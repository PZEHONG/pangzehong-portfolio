(() => {
  'use strict';
  const section = document.querySelector('#ai-videos');
  if (!section) return;
  const grid = section.querySelector('#ai-video-grid');
  const status = section.querySelector('#ai-video-status');
  const expand = section.querySelector('#ai-video-expand');
  const retry = section.querySelector('#ai-video-retry');
  const filters = [...section.querySelectorAll('[data-video-source]')];
  const dialog = document.querySelector('#ai-video-dialog');
  const stage = document.querySelector('#ai-video-stage');
  const playerStatus = document.querySelector('#ai-video-player-status');
  const original = document.querySelector('#ai-video-original');
  const catalogUrl = new URL('ai-videos.json', document.currentScript.src);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const playIcon = '<span class="ai-video-play" aria-hidden="true"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M6 3.5 17 10 6 16.5Z"/></svg></span>';
  const externalIcon = '<span class="ai-video-play" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 16 16 4M5 4h11v11"/></svg></span>';
  let catalog, loading, source = 'all', expanded = false, lastFocus, slowTimer;
  function render() {
    const selected = catalog.videos.filter(v => source === 'all' || v.source === source);
    const visible = source === 'all' && !expanded ? selected.slice(0, 6) : selected;
    grid.innerHTML = visible.map(v => {
      const site = catalog.sources.find(s => s.id === v.source);
      const external = v.type === 'external';
      const cover = `<img src="${esc(v.poster)}" alt="${esc(v.title)}${v.poster.endsWith('.svg') ? '作品题签' : '视频封面'}" width="640" height="400" loading="lazy" decoding="async">${external ? externalIcon : playIcon}<span class="ai-video-source-tag">${external ? '原站观看 ↗' : v.type === 'youtube' ? '官方播放器' : '点击播放'}</span>${v.duration ? `<span class="ai-video-duration">${esc(v.duration)}</span>` : ''}`;
      const trigger = external
        ? `<a class="ai-video-cover" href="${esc(v.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="在原站观看：${esc(v.title)}（新标签页）">${cover}</a>`
        : `<button class="ai-video-cover" type="button" data-video-id="${esc(v.id)}" aria-label="播放：${esc(v.title)}" aria-haspopup="dialog">${cover}</button>`;
      const title = external
        ? `<a class="ai-video-title" href="${esc(v.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(v.title)}</a>`
        : `<button class="ai-video-title" type="button" data-video-id="${esc(v.id)}" aria-haspopup="dialog">${esc(v.title)}</button>`;
      return `<article class="ai-video-card" data-film="${esc(v.id)}">${trigger}<div class="ai-video-meta"><span>${esc(site.name)}${v.award ? ` · ${esc(v.award)}` : ''}</span><span>${esc(v.genre)}</span></div><h3>${title}</h3><p class="ai-video-description">${esc(v.description)}</p><div class="ai-video-card-footer"><p>来源作者 · ${esc(v.creator)}</p><a href="${esc(v.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="查看${esc(v.title)}的原作与来源（新标签页）">原作 ↗</a></div></article>`;
    }).join('');
    filters.forEach(button => {
      const active = button.dataset.videoSource === source;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    status.textContent = source === 'all'
      ? expanded ? '全部精选 · 共 30 部，每个来源 5 部。' : '精选导览 · 展示 6 / 30 部，每个来源先看 1 部。'
      : `${catalog.sources.find(s => s.id === source).name} · 5 部精选${source === 'deng' ? '，含 2 部 AIGC 与 3 部创作参考' : source === 'leo' ? '，前往原站播放' : ''}。`;
    expand.hidden = source !== 'all';
    expand.setAttribute('aria-expanded', String(expanded));
    expand.innerHTML = expanded ? '收起为精选导览 <span aria-hidden="true">−</span>' : '展开全部 30 部 <span aria-hidden="true">＋</span>';
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
        if (data.sources?.length !== 6 || data.videos?.length !== 30) throw new Error('Incomplete catalog');
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
    source = button.dataset.videoSource;
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
    // Removing the iframe releases the official player and stops its audio/network.
    stage.replaceChildren();
    stage.classList.remove('ai-video-portrait');
  }
  function openFilm(film, trigger) {
    clearPlayer();
    lastFocus = trigger;
    document.querySelector('#ai-video-title').textContent = film.title;
    document.querySelector('#ai-video-credit').textContent = `来源作者 · ${film.creator} / ${catalog.sources.find(s => s.id === film.source).name}`;
    original.href = film.sourceUrl;
    playerStatus.textContent = film.playbackNote || '正在载入视频…';
    dialog.showModal();
    document.body.classList.add('no-scroll');
    if (film.type === 'youtube') {
      const frame = document.createElement('iframe');
      const url = new URL(`https://www.youtube.com/embed/${film.youtubeId}`);
      url.search = new URLSearchParams({autoplay:'1',rel:'0',playsinline:'1',enablejsapi:'1',origin:location.origin});
      frame.title = `${film.title} — 官方 YouTube 播放器`;
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.src = url.href;
      stage.append(frame);
      return;
    }
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
      playerStatus.textContent = film.source === 'deng' ? '若播放卡顿，可前往原站观看。' : '';
    });
    video.addEventListener('error', () => {
      if (!stage.contains(video) || !dialog.open) return;
      clearTimeout(slowTimer);
      playerStatus.textContent = '此视频暂时无法播放，请使用下方“原站观看”。';
    });
    stage.append(video);
    // No media URL is assigned until the visitor explicitly chooses this film.
    video.src = film.video;
    video.play().catch(() => {
      if (dialog.open && stage.contains(video)) playerStatus.textContent = '点击播放器中的播放按钮继续，或前往原站观看。';
    });
    slowTimer = setTimeout(() => {
      if (dialog.open && video.readyState < 3) playerStatus.textContent = '视频仍在载入，可继续等待或前往原站观看。';
    }, 12000);
  }
  grid.addEventListener('click', event => {
    const trigger = event.target.closest('[data-video-id]');
    if (!trigger || !catalog) return;
    const film = catalog.videos.find(v => v.id === trigger.dataset.videoId);
    if (film && film.type !== 'external') openFilm(film, trigger);
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
