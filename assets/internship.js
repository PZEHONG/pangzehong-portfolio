(() => {
  'use strict';
  const dialog = document.querySelector('#evidence-dialog');
  const links = [...document.querySelectorAll('[data-evidence]')];
  if (!dialog || !links.length) return;
  const photo = dialog.querySelector('img');
  const title = document.querySelector('#evidence-title');
  const caption = document.querySelector('#evidence-caption');
  const position = document.querySelector('#evidence-position');
  const original = document.querySelector('#evidence-file');
  let index = 0;
  let trigger;
  function show(next) {
    index = (next + links.length) % links.length;
    const link = links[index];
    const image = link.querySelector('img');
    photo.src = link.href;
    photo.alt = image.alt;
    title.textContent = link.dataset.title;
    caption.textContent = link.dataset.caption;
    position.textContent = `${String(index + 1).padStart(2, '0')} / ${links.length}`;
    original.href = link.href;
  }
  links.forEach((link, i) => link.addEventListener('click', event => {
    event.preventDefault();
    trigger = link;
    show(i);
    dialog.showModal();
    document.body.classList.add('no-scroll');
  }));
  document.querySelector('#evidence-close').addEventListener('click', () => dialog.close());
  document.querySelector('#evidence-prev').addEventListener('click', () => show(index - 1));
  document.querySelector('#evidence-next').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('no-scroll');
    trigger?.focus({preventScroll: true});
  });
})();
