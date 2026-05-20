# 洛谷刷题助手

React + Vite 本地前端应用。题库和路线运行时只读取 `public/data/*.json`，用户刷题记录保存在浏览器 `localStorage`。

## 项目结构

```text
algo-road
├── scripts
│   ├── fetchLuoguProblems.js
│   ├── generateRoutes.js
│   └── mockProblems.js
├── public
│   └── data
│       ├── problems.json
│       └── routes.json
├── src
│   ├── components
│   ├── pages
│   ├── utils
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
```

## 运行步骤

```bash
npm install
node scripts/fetchLuoguProblems.js
node scripts/generateRoutes.js
npm run dev
npm run build
npm run preview
```

如果洛谷接口对未登录访问返回空数据或重定向，可以先在浏览器登录洛谷，再把当前请求 Cookie 临时传给脚本：

```powershell
$env:LUOGU_COOKIE="你的 Cookie 字符串"
$env:LUOGU_FETCH_DELAY_MS="1500"
node scripts/fetchLuoguProblems.js
node scripts/generateRoutes.js
```

脚本会按 `普及-`、`普及/提高-`、`普及+/提高`、`提高+/省选-` 四个难度分别分页抓取并去重。不要提交或分享自己的 Cookie。

## GitHub Pages

1. 修改 `vite.config.js` 中的 `base`，或构建时使用：

```bash
npm run build:gh-pages
```

2. 如果使用浏览器历史路由，把 `dist/index.html` 复制为 `dist/404.html`。
3. 将 `dist` 发布到 GitHub Pages。也可以用 `gh-pages`、GitHub Actions 或仓库 Pages 设置发布。

## 数据说明

- `scripts/fetchLuoguProblems.js` 只在开发阶段运行，会抓取洛谷主题库 P 题，过滤入门、高难、非 P 题，并写入 `public/data/problems.json`。
- 如果抓取失败，脚本会写入 mock 数据，保证前端可运行。
- `scripts/generateRoutes.js` 从 `problems.json` 自动筛选固定 50 题路线并写入 `public/data/routes.json`。
- 前端不会实时请求洛谷，只会打开题目详情按钮跳转到洛谷对应页面。
