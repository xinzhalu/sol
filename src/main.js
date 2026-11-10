// 入口：装配场景、天体与 UI，跑动画循环，处理点击拾取与窗口缩放。
import * as THREE from 'three';
import { createScene, frameCamera } from './scene.js';
import { createBodies } from './bodies.js';
import { createHud, createInfoCard, createLabels } from './ui.js';

const canvas = document.getElementById('scene');
const labelsLayer = document.getElementById('labels');
const infoCardEl = document.getElementById('info-card');
const infoBodyEl = document.getElementById('info-body');
const infoCloseEl = document.getElementById('info-close');

let context;
try {
  context = createScene(canvas);
} catch (error) {
  document.getElementById('webgl-error').hidden = false;
  canvas.hidden = true;
  // 没有 WebGL 就没有页面主体，控制台留一条原因即可。
  console.warn('WebGL 初始化失败：', error);
}

if (context) {
  const { renderer, scene, camera, controls } = context;
  const { bodies, pickables, byId } = createBodies(scene);

  const labels = createLabels(labelsLayer, bodies);
  const infoCard = createInfoCard(infoCardEl, infoBodyEl, infoCloseEl);
  const hud = createHud(document, {
    onLabelsChange: (visible) => labels.setEnabled(visible),
  });

  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  // 点击与拖动要区分开：按下到抬起的位移小于这个像素值才算“点击”。
  const CLICK_TOLERANCE = 6;
  let pressPoint = null;
  let userTouchedCamera = false;

  window.addEventListener('pointerdown', (event) => {
    if (event.target !== canvas) return;
    pressPoint = { x: event.clientX, y: event.clientY };
  });

  window.addEventListener('pointerup', (event) => {
    if (!pressPoint) return;
    const moved = Math.hypot(event.clientX - pressPoint.x, event.clientY - pressPoint.y);
    pressPoint = null;
    if (moved > CLICK_TOLERANCE) return;

    const hit = pick(event.clientX, event.clientY);
    if (hit) {
      infoCard.show(hit);
    } else {
      infoCard.hide();
    }
  });

  // Escape 也能关掉资料卡
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') infoCard.hide();
  });

  function pick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    if (hits.length === 0) return null;
    const body = byId.get(hits[0].object.userData.bodyId);
    return body ? body.data : null;
  }

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // 用户还没手动转过/缩过镜头时，跟着窗口重新取景；动手之后就不再抢镜头。
    if (!userTouchedCamera) frameCamera(camera);
  }
  controls.addEventListener('start', () => {
    userTouchedCamera = true;
  });
  window.addEventListener('resize', resize);
  resize();

  function tick() {
    requestAnimationFrame(tick);

    const delta = Math.min(clock.getDelta(), 0.1);
    const scale = hud.getSpeed();

    if (scale > 0) {
      for (const body of bodies) {
        if (body.orbitSpeed > 0) {
          body.angle += delta * scale * body.orbitSpeed;
          body.orbitPivot.rotation.y = body.angle;
        }
        body.mesh.rotation.y += delta * scale * body.spinSpeed;
      }
    }

    controls.update();
    renderer.render(scene, camera);
    labels.update(camera, window.innerWidth, window.innerHeight);
  }

  tick();
}
