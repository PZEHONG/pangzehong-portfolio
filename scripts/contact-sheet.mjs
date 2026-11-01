import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const works=JSON.parse(await fs.readFile('assets/works.json','utf8'));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1500,height:2250}});
await page.setContent('<style>*{box-sizing:border-box}body{margin:0;background:#161a13;color:white;font:13px Arial;display:grid;grid-template-columns:repeat(5,1fr);gap:12px;padding:16px}figure{margin:0}img{width:100%;height:176px;object-fit:cover}figcaption{height:49px;padding-top:8px}</style>'+works.map(w=>`<figure><img src="http://127.0.0.1:4173/previews/${w.id}.jpg"><figcaption>${w.number}. ${w.title}</figcaption></figure>`).join(''));
await page.waitForFunction(()=>[...document.images].every(i=>i.complete));await page.screenshot({path:'previews/qa-contact.png',fullPage:true});await browser.close();
