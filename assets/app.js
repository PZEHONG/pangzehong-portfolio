(() => {
  'use strict';
  const works=window.PORTFOLIO_WORKS||[];
  const grid=document.querySelector('#work-grid');
  const dialog=document.querySelector('#prompt-dialog');
  const categories={all:'全部作品','3d':'三维世界',animation:'灵动动画',game:'互动游戏',visual:'视觉实验',cycling:'骑行专列'};
  const category=w=>/经营|游戏|卡牌|单机/.test(w.tag)?'game':/3D|three|Voxel|WebGL|模拟/i.test(w.tag)?'3d':/动画|SVG/.test(w.tag)?'animation':'visual';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const order=['deepseek-splash','re-form','shanghai-voxel','entropy-sea-3d','aether-voyager','cyberpunk-pelican-bike','coastal-house'];
  const arranged=[...works].sort((a,b)=>{const i=order.indexOf(a.id),j=order.indexOf(b.id);return(i<0?100+a.number:i)-(j<0?100+b.number:j);});
  let filter='all',currentPrompt='',lastFocus;
  const icon='<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="6" y="6" width="10" height="11" rx="1.5"/><path d="M12 6V3H3v10h3"/></svg>';
  function render(){
    grid.dispatchEvent(new Event('previewreset'));
    const visible=arranged.filter(w=>filter==='all'||(filter==='cycling'?w.cycling:category(w)===filter));
    const featured={game:'cat-piano','3d':'shoushanlu',animation:'deepseek-splash'}[filter];
    if(featured)visible.sort((a,b)=>Number(b.id===featured)-Number(a.id===featured));
    grid.innerHTML=visible.map(w=>`<article class="work-card"><a class="work-image" href="${esc(w.url)}" target="_blank" rel="noopener" aria-label="打开作品：${esc(w.title)}"><img src="previews/${esc(w.id)}.jpg" alt="${esc(w.title)}作品画面" loading="lazy" width="1440" height="900"><span class="image-corner">EXPERIMENT ${String(w.number).padStart(3,'0')}</span><span class="image-open" aria-hidden="true">＋</span></a><div class="work-meta"><span>NO. ${String(w.number).padStart(2,'0')}</span><span class="work-type">${esc(w.tag)}</span></div><h3><a href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.title)}</a></h3><p class="work-description">${esc(w.desc)}</p><div class="work-actions"><a href="${esc(w.url)}" target="_blank" rel="noopener">进入作品</a>${w.prompt?`<button class="prompt-button" data-prompt="${esc(w.id)}" aria-label="查看${esc(w.title)}的创作提示词">${icon} 创作提示词</button>`:w.source?.startsWith('https://github.com/')?`<a href="${esc(w.source)}" target="_blank" rel="noopener noreferrer" aria-label="查看${esc(w.title)}的 GitHub 源码">GitHub 源码 ↗</a>`:'<span class="no-prompt" aria-hidden="true"></span>'}</div></article>`).join('');
    document.querySelector('#results-status').textContent=`${categories[filter]} · ${visible.length} 件作品，等待探索`;
    document.querySelector('#collection-count').textContent=`${String(visible.length).padStart(2,'0')} / ${works.length}`;
    document.querySelector('#empty-state').hidden=visible.length>0;
    document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  }
  function setFilter(next){filter=next;render();}
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter)));
  document.querySelector('#reset-filter').addEventListener('click',()=>{setFilter('all');document.querySelector('[data-filter="all"]').focus();});
  document.querySelector('#browse-cycling').addEventListener('click',()=>{setFilter('cycling');document.querySelector('#works').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
  document.querySelectorAll('a[href="#works"]').forEach(a=>a.addEventListener('click',()=>setFilter('all')));
  grid.addEventListener('click',e=>{const button=e.target.closest('[data-prompt]');if(!button)return;const w=works.find(w=>w.id===button.dataset.prompt);if(!w?.prompt)return;lastFocus=button;currentPrompt=w.prompt;document.querySelector('#prompt-title').textContent=w.title;document.querySelector('#prompt-content').textContent=w.prompt;document.querySelector('#prompt-work').href=w.url;document.querySelector('#copy-status').textContent='';document.querySelector('#copy-prompt').textContent='复制提示词';dialog.showModal();document.body.classList.add('no-scroll');});
  document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('no-scroll');lastFocus?.focus();});
  document.querySelector('#copy-prompt').addEventListener('click',async()=>{let copied=false;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(currentPrompt);copied=true;}}catch{}if(!copied){const field=document.createElement('textarea');field.value=currentPrompt;field.style.cssText='position:fixed;left:0;top:0;opacity:0';dialog.append(field);field.select();try{copied=document.execCommand('copy');}catch{}field.remove();}document.querySelector('#copy-status').textContent=copied?'提示词已复制，带着这个想法继续创造。':'复制未成功，请选中上方提示词手动复制。';if(copied)document.querySelector('#copy-prompt').textContent='已复制 ✓';});
  render();
})();
