/* =========================================================================
   The small amount of machinery every scene shares: DOM helpers, waiting,
   fades, and the line-by-line title cards the whole experience is told in.
   ========================================================================= */

export const $  = id => document.getElementById(id);
export const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const lerp  = (a, b, k) => a + (b - a) * k;

/* Nothing in the experience should outlive a skip, so every wait goes
   through here and every scene can cancel what it started. */
let aborted = false;
export const abortAll  = () => { aborted = true; };
export const resumeAll = () => { aborted = false; };
export const isAborted = () => aborted;

/* ---------------------------------------------------------------- images */
const cache = new Map();
export function load(src){
  if (cache.has(src)) return cache.get(src);
  const p = new Promise(res => {
    const im = new Image();
    im.onload  = () => res(im.naturalWidth ? im : null);
    im.onerror = () => res(null);
    im.src = src;
  });
  cache.set(src, p);
  return p;
}
export async function loadAll(map){
  const out = {};
  await Promise.all(Object.entries(map).map(async ([k, src]) => {
    out[k] = await load(src);
  }));
  return out;
}

/* --------------------------------------------------------------- fading */
export function fade(to, ms = 700){
  const v = $('veil');
  v.style.transition = `opacity ${ms}ms ease`;
  v.style.opacity = to;
  v.style.pointerEvents = to > 0.01 ? 'auto' : 'none';
  return sleep(ms);
}

/* ------------------------------------------------------------ the cards
   One line at a time, centred, in the serif. This is how the story is
   told between the playable bits, so it has to be skippable: a tap moves
   to the next line instead of making her wait.                          */
export function say(lines, opts = {}){
  const hold = opts.hold ?? 1900;
  const cls  = opts.cls  ?? '';
  const host = $('cards');
  const list = Array.isArray(lines) ? lines : [lines];
  return new Promise(resolve => {
    let i = 0, timer = null, done = false;
    const line = el('div', 'card-line ' + cls);
    host.appendChild(line);
    host.classList.add('on');

    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      host.removeEventListener('pointerdown', next);
      line.classList.remove('in');
      setTimeout(() => { line.remove(); if (!host.children.length) host.classList.remove('on'); }, 380);
      resolve();
    };
    const next = () => {
      clearTimeout(timer);
      if (i >= list.length){ finish(); return; }
      line.classList.remove('in');
      setTimeout(() => {
        if (done) return;
        line.innerHTML = list[i++];
        line.classList.add('in');
        timer = setTimeout(next, hold);
      }, i === 1 ? 0 : 260);
    };
    host.addEventListener('pointerdown', next);
    next();
  });
}

/* A single line that stays until you take it away. */
export function banner(html, cls = ''){
  const host = $('cards');
  const line = el('div', 'card-line in ' + cls, html);
  host.appendChild(line);
  host.classList.add('on');
  return () => {
    line.classList.remove('in');
    setTimeout(() => { line.remove(); if (!host.children.length) host.classList.remove('on'); }, 380);
  };
}

/* --------------------------------------------------------------- toasts */
let toastTimer = null;
export function toast(html, ms = 1800){
  const t = $('toast');
  t.innerHTML = html;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), ms);
}

/* ------------------------------------------------------------ vibration */
export function buzz(pattern){
  if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch(e){} }
}

/* --------------------------------------------------------------- layers */
export function show(id){ $(id).classList.add('on'); }
export function hide(id){ $(id).classList.remove('on'); }
