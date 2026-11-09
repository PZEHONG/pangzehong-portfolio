(() => {
  'use strict';
  const root = document.documentElement;
  const button = document.querySelector('.theme-toggle');
  const label = button.querySelector('.theme-label');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  function render() {
    const light = root.dataset.theme === 'light';
    const next = light ? '切换到深色模式' : '切换到明亮模式';
    button.setAttribute('aria-pressed', String(light));
    button.setAttribute('aria-label', next);
    button.title = next;
    label.textContent = light ? '暗色' : '亮色';
    if (themeColor) themeColor.content = light ? '#f6f6ed' : '#111310';
  }
  function toggleTheme() {
    const light = root.dataset.theme !== 'light';
    if (light) root.dataset.theme = 'light';
    else delete root.dataset.theme;
    try { localStorage.setItem('portfolio-theme', light ? 'light' : 'dark'); } catch (error) {}
    render();
  }
  let pointer = null;
  let suppressClick = false;
  button.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    const direction = Math.random() < .5 ? -1 : 1;
    const angle = direction * (7 + Math.random() * 4);
    button.style.setProperty('--swing-angle', `${angle}deg`);
    button.style.setProperty('--swing-opposite', `${-angle * (.7 + Math.random() * .2)}deg`);
    button.style.setProperty('--swing-duration', `${1.9 + Math.random() * .6}s`);
  });
  button.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    pointer = { id: event.pointerId, startY: event.clientY, distance: 0 };
    button.classList.remove('is-tugging');
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    pointer.distance = Math.max(0, Math.min(44, event.clientY - pointer.startY));
    if (pointer.distance > 3) button.classList.add('is-pulling');
    button.style.setProperty('--pull-distance', `${pointer.distance}px`);
  });
  function releasePointer(event, cancelled = false) {
    if (!pointer || event.pointerId !== pointer.id) return;
    const pulled = pointer.distance >= 12;
    pointer = null;
    button.classList.remove('is-pulling');
    button.style.setProperty('--pull-distance', '0px');
    if (pulled || cancelled) {
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 0);
      if (pulled && !cancelled) toggleTheme();
    }
  }
  button.addEventListener('pointerup', event => releasePointer(event));
  button.addEventListener('pointercancel', event => releasePointer(event, true));
  button.addEventListener('lostpointercapture', event => releasePointer(event, true));
  button.addEventListener('click', () => {
    if (suppressClick) return;
    button.classList.remove('is-tugging');
    void button.offsetWidth;
    button.classList.add('is-tugging');
    toggleTheme();
  });
  button.addEventListener('animationend', () => button.classList.remove('is-tugging'));
  window.addEventListener('storage', event => {
    if (event.key !== 'portfolio-theme') return;
    if (event.newValue === 'light') root.dataset.theme = 'light';
    else delete root.dataset.theme;
    render();
  });
  render();
  requestAnimationFrame(() => root.classList.add('theme-ready'));
})();
