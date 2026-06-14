# PicPin 📌

> 一个轻量级的桌面图片展示挂件 —— "Pin your Pictures to the desktop"

PicPin 是一款可以在桌面上展示图片轮播的小挂件。支持自动轮播、网格浏览、拖拽添加图片、一键置顶窗口。基于原生 HTML/CSS/JS 编写，零外部依赖，可运行在任何提供浏览器窗口环境的桌面挂件平台上。

---

## 目录

- [功能特性](#功能特性)
- [目录结构](#目录结构)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [操作指南](#操作指南)
- [开机自启](#开机自启)
- [技术栈](#技术栈)
- [自定义主题](#自定义主题)
- [许可证](#许可证-mit)

---

## 功能特性

- 🖼️ **图片轮播** — 按序展示多张图片，支持前后切换
- 🔲 **网格视图** — 缩略图网格模式，快速定位图片
- 🖱️ **拖拽添加** — 把 PNG / JPG / GIF / WebP 图片拖入窗口即可即时添加（会话内）
- 📌 **窗口置顶** — 一键将挂件钉在所有窗口最前端
- 🎨 **主题自定义** — 通过 `app.json` 集中配置主题颜色
- ⚙️ **可调参数** — 切换播放速度（1/3/5/10 秒）与图片适应模式
- ⌨️ **键盘控制** — 方向键切换、空格播放/暂停、ESC 关闭
- 🪟 **窗口可调整** — 可拖拽移动、可调整大小、支持记录窗口位置
- 💾 **开机自启** — 通过一键脚本 `setup-autostart.bat` 设置开机自启动

---

## 目录结构

```
picpin/
├── app.json              # 主配置（窗口/主题/播放/图片列表）
├── config.json           # 桌面运行时配置（窗口参数，一般不用改）
├── index.html            # 入口页面
├── app.js                # 核心应用逻辑（原生 JS，零依赖）
├── style.css             # 样式（CSS 变量主题系统）
├── favicon.ico           # 图标
├── setup-autostart.bat   # ← 一键设置开机自启
├── disable-autostart.bat # ← 取消开机自启
├── assets/               # 图片资源目录（把图片放在这里）
└── README.md             # 本文档
```

---

## 快速开始

### 前置条件

需要一个能打开 HTML5 网页并可独立窗口化显示的桌面运行环境。任何支持浏览器窗口（含 Chromium/Electron 内核）的挂件运行时都可使用。

### 步骤 1：准备项目

将整个 `picpin/` 目录放置到你的桌面挂件运行时能识别的 `apps/` 子目录下即可：

```
运行时根目录/
└── apps/
    └── picpin/           ← 就是这个目录
        ├── app.json
        ├── index.html
        └── ...
```

### 步骤 2：添加图片

将你的图片（PNG、JPG、GIF、WebP）复制到 `assets/` 目录：

```
picpin/
└── assets/
    ├── sunset.png
    ├── mountain.jpg
    └── cat.gif
```

### 步骤 3：在配置中注册图片

打开 `app.json`，把图片路径填入 `images` 数组（路径相对于 `app.json`）：

```json
{
    "images": [
        "assets/sunset.png",
        "assets/mountain.jpg",
        "assets/cat.gif"
    ]
}
```

> 💡 也支持绝对路径和网络地址，例如：
> - `D:/Photos/beach.png`
> - `https://example.com/wallpaper.jpg`

### 步骤 4：启动

启动桌面挂件运行时，在挂件列表中找到 "PicPin"，点击打开即可。窗口会读取 `app.json` 中的图片列表并开始展示。

---

## 配置说明

所有配置集中在 **`app.json`** 中。修改后关闭挂件并重新打开即可生效。

### 完整字段

```json
{
    "name": "PicPin",
    "version": "1.0.0",

    "window": {
        "defaultWidth": 340,           // 窗口默认宽度（像素）
        "defaultHeight": 340,          // 窗口默认高度（像素）
        "minWidth": 200,               // 最小可调整宽度
        "minHeight": 200,              // 最小可调整高度
        "background": "rgba(255,255,255,0.95)",  // 背景色
        "borderRadius": 10             // 圆角半径（像素）
    },

    "viewer": {
        "mode": "slide",               // 启动时的默认视图
                                       //   "slide" = 轮播
                                       //   "grid"  = 网格
        "autoPlay": true,              // 启动后是否自动播放
        "intervalMs": 3000,            // 切换间隔（毫秒）
        "imageFit": "contain",         // 图片适配方式
                                       //   "contain" = 适应（完整显示）
                                       //   "cover"   = 填充（占满可裁剪）
        "gridItemSize": 70,            // 网格缩略图大小
        "gridGap": 8                   // 网格缩略图间距
    },

    "theme": {
        "primaryColor": "#ff79c6",     // 主色 — 工具栏、边框
        "secondaryColor": "#fee101",   // 强调色 — 激活按钮
        "backgroundColor": "#ffffff",  // 背景色
        "textColor": "#424242",        // 文本色
        "accentColor": "#ff4081"       // 辅助色
    },

    "images": []                      // 图片列表（相对于 app.json 的路径）
}
```

### 关于 config.json

`config.json` 由桌面挂件运行时读取，用于声明窗口参数（无边框、透明、可调大小等）。通常**不需要修改**。

---

## 操作指南

### 窗口控制

| 操作 | 方式 |
|------|------|
| 移动窗口 | 拖动顶部标题栏 |
| 置顶窗口 | 点击 `📌` 按钮（再次点击取消） |
| 关闭挂件 | 点击 `✕` 按钮 或 按 `Esc` |

### 图片浏览

| 操作 | 方式 |
|------|------|
| 上一张 / 下一张 | 左右两侧的 `‹` / `›` 按钮、方向键，或点击图片 |
| 播放 / 暂停 | 底部「▶ 播放 / ⏸ 暂停」按钮 或 空格键 |
| 切换速度 | 下拉选择 1s / 3s / 5s / 10s |
| 切换适配 | 选择「适应 / 填充」 |
| 轮播 / 网格 | 点击底部「网格 / 轮播」按钮 |
| 即时添加图片 | 把图片文件拖进窗口 |

### 键盘快捷键

| 键 | 功能 |
|---|---|
| `←` | 上一张 |
| `→` | 下一张 |
| `Space` | 播放 / 暂停 |
| `Esc` | 关闭挂件 |

---

## 开机自启

### 启用

在项目目录中双击运行 `setup-autostart.bat`。脚本会：

1. 在 Windows 启动文件夹 (`shell:startup`) 创建快捷方式
2. 在桌面创建快捷方式

下次开机后会自动启动挂件运行时，随后 PicPin 挂件会被自动展示（因为 `config.json` 中设置了 `showWhenStartup: true`）。

### 取消

双击运行 `disable-autostart.bat` 即可移除所有快捷方式。

---

## 技术栈

- **HTML5** — 入口页面结构
- **CSS3 + CSS 变量** — 主题系统与动画
- **原生 JavaScript (ES5+)** — 应用逻辑（零外部依赖）
- **桌面浏览器窗口 API** — 通过兼容层 `window.fm` 或 `window.kt` 控制窗口置顶/关闭/显示

### 为什么零依赖？

- 打包体积极小：整个挂件源码 + 样式 < 20KB
- 启动速度极快：无需任何框架初始化
- 可移植性强：任何 HTML5 浏览器窗口环境都能跑
- 维护性好：逻辑集中在一个 `app.js` 文件中，便于二次开发

---

## 自定义主题

修改 `app.json` 中的 `theme` 字段。这里提供几个推荐配色：

### 🌸 粉色（默认）
```json
"theme": { "primaryColor": "#ff79c6", "secondaryColor": "#fee101" }
```

### 🌊 蓝色海洋
```json
"theme": { "primaryColor": "#4a90e2", "secondaryColor": "#357abd" }
```

### 🌿 薄荷绿
```json
"theme": { "primaryColor": "#4caf50", "secondaryColor": "#81c784" }
```

### 🌙 暗夜紫
```json
"theme": { "primaryColor": "#7c4dff", "secondaryColor": "#b388ff" }
```

修改后关闭挂件重新打开即生效。

---

## FAQ

**Q: 打开后显示"暂无图片"？**
A: 你还没有在 `app.json` 的 `images` 数组中添加图片路径。将图片放入 `assets/` 后在 `app.json` 中登记即可。

**Q: 拖入窗口的图片关掉就没了？**
A: 是的。拖拽添加仅保存在当前会话的内存中。若想持久显示，请把文件放入 `assets/` 并在 `app.json` 中注册路径。

**Q: 想要固定在桌面某一角？**
A: 先拖动标题栏到目标位置，再点击 📌 按钮。大部分桌面运行时会记住窗口位置。

**Q: 可以调窗口大小吗？**
A: 可以。`config.json` 中 `resizable: true` 已启用。

---

## 许可证 (MIT)

```
MIT License

Copyright (c) 2026 PicPin Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

*Made with ♥ — a lightweight desktop widget for image lovers.*
