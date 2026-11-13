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

const grid = document.getElementById('grid');
const filters = document.getElementById('filters');
const dialog = document.getElementById('lightbox');
const stage = document.getElementById('lb-stage');
const caption = document.getElementById('lb-caption');
const counter = document.getElementById('lb-count');
let visible = [];
let current = 0;

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
  const p = { title: "Sunlight Sunset Vegas", category: "LandScape", year: "2025", ratio: "3 / 2", src: "https://cdn.discordapp.com/attachments/916851203328081931/1570325719291138168/DSC09074.JPG?ex=6af6af4a&is=6af55dca&hm=fe92f0d711c991dc43b122941a38874343cab1b6e1bf623abd07023f63155459&" };
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

// Shows photos in the grid, optionally only one category.
function render(filter = 'All') {
  visible = PHOTOS.filter(p => filter === 'All' || p.category === filter);
  grid.replaceChildren(...visible.map((p, i) => {
    const btn = document.createElement('button');
    btn.className = 'tile';
    btn.style.aspectRatio = p.ratio;
    btn.setAttribute('aria-label', 'Open ' + p.title);
    btn.appendChild(media(p, 'fill'));
    btn.addEventListener('click', () => openAt(i));
    return btn;
  }));
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
    render(c);
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
