// 太阳系天体的唯一数据源。
// facts 里是真实的直径、日距、公转与自转周期等，供资料卡展示；
// radius / orbitRadius 是为画面效果压缩过的显示尺寸，不是真实比例。

// 画面时间换算：所有天体共用同一套基准，滑杆只是整体倍率。
export const TIME = {
  // 地球公转一圈（1 倍速）用 12 秒，其余天体按真实公转周期等比换算。
  earthOrbitSeconds: 12,
  // 自转单独一套视觉换算，否则 12 秒绕太阳一圈时地球连 1/100 圈都转不完。
  rotationSecondsPerHour: 0.9,
  // 自转周期钳制，避免金星（243 天）看起来静止、木星转得糊成一片。
  minRotationHours: 6,
  maxRotationHours: 48,
  // 月球绕地球一圈：按真实比例只有 0.9 秒，快得看不清，单独放慢。
  moonOrbitSeconds: 6,
};

// 太阳半径取画面里最大的可见值，其余行星按相对大小压缩，轨道半径按开方压缩。
export const BODIES = [
  {
    id: 'sun',
    name: '太阳',
    en: 'Sun',
    type: '恒星',
    isStar: true,
    radius: 10,
    orbitRadius: 0,
    orbitalPeriodDays: 0,
    rotationPeriodHours: 609.12,
    tilt: 7.25,
    texture: 'assets/textures/2k_sun.jpg',
    fallbackColor: '#ffb545',
    facts: {
      diameter: '1,392,700 km（地球的 109 倍）',
      distance: '—',
      orbitalPeriod: '绕银河系中心约 2.3 亿年',
      rotationPeriod: '赤道约 25 天',
      moons: '—',
      blurb:
        '太阳系唯一的恒星，占整个太阳系质量的 99.86%。核心每秒把约 6 亿吨氢聚变成氦，释放出的光走到地球需要约 8 分 20 秒。',
    },
  },
  {
    id: 'mercury',
    name: '水星',
    en: 'Mercury',
    type: '类地行星',
    radius: 0.9,
    orbitRadius: 20,
    orbitalPeriodDays: 87.97,
    rotationPeriodHours: 1407.6,
    tilt: 0.03,
    texture: 'assets/textures/2k_mercury.jpg',
    fallbackColor: '#8c8177',
    facts: {
      diameter: '4,879 km',
      distance: '0.39 AU（约 5,790 万 km）',
      orbitalPeriod: '88 天',
      rotationPeriod: '58.6 天',
      moons: '0 颗',
      blurb:
        '离太阳最近、也是最小的行星。几乎没有大气保温，白天可达 430°C，夜里跌到 -180°C，是太阳系昼夜温差最大的行星。',
    },
  },
  {
    id: 'venus',
    name: '金星',
    en: 'Venus',
    type: '类地行星',
    radius: 1.7,
    orbitRadius: 27,
    orbitalPeriodDays: 224.7,
    rotationPeriodHours: -5832.5,
    tilt: 177.4,
    texture: 'assets/textures/2k_venus_surface.jpg',
    fallbackColor: '#d9b170',
    facts: {
      diameter: '12,104 km',
      distance: '0.72 AU（约 1.08 亿 km）',
      orbitalPeriod: '225 天',
      rotationPeriod: '243 天（逆向自转）',
      moons: '0 颗',
      blurb:
        '被浓厚二氧化碳云层包裹，温室效应让表面稳定在约 465°C，比水星更热。它的自转方向与其他行星相反，太阳从西边升起。',
    },
  },
  {
    id: 'earth',
    name: '地球',
    en: 'Earth',
    type: '类地行星',
    radius: 1.75,
    orbitRadius: 34,
    orbitalPeriodDays: 365.25,
    rotationPeriodHours: 23.93,
    tilt: 23.44,
    texture: 'assets/textures/2k_earth_daymap.jpg',
    fallbackColor: '#3f6fb0',
    facts: {
      diameter: '12,742 km',
      distance: '1.00 AU（约 1.496 亿 km）',
      orbitalPeriod: '365.25 天',
      rotationPeriod: '23 小时 56 分',
      moons: '1 颗（月球）',
      blurb:
        '已知唯一存在生命的星球。表面 71% 被液态水覆盖，23.4° 的自转轴倾角带来了四季变化。',
    },
  },
  {
    id: 'moon',
    name: '月球',
    en: 'Moon',
    type: '卫星',
    parent: 'earth',
    radius: 0.7,
    orbitRadius: 5.5,
    orbitalPeriodDays: 27.32,
    rotationPeriodHours: 655.7,
    tilt: 6.68,
    texture: 'assets/textures/2k_moon.jpg',
    fallbackColor: '#a8a49c',
    facts: {
      diameter: '3,474 km',
      distance: '距地球约 38.4 万 km',
      orbitalPeriod: '27.3 天',
      rotationPeriod: '27.3 天（潮汐锁定）',
      moons: '—',
      blurb:
        '地球唯一的天然卫星。因为潮汐锁定，它自转一圈和绕地球一圈的时间相同，所以我们永远只能看到它的同一面。',
    },
  },
  {
    id: 'mars',
    name: '火星',
    en: 'Mars',
    type: '类地行星',
    radius: 1.2,
    orbitRadius: 41,
    orbitalPeriodDays: 686.98,
    rotationPeriodHours: 24.62,
    tilt: 25.19,
    texture: 'assets/textures/2k_mars.jpg',
    fallbackColor: '#b4552d',
    facts: {
      diameter: '6,779 km',
      distance: '1.52 AU（约 2.28 亿 km）',
      orbitalPeriod: '687 天',
      rotationPeriod: '24 小时 37 分',
      moons: '2 颗（火卫一、火卫二）',
      blurb:
        '表面的氧化铁让它呈红色，因此被称为红色星球。这里有太阳系最高的火山奥林帕斯山（约 22 km）和最长的峡谷水手谷。',
    },
  },
  {
    id: 'jupiter',
    name: '木星',
    en: 'Jupiter',
    type: '气态巨行星',
    radius: 4.8,
    orbitRadius: 56,
    orbitalPeriodDays: 4332.6,
    rotationPeriodHours: 9.93,
    tilt: 3.13,
    texture: 'assets/textures/2k_jupiter.jpg',
    fallbackColor: '#c9a882',
    facts: {
      diameter: '139,820 km',
      distance: '5.20 AU（约 7.78 亿 km）',
      orbitalPeriod: '11.86 年',
      rotationPeriod: '9 小时 56 分',
      moons: '95 颗以上（木卫一至木卫四最大）',
      blurb:
        '太阳系最大的行星，质量是其余七颗行星总和的 2.5 倍。大红斑是一场持续了至少几百年的巨型风暴，直径超过地球。',
    },
  },
  {
    id: 'saturn',
    name: '土星',
    en: 'Saturn',
    type: '气态巨行星',
    radius: 4.1,
    orbitRadius: 70,
    orbitalPeriodDays: 10759,
    rotationPeriodHours: 10.66,
    tilt: 26.73,
    texture: 'assets/textures/2k_saturn.jpg',
    fallbackColor: '#d9c48d',
    ring: {
      inner: 1.35,
      outer: 2.35,
      texture: 'assets/textures/2k_saturn_ring_alpha.png',
    },
    facts: {
      diameter: '116,460 km',
      distance: '9.54 AU（约 14.3 亿 km）',
      orbitalPeriod: '29.4 年',
      rotationPeriod: '10 小时 40 分',
      moons: '146 颗以上（土卫六最大）',
      blurb:
        '以壮观的冰环闻名，环的主体厚度只有几十米，宽度却接近 30 万公里。它的平均密度比水还小，理论上能浮在水面上。',
    },
  },
  {
    id: 'uranus',
    name: '天王星',
    en: 'Uranus',
    type: '冰巨行星',
    radius: 2.5,
    orbitRadius: 88,
    orbitalPeriodDays: 30687,
    rotationPeriodHours: -17.24,
    tilt: 97.77,
    texture: 'assets/textures/2k_uranus.jpg',
    fallbackColor: '#9fd8de',
    facts: {
      diameter: '50,724 km',
      distance: '19.2 AU（约 28.7 亿 km）',
      orbitalPeriod: '84 年',
      rotationPeriod: '17 小时 14 分（逆向自转）',
      moons: '28 颗',
      blurb:
        '自转轴几乎躺倒在轨道面上，像滚球一样侧着转，因此两极各有长达 42 年的极昼和极夜。甲烷让它呈现淡蓝绿色。',
    },
  },
  {
    id: 'neptune',
    name: '海王星',
    en: 'Neptune',
    type: '冰巨行星',
    radius: 2.4,
    orbitRadius: 104,
    orbitalPeriodDays: 60190,
    rotationPeriodHours: 16.11,
    tilt: 28.32,
    texture: 'assets/textures/2k_neptune.jpg',
    fallbackColor: '#3d6fd0',
    facts: {
      diameter: '49,244 km',
      distance: '30.1 AU（约 45 亿 km）',
      orbitalPeriod: '164.8 年',
      rotationPeriod: '16 小时 7 分',
      moons: '16 颗（海卫一最大）',
      blurb:
        '太阳系风最猛烈的行星，风速可超过 2,000 km/h。它是先靠数学计算预言、再被望远镜找到的第一颗行星。',
    },
  },
  {
    id: 'pluto',
    name: '冥王星',
    en: 'Pluto',
    type: '矮行星',
    radius: 0.65,
    orbitRadius: 118,
    orbitalPeriodDays: 90560,
    rotationPeriodHours: -153.3,
    tilt: 122.53,
    // 公开贴图站没有冥王星表面图，用程序生成的斑驳纹理代替。
    texture: null,
    fallbackColor: '#c2a894',
    facts: {
      diameter: '2,377 km',
      distance: '39.5 AU（约 59 亿 km）',
      orbitalPeriod: '248 年',
      rotationPeriod: '6.4 天',
      moons: '5 颗（最大的是卡戎）',
      blurb:
        '曾经的老「第九大行星」，2006 年被重新划为矮行星。表面覆盖着氮冰，有一颗相对它大得多的卫星卡戎，两者像在互相绕转。',
    },
  },
];


// 布局参数集中在这里，main.js 与 scene.js 共用。
export const VIEW = {
  minDistance: 6,
  maxDistance: 1400,
  // 初始镜头距离，窄屏（竖屏手机）时自动后退，保证冥王星轨道也在画面内。
  baseDistance: 262,
  far: 4000,
};
