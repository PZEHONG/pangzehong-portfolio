# PANGZEHONG · 应聘作品集

> 以下保留本地制作阶段的维护与交付记录。其中“未上传”等表述指当时的交付状态；当前仓库介绍、工作投递书和许可范围请以根目录 [README](../README.md) 为准。

基于原站作品内容制作的全新作品展示首页，并新增「喵喵钢琴」互动游戏和「收山录」三维山野档案。深色与荧光绿配色，使用作品实际画面，包含分类筛选、骑行专题、创作提示词查看与复制，并适配手机、平板和桌面。

首页另设「实战项目」专区，展示 [AI 智能实习工作台](https://xqd.aist.ink/#/records) 与 [高并发 Token 代理中心](https://qine.aist.ink/index.html)。每个项目包含简介、功能标签、用户提供的页面截图和外部访问入口；这两项实战项目单独展示，不计入原有 45 件创意作品。介绍位于 `index.html`，样式位于 `assets/style.css`，预览图为 `previews/project-xqd.png` 与 `previews/project-qine-speed.png`。后者展示单次测试 11,972.5 token/s 的生成速度。

## 打开方式

“关于我与实习”区域（`/#about`）新增个人实习经历：搭建 TikTok 自动化工作流，项目入口为 `qingkongai.com`。其中 13 张 TikTok 后台实拍来自用户提供的素材，可放大、切换和查看全部数据明细；网页图片已压缩并校正照片方向，源照片未修改。

精选的 2026 年 6、7 月 Commission GMV 月报显示约 $4.8K、$2.8K，展示值合计约 $7.6K，合计售出 412 件。8 月完整月报单独展示归因 GMV 约 $1.7K、成交 134 件、曝光约 115.4K 次。账号标识未显示的其他报表独立列示，单日和阶段快照不与完整月报累加；金额保留后台的 $ 符号与约数口径。

逐图记录在 `assets/internship-data.json`，更新后运行 `node scripts/update-internship.mjs` 可重建实习区块。图片在 `previews/internship/`，交互在 `assets/internship.js`。

- 直接双击 `index.html` 可以浏览新首页。
- **推荐双击「启动预览.cmd」**，自动启动本地预览并打开浏览器。需要本机已安装 Node.js；当前电脑已安装。关闭启动窗口即可停止该预览服务。
- 也可在当前目录运行 `npm start`，然后打开 http://localhost:4173/ 。如端口已经被占用，请先检查是否已有本站的预览服务在运行。
- 个别使用 JavaScript 模块的作品（例如「星位」）需要通过上述本地预览访问，直接双击其 HTML 可能受到浏览器文件安全策略限制。

## 目录

| 位置 | 内容 |
| --- | --- |
| `index.html` | 全新首页 |
| `assets/style.css` | 响应式布局、视觉与动效 |
| `assets/app.js` | 筛选、提示词弹窗与复制 |
| `assets/previews.js` | 作品卡片悬停演示、按需加载和离开清理 |
| `assets/works.json` / `works.js` | 48 件作品的标题、说明、路径和原有提示词 |
| `works/` | 可浏览的本地作品副本，保持原站文件层级 |
| `works/visual-lab/` | 视觉实验室及全部 5 个子页面、依赖资源 |
| `works/houdoumen/` | 后陡门四季合集、游戏脚本及各季图片 |
| `works/xingwei/` | 星位卡牌游戏、模块脚本、卡牌图片及离线缓存资源 |
| `previews/` | 48 张真实作品预览和首页验收截图 |
| `backup/site/` | 从原站下载的原始文件，不修改内容 |
| `backup/original-index.html` / `original-cycling.html` | 原版总目录、骑行目录 |
| `backup/manifest.json` | 原始 URL、文件路径、字节数、SHA-256 与资源依赖清单 |
| `backup/discovered-resources.json` | 浏览器实际发现的动态加载资源 |
| `backup/verification.json` | 最后一次浏览器验收结果 |
| `scripts/` | 本地预览、备份整理、预览截图及验证工具 |

## 备份范围

来源：http://shop.website88.net/gpt6-works/index.html 。备份日期：2026-10-09。

原站首页列出 **45 件作品**，骑行专列是其中的 **19 件**。此外保存了视觉实验室的 5 个内部子页面，以及后陡门、星位运行所需的脚本、样式和图片。原始文件与本地浏览副本分开保存，文件清单可用于完整性核验。

「喵喵钢琴」来自 [PZEHONG/cat-piano](https://github.com/PZEHONG/cat-piano) 仓库，已将其可运行网页文件放入 `works/cat-piano/`，并以实际页面截图生成 `previews/cat-piano.jpg`。它在「互动游戏」分类中排第一，点击「进入作品」可直接游玩，卡片也提供 GitHub 源码链接。它不属于原站的 45 件备份作品。

「收山录」来自 [PZEHONG/shoushanlu](https://github.com/PZEHONG/shoushanlu) 仓库，可运行文件位于 `works/shoushanlu/`，预览图为 `previews/shoushanlu.jpg`。它在「三维世界」分类中排第一，点击「进入作品」可探索三维地球和山野档案，卡片提供 GitHub 源码链接。

备份的是网站公开提供的客户端文件。网页无法提供服务器端代码、未公开的开发工程或版本历史。作品本身的功能和文字保留原状。本次只生成当前目录中的首页及备份，未修改线上原站。

「开屏动画 · DeepSeek Harness」来自 [PZEHONG/deepseek-splash](https://github.com/PZEHONG/deepseek-splash)，仅取用 `package/harness-splash.webm` 与 `review/splash-preview.png` 两个媒体文件，没有克隆项目或引入插件代码。独立展示页位于 `works/deepseek-splash/index.html`，保留原始 3840×2160、24 fps、4 秒无声动画，支持播放、暂停、重播和全屏；启用减少动态效果时等待点击播放。首页与「灵动动画」分类优先展示该作品，作品总数为 48。

## 维护与检查

- 48 张作品卡片支持鼠标悬停自动演示：停留 220 毫秒后加载当前作品，网页作品使用缩放的实时页面，开屏动画使用静音循环视频。移开、切换分类、滚出可见区域、切换浏览器标签页或按 Esc 时释放预览并恢复封面。一次只运行一个预览，加载期间保留封面，失败可直接点击进入作品。
- 键盘聚焦封面也可预览；开启系统「减少动态效果」时不自动播放，触屏保持点击进入作品。运行 `node scripts/verify-previews.mjs` 可检查全部 48 个预览及交互。

- 修改作品数据时，同步 `assets/works.json` 和 `assets/works.js`；后者让首页可以直接双击打开。
- `npm run backup` 根据已下载的原始文件重新整理作品数据、依赖清单及 `works/` 镜像，并保留单独引入的「喵喵钢琴」、「收山录」与「开屏动画」记录；不会重新下载或更新线上文件。
- 原站的提示词只在有原始记录的作品中显示，不为其他作品补写虚构提示词。
- 启动本地服务后运行 `npm test`，校验原始文件哈希、作品数量、分类筛选、弹窗复制、键盘关闭、焦点恢复、5 种屏幕宽度及合集页面资源。
- 验证使用 Playwright 和本机 Chrome。运行站点本身不需要安装任何第三方依赖。

## 上传到现有网站

若要部署此版本，把 `index.html`、`assets/`、`previews/`、`works/` 一并上传到同一目录，保持相对路径。无需上传 `node_modules/`、`.npm-cache/`、`backup/` 或验证脚本。当前交付没有执行线上上传。
