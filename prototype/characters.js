// ===================== Personagens 3D humanos =====================
// Rig feito de grupos aninhados (o osso é um Group, a geometria é a "carne").
// As animações são calculadas em código e misturadas por pesos: parado, andar,
// correr, guarda, soco, golpe recebido, escalada, ar e morte.
import * as THREE from 'three';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = v => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };

// ===================== Geometrias partilhadas =====================
const geoCache = new Map();
function cached(key, make) {
  let g = geoCache.get(key);
  if (!g) { g = make(); geoCache.set(key, g); }
  return g;
}
const k = n => n.toFixed(3);
const cap = (r, len, seg = 10) => cached(`c${k(r)}|${k(len)}|${seg}`, () => new THREE.CapsuleGeometry(r, len, 3, seg));
const ball = (r, w = 14, h = 10) => cached(`b${k(r)}|${w}|${h}`, () => new THREE.SphereGeometry(r, w, h));
const dome = (r, t1, w = 18, h = 8) => cached(`d${k(r)}|${k(t1)}|${w}|${h}`, () => new THREE.SphereGeometry(r, w, h, 0, Math.PI * 2, 0, t1));
const tube = (rt, rb, h, s = 12) => cached(`y${k(rt)}|${k(rb)}|${k(h)}|${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s));
const slab = (x, y, z) => cached(`x${k(x)}|${k(y)}|${k(z)}`, () => new THREE.BoxGeometry(x, y, z));

// ===================== Pose =====================
const JOINTS = [
  'hips', 'chest', 'neck', 'head',
  'shoulderL', 'elbowL', 'wristL', 'shoulderR', 'elbowR', 'wristR',
  'hipL', 'kneeL', 'ankleL', 'hipR', 'kneeR', 'ankleR',
];

function blankPose() {
  const p = { rootY: 0, lean: 0, lunge: 0 };
  for (const j of JOINTS) p[j] = [0, 0, 0];
  return p;
}
function set(p, j, x = 0, y = 0, z = 0) { const a = p[j]; a[0] = x; a[1] = y; a[2] = z; return p; }
function mix(out, src, w) {
  for (const j of JOINTS) {
    const o = out[j], s = src[j];
    o[0] += (s[0] - o[0]) * w; o[1] += (s[1] - o[1]) * w; o[2] += (s[2] - o[2]) * w;
  }
  out.rootY += (src.rootY - out.rootY) * w;
  out.lean += (src.lean - out.lean) * w;
  out.lunge += (src.lunge - out.lunge) * w;
}

// ---- paradoxo: respiração leve, peso num pé só
function poseIdle(p, t) {
  const b = Math.sin(t * 1.8), s = Math.sin(t * 0.6);
  p.rootY = b * 0.008 - 0.01;
  set(p, 'chest', 0.05 + b * 0.035, s * 0.05, 0);
  set(p, 'neck', -0.03, -s * 0.07, 0);
  set(p, 'head', s * 0.05, s * 0.12, 0);
  set(p, 'shoulderL', 0.02 + b * 0.02, 0, -0.12);
  set(p, 'shoulderR', 0.02 + b * 0.02, 0, 0.12);
  set(p, 'elbowL', -0.18, 0, 0.05);
  set(p, 'elbowR', -0.18, 0, -0.05);
  set(p, 'hipL', 0, 0, -0.02);
  set(p, 'hipR', 0, 0, 0.02);
  set(p, 'ankleL', 0.02, 0, 0);
  set(p, 'ankleR', 0.02, 0, 0);
  return p;
}

// ---- guarda de combate: pesos atrás, punhos à frente do rosto
function poseGuard(p, t) {
  const b = Math.abs(Math.sin(t * 3.4));
  p.rootY = -0.07 + b * 0.015;
  set(p, 'chest', 0.14, -0.1, 0);
  set(p, 'neck', -0.05, 0.05, 0);
  set(p, 'head', 0.08, 0.06, 0);
  set(p, 'shoulderL', -0.85, 0.2, -0.5);
  set(p, 'elbowL', -1.6, 0, 0.3);
  set(p, 'shoulderR', -0.6, -0.15, 0.62);
  set(p, 'elbowR', -1.45, 0, -0.2);
  set(p, 'hipL', -0.22, 0.12, -0.12);
  set(p, 'kneeL', 0.36, 0, 0);
  set(p, 'ankleL', -0.16, 0, 0);
  set(p, 'hipR', 0.14, -0.16, 0.16);
  set(p, 'kneeR', 0.24, 0, 0);
  set(p, 'ankleR', -0.08, 0, 0);
  return p;
}

// ---- andar / correr: ciclo de pernas, braços em contra-balanço, inclinação
function legSet(p, jh, jk, ja, sn, cs, side, amp, run) {
  set(p, jh, -sn * 0.5 * amp, 0, side * 0.02);
  set(p, jk, 0.12 + Math.max(0, -cs) * (0.55 + run * 0.5), 0, 0);
  set(p, ja, (0.06 + 0.26 * sn) * amp, 0, 0);
}
function armSet(p, jsh, jel, jwr, sn, side, amp, run) {
  set(p, jsh, -sn * 0.42 * amp, 0, side * 0.16);
  set(p, jel, -(0.22 + run * 0.85), 0, side * 0.04);
  set(p, jwr, 0, 0, side * 0.05);
}
function poseLoco(p, t, run) {
  const ph = t * (2.4 + run * 4.4);
  const amp = 0.6 + run * 0.7;
  const s = Math.sin(ph), c = Math.cos(ph);
  const s2 = -s, c2 = -c;
  p.rootY = -0.025 + (1 - Math.cos(2 * ph)) * 0.02 * (0.7 + run * 0.6);
  p.lean = 0.04 + run * 0.13;
  set(p, 'hips', 0, s * 0.09, 0);
  set(p, 'chest', 0.06 + run * 0.24, -s * 0.13, 0);
  set(p, 'neck', -0.05 - run * 0.1, s * 0.06, 0);
  set(p, 'head', 0.02 - run * 0.05, s * 0.09, 0);
  legSet(p, 'hipL', 'kneeL', 'ankleL', s, c, -1, amp, run);
  legSet(p, 'hipR', 'kneeR', 'ankleR', s2, c2, 1, amp, run);
  armSet(p, 'shoulderL', 'elbowL', 'wristL', s2, -1, amp, run);
  armSet(p, 'shoulderR', 'elbowR', 'wristR', s, 1, amp, run);
  return p;
}

// ---- no ar: a subir enrola as pernas, a cair abre-as
function poseAir(p, vy) {
  const up = vy > 0;
  set(p, 'chest', up ? -0.12 : 0.1, 0, 0);
  set(p, 'neck', up ? 0.1 : -0.1, 0, 0);
  set(p, 'shoulderL', up ? -1.2 : -0.3, 0, -0.7);
  set(p, 'shoulderR', up ? -1.2 : -0.3, 0, 0.7);
  set(p, 'elbowL', -0.6, 0, 0.2);
  set(p, 'elbowR', -0.6, 0, -0.2);
  if (up) {
    set(p, 'hipL', -1.0, 0, -0.12); set(p, 'kneeL', 1.5, 0, 0);
    set(p, 'hipR', -0.45, 0, 0.12); set(p, 'kneeR', 0.75, 0, 0);
  } else {
    set(p, 'hipL', 0.3, 0, -0.12); set(p, 'kneeL', 0.4, 0, 0);
    set(p, 'hipR', -0.35, 0, 0.12); set(p, 'kneeR', 0.95, 0, 0);
  }
  set(p, 'ankleL', -0.25, 0, 0);
  set(p, 'ankleR', -0.2, 0, 0);
  return p;
}

// ---- escalada: braços alternados a cima, pés a procurar apoio
function poseClimb(p, t) {
  const ph = t * 5.2;
  const a = Math.sin(ph), b = -a;
  p.lean = 0.12;
  p.rootY = -0.06 + a * 0.02;
  set(p, 'chest', 0.06, (a - b) * 0.08, 0);
  set(p, 'neck', -0.32, 0, 0);
  set(p, 'head', 0.12, 0, 0);
  set(p, 'shoulderL', -2.45 + a * 0.6, 0, -0.28);
  set(p, 'elbowL', -0.5 - Math.max(0, a) * 0.35, 0, 0);
  set(p, 'wristL', 0, 0, 0.2);
  set(p, 'shoulderR', -2.45 + b * 0.6, 0, 0.28);
  set(p, 'elbowR', -0.5 - Math.max(0, b) * 0.35, 0, 0);
  set(p, 'wristR', 0, 0, -0.2);
  set(p, 'hipL', -0.75 + b * 0.4, 0, -0.12);
  set(p, 'kneeL', 0.95 - b * 0.35, 0, 0);
  set(p, 'hipR', -0.75 + a * 0.4, 0, 0.12);
  set(p, 'kneeR', 0.95 - a * 0.35, 0, 0);
  set(p, 'ankleL', -0.2, 0, 0);
  set(p, 'ankleR', -0.2, 0, 0);
  return p;
}

// ---- soco com o braço direito: prepara, estende, recupera
// devolve 0..1 = quanto do soco já saiu (para o jogo aplicar o dano)
function poseAttack(p, u, windup) {
  const strikeLen = 0.26, back = 1 - windup - strikeLen;
  let coil = 0, punch = 0;
  if (u < windup) { coil = smooth(u / windup); }
  else if (u < windup + strikeLen) { coil = 1; punch = smooth((u - windup) / strikeLen); }
  else { const r = smooth((u - windup - strikeLen) / Math.max(0.01, back)); coil = 1 - r; punch = 1 - r; }

  p.lean = 0.05 + punch * 0.14;
  p.lunge = punch * 0.16 - coil * 0.04;
  p.rootY = -0.06 - coil * 0.02 + punch * 0.03;
  set(p, 'hips', 0, -coil * 0.18 + punch * 0.3, 0);
  set(p, 'chest', 0.12 + coil * 0.05, -coil * 0.4 + punch * 0.45, 0);
  set(p, 'neck', -0.06, coil * 0.2 - punch * 0.2, 0);
  set(p, 'head', 0.05, coil * 0.12 - punch * 0.18, 0);

  set(p, 'shoulderR', -0.85 - punch * 0.62, 0, 0.42 - coil * 0.3 + punch * 0.05);
  set(p, 'elbowR', -1.75 * (1 - punch), 0, -0.15);
  set(p, 'wristR', 0, 0, -0.25 * (1 - punch));
  set(p, 'shoulderL', -0.75, 0.25, -0.6);
  set(p, 'elbowL', -1.55, 0, 0.35);

  set(p, 'hipL', -0.25, 0.15, -0.14);
  set(p, 'kneeL', 0.4, 0, 0);
  set(p, 'ankleL', -0.18, 0, 0);
  set(p, 'hipR', 0.3, -0.12, 0.18);
  set(p, 'kneeR', 0.3, 0, 0);
  set(p, 'ankleR', -0.1, 0, 0);
  return punch;
}

// ---- levar um golpe: tronco recua, braços sobem
function poseHit(p, u) {
  const e = Math.sin(Math.PI * u);
  p.lean = 0.2 * e;
  p.lunge = -0.1 * e;
  p.rootY = -0.04 * e;
  set(p, 'chest', 0.3 * e, 0.14 * e, 0.1 * e);
  set(p, 'neck', 0.35 * e, 0, 0);
  set(p, 'head', 0.3 * e, 0.22 * e, 0.16 * e);
  set(p, 'shoulderL', -0.45 * e, 0, -0.85 * e);
  set(p, 'elbowL', -0.6 * e, 0, 0);
  set(p, 'shoulderR', -0.35 * e, 0, 0.75 * e);
  set(p, 'elbowR', -0.5 * e, 0, 0);
  set(p, 'hipL', 0.15 * e, 0, -0.1 * e);
  set(p, 'hipR', 0.2 * e, 0, 0.1 * e);
  set(p, 'kneeL', 0.25 * e, 0, 0);
  set(p, 'kneeR', 0.3 * e, 0, 0);
  return p;
}

// ---- cair para trás e ficar estendido no chão
function poseDeath(p, u) {
  const e = smooth(u);
  p.lean = -1.5 * e;
  p.rootY = 0.14 * e;
  set(p, 'hips', 0, 0.15 * e, 0);
  set(p, 'chest', -0.1 * e, -0.1 * e, 0);
  set(p, 'neck', 0.35 * e, 0.25 * e, 0);
  set(p, 'head', 0.4 * e, 0.15 * e, 0.25 * e);
  set(p, 'shoulderL', 0.25 * e, 0, -0.95 * e);
  set(p, 'elbowL', -0.45 * e, 0, 0.45 * e);
  set(p, 'shoulderR', 0.15 * e, 0, 0.85 * e);
  set(p, 'elbowR', -0.3 * e, 0, -0.4 * e);
  set(p, 'hipL', -0.6 * e, 0, -0.35 * e);
  set(p, 'kneeL', 0.95 * e, 0, 0);
  set(p, 'ankleL', -0.15 * e, 0, 0);
  set(p, 'hipR', -0.25 * e, 0, 0.5 * e);
  set(p, 'kneeR', 0.6 * e, 0, 0);
  set(p, 'ankleR', -0.1 * e, 0, 0);
  return p;
}

// ===================== Presets =====================
export const PRESETS = {
  hero: {
    label: 'Herói', skin: 0xd6a37c, hair: 0x2a1c14, hairStyle: 'short',
    shirt: 0x2f6f8f, shirt2: 0x27536a, pants: 0x2b3440, shoes: 0x1b1d22, accent: 0xf0b429,
    height: 1, build: 1,
  },
  explorer: {
    label: 'Explorador', skin: 0xbb8459, hair: 0x1b1310, hairStyle: 'cap',
    shirt: 0xa5622f, shirt2: 0x82481f, pants: 0x3d4030, shoes: 0x2a2119, accent: 0xdbb26a,
    height: 0.99, build: 0.98,
  },
};

// inimigos: [encapuzado, capuz+mascarado, brutamontes, elite]
export const ENEMY_PRESETS = [
  {
    label: 'Capuzado', skin: 0xb07a55, hair: 0x14161c, hairStyle: 'hood',
    shirt: 0x1d2028, shirt2: 0x14161b, pants: 0x171a20, shoes: 0x0e1013, accent: 0x7d1c26,
    mask: true, eyeGlow: 0xff3524, height: 1, build: 1,
  },
  {
    label: 'Bandido', skin: 0x8f5f3c, hair: 0x20160f, hairStyle: 'bandana',
    shirt: 0x3a3f4a, shirt2: 0x2a2e36, pants: 0x24262c, shoes: 0x15161a, accent: 0xb03a2a,
    vest: true, height: 1.01, build: 1.06,
  },
  {
    label: 'Brutamontes', skin: 0xc9926a, hair: 0x4a3524, hairStyle: 'short',
    shirt: 0x5c2a22, shirt2: 0x42201a, pants: 0x2c2723, shoes: 0x191512, accent: 0xd9a441,
    vest: true, height: 1.12, build: 1.34,
  },
  {
    label: 'Elite', skin: 0x6d4630, hair: 0x0f1013, hairStyle: 'short',
    shirt: 0x1b2733, shirt2: 0x121a23, pants: 0x14181e, shoes: 0x0c0e11, accent: 0xc9a227,
    vest: true, mask: true, height: 1.04, build: 1.12,
  },
];

const DEFAULTS = {
  skin: 0xd6a37c, hair: 0x2a1c14, hairStyle: 'short', shirt: 0x2f6f8f, shirt2: 0x27536a,
  pants: 0x2b3440, shoes: 0x1b1d22, accent: 0xf0b429,
  mask: false, vest: false, eyeGlow: 0, height: 1, build: 1, scale: 1,
};

// ===================== Personagem =====================
export class Character extends THREE.Group {
  constructor(opts = {}) {
    super();
    const o = { ...DEFAULTS, ...(opts.preset || {}), ...opts };
    this.opts = o;
    this.radius = 0.42;

    this.mats = {
      skin: new THREE.MeshStandardMaterial({ color: o.skin, roughness: 0.72 }),
      hair: new THREE.MeshStandardMaterial({ color: o.hair, roughness: 0.88 }),
      shirt: new THREE.MeshStandardMaterial({ color: o.shirt, roughness: 0.78 }),
      shirt2: new THREE.MeshStandardMaterial({ color: o.shirt2 ?? o.shirt, roughness: 0.8 }),
      pants: new THREE.MeshStandardMaterial({ color: o.pants, roughness: 0.86 }),
      shoes: new THREE.MeshStandardMaterial({ color: o.shoes, roughness: 0.55 }),
      accent: new THREE.MeshStandardMaterial({ color: o.accent, roughness: 0.5, metalness: 0.15 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x0e1014, roughness: 0.7 }),
      white: new THREE.MeshStandardMaterial({ color: 0xf2f4f7, roughness: 0.45 }),
      eye: new THREE.MeshStandardMaterial({
        color: o.eyeGlow ? 0x201010 : 0x0d0f12, roughness: 0.25, metalness: 0.4,
        emissive: o.eyeGlow || 0x000000, emissiveIntensity: o.eyeGlow ? 1.4 : 0,
      }),
    };
    this.allMats = Object.values(this.mats);

    this.rig = new THREE.Group();
    this.rig.scale.setScalar((o.height || 1) * (o.scale || 1));
    this.add(this.rig);
    buildRig(this, o);

    this.pose = blankPose();
    this.scratch = blankPose();
    this.time = Math.random() * 12;
    this.action = null;
    this.dead = false;
    this.flash = 0;
    this.glowI = 0;
    this.glowColor = new THREE.Color(0x000000);
    this._appliedGlow = -1;
  }

  // -------- ações --------
  play(name, opts = {}) {
    if (name === 'die') {
      if (this.dead) return false;
      this.dead = true;
      this.action = { name, t: 0, dur: 0.9, windup: 0, fired: false };
      return true;
    }
    if (this.dead) return false;
    if (name === 'attack') {
      if (this.busy) return false;
      const windup = opts.windup ?? 0.3;
      this.action = { name, t: 0, dur: windup + 0.26 + 0.34, windup, fired: false };
      return true;
    }
    if (name === 'hit') {
      if (this.dead) return false;
      this.action = { name, t: 0, dur: 0.42, windup: 0, fired: false };
      return true;
    }
    return false;
  }

  stopAction() { this.action = null; }

  get busy() { return !!this.action && this.action.name !== 'hit'; }
  get attackU() { return this.action && this.action.name === 'attack' ? clamp(this.action.t / this.action.dur, 0, 1) : 0; }
  get punching() { return !!this.action && this.action.name === 'attack' && this.action.t >= this.action.windup; }

  // brilho contínuo (avisar que vai atacar)
  setGlow(color, intensity = 0.7) {
    this.glowColor.set(color);
    this.glowI = intensity;
  }
  // flash de dano
  hitFlash(dur = 0.28, color = 0xff2a2a) {
    this.flash = dur;
    this.flashColor = new THREE.Color(color);
  }

  update(dt, s = {}) {
    dt = Math.min(dt, 0.05);
    this.time += dt;
    const p = this.pose, tmp = this.scratch;

    if (s.dead || this.dead) {
      // a animação de morte roda no próprio action; se não houver, fica caída
      if (!this.action || this.action.name !== 'die') { this.dead = true; this.action = { name: 'die', t: 0.9, dur: 0.9, windup: 0, fired: true }; }
    }

    // ---- pose base
    if (s.climb) {
      poseClimb(p, this.time);
    } else if (s.grounded === false) {
      poseAir(p, s.vy || 0);
    } else if (s.guard) {
      poseGuard(p, this.time);
    } else {
      poseIdle(p, this.time);
    }

    // ---- locomoção
    const speed = s.speed || 0;
    const run = clamp((speed - 3.2) / 4, 0, 1);
    const moving = clamp(speed / 3.2, 0, 1) * (s.grounded === false || s.climb ? 0 : 1);
    if (moving > 0.01) {
      poseLoco(tmp, this.time, run);
      mix(p, tmp, smooth(moving * 1.3));
    }

    // ---- ação por cima
    this.impact = false;
    const act = this.action;
    if (act) {
      act.t += dt;
      const u = clamp(act.t / act.dur, 0, 1);
      let w = 1;
      if (act.name === 'attack') {
        const punch = poseAttack(tmp, u, act.windup);
        if (!act.fired && punch > 0.35) {
          act.fired = true;
          this.impact = true;
          if (this.onImpact) this.onImpact(this);
        }
        w = Math.min(smooth(act.t / 0.09), 1 - smooth((u - 0.86) / 0.14));
      } else if (act.name === 'hit') {
        poseHit(tmp, u);
        w = smooth(act.t / 0.07) * (1 - smooth((u - 0.8) / 0.2));
      } else if (act.name === 'die') {
        poseDeath(tmp, u);
        w = smooth(act.t / 0.22);
        if (act.t >= act.dur + 0.15) { this.action = null; this.deathDone = true; }
      }
      mix(p, tmp, w);
      if (act.name !== 'die' && act.t >= act.dur) this.action = null;
    }

    // ---- aplicar
    this.body.position.set(0, p.rootY, p.lunge);
    this.body.rotation.x = p.lean;
    for (const j of JOINTS) {
      const o = this.j[j], t = p[j];
      o.rotation.set(t[0], t[1], t[2]);
    }

    // ---- brilho / flash
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt);
    const gi = Math.max(this.glowI, this.flash > 0 ? 0.85 : 0);
    const col = this.flash > 0 ? this.flashColor : this.glowColor;
    if (gi !== this._appliedGlow || (gi > 0 && col !== this._appliedColor)) {
      for (const m of this.allMats) {
        m.emissive.copy(col);
        m.emissiveIntensity = gi;
      }
      this._appliedGlow = gi;
      this._appliedColor = gi > 0 ? col : null;
    }
  }

  dispose() {
    for (const m of this.allMats) m.dispose();
    this.removeFromParent();
  }
}

// ===================== Construção do corpo =====================
function buildRig(ch, o) {
  const B = o.build || 1;
  const R = v => v * (0.68 + 0.32 * B);   // espessura
  const X = v => v * B;                  // afastamento lateral
  const Z = v => v * (0.78 + 0.22 * B);  // profundidade
  const M = ch.mats;

  const grp = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
  const mesh = (parent, g, m, x, y, z, sx = 1, sy = 1, sz = 1, shadow = true) => {
    const n = new THREE.Mesh(g, m);
    n.position.set(x, y, z);
    n.scale.set(sx, sy, sz);
    n.castShadow = shadow;
    parent.add(n);
    return n;
  };
  ch.j = {};

  // ---- tronco (pés no chão, quadril a 0.92m, ombros a 1.42m)
  const body = grp(ch.rig, 0, 0, 0);
  ch.body = body;
  const hips = grp(body, 0, 0.92, 0);
  ch.j.hips = hips;
  mesh(hips, cap(R(0.155), 0.06), M.pants, 0, 0.07, 0, 1, 1, Z(0.8));
  mesh(hips, cap(R(0.163), 0.07), M.shirt, 0, 0.25, 0, 1, 1, Z(0.78));

  const chest = grp(hips, 0, 0.44, 0);          // 1.36m
  ch.j.chest = chest;
  mesh(chest, cap(R(0.175), 0.1), M.shirt, 0, -0.02, 0, 1, 1, Z(0.8));
  if (o.vest) mesh(chest, cap(R(0.182), 0.07), M.accent, 0, -0.04, 0, 1, 1, Z(0.83));
  for (const s of [-1, 1]) mesh(chest, ball(R(0.088), 12, 8), M.shirt, X(0.2) * s, 0.05, 0);

  const neck = grp(chest, 0, 0.19, 0);          // 1.55m
  ch.j.neck = neck;
  mesh(neck, tube(R(0.053), R(0.058), 0.1), M.skin, 0, 0.01, 0);

  const head = grp(neck, 0, 0.09, 0);            // 1.64m
  ch.j.head = head;
  const RX = R(0.115), RY = R(0.127), RZ = R(0.117);
  const headY = 0.045;
  mesh(head, ball(R(0.115), 18, 14), M.skin, 0, headY, 0, 1, 1.1, 1.02);
  // face: olhos, nariz, boca, sobrancelhas
  const onFace = (m, dx, dy, dz, kk = 0.99, push = 0.008) => {
    const v = new THREE.Vector3(dx, dy, dz).normalize();
    m.position.set(v.x * RX * kk, headY + v.y * RY * kk, v.z * RZ * kk);
    const n = new THREE.Vector3(v.x / RX, v.y / RY, v.z / RZ).normalize();
    m.position.addScaledVector(n, push);
    return m;
  };
  for (const s of [-1, 1]) {
    onFace(mesh(head, ball(R(0.029), 12, 10), M.white, 0, 0, 0, 1, 0.8, 0.6, false), s * 0.45, 0.14, 0.88, 1, 0.002);
    onFace(mesh(head, ball(R(0.014), 10, 8), M.eye, 0, 0, 0, 1, 1, 0.6, false), s * 0.45, 0.13, 0.9, 1, 0.012);
    onFace(mesh(head, slab(R(0.05), R(0.012), R(0.012)), M.hair, 0, 0, 0, 1, 1, 1, false), s * 0.45, 0.33, 0.9, 1, 0.004)
      .rotation.z = -s * 0.18;
  }
  onFace(mesh(head, ball(R(0.022), 10, 8), M.skin, 0, 0, 0, 1, 1.2, 1.3, false), 0, 0.02, 1, 0.99, 0.012);
  if (!o.mask) onFace(mesh(head, slab(R(0.045), R(0.011), R(0.01)), M.dark, 0, 0, 0, 1, 1, 1, false), 0, -0.28, 0.92, 0.99, 0.004);
  if (o.mask) {
    onFace(mesh(head, cap(R(0.085), 0.06), M.shirt2, 0, 0, 0, 1, 1, 1, false), 0, -0.16, 0.86, 0.98, 0.01);
    onFace(mesh(head, slab(R(0.13), R(0.014), R(0.012)), M.accent, 0, 0, 0, 1, 1, 1, false), 0, 0.06, 0.9, 0.99, 0.006);
  }

  // ---- cabelo / chapel / capacete
  const style = o.hairStyle || 'short';
  if (style === 'short' || style === 'bandana') {
    mesh(head, dome(R(0.121), 1.45, 18, 8), M.hair, 0, headY, 0, 1, 1.06, 1.02);
    if (style === 'bandana') mesh(head, tube(R(0.122), R(0.122), R(0.045), 16), M.accent, 0, headY + 0.055, 0, 1, 1, 1.02);
  } else if (style === 'long') {
    mesh(head, dome(R(0.123), 1.5, 18, 8), M.hair, 0, headY, 0, 1, 1.05, 1.02);
    mesh(head, cap(R(0.1), 0.18), M.hair, 0, -0.03, -0.075, 1, 1, 0.75);
  } else if (style === 'bun') {
    mesh(head, dome(R(0.121), 1.4, 18, 8), M.hair, 0, headY, 0, 1, 1.05, 1.02);
    mesh(head, ball(R(0.058), 12, 10), M.hair, 0, 0.13, -0.1);
  } else if (style === 'buzz') {
    mesh(head, dome(R(0.117), 1.15, 18, 6), M.hair, 0, headY, 0, 1, 1.05, 1.02);
  } else if (style === 'cap') {
    mesh(head, dome(R(0.128), 1.25, 18, 8), M.shirt2, 0, headY + 0.005, 0, 1, 1.05, 1.02);
    mesh(head, slab(R(0.2), R(0.016), R(0.11)), M.shirt2, 0, headY + 0.06, 0.115, 1, 1, 1);
  } else if (style === 'hood') {
    mesh(head, dome(R(0.148), 1.95, 18, 10), M.shirt2, 0, headY - 0.01, -0.012, 1, 1.05, 1.02);
    mesh(head, ball(R(0.132), 16, 12), M.shirt2, 0, headY - 0.03, -0.075, 1, 1.1, 0.95);
    mesh(head, ball(R(0.118), 14, 10), M.dark, 0, headY - 0.01, -0.02, 1, 1.05, 0.8, false);
  } else if (style === 'helmet') {
    mesh(head, ball(R(0.142), 18, 14), M.shirt2, 0, headY + 0.01, 0, 1, 1.02, 1.02);
    onFace(mesh(head, slab(R(0.16), R(0.055), R(0.02)), M.accent, 0, 0, 0, 1, 1, 1, false), 0, 0.1, 0.95, 1, 0.01);
  }

  // ---- braços
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1;
    const shoulder = grp(chest, X(0.2) * s, 0.05, 0);
    ch.j['shoulder' + side] = shoulder;
    mesh(shoulder, cap(R(0.058), 0.14), M.shirt, 0, -0.11, 0, 1, 1, Z(0.95));
    const elbow = grp(shoulder, 0, -0.235, 0);
    ch.j['elbow' + side] = elbow;
    mesh(elbow, ball(R(0.055), 10, 8), M.skin, 0, 0, 0, 1, 1, Z(0.95));
    mesh(elbow, cap(R(0.05), 0.15), o.mask ? M.skin : M.skin, 0, -0.115, 0, 1, 1, Z(0.95));
    const wrist = grp(elbow, 0, -0.215, 0);
    ch.j['wrist' + side] = wrist;
    mesh(wrist, ball(R(0.062), 12, 10), M.skin, 0, -0.045, 0, 1, 1.1, 0.72);
  }

  // ---- pernas
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1;
    const hip = grp(hips, X(0.095) * s, -0.02, 0);
    ch.j['hip' + side] = hip;
    mesh(hip, cap(R(0.088), 0.26), M.pants, 0, -0.2, 0, 1, 1, Z(0.95));
    const knee = grp(hip, 0, -0.42, 0);
    ch.j['knee' + side] = knee;
    mesh(knee, ball(R(0.072), 10, 8), M.pants, 0, 0, 0, 1, 1, Z(0.95));
    mesh(knee, cap(R(0.068), 0.26), M.pants, 0, -0.2, 0, 1, 1, Z(0.92));
    const ankle = grp(knee, 0, -0.42, 0);
    ch.j['ankle' + side] = ankle;
    mesh(ankle, slab(R(0.115), R(0.075), R(0.25)), M.shoes, 0, -0.018, 0.055);
  }
}

export function createCharacter(opts) { return new Character(opts); }
