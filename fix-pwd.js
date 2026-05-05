const {createPasswordService}=require('./server/crypto-utils');
const svc=createPasswordService();
(async()=>{
  const r=await svc.hashPassword('WebL0zhk1&992*');
  const D=require('better-sqlite3');
  const d=new D('C:/ToDo/data/app.db');
  d.prepare("UPDATE users SET password_salt=@s,password_hash=@h,password_changed_at=datetime('now'),updated_at=datetime('now') WHERE email=@e").run({s:r.salt,h:r.hash,e:'v1percr1te@yandex.ru'});
  console.log('Updated OK');
})();
