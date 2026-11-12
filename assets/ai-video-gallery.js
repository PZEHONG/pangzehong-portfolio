(() => {
  'use strict';
  const section = document.querySelector('#ai-videos');
  if (!section) return;
  const grid = section.querySelector('#ai-video-grid');
  const status = section.querySelector('#ai-video-status');
  const expand = section.querySelector('#ai-video-expand');
  const retry = section.querySelector('#ai-video-retry');
  const filters = [...section.querySelectorAll('[data-video-tool]')];
  const dialog = document.querySelector('#ai-video-dialog');
  const stage = document.querySelector('#ai-video-stage');
  const playerStatus = document.querySelector('#ai-video-player-status');
  const download = document.querySelector('#ai-video-download');
  const catalogUrl = new URL('ai-videos.json?v=2', document.currentScript.src);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const playIcon = '<span class="ai-video-play" aria-hidden="true"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M6 3.5 17 10 6 16.5Z"/></svg></span>';
  let catalog, loading, tool = 'all', expanded = false, lastFocus, slowTimer;
  const toolName = id => catalog.tools.find(t => t.id === id)?.name;
  function render() {
    const selected = catalog.videos.filter(v => tool === 'all' || v.tools.includes(tool));
    const visible = tool === 'all' && !expanded ? catalog.featured.map(id => catalog.videos.find(v => v.id === id)) : selected;
    grid.innerHTML = visible.map(v => {
      const software = v.tools.map(toolName).join(' / ');
      const size = `${(v.bytes / 1048576).toFixed(1)} MB`;
      return `<article class="ai-video-card" data-film="${esc(v.id)}"><button class="ai-video-cover" type="button" data-video-id="${esc(v.id)}" aria-label="播放：${esc(v.title)}" aria-haspopup="dialog"><img src="${esc(v.poster)}" alt="${esc(v.title)}视频封面" width="640" height="400" loading="lazy" decoding="async">${playIcon}<span class="ai-video-source-tag">点击播放</span><span class="ai-video-duration">${esc(v.duration)}</span></button><div class="ai-video-meta"><span>${esc(software || v.genre)}</span><span>${esc(software ? v.genre : '精选短片')}</span></div><h3><button class="ai-video-title" type="button" data-video-id="${esc(v.id)}" aria-haspopup="dialog">${esc(v.title)}</button></h3><p class="ai-video-description">${esc(v.description)}</p><div class="ai-video-actions"><span>${size}</span><a href="${esc(v.video)}" download="${esc(v.id)}.mp4" aria-label="下载视频：${esc(v.title)}">下载视频 <span aria-hidden="true">↓</span></a></div></article>`;
    }).join('');
    filters.forEach(button => {
      const active = button.dataset.videoTool === tool;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
      button.querySelector('span').textContent = button.dataset.videoTool === 'all' ? catalog.videos.length : String(catalog.videos.filter(v => v.tools.includes(button.dataset.videoTool)).length).padStart(2, '0');
    });
    status.textContent = tool === 'all'
      ? expanded ? `全部精选 · ${selected.length} 部短片` : `精选导览 · ${visible.length} / ${selected.length} 部短片`
      : `${toolName(tool)} · ${selected.length} 部短片`;
    expand.hidden = tool !== 'all';
    expand.setAttribute('aria-expanded', String(expanded));
    expand.innerHTML = expanded ? '收起为精选导览 <span aria-hidden="true">−</span>' : `展开全部 ${catalog.videos.length} 部 <span aria-hidden="true">＋</span>`;
  }
  async function loadCatalog() {
    if (catalog || loading) return loading;
    retry.hidden = true;
    grid.setAttribute('aria-busy', 'true');
    loading = (async () => {
      try {
        const response = await fetch(catalogUrl, {signal: AbortSignal.timeout(12000)});
        if (!response.ok) throw new Error('Catalog unavailable');
        const data = await response.json();
        if (data.tools?.length !== 6 || !data.videos?.length || data.featured?.length !== 6) throw new Error('Incomplete catalog');
        catalog = data;
        render();
        filters.forEach(b => { b.disabled = false; });
      } catch {
        grid.innerHTML = '<p class="ai-video-loading">片单暂时未能载入，请重试。</p>';
        status.textContent = '连接暂时中断，重试后可继续浏览。';
        retry.hidden = false;
      } finally {
        grid.setAttribute('aria-busy', 'false');
        loading = null;
      }
    })();
    return loading;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    tool = button.dataset.videoTool;
    render();
  }));
  expand.addEventListener('click', () => {
    expanded = !expanded;
    render();
    if (!expanded) section.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  retry.addEventListener('click', loadCatalog);
  function clearPlayer() {
    clearTimeout(slowTimer);
    const video = stage.querySelector('video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    stage.replaceChildren();
    stage.classList.remove('ai-video-portrait');
  }
  function openFilm(film, trigger) {
    clearPlayer();
    lastFocus = trigger;
    document.querySelector('#ai-video-title').textContent = film.title;
    document.querySelector('#ai-video-details').textContent = `${film.tools.map(toolName).join(' / ') || film.genre} · ${film.duration} · ${(film.bytes / 1048576).toFixed(1)} MB`;
    download.href = film.video;
    download.download = `${film.id}.mp4`;
    playerStatus.textContent = '正在载入视频…';
    dialog.showModal();
    document.body.classList.add('no-scroll');
    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'none';
    video.poster = film.poster;
    video.setAttribute('aria-label', film.title);
    if (film.orientation === 'portrait') stage.classList.add('ai-video-portrait');
    video.addEventListener('playing', () => {
      if (!stage.contains(video) || !dialog.open) return;
      clearTimeout(slowTimer);
      playerStatus.textContent = '';
    });
    video.addEventListener('error', () => {
      if (!stage.contains(video) || !dialog.open) return;
      clearTimeout(slowTimer);
      playerStatus.textContent = '暂时无法播放，可下载视频后观看。';
    });
    stage.append(video);
    // Assign the local media URL only after an explicit play action.
    video.src = film.video;
    video.play().catch(() => {
      if (dialog.open && stage.contains(video)) playerStatus.textContent = '点击播放器中的播放按钮继续。';
    });
    slowTimer = setTimeout(() => {
      if (dialog.open && video.readyState < 3) playerStatus.textContent = '视频仍在载入，也可下载后观看。';
    }, 12000);
  }
  grid.addEventListener('click', event => {
    const trigger = event.target.closest('[data-video-id]');
    if (!trigger || !catalog) return;
    const film = catalog.videos.find(v => v.id === trigger.dataset.videoId);
    if (film) openFilm(film, trigger);
  });
  document.querySelector('#ai-video-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    clearPlayer();
    document.body.classList.remove('no-scroll');
    lastFocus?.focus({preventScroll:true});
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        observer.disconnect();
        loadCatalog();
      }
    }, {rootMargin:'600px'});
    observer.observe(section);
  } else loadCatalog();
  if (location.hash === '#ai-videos') loadCatalog();
})();
