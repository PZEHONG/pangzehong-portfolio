import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--allow-file-access-from-files','--enable-unsafe-swiftshader']});
const works=JSON.parse(await fs.readFile('assets/works.json','utf8'));
const errors=[];
for(const w of works){
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push({id:w.id,message:e.message}));
 try{await page.goto('http://127.0.0.1:4173/'+w.url,{waitUntil:'networkidle',timeout:18000});await page.waitForTimeout(1200);await page.screenshot({path:'previews/'+w.id+'.jpg',type:'jpeg',quality:83});console.log('Preview',w.id);}catch(e){console.log('Preview failed',w.id,e.message);}
 await page.close();
}
await fs.writeFile('backup/render-errors.json',JSON.stringify(errors,null,2));await browser.close();
