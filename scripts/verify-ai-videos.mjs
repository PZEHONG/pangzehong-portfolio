import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';

const base=process.argv[2]||'http://127.0.0.1:4173/';
const catalog=JSON.parse(await fs.readFile(new URL('../assets/ai-videos.json',import.meta.url),'utf8'));
assert.equal(catalog.videos.length,30);
assert.equal(new Set(catalog.videos.map(v=>v.id)).size,30);
for(const source of catalog.sources)assert.equal(catalog.videos.filter(v=>v.source===source.id).length,5);
const bytes=(await Promise.all(catalog.videos.map(v=>fs.stat(new URL('../'+v.poster,import.meta.url))))).reduce((n,f)=>n+f.size,0);
assert.ok(bytes<400000,'All covers together must stay below 400 KB');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[],media=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(/\.(mp4|webm|m3u8)(?:\?|$)|youtube\.com\/embed/.test(request.url()))media.push(request.url())});
 await page.goto(base,{waitUntil:'load'});
 await page.locator('header a[href="#ai-videos"]').click();
 await page.waitForFunction(()=>document.querySelectorAll('.ai-video-card').length===6);
 for(const source of catalog.sources){
  await page.locator(`[data-video-source="${source.id}"]`).click();
  assert.equal(await page.locator('.ai-video-card').count(),5);
 }
 await page.locator('[data-video-source="all"]').click();
 await page.locator('#ai-video-expand').click();
 assert.equal(await page.locator('.ai-video-card').count(),30);
 assert.equal(media.length,0,'Browsing and filtering must not load videos/embeds');
 await page.locator('#ai-video-expand').click();
 for(const width of [320,375,600,760,850,900,901,1092,1440]){
  await page.setViewportSize({width,height:871});
  await page.locator('header a[href="#ai-videos"]').click();
  const layout=await page.evaluate(()=>{
   const h=document.querySelector('.site-header').getBoundingClientRect();
   return {height:h.height,top:h.top,section:document.querySelector('#ai-videos').getBoundingClientRect().top,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,links:[...document.querySelectorAll('.site-header nav a')].map(a=>{const r=a.getBoundingClientRect();return {left:r.left,right:r.right,height:r.height,bottom:r.bottom}})};
  });
  assert.equal(layout.top,0);
  assert.equal(layout.height,width<=900?88:64);
  assert.ok(layout.section>=layout.height);
  assert.ok(layout.scrollWidth<=width);
  for(const link of layout.links){assert.ok(link.left>=0&&link.right<=width);assert.ok(link.height>=44);assert.ok(link.bottom<=layout.height)}
 }
 const first=page.locator('[data-video-id="ch-womenswear-explain"]').first();
 await first.click();
 await page.waitForFunction(()=>document.querySelector('#ai-video-stage video')?.currentTime>0.1,null,{timeout:25000});
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#ai-video-stage').evaluate(e=>e.children.length),0);
 assert.ok(await first.evaluate(e=>e===document.activeElement));
 assert.ok(!await page.locator('body').evaluate(e=>e.classList.contains('no-scroll')));
 await page.locator('[data-video-source="runway"]').click();
 await page.locator('[data-video-id]').first().click();
 assert.equal(await page.locator('#ai-video-stage iframe').count(),1);
 await page.locator('#ai-video-close').click();
 assert.equal(await page.locator('#ai-video-stage iframe').count(),0);
 await page.locator('[data-video-source="leo"]').click();
 assert.equal(await page.locator('.ai-video-card .ai-video-cover[href^="https://leixiang.top/film#"]').count(),5);
 assert.deepEqual(errors,[]);
 console.log(`PASS: 30 films, 5/source, ${bytes} cover bytes, six filters, zero idle video requests, nine screen widths, actual playback, focus and media cleanup.`);
}finally{await browser.close()}
