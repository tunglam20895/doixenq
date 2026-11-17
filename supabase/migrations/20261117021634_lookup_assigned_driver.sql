create or replace function fleet_private.booking_json(b public.fleet_bookings) returns jsonb
language sql stable set search_path = '' as $$
 select b.payload || jsonb_build_object(
 'id',b.id,'status',b.status,'customerId',b.customer_id,'driverId',coalesce(b.driver_id,'auto'),
 'actualTotal',b.actual_total,'version',b.version,'completedAt',b.completed_at,'createdAt',b.created_at,
 'driverName',d.name,'driverAssigned',coalesce(a.assigned,false),
 'driverPhone',case when a.assigned then nullif(d.phone,'') else null end)
 from (select b.driver_id is not null and (
   b.payload->>'source'='admin' or exists (
     select 1 from public.fleet_booking_events e
     where e.booking_id=b.id and e.event='updated' and e.actor<>'web'
       and e.detail->>'toDriver'=b.driver_id
   )) as assigned) a
 left join public.fleet_drivers d on d.id=b.driver_id;
$$;
revoke all on function fleet_private.booking_json(public.fleet_bookings) from public,anon,authenticated;
