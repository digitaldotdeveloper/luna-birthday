/* =========================================================================
   Two separate things: the cheap square-wave noises the terrible site makes,
   and the actual song. Kept apart so the track can be swapped for a licensed
   or original one by changing CONFIG.MUSIC.src and nothing else.
   ========================================================================= */

import { CONFIG } from './config.js';
import { $ } from './core.js';

let AC = null;
export let muted = false;

export function ctx(){
  if (!AC){
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
  }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
}

/* ------------------------------------------------------------- one voice */
export function tone(freq, when, dur, o = {}){
  if (muted) return;
  const a = ctx(); if (!a) return;
  const t0 = a.currentTime + when;
  const g = a.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(o.gain ?? 0.12, t0 + 0.012);
  g.gain.setValueAtTime(o.gain ?? 0.12, t0 + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  g.connect(a.destination);
  const mk = det => {
    const osc = a.createOscillator();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(24, o.slide), t0 + dur);
    osc.detune.value = det;
    osc.connect(g); osc.start(t0); osc.stop(t0 + dur + 0.02);
  };
  mk(0);
  if (o.bad) mk(11);          // the second, slightly out-of-tune voice
}

export function noise(when, dur, gain = 0.2, hp = 700){
  if (muted) return;
  const a = ctx(); if (!a) return;
  const t0 = a.currentTime + when;
  const n = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, n, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = a.createBufferSource(); src.buffer = buf;
  const f = a.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
  const g = a.createGain(); g.gain.value = gain;
  src.connect(f); f.connect(g); g.connect(a.destination);
  src.start(t0);
}

/* ------------------------------------------- the only song it can play --
   Happy Birthday, one phrase, on a square wave, with a drum machine that
   should not be encouraged.                                              */
const N = { G4:392, A4:440, B4:493.88, C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99 };
const MELODY = [[N.G4,.75],[N.G4,.25],[N.A4,1],[N.G4,1],[N.C5,1],[N.B4,1.6]];
const BEAT = 0.30;

export function cheesySong(){
  let t = 0.2;
  for (const [f, b] of MELODY){
    tone(f, t, b * BEAT * 0.92, { type:'square', gain:0.1, bad:true });
    t += b * BEAT;
  }
  for (let b = 0; b < Math.ceil(t / BEAT); b++)
    noise(0.2 + b * BEAT, 0.05, b % 2 ? 0.05 : 0.09, b % 2 ? 3800 : 900);
  return (t + 0.35) * 1000;
}
/* the same song, dying */
export function tapeStop(){
  tone(N.C5, 0, 1.7, { type:'square', gain:0.13, bad:true, slide:38 });
  tone(N.G4, 0.05, 1.7, { type:'sawtooth', gain:0.07, slide:26 });
}

/* ------------------------------------------------------------- the rest */
export const sfx = {
  click(){ tone(880, 0, 0.05, { type:'square', gain:0.07 }); },
  clunk(){ tone(180, 0, 0.09, { type:'square', gain:0.09, slide:120 }); noise(0, 0.04, 0.05, 1200); },
  step(){  noise(0, 0.045, 0.035, 500); },
  pick(){  tone(760 + Math.random()*220, 0, 0.12, { type:'triangle', gain:0.12 }); },
  good(){  [0,110,220].forEach((d,i) => tone([659.25,783.99,1046.5][i], d/1000, 0.45, { type:'triangle', gain:0.11 })); },
  bad(){   tone(180, 0, 0.22, { type:'sawtooth', gain:0.1, slide:110 }); },
  key(){   [0,90,180,300].forEach((d,i) => tone([523.25,659.25,783.99,1318.5][i], d/1000, 0.55, { type:'triangle', gain:0.1 })); },
  glass(){ noise(0, 0.5, 0.3, 1800); noise(0.07, 0.35, 0.18, 900); },
  thud(){  tone(70, 0, 0.4, { type:'sine', gain:0.28, slide:34 }); noise(0, 0.16, 0.16, 200); },
  candle(i){ tone(430 + (i % 12) * 34, 0, 0.18, { type:'triangle', gain:0.1 }); },
  whoosh(){ noise(0, 0.55, 0.12, 260); },
  alarm(){ for (let i=0;i<5;i++) tone(i%2?740:560, i*0.16, 0.15, { type:'square', gain:0.09 }); }
};

/* ============================================================== the song
   Safari will not play an <audio> element that was not started from a tap,
   and will not start one that has downloaded nothing. So the very first
   tap in the whole experience primes it and begins the fetch; the real
   play() happens later, inside another tap.                              */
let bgm = null, fadeTimer = null, wanted = false;

export function initMusic(){
  bgm = $('bgm');
  if (!bgm) return;
  bgm.src = CONFIG.MUSIC.src;
  bgm.loop = true;
  bgm.preload = 'none';
  bgm.volume = 0;
}
export function primeMusic(){
  if (!bgm) return;
  bgm.preload = 'auto';
  try { bgm.load(); } catch(e){}
  const p = bgm.play();
  if (p && p.then) p.then(() => bgm.pause()).catch(() => {});
}
export function startMusic(){
  if (!bgm) return;
  wanted = true;
  if (muted) return;
  bgm.volume = 0;
  const p = bgm.play();
  if (p && p.catch) p.catch(() => {});
  rampTo(CONFIG.MUSIC.volume, CONFIG.MUSIC.fadeMs);
}
export function duckMusic(to = 0.22, ms = 1400){ rampTo(to, ms); }
export function fadeOutMusic(ms = 3000){ rampTo(0, ms); }

function rampTo(target, ms){
  if (!bgm) return;
  clearInterval(fadeTimer);
  const steps = Math.max(1, Math.round(ms / 50));
  const from = bgm.volume;
  let i = 0;
  fadeTimer = setInterval(() => {
    if (muted){ clearInterval(fadeTimer); return; }
    i++;
    bgm.volume = Math.max(0, Math.min(1, from + (target - from) * (i / steps)));
    if (i >= steps) clearInterval(fadeTimer);
  }, 50);
}

/* the beat, roughly, for the few effects that lean on it */
export function musicTime(){ return bgm ? bgm.currentTime : 0; }

export function toggleMute(){
  muted = !muted;
  if (bgm){
    clearInterval(fadeTimer);
    if (muted) bgm.pause();
    else if (wanted){ bgm.volume = CONFIG.MUSIC.volume; bgm.play().catch(() => {}); }
  }
  return muted;
}
export function pauseForHidden(hidden){
  if (!bgm || muted || !wanted) return;
  if (hidden) bgm.pause(); else bgm.play().catch(() => {});
}
