(() => {
  'use strict';
  const grid = document.querySelector('#work-grid');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const works = new Map((window.PORTFOLIO_WORKS || []).map(work => [new URL(work.url, document.baseURI).href, work]));
  let active = null;

  function stop() {
    if (!active) return;
    const { card, media, timer, timeout, reveal, observer, resize } = active;
    active = null;
    clearTimeout(timer);
    clearTimeout(timeout);
    clearTimeout(reveal);
    observer?.disconnect();
    resize?.disconnect();
    if (media?.tagName === 'VIDEO') {
      media.pause();
      media.removeAttribute('src');
      media.load();
    }
    media?.remove();
    card.classList.remove('preview-loading', 'preview-playing', 'preview-failed');
    card.querySelector('.preview-status')?.remove();
  }

  function start(card) {
    if (active?.card === card || motion.matches || document.hidden) return;
    stop();
    const link = card.querySelector('.work-image');
    const work = works.get(link.href);
    if (!work) return;
    const session = active = { card };
    // A brief dwell avoids starting heavy scenes while moving across the grid.
    session.timer = setTimeout(() => {
      if (active !== session) return;
      const status = document.createElement('span');
      status.className = 'preview-status';
      status.setAttribute('aria-hidden', 'true');
      status.textContent = '正在加载演示…';
      link.append(status);
      card.classList.add('preview-loading');

      const ready = () => {
        if (active !== session) return;
        clearTimeout(session.timeout);
        card.classList.remove('preview-loading');
        card.classList.add('preview-playing');
        status.textContent = '演示中 · 点击进入';
      };
      const failed = () => {
        if (active !== session) return;
        stop();
        // Keep the existing cover and working link if a preview cannot load.
        active = { card };
        card.classList.add('preview-failed');
        status.textContent = '点击进入作品';
        link.append(status);
      };
      session.timeout = setTimeout(failed, 20000);

      const isVideo = work.id === 'deepseek-splash';
      const media = session.media = document.createElement(isVideo ? 'video' : 'iframe');
      media.className = 'work-preview';
      media.setAttribute('aria-hidden', 'true');
      media.tabIndex = -1;
      if (isVideo) {
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.addEventListener('playing', ready, { once: true });
        media.addEventListener('error', failed, { once: true });
        media.src = new URL('harness-splash.webm', link.href).href;
        link.append(media);
        media.play().catch(() => { if (active === session) failed(); });
      } else {
        media.title = `${work.title}的动态预览`;
        media.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        media.setAttribute('allow', "autoplay 'none'; camera 'none'; microphone 'none'");
        media.inert = true;
        const fit = () => {
          const scale = link.clientWidth / 1440;
          media.style.width = '1440px';
          media.style.height = `${link.clientHeight / scale}px`;
          media.style.transform = `scale(${scale})`;
        };
        fit();
        session.resize = new ResizeObserver(fit);
        session.resize.observe(link);
        media.addEventListener('load', () => {
          if (active !== session) return;
          // Keep the cover visible while the scene paints its first frame.
          session.reveal = setTimeout(ready, 450);
        }, { once: true });
        media.addEventListener('error', failed, { once: true });
        media.src = link.href;
        link.append(media);
      }
      session.observer = new IntersectionObserver(entries => {
        if (active === session && !entries[0].isIntersecting) stop();
      });
      session.observer.observe(link);
    }, 220);
  }

  grid.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch' || !hover.matches) return;
    const card = event.target.closest('.work-card');
    if (card && !card.contains(event.relatedTarget)) start(card);
  });
  grid.addEventListener('pointerout', event => {
    const card = event.target.closest('.work-card');
    if (card === active?.card && !card.contains(event.relatedTarget)) stop();
  });
  grid.addEventListener('focusin', event => {
    if (!event.target.matches('.work-image:focus-visible')) return;
    start(event.target.closest('.work-card'));
  });
  grid.addEventListener('focusout', event => {
    if (event.target.matches('.work-image')) stop();
  });
  grid.addEventListener('click', stop);
  grid.addEventListener('previewreset', stop);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  motion.addEventListener('change', stop);
  hover.addEventListener('change', stop);
})();
