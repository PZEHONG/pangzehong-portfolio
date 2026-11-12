import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

const base=process.argv[2]||'http://127.0.0.1:4173/';
const catalog=JSON.parse(await fs.readFile(new URL('../assets/ai-videos.json',import.meta.url),'utf8'));
assert.equal(catalog.videos.length,30);
assert.equal(new Set(catalog.videos.map(v=>v.id)).size,30);
assert.deepEqual(catalog.tools.map(t=>t.name),['可灵AI','即梦','海螺','豆包','flow','LibTV']);
let coverBytes=0,videoBytes=0;
for(const film of catalog.videos){
 assert.match(film.video,/^assets\/ai-videos\/[\w-]+\.mp4$/);
 assert.ok(film.tools.length&&film.tools.every(id=>catalog.tools.some(t=>t.id===id)));
 assert.ok(film.durationSeconds>0&&film.durationSeconds<=30.1);
 assert.ok(film.provenance.evidenceUrl);
 const data=await fs.readFile(new URL('../'+film.video,import.meta.url));
 assert.equal(data.length,film.bytes);
 const moov=data.indexOf(Buffer.from('moov')),mdat=data.indexOf(Buffer.from('mdat'));
 assert.ok(moov>0&&moov<mdat,'MP4 must allow progressive playback: '+film.id);
 coverBytes+=(await fs.stat(new URL('../'+film.poster,import.meta.url))).size;
 videoBytes+=film.bytes;
}
assert.ok(coverBytes<700000);
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[],media=[],outside=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{
  if(/\.(mp4|webm|m3u8)(?:\?|$)|youtube\.com\/embed/.test(request.url())){
   media.push(request.url());
   if(new URL(request.url()).origin!==new URL(base).origin)outside.push(request.url());
  }
 });
 await page.goto(base,{waitUntil:'load'});
 await page.locator('header a[href="#ai-videos"]').click();
 await page.waitForFunction(()=>document.querySelectorAll('.ai-video-card').length===6);
 assert.equal(await page.locator('.ai-exhibition-intro,.ai-video-card-footer,#ai-video-original,#ai-video-credit').count(),0);
 assert.equal(await page.locator('#ai-videos a[target="_blank"]').count(),0);
 for(const tool of catalog.tools){
  await page.locator(`[data-video-tool="${tool.id}"]`).click();
  assert.equal(await page.locator('.ai-video-card').count(),catalog.videos.filter(v=>v.tools.includes(tool.id)).length);
 }
 await page.locator('[data-video-tool="all"]').click();
 await page.locator('#ai-video-expand').click();
 assert.equal(await page.locator('.ai-video-card').count(),30);
 assert.equal(await page.locator('.ai-video-actions a[download]').count(),30);
 assert.equal(media.length,0,'Browsing and filtering must not load video data');
 assert.doesNotMatch(await page.locator('#ai-videos').innerText(),/来源作者|原作|原站观看|呈鸿|邓慧灵|Leo Film|张建坤|宇人|Runway AIF/);
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
 // Each of the six software categories must play natively in the same page.
 for(const tool of catalog.tools){
  await page.locator(`[data-video-tool="${tool.id}"]`).click();
  const trigger=page.locator('[data-video-id]').first();
  await trigger.click();
  await page.waitForFunction(()=>document.querySelector('#ai-video-stage video')?.currentTime>0.1,null,{timeout:25000});
  const player=page.locator('#ai-video-stage video');
  assert.equal(await player.getAttribute('preload'),'none');
  assert.ok(await player.evaluate(v=>!v.error));
  assert.match(await page.locator('#ai-video-download').getAttribute('href'),/^assets\/ai-videos\//);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#ai-video-stage').evaluate(e=>e.children.length),0);
  assert.ok(await trigger.evaluate(e=>e===document.activeElement));
  assert.ok(!await page.locator('body').evaluate(e=>e.classList.contains('no-scroll')));
 }
 // Exercise a real browser download, including the saved bytes and suggested name.
 await page.locator('[data-video-tool="jimeng"]').click();
 const link=page.locator('.ai-video-actions a[download]').first();
 const pending=page.waitForEvent('download');
 await link.click();
 const downloaded=await pending;
 const expected=catalog.videos.find(v=>v.id+'.mp4'===downloaded.suggestedFilename());
 assert.ok(expected);
 const actual=await fs.readFile(await downloaded.path());
 const wanted=await fs.readFile(new URL('../'+expected.video,import.meta.url));
 assert.equal(createHash('sha256').update(actual).digest('hex'),createHash('sha256').update(wanted).digest('hex'));
 assert.deepEqual(outside,[],'All video requests must stay on this website');
 assert.deepEqual(errors,[]);
 console.log(`PASS: 30 local short videos (${videoBytes} bytes), ${coverBytes} cover bytes, six software filters, zero idle video requests, nine widths, six actual plays, verified browser download, focus and media cleanup.`);
}finally{await browser.close()}
