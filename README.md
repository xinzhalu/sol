# 太阳系 · 3D 运转演示

一个纯静态的太阳系 3D 页面：太阳、八大行星、月球与冥王星同时运转，表面使用真实行星贴图，
可拖动旋转、滚轮缩放，点击任意星球查看资料，并可调节速度与暂停。

## 本地打开

页面没有构建步骤，但用 ES module 和 `fetch` 加载贴图，需要通过 HTTP 打开（直接双击 `index.html` 会被浏览器的本地文件策略拦下）：

```bash
cd 仓库目录
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000/
```

## 操作

- 拖动：旋转视角；滚轮 / 双指：缩放
- 点击星球：右侧弹出资料卡（直径、距离、公转与自转周期、卫星数、简介），点击空白处或按 Esc 关闭
- 底部：速度滑杆（0–10 倍）、暂停 / 继续、名称显示开关

## 目录

```
index.html            页面骨架与 importmap
styles/main.css       深空主题、HUD 与资料卡样式
src/data.js           全部天体数据与画面缩放参数（单一数据源）
src/scene.js          渲染器、相机、控制器、灯光、星空与轨道线
src/bodies.js         天体球体、土星环、太阳光晕、冥王星程序纹理
src/ui.js             名称标签、资料卡、底部控制条
src/main.js           入口：动画循环、点击拾取、窗口缩放
vendor/               Three.js r160 运行库（three.module.js、OrbitControls.js）
assets/textures/      行星贴图（来源 solarsystemscope.com，CC BY 4.0）
```

画面尺寸经过压缩（真实比例下地球只有一像素），资料卡里的数值始终是真实的。
