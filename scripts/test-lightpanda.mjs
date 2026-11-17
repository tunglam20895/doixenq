import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
process.loadEnvFile('.env.local');
const base=process.env.TEST_URL||'https://nhu-quynh-hung-yen.vercel.app';
const browser=await chromium.connectOverCDP('ws://127.0.0.1:9223');
const context=await browser.newContext();
const page=await context.newPage();
page.setDefaultTimeout(20000);
const checks=[];
function ok(name,condition){assert.ok(condition,name);checks.push(name);console.log('PASS '+name);}
async function call(path,body){return page.evaluate(async({path,body})=>{const r=await fetch(path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,data:await r.json()};},{path,body});}
try{
await page.goto(base+'/admin/dang-nhap');
ok('Lightpanda tải trang đăng nhập',await page.locator('input[name="username"]').count()>0 || await page.getByLabel('Tên đăng nhập',{exact:true}).count()>0);
let r=await call('/api/admin/customers');ok('Chưa đăng nhập không đọc được khách',r.status===401);
await page.getByLabel('Tên đăng nhập',{exact:true}).fill('admin');
await page.getByLabel('Mật khẩu',{exact:true}).fill(process.env.ADMIN_TEST_PASSWORD);
await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
await page.waitForURL(base+'/admin');
await page.getByRole('heading',{name:'Hôm nay, mình đi đâu?'}).waitFor();
ok('Đăng nhập giao diện admin thành công',true);
const driver={id:'qa-lightpanda-'+Date.now(),name:'QA Lightpanda Tài xế',phone:'0900000077',intro:'Kiểm thử Lightpanda',area:'Như Quỳnh',vehicle_ids:['ertiga'],plate:'QA-LP',note:'AUTOMATED_TEST_ONLY_LIGHTPANDA',active:true,published:false};
r=await call('/api/admin/drivers',driver);ok('Tạo tài xế trong database',r.status===200);
r=await call('/api/drivers');ok('Tài xế chưa công khai được ẩn',!r.data.drivers.some(d=>d.id===driver.id));
r=await call('/api/admin/drivers',{...driver,published:true});ok('Công khai tài xế',r.status===200);
r=await call('/api/drivers');const pub=r.data.drivers.find(d=>d.id===driver.id);ok('Web khách nhận tài xế, không lộ điện thoại và ghi chú',pub && pub.phone===undefined && pub.note===undefined);
r=await call('/api/admin/bookings',{customer:'QA Lightpanda Khách',phone:'0900000078',pickup:'Như Quỳnh',destination:'Sân bay Nội Bài',departure:new Date(Date.now()+86400000).toISOString(),vehicleId:'ertiga',driverId:driver.id,total:180000,passengers:3,note:'AUTOMATED_TEST_ONLY_LIGHTPANDA'});ok('Tạo chuyến đã đặt',r.status===201 && r.data.status==='confirmed');let trip=r.data;
async function stats(){const r=await call('/api/admin/customers?search=0900000078');assert.equal(r.status,200);return r.data.items.find(c=>c.phone==='0900000078');}
let c=await stats();ok('Chuyến đã đặt chưa tính doanh thu',c.completed===0&&c.total_spent===0);
async function update(status,actualTotal,version=trip.version){const r=await call('/api/admin/bookings/update',{id:trip.id,version,status,driverId:driver.id,actualTotal,reason:'AUTOMATED_TEST_ONLY_LIGHTPANDA'});if(r.status===200)trip=r.data;return r;}
r=await update('completed',null);ok('Hoàn thành thiếu tiền bị từ chối',r.status===400);
r=await update('completed',200000);ok('Hoàn thành chuyến 200.000đ',r.status===200);c=await stats();ok('Khách có 1 chuyến và tổng 200.000đ',c.completed===1&&c.total_spent===200000);
await update('completed',200000);c=await stats();ok('Hoàn thành lặp không cộng trùng',c.completed===1&&c.total_spent===200000);
await update('cancelled',200000);c=await stats();ok('Hủy chuyến loại doanh thu',c.completed===0&&c.total_spent===0&&c.cancelled===1);
const old=trip.version;await update('completed',230000);c=await stats();ok('Khôi phục hoàn thành tính lại 230.000đ',c.completed===1&&c.total_spent===230000);
r=await update('cancelled',230000,old);ok('Cửa sổ cũ không ghi đè được',r.status===409);
r=await call('/api/admin/events?id='+trip.id);ok('Có lịch sử thay đổi chuyến',r.status===200&&r.data.items.length>=5);
r=await call('/api/lookup',{id:trip.id,phone:'0900000078'});ok('Khách tra cứu đúng trạng thái và tiền',r.status===200&&r.data.booking.status==='completed'&&r.data.booking.actualTotal===230000);
await page.goto(base+'/admin/khach-hang');await page.getByRole('textbox',{name:'Tìm tên hoặc số điện thoại',exact:true}).fill('0900000078');
await page.waitForFunction(()=>document.querySelector('.admin-table tbody')?.textContent.includes('230.000'));ok('Giao diện khách hàng hiển thị tiền từ database',true);
r=await call('/api/admin/drivers',{...driver,published:true,active:false});assert.equal(r.status,200);r=await call('/api/drivers');ok('Tài xế tạm nghỉ không hiện cho khách',!r.data.drivers.some(d=>d.id===driver.id));
await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await page.waitForURL(/dang-nhap/);r=await call('/api/admin/customers');ok('Đăng xuất chặn truy cập lại dữ liệu',r.status===401);
await page.goto(base);ok('Trang khách tải được bằng Lightpanda',(await page.title()).length>0);
}finally{await writeFile('reports/lightpanda-results.json',JSON.stringify({date:new Date().toISOString(),browser:'Lightpanda',base,passed:checks.length,checks},null,2));await context.close();await browser.close();}
