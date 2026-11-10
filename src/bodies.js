// 天体构建：球体、材质、土星环、太阳光晕、冥王星程序纹理，以及轨道/自转所需的角度参数。
import * as THREE from 'three';
import { BODIES, TIME } from './data.js';

const textureLoader = new THREE.TextureLoader();

/**
 * 按 BODIES 构建所有天体。
 * 返回的顺序与 BODIES 一致，另附 pickables（可点击的球体）供射线拾取。
 */
export function createBodies(scene) {
  const byId = new Map();
  const bodies = [];

  BODIES.forEach((data) => {
    const body = createBody(data, byId, scene);
    byId.set(data.id, body);
    bodies.push(body);
  });

  const pickables = [];
  bodies.forEach((body) => {
    pickables.push(body.mesh);
    body.mesh.children.forEach((child) => {
      if (child.userData && child.userData.bodyId) pickables.push(child);
    });
  });

  return { bodies, pickables, byId };
}

function createBody(data, byId, scene) {
  const parentBody = data.parent ? byId.get(data.parent) : null;

  // orbitPivot 绕父天体转，holder 停在自己的轨道半径上；
  // 自转轴倾斜放在 tiltGroup 里，这样同时影响球体和土星环。
  const orbitPivot = new THREE.Object3D();
  const holder = new THREE.Object3D();
  const tiltGroup = new THREE.Object3D();

  if (parentBody) {
    // 卫星跟着父行星走，但不继承父行星的倾角。
    orbitPivot.position.set(0, 0, 0);
    parentBody.holder.add(orbitPivot);
  } else {
    scene.add(orbitPivot);
  }
  orbitPivot.add(holder);
  holder.add(tiltGroup);

  holder.position.set(data.orbitRadius, 0, 0);
  tiltGroup.rotation.z = THREE.MathUtils.degToRad(data.tilt || 0);

  const segments = data.isStar || data.radius > 2 ? 64 : 48;
  const geometry = new THREE.SphereGeometry(data.radius, segments, segments / 2);

  let material;
  if (data.isStar) {
    // 太阳自己发光，不吃光照，用基础材质。
    material = new THREE.MeshBasicMaterial({ color: 0xffddaa });
  } else {
    material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(data.fallbackColor),
      roughness: 0.92,
      metalness: 0.02,
    });
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = data.id;
  mesh.userData.bodyId = data.id;
  tiltGroup.add(mesh);

  // 小行星（水星、火星、月球、冥王星）在全系统视角下只有几个像素宽，
  // 给它套一层不可见的“点击球”，降低点中的难度。
  if (data.radius < 2.4) {
    const hitRadius = Math.min(Math.max(data.radius * 2.2, 2.2), 3);
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(hitRadius, 16, 12),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hit.name = `${data.id}-hit`;
    hit.userData.bodyId = data.id;
    mesh.add(hit);
  }

  attachTexture(data, material);
  if (data.isStar) addGlow(tiltGroup, data.radius);
  if (data.ring) tiltGroup.add(createRing(data));

  const orbitalSeconds =
    data.id === 'moon'
      ? TIME.moonOrbitSeconds
      : (data.orbitalPeriodDays / 365.25) * TIME.earthOrbitSeconds;

  return {
    data,
    orbitPivot,
    holder,
    tiltGroup,
    mesh,
    // 弧度/秒，1 倍速下的公转与自转速度。
    orbitSpeed: orbitalSeconds > 0 ? (Math.PI * 2) / orbitalSeconds : 0,
    spinSpeed: (Math.PI * 2) / rotationSeconds(data.rotationPeriodHours),
    // 让每颗行星起始位置错开，不在一条直线上。
    angle: Math.random() * Math.PI * 2,
  };
}

/** 真实自转周期换算成画面里的自转周期（秒），并做钳制。 */
function rotationSeconds(hours) {
  const clamped = Math.min(
    Math.max(Math.abs(hours), TIME.minRotationHours),
    TIME.maxRotationHours,
  );
  const sign = hours < 0 ? -1 : 1;
  return sign * clamped * TIME.rotationSecondsPerHour;
}

/**
 * 异步挂贴图。加载失败（404 / 断网）时保留 fallbackColor，页面照常运转。
 */
function attachTexture(data, material) {
  const apply = (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    material.map = texture;
    material.color.set(0xffffff);
    material.needsUpdate = true;
  };

  if (!data.texture) {
    // 冥王星没有公开贴图，用程序生成的斑驳表面顶上。
    apply(createProceduralPlutoTexture());
    return;
  }

  textureLoader.load(
    data.texture,
    apply,
    undefined,
    () => {
      // 贴图缺失：纯色球体，颜色已是 fallbackColor。
    },
  );
}

/** 太阳光晕：径向渐变的加色 sprite，比再套一层球体便宜也更好看。 */
function addGlow(parent, radius) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 248, 226, 0.95)');
  gradient.addColorStop(0.16, 'rgba(255, 214, 140, 0.55)');
  gradient.addColorStop(0.34, 'rgba(255, 168, 76, 0.16)');
  gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }),
  );
  sprite.scale.setScalar(radius * 3.4);
  parent.add(sprite);
}

/** 土星环：把默认平面 UV 改成沿半径方向的映射，才配得上那条 2048×125 的环形贴图。 */
function createRing(data) {
  const { inner, outer, texture } = data.ring;
  const geometry = new THREE.RingGeometry(
    data.radius * inner,
    data.radius * outer,
    160,
    4,
  );
  remapRingUVs(geometry, data.radius * inner, data.radius * outer);

  const material = new THREE.MeshStandardMaterial({
    color: 0xd8c9a8,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  });

  const ringTexture = new THREE.TextureLoader().load(texture, (loaded) => {
    loaded.colorSpace = THREE.SRGBColorSpace;
    material.map = loaded;
    material.color.set(0xffffff);
    material.needsUpdate = true;
  });
  ringTexture.colorSpace = THREE.SRGBColorSpace;

  const mesh = new THREE.Mesh(geometry, material);
  // RingGeometry 默认在 xy 平面，放平到轨道面上。
  mesh.rotation.x = -Math.PI / 2;
  mesh.name = 'saturn-ring';
  return mesh;
}

function remapRingUVs(geometry, innerRadius, outerRadius) {
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const span = outerRadius - innerRadius;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const r = Math.sqrt(x * x + y * y);
    uv.setXY(i, THREE.MathUtils.clamp((r - innerRadius) / span, 0, 1), 0.5);
  }
  uv.needsUpdate = true;
}

/**
 * 冥王星的程序纹理：灰褐色底 + 随机明暗斑块 + 一块较亮的"心形"区域（汤博区）。
 * 目的只是让它在球体上有细节，不追求写实。
 */
export function createProceduralPlutoTexture() {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#b8a290';
  ctx.fillRect(0, 0, width, height);

  // 明暗斑块
  for (let i = 0; i < 900; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 8 + Math.random() * 60;
    const dark = Math.random() > 0.45;
    const alpha = 0.05 + Math.random() * 0.13;
    ctx.fillStyle = dark
      ? `rgba(74, 58, 48, ${alpha})`
      : `rgba(240, 232, 220, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.5 + Math.random() * 0.6), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // 亮一些的"心形"区域，靠近赤道
  const heartX = width * 0.62;
  const heartY = height * 0.58;
  const heartGradient = ctx.createRadialGradient(heartX, heartY, 4, heartX, heartY, 96);
  heartGradient.addColorStop(0, 'rgba(248, 243, 232, 0.85)');
  heartGradient.addColorStop(1, 'rgba(248, 243, 232, 0)');
  ctx.fillStyle = heartGradient;
  ctx.beginPath();
  ctx.ellipse(heartX, heartY, 120, 78, -0.25, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
