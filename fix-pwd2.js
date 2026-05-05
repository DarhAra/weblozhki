const {createPasswordService}=require('./server/crypto-utils');
const svc=createPasswordService();
(async()=>{
  const r=await svc.hashPassword('WebL0zhk1&992*');
  const D=require('better-sqlite3');
  const d=new D('C:/ToDo/data/app.db');
  const stmt=d.prepare("UPDATE users SET password_salt=@s,password_hash=@h,password_changed_at=datetime('now'),updated_at=datetime('now') WHERE email=@e");
  stmt.run({s:r.salt,h:r.hash,e:'v1percr1te@yandex.ru'});
  const u=d.prepare('SELECT password_salt,password_hash FROM users WHERE email=?').get('v1percr1te@yandex.ru');
  console.log('salt:',u.password_salt.substring(0,15),'hash:',u.password_hash.substring(0,40));
  const verifyUser={passwordSalt:u.password_salt,passwordHash:u.password_hash};
  const v=await svc.verifyPassword('WebL0zhk1&992*',verifyUser);
  console.log('verify:',JSON.stringify(v));
})();
