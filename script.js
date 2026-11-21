/* ---------- YOUR CONTENT ---------- */

// HOW TO ADD A PHOTO: copy any line below, then change title, category, year, ratio, tone, and src.
// ratio: the shape of the photo, e.g. "4 / 5", "3 / 2", "16 / 9".
// category: use any name you like (Sports, Nature, Portrait, Street, Events...).
// Filter buttons are created automatically from the category names you use.
// src: your image link. Leave "" to show a colored placeholder.
import {PHOTOS as f} from "./photos.js";
const PHOTOS = f;

// Index of the photo shown at the top of the page.
const HERO_INDEX = 0;

// Portrait photo for the About section. Put your image link here, or leave "".
const PORTRAIT_SRC = "edit.png";

/* ---------------------------------- */

// How many photos are shown per page in the grid.
const PAGE_SIZE = 10;

const grid = document.getElementById('grid');
const filters = document.getElementById('filters');
const pager = document.getElementById('pager');
const dialog = document.getElementById('lightbox');
const stage = document.getElementById('lb-stage');
const caption = document.getElementById('lb-caption');
const counter = document.getElementById('lb-count');
let visible = [];   // photos on the current page (used by the lightbox)
let current = 0;
let activeFilter = 'All';
let page = 1;

// Builds either an <img> (if src is set) or a colored placeholder block.
function media(p, cls) {
  if (p.src) {
    const img = document.createElement('img');
    img.src = p.src;
    img.alt = p.title;
    img.loading = 'lazy';
    img.className = cls;
    return img;
  }
  const d = document.createElement('div');
  d.className = cls + ' placeholder';
  d.style.background = p.tone;
  d.setAttribute('role', 'img');
  d.setAttribute('aria-label', p.title);
  return d;
}

function renderHero() {
  const p = { title: "Sunlight Sunset Vegas", category: "LandScape", year: "2025", ratio: "3 / 2", src: "Showcase.png" };
  const el = media(p, 'hero-image');
  el.setAttribute('alt', p.title);
  document.querySelector('[data-hero]').appendChild(el);
}

function renderPortrait() {
  const slot = document.querySelector('[data-portrait]');
  if (PORTRAIT_SRC) {
    const img = document.createElement('img');
    img.src = PORTRAIT_SRC;
    img.alt = 'Portrait of the photographer';
    img.className = 'portrait';
    slot.appendChild(img);
  } else {
    const d = document.createElement('div');
    d.className = 'portrait';
    d.style.background = '#B8AFA2';
    d.setAttribute('role', 'img');
    d.setAttribute('aria-label', 'Portrait placeholder');
    slot.appendChild(d);
  }
}

// Builds one grid tile. A shimmer skeleton sits over the photo until it has loaded.
function tile(p, i) {
  const btn = document.createElement('button');
  btn.className = 'tile';
  btn.style.aspectRatio = p.ratio;
  btn.setAttribute('aria-label', 'Open ' + p.title);
  btn.addEventListener('click', () => openAt(i));

  if (!p.src) {
    btn.appendChild(media(p, 'fill'));
    return btn;
  }

  const skeleton = document.createElement('span');
  skeleton.className = 'skeleton';
  skeleton.setAttribute('aria-hidden', 'true');

  const img = media(p, 'fill');
  img.classList.add('is-loading');
  const done = () => { img.classList.remove('is-loading'); skeleton.remove(); };
  img.addEventListener('load', done, { once: true });
  img.addEventListener('error', done, { once: true });

  btn.append(skeleton, img);
  return btn;
}

// Shows the current page of the active category in the grid.
function render() {
  const filtered = PHOTOS.filter(p => activeFilter === 'All' || p.category === activeFilter);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  page = Math.min(page, pages);

  const start = (page - 1) * PAGE_SIZE;
  visible = filtered.slice(start, start + PAGE_SIZE);
  grid.replaceChildren(...visible.map((p, i) => tile(p, i)));
  renderPager(pages);
}

// Page buttons: Prev, one per page, Next. Hidden when everything fits on one page.
function renderPager(pages) {
  pager.hidden = pages <= 1;
  if (pages <= 1) return;

  const button = (label, target, { aria = label, disabled = false, current = false } = {}) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.setAttribute('aria-label', aria);
    b.disabled = disabled;
    if (current) b.setAttribute('aria-current', 'page');
    b.addEventListener('click', () => goTo(target));
    return b;
  };

  const items = [button('← Prev', page - 1, { aria: 'Previous page', disabled: page === 1 })];
  for (let n = 1; n <= pages; n++) {
    items.push(button(String(n), n, { aria: 'Page ' + n, current: n === page }));
  }
  items.push(button('Next →', page + 1, { aria: 'Next page', disabled: page === pages }));
  pager.replaceChildren(...items);
}

function goTo(n) {
  page = n;
  render();
  document.getElementById('work').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showCurrent() {
  const p = visible[current];
  const el = media(p, 'frame');
  el.style.setProperty('--ratio', p.ratio);
  stage.replaceChildren(el);

  const name = document.createElement('span');
  name.textContent = p.title + ', ' + p.year;
  const cat = document.createElement('span');
  cat.textContent = p.category;
  caption.replaceChildren(name, cat);

  counter.textContent = (current + 1) + ' of ' + visible.length;
}

function openAt(i) {
  current = i;
  showCurrent();
  dialog.showModal();
}

function step(dir) {
  current = (current + dir + visible.length) % visible.length;
  showCurrent();
}

// Filter buttons, one per category, plus "All".
const categories = ['All', ...new Set(PHOTOS.map(p => p.category))];
categories.forEach((c, i) => {
  const b = document.createElement('button');
  b.textContent = c;
  b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
  b.addEventListener('click', () => {
    filters.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    activeFilter = c;
    page = 1;
    render();
  });
  filters.appendChild(b);
});

// Lightbox controls
document.getElementById('lb-prev').addEventListener('click', () => step(-1));
document.getElementById('lb-next').addEventListener('click', () => step(1));
document.getElementById('lb-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
dialog.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

document.getElementById('year').textContent = new Date().getFullYear();

renderHero();
renderPortrait();
render();
