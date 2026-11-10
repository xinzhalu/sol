// 场景搭台：渲染器、相机、轨道控制器、灯光、星空背景与轨道线。
import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { BODIES, VIEW } from './data.js';

/**
 * 创建 Three.js 场景。
 * 浏览器不支持 WebGL 时，WebGLRenderer 构造函数会抛错，由调用方兜底提示。
 */
export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    VIEW.far,
  );
  frameCamera(camera);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.rotateSpeed = 0.55;
  controls.zoomSpeed = 0.8;
  controls.minDistance = VIEW.minDistance;
  controls.maxDistance = VIEW.maxDistance;
  controls.target.set(0, 0, 0);

  // 太阳位置的光源。decay = 0 让海王星和冥王星也不会一片漆黑（真实衰减下它们几乎看不见）。
  const sunLight = new THREE.PointLight(0xfff2dd, 5.2, 0, 0);
  scene.add(sunLight);
  // 环境光托底，行星的背光面也留一点细节，但不会亮到破坏光影对比。
  scene.add(new THREE.AmbientLight(0x9fb0d4, 0.5));

  addStarfield(scene);
  BODIES.forEach((body) => {
    if (body.orbitRadius > 0) addOrbitLine(scene, body);
  });

  return { renderer, scene, camera, controls };
}

/**
 * 把相机摆回初始取景位置：宽屏俯角约 40°，整个星系的椭圆投影刚好铺满画面；
 * 竖屏时抬高俯角看更接近正上方，不浪费上下的空白。
 * 窗口改变尺寸且用户还没手动动过镜头时会被重新调用。
 */
export function frameCamera(camera) {
  const aspect = camera.aspect > 0 ? camera.aspect : 1;
  const distance = initialDistance(aspect);
  // aspect ≥ 1.25 用 40°，越窄越抬到 62°。
  const t = THREE.MathUtils.clamp((1.25 - aspect) / 0.8, 0, 1);
  const elevation = THREE.MathUtils.degToRad(40 + 22 * t);
  camera.position.set(
    0,
    distance * Math.sin(elevation),
    distance * Math.cos(elevation),
  );
  camera.lookAt(0, 0, 0);
}

/** 初始镜头距离：竖屏/窄窗口时后退，避免冥王星轨道被切出画面。 */
function initialDistance(aspect) {
  return VIEW.baseDistance * Math.max(1, 1.05 / aspect);
}

function addStarfield(scene) {
  const geometry = new THREE.SphereGeometry(1500, 48, 32);
  const texture = new THREE.TextureLoader().load(
    'assets/textures/2k_stars_milky_way.jpg',
    (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      material.map = loaded;
      material.color.set(0xffffff);
      material.needsUpdate = true;
    },
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({
    color: 0x2b2f45,
    side: THREE.BackSide,
    depthWrite: false,
    map: texture,
  });
  const sky = new THREE.Mesh(geometry, material);
  sky.name = 'starfield';
  scene.add(sky);
}

/** 每个天体一圈细轨道线，帮助看清公转路径。 */
function addOrbitLine(scene, body) {
  const segments = 256;
  const points = [];
  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * body.orbitRadius,
        0,
        Math.sin(angle) * body.orbitRadius,
      ),
    );
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: body.parent ? 0x6f7f9c : 0x4a6288,
    transparent: true,
    opacity: body.parent ? 0.25 : 0.38,
    depthWrite: false,
  });
  const line = new THREE.LineLoop(geometry, material);
  line.name = `orbit-${body.id}`;
  scene.add(line);
}
