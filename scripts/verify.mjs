import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {chromium} from 'playwright';
const works=JSON.parse(await fs.readFile('assets/works.json','utf8'));
const manifest=JSON.parse(await fs.readFile('backup/manifest.json','utf8'));
assert.equal(works.length,48);assert.equal(works.filter(w=>w.cycling).length,19);assert.equal(manifest.failures.length,0,'Backup has missing files');
for(const w of works){await fs.access(w.url);await fs.access('previews/'+w.id+'.jpg');}
for(const f of manifest.files){const bytes=await fs.readFile('backup/'+(new URL(f.url).hostname==='shop.website88.net'?'site':'external')+'/'+f.path);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),f.sha256,f.path+' backup hash mismatch');}
console.log(`PASS: 48 works, 19 cycling works, ${manifest.files.length} original backup files verified by SHA-256.`);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.work-card').count(),48);
 await page.locator('[data-filter="3d"]').click();assert.equal(await page.locator('.work-card').count(),14);assert.match(await page.locator('.work-card').first().innerText(),/收山录/);
 await page.locator('[data-filter="game"]').click();assert.equal(await page.locator('.work-card').count(),7);assert.match(await page.locator('.work-card').first().innerText(),/喵喵钢琴/);
 await page.locator('[data-filter="cycling"]').click();assert.equal(await page.locator('.work-card').count(),19);
 await page.locator('[data-filter="all"]').click();assert.equal(await page.locator('.work-card').count(),48);
 await page.locator('[data-prompt]').first().click();assert.equal(await page.locator('#prompt-dialog').isVisible(),true);
 const prompt=await page.locator('#prompt-content').textContent();await page.locator('#copy-prompt').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),prompt);
 await page.keyboard.press('Escape');assert.equal(await page.locator('#prompt-dialog').isVisible(),false);assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-prompt')),true);
 assert.equal(await page.locator('[data-evidence]').count(),13);
 assert.equal(await page.locator('.evidence-table tbody tr').count(),13);
 const evidenceData=JSON.parse(await fs.readFile('assets/internship-data.json','utf8'));
 for(const item of evidenceData){for(const prefix of ['', 'thumb-']){const response=await context.request.get('http://127.0.0.1:4173/previews/internship/'+prefix+item.file);assert.equal(response.status(),200,'Missing evidence image '+item.file);}}
 await page.locator('[data-evidence="9"]').click();assert.equal(await page.locator('#evidence-dialog').isVisible(),true);
 assert.match(await page.locator('#evidence-caption').innerText(),/4\.8K.*259/);
 await page.keyboard.press('ArrowRight');assert.match(await page.locator('#evidence-caption').innerText(),/2\.8K.*153/);
 await page.locator('#evidence-next').click();assert.match(await page.locator('#evidence-caption').innerText(),/1\.7K.*134/);
 await page.locator('#evidence-prev').click();await page.keyboard.press('ArrowLeft');assert.match(await page.locator('#evidence-caption').innerText(),/4\.8K/);
 await page.keyboard.press('Escape');assert.equal(await page.locator('#evidence-dialog').isVisible(),false);assert.equal(await page.evaluate(()=>document.activeElement.dataset.evidence),'9');
 await page.locator('.evidence-more summary').click();await page.locator('[data-evidence="1"]').click();await page.locator('#evidence-close').click();assert.equal(await page.evaluate(()=>document.activeElement.dataset.evidence),'1');
 for(const width of [320,375,768,1024,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Expanded internship overflow at '+width);}
 await page.locator('.evidence-more summary').click();
 await page.evaluate(()=>document.activeElement.blur());await page.mouse.move(0,0);
 await page.setViewportSize({width:1440,height:1000});await page.locator('.internship').screenshot({path:'previews/internship-desktop.png'});
 await page.setViewportSize({width:375,height:844});await page.locator('.internship').screenshot({path:'previews/internship-mobile.png'});
 console.log('PASS: 13 evidence records and photos, gallery navigation, keyboard close and focus restoration, expanded mobile layout.');
 for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});await page.evaluate(()=>scrollTo(0,0));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Horizontal overflow at '+width);}
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'previews/home-desktop.png'});
 await page.locator('#works').scrollIntoViewIfNeeded();await page.screenshot({path:'previews/home-gallery.png'});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'previews/home-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS: filters, prompt copy, Escape, focus restoration, 5 responsive widths, no home JavaScript errors.');
 await page.goto(new URL('../index.html',import.meta.url).href);assert.equal(await page.locator('.work-card').count(),48);console.log('PASS: homepage opens directly as a local file.');
 const requests=[];const failures=[];
 for(const route of ['works/shoushanlu/index.html','works/cat-piano/index.html','works/xingwei/index.html','works/houdoumen/index.html',...['01-polar','02-keyboard','03-gravity','04-metro','05-poster'].map(x=>'works/visual-lab/'+x+'.html')]){
  const p=await context.newPage();p.on('pageerror',e=>failures.push({route,error:e.message}));p.on('response',r=>{if(r.status()>=400)requests.push({route,url:r.url(),status:r.status()});});
  await p.goto('http://127.0.0.1:4173/'+route,{waitUntil:'networkidle',timeout:30000});await p.waitForTimeout(700);
  console.log('CHECK',route);await p.close();
 }
 await fs.writeFile('backup/verification.json',JSON.stringify({checkedAt:new Date().toISOString(),works:48,backupFiles:manifest.files.length,homeErrors:errors,collectionErrors:failures,failedRequests:requests},null,2));
 assert.deepEqual(requests,[],'Missing collection resources');assert.deepEqual(failures,[],'Collection runtime errors');console.log('PASS: all 9 collection entry/subpages render without missing requests or JavaScript errors.');
}finally{await browser.close();}
