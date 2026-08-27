/* =========================================================================
   The look of the second half: the layered world, the motes of light, and
   the effect that tears the first half apart.
   ========================================================================= */

import { clamp } from './core.js';

/* ======================================================== the world =====
   Six layers at six distances. The floor and the water are photographs cut
   into bands: each band takes its own slice of the texture and measures
   from the same world line, so the joints spread apart as they come toward
   you. That difference across the bands is the whole illusion.           */
export class World {
  constructor(canvas){
    this.cv = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.art = {};
    this.stars = [];
    this.motes = [];
    this.lights = [];
    this.bloom = 0;
    this.t = 0;
  }

  setArt(art){ this.art = art; }

  layout(){
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.cv.width  = Math.round(this.W * DPR);
    this.cv.height = Math.round(this.H * DPR);
    this.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    this.SC = clamp(this.H / 780, 0.72, 1.14);

    this.horizonY = this.H * 0.41;
    this.poolFar  = this.H * 0.47;
    this.deckFar  = this.H * 0.62;
    this.groundY  = this.H * 0.785;   // the line the character stands on

    this.buildStars();
    this.buildMotes();
    this.buildLights();
    this.skyKey = this.poolKey = this.deckKey = '';
  }

  buildStars(){
    this.stars = [];
    const n = Math.round((this.W * this.horizonY) / 4200);
    for (let i = 0; i < n; i++)
      this.stars.push({ x: Math.random() * this.W, y: Math.random() * this.horizonY * 0.98,
                        r: Math.random() * 1.2 + 0.3, a: Math.random() * 0.5 + 0.2,
                        tw: Math.random() * 6.28, sp: Math.random() * 1.7 + 0.4 });
  }
  /* the floating light. Slow, warm, and never in a hurry. */
  buildMotes(){
    this.motes = [];
    const n = Math.round((this.W * this.H) / 26000);
    for (let i = 0; i < n; i++)
      this.motes.push({ x: Math.random() * this.W, y: Math.random() * this.H,
                        r: Math.random() * 2.2 + 0.8, a: Math.random() * 0.4 + 0.12,
                        vy: -(6 + Math.random() * 16), ph: Math.random() * 6.28,
                        sw: 6 + Math.random() * 20 });
  }
  buildLights(){
    this.lights = [];
    const n = Math.round(this.W / 30) + 8;
    for (let i = 0; i <= n; i++) this.lights.push({ i, ph: Math.random() * 6.28 });
  }

  /* ---------------------------------------------------------- textures */
  bands(im, yTop, yBot, count, sc0, sc1, speed, curve, cam){
    if (!im) return false;
    const { ctx, W } = this;
    const tw = im.naturalWidth, th = im.naturalHeight;
    ctx.save();
    ctx.beginPath(); ctx.rect(-10, yTop, W + 20, yBot - yTop + 2); ctx.clip();
    const vx = W * 0.5;
    for (let i = 0; i < count; i++){
      const v0 = i / count, v1 = (i + 1) / count;
      const e0 = v0 * v0 * curve + v0 * (1 - curve);
      const e1 = v1 * v1 * curve + v1 * (1 - curve);
      const y0 = yTop + (yBot - yTop) * e0;
      const y1 = yTop + (yBot - yTop) * e1;
      const sy = v0 * th, sh = Math.max(1, (v1 - v0) * th);
      const sc = sc0 + (sc1 - sc0) * v0;
      const dw = tw * sc;
      const world = cam * speed * sc;
      const n0 = Math.floor((world - vx) / dw) - 1;
      const n1 = Math.ceil((world + vx) / dw) + 1;
      for (let n = n0; n <= n1; n++){
        const x = vx + n * dw - world;
        if (x > W + dw || x + dw < -dw) continue;
        const flip = ((n % 2) + 2) % 2 === 1;
        const sy2 = flip ? (sy + th * 0.37) % Math.max(1, th - sh) : sy;
        ctx.save();
        if (flip){ ctx.translate(2 * x + dw, 0); ctx.scale(-1, 1); }
        ctx.drawImage(im, 0, sy2, tw, sh, x, y0, dw, y1 - y0 + 1);
        ctx.restore();
      }
    }
    ctx.restore();
    return true;
  }

  /* ------------------------------------------------------------- paint */
  draw(cam, dt, opts = {}){
    const { ctx, W, H, SC } = this;
    this.t += dt;
    const t = this.t;
    const bloom = this.bloom = opts.bloom ?? this.bloom;
    const building = opts.building === 'room' ? this.art.room : this.art.villa;

    /* sky */
    const k = W + 'x' + H + ':' + Math.round(bloom * 24);
    if (k !== this.skyKey){
      this.skyKey = k;
      const g = ctx.createLinearGradient(0, 0, 0, this.horizonY);
      g.addColorStop(0,   mix([16,7,30],  [34,14,58],  bloom));
      g.addColorStop(0.6, mix([30,12,58], [62,24,96],  bloom));
      g.addColorStop(1,   mix([58,26,98], [116,54,150], bloom));
      this.skyG = g;
    }
    ctx.fillStyle = this.skyG;
    ctx.fillRect(-30, -30, W + 60, this.horizonY + 40);

    for (const s of this.stars){
      ctx.globalAlpha = s.a * (0.5 + 0.5 * Math.sin(t * s.sp + s.tw));
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* the moon, low and large */
    const mx = W * 0.78 - cam * 0.02, my = this.horizonY * 0.34, mr = 46 * SC;
    const mg = ctx.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 4.4);
    mg.addColorStop(0, 'rgba(255,236,206,' + (0.20 + bloom * 0.16) + ')');
    mg.addColorStop(1, 'rgba(255,220,190,0)');
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.arc(mx, my, mr * 4.4, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(252,244,226,.95)';
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.2832); ctx.fill();

    /* the ridges */
    if (this.art.mountains){
      const im = this.art.mountains;
      const w = W * 1.9, h = w * (im.naturalHeight / im.naturalWidth);
      const off = ((-cam * 0.05) % w + w) % w;
      for (let i = -1; i <= 1; i++)
        ctx.drawImage(im, i * w + off - w, this.horizonY - h * 0.94, w, h);
    }
    /* the building */
    if (building){
      const w = W * 1.35, h = w * (building.naturalHeight / building.naturalWidth);
      const off = ((-cam * 0.17) % w + w) % w;
      for (let i = -1; i <= 1; i++)
        ctx.drawImage(building, i * w + off - w, this.poolFar - h * 0.86, w, h);
      const bank = ctx.createLinearGradient(0, this.horizonY, 0, this.poolFar);
      bank.addColorStop(0,   'rgba(74,44,124,0)');
      bank.addColorStop(1,   'rgba(112,70,178,.34)');
      ctx.fillStyle = bank;
      ctx.fillRect(-10, this.horizonY, W + 20, this.poolFar - this.horizonY + 2);
    }
    /* the lights strung over the water */
    this.drawLights(cam, t, bloom);
    if (this.art.bunting){
      const im = this.art.bunting;
      const w = W * 1.1, h = w * (im.naturalHeight / im.naturalWidth);
      const off = ((-cam * 0.5) % w + w) % w;
      for (let i = -1; i <= 1; i++) ctx.drawImage(im, i * w + off - w, H * 0.30, w, h);
    }

    /* the water */
    if (this.poolKey !== W + 'x' + H){
      this.poolKey = W + 'x' + H;
      const g = ctx.createLinearGradient(0, this.poolFar, 0, this.deckFar);
      g.addColorStop(0, 'rgb(58,30,120)');
      g.addColorStop(1, 'rgb(126,74,224)');
      this.poolG = g;
    }
    ctx.fillStyle = this.poolG;
    ctx.fillRect(-10, this.poolFar, W + 20, this.deckFar - this.poolFar);
    if (this.bands(this.art.water, this.poolFar, this.deckFar, 12, 0.07, 0.30, 0.62, 0.76, cam)){
      const tint = ctx.createLinearGradient(0, this.poolFar, 0, this.deckFar);
      tint.addColorStop(0,   'rgba(30,14,74,.72)');
      tint.addColorStop(1,   'rgba(74,40,150,.36)');
      ctx.fillStyle = tint;
      ctx.fillRect(-10, this.poolFar, W + 20, this.deckFar - this.poolFar);
    }
    ctx.fillStyle = 'rgba(214,190,255,.22)';
    ctx.fillRect(-10, this.poolFar, W + 20, 2 * SC);

    /* the floor */
    if (this.deckKey !== W + 'x' + H){
      this.deckKey = W + 'x' + H;
      const g = ctx.createLinearGradient(0, this.deckFar, 0, H);
      g.addColorStop(0,    'rgb(126,106,126)');
      g.addColorStop(0.22, 'rgb(92,74,98)');
      g.addColorStop(1,    'rgb(26,17,34)');
      this.deckG = g;
    }
    ctx.fillStyle = this.deckG;
    ctx.fillRect(-10, this.deckFar, W + 20, H - this.deckFar + 10);
    if (this.bands(this.art.floor, this.deckFar, H + 2, 18, 0.10, 0.58, 1.0, 0.84, cam)){
      const sh = ctx.createLinearGradient(0, this.deckFar, 0, H);
      sh.addColorStop(0,    'rgba(44,26,64,.52)');
      sh.addColorStop(0.30, 'rgba(30,17,46,.72)');
      sh.addColorStop(0.72, 'rgba(18,9,30,.80)');
      sh.addColorStop(1,    'rgba(10,5,18,.90)');
      ctx.fillStyle = sh;
      ctx.fillRect(-10, this.deckFar, W + 20, H - this.deckFar + 10);
    }
    const gl = ctx.createLinearGradient(0, this.groundY - 44 * SC, 0, this.groundY + 3);
    gl.addColorStop(0, 'rgba(255,220,170,0)');
    gl.addColorStop(1, 'rgba(255,220,170,' + (0.07 + bloom * 0.06) + ')');
    ctx.fillStyle = gl;
    ctx.fillRect(-10, this.groundY - 44 * SC, W + 20, 47 * SC);
  }

  drawLights(cam, t, bloom){
    const { ctx, W, H, SC } = this;
    const span = 30 * SC, sag = H * 0.055, off = (cam * 0.42) % (span * 8);
    ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (const l of this.lights){
      const x = l.i * span - off;
      const y = H * 0.10 + Math.sin((l.i * span - off) / (span * 8) * Math.PI * 2) * sag;
      l.sx = x; l.sy = y;
      l.i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    for (const l of this.lights){
      if (l.sx < -30 || l.sx > W + 30) continue;
      const f = (0.6 + 0.4 * Math.sin(t * 1.5 + l.ph)) * (0.55 + bloom * 0.45);
      const g = ctx.createRadialGradient(l.sx, l.sy, 0, l.sx, l.sy, 14);
      g.addColorStop(0, 'rgba(255,222,150,' + (0.72 * f) + ')');
      g.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(l.sx, l.sy, 14, 0, 6.2832); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,205,' + (0.85 * f) + ')';
      ctx.beginPath(); ctx.arc(l.sx, l.sy, 2.1, 0, 6.2832); ctx.fill();
    }
  }

  /* the light that drifts in front of everything */
  drawMotes(dt, boost = 0){
    const { ctx, W, H } = this;
    for (const m of this.motes){
      m.y += m.vy * dt * (1 + boost);
      m.ph += dt;
      if (m.y < -12){ m.y = H + 12; m.x = Math.random() * W; }
      const x = m.x + Math.sin(m.ph * 0.6) * m.sw;
      const a = m.a * (0.6 + 0.4 * Math.sin(m.ph * 1.4)) * (1 + boost * 0.6);
      const g = ctx.createRadialGradient(x, m.y, 0, x, m.y, m.r * 5);
      g.addColorStop(0, 'rgba(238,214,255,' + a + ')');
      g.addColorStop(1, 'rgba(200,164,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, m.y, m.r * 5, 0, 6.2832); ctx.fill();
    }
  }
}

export function mix(a, b, k){
  return 'rgb(' + Math.round(a[0]+(b[0]-a[0])*k) + ',' +
                  Math.round(a[1]+(b[1]-a[1])*k) + ',' +
                  Math.round(a[2]+(b[2]-a[2])*k) + ')';
}

/* ======================================================= sprite strips == */
export function cell(ctx, im, cells, i, x, y, h, flip = false){
  if (!im) return false;
  const cw = im.naturalWidth / cells, ch = im.naturalHeight;
  const w = h * (cw / ch);
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(im, i * cw, 0, cw, ch, -w / 2, -h, w, h);
  ctx.restore();
  return true;
}

/* ============================================================ particles = */
export class Burst {
  constructor(){ this.p = []; }
  add(x, y, colour, n = 20, power = 1){
    for (let i = 0; i < n; i++){
      const a = Math.random() * 6.2832, s = (40 + Math.random() * 150) * power;
      this.p.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30,
                    life: 0.5 + Math.random() * 0.6, r: 1.4 + Math.random() * 2.8, c: colour });
    }
  }
  update(dt){
    for (const q of this.p){ q.x += q.vx*dt; q.y += q.vy*dt; q.vy += 220*dt; q.life -= dt*1.2; }
    this.p = this.p.filter(q => q.life > 0);
  }
  draw(ctx){
    for (const q of this.p){
      ctx.globalAlpha = Math.max(0, q.life);
      ctx.fillStyle = 'rgb(' + q.c + ')';
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/* ============================================================ fireworks = */
export class Fireworks {
  constructor(){ this.sparks = []; this.next = 0; }
  update(dt, W, H){
    this.next -= dt;
    if (this.next <= 0){
      this.next = 0.55 + Math.random() * 0.9;
      const x = W * (0.15 + Math.random() * 0.7);
      const y = H * (0.12 + Math.random() * 0.22);
      const hue = [280, 315, 265, 330][Math.floor(Math.random() * 4)];
      for (let i = 0; i < 46; i++){
        const a = (i / 46) * 6.2832, s = 60 + Math.random() * 130;
        this.sparks.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s,
                           life: 1 + Math.random() * 0.7, hue });
      }
    }
    for (const s of this.sparks){
      s.x += s.vx*dt; s.y += s.vy*dt; s.vy += 40*dt;
      s.vx *= 0.985; s.vy *= 0.985; s.life -= dt * 0.75;
    }
    this.sparks = this.sparks.filter(s => s.life > 0);
  }
  draw(ctx){
    for (const s of this.sparks){
      ctx.globalAlpha = Math.max(0, s.life) * 0.9;
      ctx.fillStyle = `hsl(${s.hue},90%,${62 + s.life*18}%)`;
      ctx.beginPath(); ctx.arc(s.x, s.y, 1.9, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

/* =========================================================== the glitch ==
   The first half is DOM, so it is torn apart as DOM: two tinted copies
   offset for the colour fringing, and a stack of slices that jump
   sideways for the tearing. No canvas snapshot needed.                   */
export function glitch(target, host){
  const rig = document.createElement('div');
  rig.className = 'glitch-rig';
  const layers = [];
  for (let i = 0; i < 2; i++){
    const c = target.cloneNode(true);
    c.removeAttribute('id');
    c.className = 'glitch-copy ' + (i ? 'g-cyan' : 'g-red');
    rig.appendChild(c); layers.push(c);
  }
  const SLICES = 9;
  const slices = [];
  for (let i = 0; i < SLICES; i++){
    const c = target.cloneNode(true);
    c.removeAttribute('id');
    c.className = 'glitch-slice';
    const a = (i / SLICES) * 100, b = ((i + 1) / SLICES) * 100;
    c.style.clipPath = `inset(${a}% 0 ${100 - b}% 0)`;
    rig.appendChild(c); slices.push(c);
  }
  host.appendChild(rig);

  let raf = 0, t = 0;
  const tick = () => {
    t += 1 / 60;
    const k = Math.min(1, t / 2.2);
    layers[0].style.transform = `translate(${(Math.random()-0.5)*10*k}px,0)`;
    layers[1].style.transform = `translate(${(Math.random()-0.5)*10*k}px,0)`;
    for (const s of slices){
      s.style.transform = Math.random() < 0.35 * k + 0.1
        ? `translateX(${(Math.random()-0.5) * 90 * k}px) scaleX(${1 + (Math.random()-0.5)*0.06})`
        : 'none';
      s.style.opacity = Math.random() < 0.06 * k ? '0.15' : '1';
    }
    rig.style.filter = `saturate(${1 + k}) hue-rotate(${(Math.random()-0.5)*40*k}deg)`;
    raf = requestAnimationFrame(tick);
  };
  tick();
  return () => { cancelAnimationFrame(raf); rig.remove(); };
}
