create or replace function fleet_private.backend(p_secret text,p_action text,p_data jsonb default '{}') returns jsonb
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare r jsonb; b public.fleet_bookings; c uuid; n integer; search text; start_at integer; size integer; actor text; next_status text; sess text;
begin
 if p_secret is null or length(p_secret)<40 or not exists(select 1 from fleet_private.config where secret_hash=encode(sha256(convert_to(p_secret,'UTF8')),'hex')) then
  raise exception 'ACCESS_DENIED' using errcode='42501';
 end if;
 search := left(coalesce(p_data->>'search',''),150); start_at:=greatest(0,coalesce((p_data->>'offset')::int,0)); size:=least(100,greatest(1,coalesce((p_data->>'limit')::int,30))); actor:=coalesce(p_data->>'actor','admin');
 if p_action='rate_limit' then
  insert into public.fleet_rate_limits(key,count,expires) values(p_data->>'key',1,(p_data->>'now')::bigint+(p_data->>'window')::bigint)
  on conflict(key) do update set count=case when fleet_rate_limits.expires<(p_data->>'now')::bigint then 1 else fleet_rate_limits.count+1 end,
  expires=case when fleet_rate_limits.expires<(p_data->>'now')::bigint then (p_data->>'now')::bigint+(p_data->>'window')::bigint else fleet_rate_limits.expires end returning count into n;
  return to_jsonb(n<=(p_data->>'limit')::int);
 elsif p_action='auth_account' then select to_jsonb(a) into r from public.fleet_admin_accounts a where username=p_data->>'username';return r;
 elsif p_action='auth_session_create' then
  delete from public.fleet_admin_sessions where expires_at<now();
  insert into public.fleet_admin_sessions(id,username,expires_at) values(p_data->>'id',p_data->>'username',(p_data->>'expires')::timestamptz);return 'true';
 elsif p_action='auth_session' then
  select jsonb_build_object('username',s.username,'mustChange',a.must_change) into r from public.fleet_admin_sessions s join public.fleet_admin_accounts a on a.username=s.username where s.id=p_data->>'id' and s.expires_at>now();return r;
 elsif p_action='auth_logout' then delete from public.fleet_admin_sessions where id=p_data->>'id';return 'true';
 elsif p_action='auth_password' then
  update public.fleet_admin_accounts set password_hash=p_data->>'hash',must_change=false,updated_at=now() where username=p_data->>'username';
  delete from public.fleet_admin_sessions where username=p_data->>'username' and id<>p_data->>'session';return 'true';
 elsif p_action='drivers' then
  select coalesce(jsonb_agg(to_jsonb(d)-'avatar_data' || jsonb_build_object('hasAvatar',d.avatar_data is not null) order by d.created_at),'[]') into r from public.fleet_drivers d;return r;
 elsif p_action='driver_photo' then
  select jsonb_build_object('data',avatar_data,'published',published,'active',active,'updated_at',updated_at) into r from public.fleet_drivers where id=p_data->>'id';return r;
 elsif p_action='driver_save' then
  insert into public.fleet_drivers(id,name,phone,intro,area,vehicle_ids,plate,note,active,published,avatar_data)
  values(p_data->>'id',p_data->>'name',coalesce(p_data->>'phone',''),coalesce(p_data->>'intro',''),coalesce(p_data->>'area',''),array(select jsonb_array_elements_text(p_data->'vehicle_ids')),coalesce(p_data->>'plate',''),coalesce(p_data->>'note',''),(p_data->>'active')::boolean,(p_data->>'published')::boolean,p_data->>'avatar_data')
  on conflict(id) do update set name=excluded.name,phone=excluded.phone,intro=excluded.intro,area=excluded.area,vehicle_ids=excluded.vehicle_ids,plate=excluded.plate,note=excluded.note,active=excluded.active,published=excluded.published,
  avatar_data=case when p_data ? 'avatar_data' then excluded.avatar_data else fleet_drivers.avatar_data end,updated_at=now() returning to_jsonb(fleet_drivers)-'avatar_data' into r;return r;
 elsif p_action='save_booking' then
  insert into public.fleet_customers(name,phone) values(p_data->>'customer',p_data->>'phone') on conflict(phone) do update set updated_at=now() returning id into c;
  insert into public.fleet_bookings(id,request_id,customer_id,driver_id,vehicle_id,status,payload,actual_total,completed_at)
  values(p_data->>'id',(p_data->>'requestId')::uuid,c,nullif(p_data->>'driverId','auto'),p_data->>'vehicleId',p_data->>'status',p_data,(p_data->>'actualTotal')::bigint,case when p_data->>'status'='completed' then now() else null end)
  on conflict(request_id) do nothing returning * into b;
  if b.id is null then select * into b from public.fleet_bookings where request_id=(p_data->>'requestId')::uuid;
  else insert into public.fleet_booking_events(booking_id,actor,event,detail) values(b.id,coalesce(p_data->>'source','web'),'created',jsonb_build_object('status',b.status));end if;
  return fleet_private.booking_json(b);
 elsif p_action='lookup_phone' then
  if coalesce(p_data->>'suffix','') !~ '^[0-9]{9}$' then raise exception 'INVALID_PHONE';end if;
  select coalesce(jsonb_agg(fleet_private.booking_json(b) order by b.payload->>'departure'),'[]') into r
  from public.fleet_bookings b
  where right(regexp_replace(b.payload->>'phone','[^0-9]','','g'),9)=p_data->>'suffix';
  return r;
 elsif p_action='find_booking' then select * into b from public.fleet_bookings where id=p_data->>'id';if b.id is null then return null;end if;return fleet_private.booking_json(b);
 elsif p_action='by_request' then select * into b from public.fleet_bookings where request_id=(p_data->>'requestId')::uuid;if b.id is null then return null;end if;return fleet_private.booking_json(b);
 elsif p_action='notification_update' then
  update public.fleet_bookings set payload=payload || jsonb_build_object('notification',p_data->>'notification','attempts',(p_data->>'attempts')::int) where id=p_data->>'id';return 'true';
 elsif p_action='pending_notifications' then
  select coalesce(jsonb_agg(fleet_private.booking_json(x)),'[]') into r from (select * from public.fleet_bookings where payload->>'notification'='pending' and (payload->>'attempts')::int<8 order by created_at limit 20) x;return r;
 elsif p_action='bookings' then
  select jsonb_build_object('items',coalesce(jsonb_agg(q.item order by q.departure desc),'[]'),'total',(select count(*) from public.fleet_bookings b where
   (search='' or b.id ilike '%'||search||'%' or b.payload->>'customer' ilike '%'||search||'%' or b.payload->>'phone' ilike '%'||search||'%') and
   (coalesce(p_data->>'status','all')='all' or p_data->>'status'='booked' and b.status in ('requested','confirmed') or b.status=p_data->>'status') and
   (coalesce(p_data->>'customerId','')='' or b.customer_id::text=p_data->>'customerId')))
  into r from (select (fleet_private.booking_json(b)-array['token','requestId','notification','attempts']) as item,b.payload->>'departure' as departure from public.fleet_bookings b where
   (search='' or b.id ilike '%'||search||'%' or b.payload->>'customer' ilike '%'||search||'%' or b.payload->>'phone' ilike '%'||search||'%') and
   (coalesce(p_data->>'status','all')='all' or p_data->>'status'='booked' and b.status in ('requested','confirmed') or b.status=p_data->>'status') and
   (coalesce(p_data->>'customerId','')='' or b.customer_id::text=p_data->>'customerId') order by b.payload->>'departure' desc limit size offset start_at) q;return r;
 elsif p_action='booking_update' then
  select * into b from public.fleet_bookings where id=p_data->>'id' for update;
  if b.id is null then raise exception 'NOT_FOUND';end if;
  if b.version<>(p_data->>'version')::int then raise exception 'VERSION_CONFLICT';end if;
  next_status:=p_data->>'status';
  insert into public.fleet_booking_events(booking_id,actor,event,detail) values(b.id,actor,'updated',jsonb_build_object('from',b.status,'to',next_status,'previousTotal',b.actual_total,'actualTotal',p_data->'actualTotal','reason',p_data->>'reason','fromDriver',b.driver_id,'toDriver',p_data->>'driverId'));
  update public.fleet_bookings set status=next_status,actual_total=(p_data->>'actualTotal')::bigint,driver_id=nullif(p_data->>'driverId','auto'),
   completed_at=case when next_status='completed' then coalesce(completed_at,now()) else null end,version=version+1,updated_at=now()
   where id=b.id returning * into b;return fleet_private.booking_json(b)-array['token','requestId','notification','attempts'];
 elsif p_action='booking_events' then
  select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at desc),'[]') into r from public.fleet_booking_events e where booking_id=p_data->>'id';return r;
 elsif p_action='customers' then
  select jsonb_build_object('items',coalesce(jsonb_agg(to_jsonb(q) order by q.created_at desc),'[]'),'total',(select count(*) from public.fleet_customers where search='' or name ilike '%'||search||'%' or phone ilike '%'||search||'%')) into r from
  (select c.*,count(b.id)::int as bookings,count(b.id) filter(where b.status='completed')::int as completed,
   count(b.id) filter(where b.status='cancelled')::int as cancelled,coalesce(sum(coalesce(b.actual_total,(b.payload->>'total')::bigint)) filter(where b.status='completed'),0)::bigint as total_spent,
   max(b.payload->>'departure') as last_trip from public.fleet_customers c left join public.fleet_bookings b on b.customer_id=c.id
   where search='' or c.name ilike '%'||search||'%' or c.phone ilike '%'||search||'%' group by c.id order by c.created_at desc limit size offset start_at) q;return r;
 elsif p_action='customer_save' then
  if coalesce(p_data->>'id','')='' then insert into public.fleet_customers(name,phone,note) values(p_data->>'name',p_data->>'phone',coalesce(p_data->>'note','')) returning to_jsonb(fleet_customers) into r;
  else update public.fleet_customers set name=p_data->>'name',phone=p_data->>'phone',note=coalesce(p_data->>'note',''),updated_at=now() where id=(p_data->>'id')::uuid returning to_jsonb(fleet_customers) into r;end if;return r;
 elsif p_action='dashboard' then
  select jsonb_build_object('customers',(select count(*) from public.fleet_customers),'drivers',(select count(*) from public.fleet_drivers where active),'booked',count(*) filter(where status in ('requested','confirmed')),'completed',count(*) filter(where status='completed'),'cancelled',count(*) filter(where status='cancelled'),'revenue',coalesce(sum(coalesce(actual_total,(payload->>'total')::bigint)) filter(where status='completed'),0),
  'today',count(*) filter(where ((payload->>'departure')::timestamptz at time zone 'Asia/Ho_Chi_Minh')::date=(now() at time zone 'Asia/Ho_Chi_Minh')::date),
  'recent',(select coalesce(jsonb_agg(fleet_private.booking_json(x)-array['token','requestId','notification','attempts'] order by x.created_at desc),'[]') from (select * from public.fleet_bookings order by created_at desc limit 6) x),
  'chart',(select coalesce(jsonb_agg(jsonb_build_object('date',day::date,'revenue',coalesce((select sum(coalesce(b.actual_total,(b.payload->>'total')::bigint)) from public.fleet_bookings b where b.status='completed' and (b.completed_at at time zone 'Asia/Ho_Chi_Minh')::date=day::date),0)) order by day),'[]') from generate_series((now() at time zone 'Asia/Ho_Chi_Minh')::date-6,(now() at time zone 'Asia/Ho_Chi_Minh')::date,'1 day') day)) into r from public.fleet_bookings;return r;
 end if;
 raise exception 'UNKNOWN_ACTION';
end;$$;
