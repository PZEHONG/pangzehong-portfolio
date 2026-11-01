import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const origin='http://shop.website88.net';
const base=origin+'/gpt6-works/index.html';
const root=process.cwd();
const main=await fs.readFile('backup/original-index.html','utf8');
const cycling=await fs.readFile('backup/original-cycling.html','utf8');
function records(html){
 const source=html.slice(html.indexOf('var works = ['),html.indexOf('var host ='));
 return [...source.matchAll(/\{\s*url:\s*"([^"\n]+)"([\s\S]*?)(?=\n\s*\{\s*url:|$)/g)].map(m=>{
  const entry={url:m[1]};
  for(const key of ['title','desc','tag','ico']){const value=m[2].match(new RegExp(key+':\\s*("(?:[^"\\\\]|\\\\.)*")'));if(value)entry[key]=JSON.parse(value[1]);}
  const prompt=m[2].match(/prompt:\s*`([\s\S]*?)`/);if(prompt)entry.prompt=prompt[1].replace(/\\~/g,'~');
  return entry;
 });
}
const cycleIds=new Set(records(cycling).map(x=>x.url));
const works=records(main).map((w,i)=>({...w,id:w.url.replace(/^\.\.\//,'').replace(/\/index\.html$|\.html$/g,'').replaceAll('/','-'),number:i+1,source:new URL(w.url,base).href,url:'works/'+new URL(w.url,base).pathname.slice(1),cycling:cycleIds.has(w.url)}));
const localWorks=JSON.parse(await fs.readFile('assets/works.json','utf8')).filter(w=>['cat-piano','shoushanlu','deepseek-splash'].includes(w.id));
const catalog=[...works,...localWorks];
await fs.writeFile('assets/works.json',JSON.stringify(catalog,null,2)+'\n');
await fs.writeFile('assets/works.js','window.PORTFOLIO_WORKS = '+JSON.stringify(catalog,null,2)+';\n');
const queue=[base,origin+'/gpt6-works/cycling.html',...works.map(w=>w.source)];
try{queue.push(...JSON.parse(await fs.readFile('backup/discovered-resources.json','utf8')));}catch{}
const seen=new Set(), files=[], failures=[];
const assetExt=/\.(?:html?|css|m?js|json|webmanifest|png|jpe?g|webp|gif|svg|woff2?|ttf|mp3|wav|ogg|glb|gltf|bin|bbmodel)(?:[?#]|$)/i;
function dest(url){const u=new URL(url);let p=decodeURIComponent(u.pathname).replace(/^\//,'');if(p.includes('..'))throw Error('Unsafe path');if(!p||p.endsWith('/'))p+='index.html';if(u.host!==new URL(origin).host)p='_vendor/'+u.host+'/'+p;if(u.search)p=p.replace(/(\.[^/.]+)?$/,(_,e)=>'-'+crypto.createHash('sha256').update(u.search).digest('hex').slice(0,8)+(e||'.js'));return p;}
function refs(content,url){const found=new Set();const candidates=[...content.matchAll(/(?:\b(?:src|href|data-page)\s*=\s*|\bfrom\s+|\bimport\s*\(?\s*|\bfetch\s*\(\s*|\burl:\s*)["'`]([^"'`\s<>]+)["'`]/g)];if(/\/(visual-lab|xingwei|houdoumen)\//.test(url))candidates.push(...content.matchAll(/["'`]((?:assets\/|https?:\/\/)[^"'`\s<>]+\.(?:png|jpg|webp|html|js|css|json))["'`]/g));
 if(url.includes('/xingwei/src/')){for(const m of content.matchAll(/\bart\s*:\s*['"]([a-z0-9-]+)['"]|\bart\(['"]([a-z0-9-]+)['"]\)/g))found.add(origin+'/xingwei/assets/'+(m[1]||m[2])+'.webp');if(content.includes('serviceWorker.register'))found.add(origin+'/xingwei/sw.js');}
 for(const m of candidates){let s=m[1].replaceAll('&amp;','&');if(s.startsWith('//'))s='https:'+s;if(!assetExt.test(s)||/^(data:|blob:|#)/.test(s)||s.includes('${'))continue;try{const u=new URL(s,url);if(!['http:','https:'].includes(u.protocol))continue;u.hash='';if(u.host!==new URL(origin).host&&!/\.(?:css|m?js|png|jpe?g|webp|svg|woff2?|ttf|glb|bin)(?:\?|$)/i.test(u.href))continue;found.add(u.href);}catch{}}
 if(url.endsWith('/xingwei/sw.js')){const names=content.match(/\.\.\.\[([^\]]+)\]\.map/);if(names)for(const m of names[1].matchAll(/'([a-z0-9-]+)'/g))found.add(origin+'/xingwei/assets/'+m[1]+'.webp');for(const m of content.matchAll(/'\.\/assets\/([^']+)'/g))found.add(origin+'/xingwei/assets/'+m[1]);}
 if(url.endsWith('.webmanifest')){for(const icon of JSON.parse(content).icons||[])found.add(new URL(icon.src,url).href);}
 for(const m of content.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/g)){if(!/^(data:|#)/.test(m[1])&&assetExt.test(m[1]))try{const u=new URL(m[1],url);u.hash='';found.add(u.href);}catch{}}
 return [...found];}
while(queue.length){const batch=[];while(queue.length&&batch.length<6){const u=queue.shift();if(seen.has(u))continue;seen.add(u);batch.push(u);}await Promise.all(batch.map(async url=>{try{
 const rel=dest(url);const raw=path.join(root,'backup',new URL(url).host===new URL(origin).host?'site':'external',rel);
 await fs.mkdir(path.dirname(raw),{recursive:true});
 try{await fs.access(raw);}catch{throw Error('Pending download');}
 const bytes=await fs.readFile(raw);
 const textual=/\.(?:html?|css|m?js|json|webmanifest)$/i.test(rel);const content=textual?bytes.toString('utf8'):null;
 const dependencies=content?refs(content,url):[];
 const record={url,path:rel,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),dependencies};files.push(record);
 for(const ref of dependencies)if(!seen.has(ref))queue.push(ref);
 console.log('Saved',rel,bytes.length);
}catch(error){failures.push({url,path:dest(url),error:error.message});}}));if(seen.size>600)throw Error('Unexpected crawl size');}
const available=new Map(files.map(f=>[f.url,f.path]));
for(const f of files){const raw=path.join('backup',new URL(f.url).host===new URL(origin).host?'site':'external',f.path);let bytes=await fs.readFile(raw);if(/\.(?:html?|css|m?js|json)$/i.test(f.path)){
 let content=bytes.toString('utf8');for(const dep of f.dependencies){if(!available.has(dep))continue;const relative=path.posix.relative(path.posix.dirname(f.path),available.get(dep));const replacement=relative.startsWith('.')?relative:'./'+relative;const u=new URL(dep);
 content=content.split(dep).join(replacement).split(dep.replaceAll('&','&amp;')).join(replacement);
 if(u.host===new URL(origin).host)content=content.replace(new RegExp('(["\'])'+u.pathname.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(["\'])','g'),'$1'+replacement+'$2');
 }bytes=Buffer.from(content);}
 const target=path.join('works',f.path);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes);
}
const manifest={source:base,createdAt:new Date().toISOString(),workCount:works.length,files,failures};await fs.writeFile('backup/manifest.json',JSON.stringify(manifest,null,2));
console.log(JSON.stringify({works:works.length,files:files.length,failures},null,2));
