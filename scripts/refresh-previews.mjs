import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
const works=JSON.parse(await fs.readFile('assets/works.json','utf8'));
for(const id of (process.argv.length>2?process.argv.slice(2):['re-form','visual-lab','houdoumen','xingwei'])){
 const w=works.find(w=>w.id===id);const p=await browser.newPage({viewport:{width:1440,height:900}});
 await p.goto('http://127.0.0.1:4173/'+w.url,{waitUntil:'networkidle',timeout:45000});await p.waitForTimeout(['re-form','auto-windtunnel'].includes(id)?10000:1500);
 await p.screenshot({path:'previews/'+id+'.jpg',type:'jpeg',quality:85});console.log('Refreshed',id);await p.close();
}
await browser.close();
