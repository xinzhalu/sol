// 页面上的三块 UI：星球名称标签、点击后的资料卡、底部控制条。
import * as THREE from 'three';

/**
 * 3D 空间里的名称标签：每帧把天体世界坐标投影成屏幕坐标，写进绝对定位的 DOM。
 * 用 DOM 而不是 3D 文字，中文渲染清晰、字号好控制。
 */
export function createLabels(container, bodies) {
  const items = bodies.map((body) => {
    const el = document.createElement('span');
    el.className = 'label';
    el.textContent = body.data.name;
    container.appendChild(el);
    return { body, el, visible: true, width: 0, height: 0, y: 0 };
  });

  // 大天体优先占位，被挤掉的是小卫星的标签（全系统视角下月球会和地球撞在一起）。
  const ordered = [...items].sort((a, b) => b.body.data.radius - a.body.data.radius);
  const placed = [];

  let enabled = true;
  // 复用同一个向量做投影，避免每帧给每个天体 new 一个 Vector3。
  const projected = new THREE.Vector3();
  const worldPosition = new THREE.Vector3();

  return {
    setEnabled(value) {
      enabled = value;
      container.classList.toggle('is-hidden', !enabled);
      if (enabled) items.forEach((item) => (item.width = 0));
    },
    update(camera, width, height) {
      if (!enabled) return;
      placed.length = 0;

      for (const item of ordered) {
        const { data } = item.body;
        item.body.mesh.getWorldPosition(worldPosition);
        projected.copy(worldPosition).project(camera);

        // 在画面外或跑到相机背后就不画。
        const hidden =
          projected.z > 1 ||
          Math.abs(projected.x) > 1.05 ||
          Math.abs(projected.y) > 1.05;

        if (hidden) {
          if (item.visible) {
            item.el.style.display = 'none';
            item.visible = false;
          }
          continue;
        }

        // 标签宽度只跟文字有关，量一次就够。
        if (!item.width) {
          item.el.style.display = '';
          item.width = item.el.offsetWidth;
          item.height = item.el.offsetHeight;
        }

        const x = (projected.x * 0.5 + 0.5) * width;
        const centerY = (-projected.y * 0.5 + 0.5) * height;

        // 太阳、木星、土星在屏幕上很大，标签要让出球体（土星还要让出土星环）。
        const visualRadius = data.ring ? data.radius * data.ring.outer : data.radius;
        const distance = worldPosition.distanceTo(camera.position);
        const radiusPx =
          (visualRadius / Math.max(distance, 0.001)) *
          (height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))));
        const base = Math.max(16, radiusPx + 9);
        const offsets = [-base, base, -base - 20, base + 20];

        // 先试着把标签压在星球上方；挤在一起时依次改到下方、更上方，都不行才隐藏。
        let box = null;
        for (const offset of offsets) {
          const y = centerY + offset;
          const candidate = {
            left: x - item.width / 2,
            right: x + item.width / 2,
            top: y - item.height / 2,
            bottom: y + item.height / 2,
          };
          const collides = placed.some(
            (other) =>
              candidate.left < other.right + 4 &&
              candidate.right > other.left - 4 &&
              candidate.top < other.bottom + 2 &&
              candidate.bottom > other.top - 2,
          );
          if (!collides) {
            box = candidate;
            item.y = y;
            break;
          }
        }

        if (!box) {
          if (item.visible) {
            item.el.style.display = 'none';
            item.visible = false;
          }
          continue;
        }

        placed.push(box);
        if (!item.visible) {
          item.el.style.display = '';
          item.visible = true;
        }
        item.el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${item.y.toFixed(1)}px)`;
      }
    },
  };
}

/**
 * 资料卡：显示被点中天体的真实数据与一句简介。
 */
export function createInfoCard(cardEl, bodyEl, closeButton) {
  const hide = () => {
    cardEl.hidden = true;
    cardEl.classList.remove('is-open');
  };

  closeButton.addEventListener('click', hide);

  return {
    hide,
    show(data) {
      bodyEl.innerHTML = '';
      bodyEl.appendChild(buildCardContent(data));
      cardEl.hidden = false;
      // 先移除 hidden 再加 class，让 CSS 过渡能吃上。
      requestAnimationFrame(() => cardEl.classList.add('is-open'));
    },
  };
}

function buildCardContent(data) {
  const fragment = document.createDocumentFragment();

  const head = document.createElement('div');
  head.className = 'info-head';
  const title = document.createElement('h2');
  title.textContent = data.name;
  const kicker = document.createElement('p');
  kicker.className = 'info-kicker';
  kicker.textContent = `${data.en} · ${data.type}`;
  head.append(title, kicker);

  const list = document.createElement('dl');
  list.className = 'info-facts';
  const rows = [
    ['直径', data.facts.diameter],
    ['距离', data.facts.distance],
    ['公转', data.facts.orbitalPeriod],
    ['自转', data.facts.rotationPeriod],
    ['卫星', data.facts.moons],
  ];
  for (const [label, value] of rows) {
    if (!value || value === '—') continue;
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    list.append(dt, dd);
  }

  const blurb = document.createElement('p');
  blurb.className = 'info-blurb';
  blurb.textContent = data.facts.blurb;

  fragment.append(head, list, blurb);
  return fragment;
}

/**
 * 底部控制条：速度滑杆、暂停、名称开关。
 */
export function createHud(root, { onLabelsChange }) {
  const pauseButton = root.getElementById('btn-pause');
  const slider = root.getElementById('speed');
  const speedValue = root.getElementById('speed-value');
  const labelsButton = root.getElementById('btn-labels');

  const state = { speed: Number(slider.value), paused: false, labels: true };

  slider.addEventListener('input', () => {
    state.speed = Number(slider.value);
    speedValue.textContent = `${state.speed.toFixed(1)}×`;
  });

  pauseButton.addEventListener('click', () => {
    state.paused = !state.paused;
    pauseButton.textContent = state.paused ? '继续' : '暂停';
    pauseButton.setAttribute('aria-pressed', String(state.paused));
    pauseButton.classList.toggle('is-active', state.paused);
  });

  labelsButton.addEventListener('click', () => {
    state.labels = !state.labels;
    labelsButton.textContent = state.labels ? '隐藏名称' : '显示名称';
    labelsButton.setAttribute('aria-pressed', String(state.labels));
    labelsButton.classList.toggle('is-active', !state.labels);
    onLabelsChange(state.labels);
  });

  speedValue.textContent = `${state.speed.toFixed(1)}×`;

  return {
    state,
    getSpeed: () => (state.paused ? 0 : state.speed),
    isPaused: () => state.paused,
  };
}
