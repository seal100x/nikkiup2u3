# 奇迹暖暖在线配装器 — 前端 App

基于 React + TypeScript + Vite 构建的新版前端，嵌入主仓库 `nikkiup2u3` 中使用。

## 技术栈

| 依赖            | 版本    |
| --------------- | ------- |
| React           | ^18.3.1 |
| React DOM       | ^18.3.1 |
| Ant Design      | ^6.3.5  |
| TypeScript      | ~5.6.2  |
| Vite            | ^5.4.10 |
| Node.js（推荐） | ≥18     |

## 开发准备

1. 安装 [Node.js](https://nodejs.org/) ≥ 18
2. 进入 `app/` 目录，安装依赖：

```bash
cd app
npm install
```

## 本地开发

```bash
cd app
npm run dev
```

启动后访问 `http://localhost:5173`。

开发服务器通过 `vite.config.ts` 中的 `publicDir: '../../'` 将项目根目录作为静态资源目录，因此 `wardrobe.js`、`levels.js` 等数据文件可以直接被访问，无需额外配置。

## 构建与部署

项目部署在 GitHub Pages 的子路径 `/nikkiup2u3/` 下，`vite.config.ts` 已配置 `base: '/nikkiup2u3/'`。

**不要手动 build**，在项目根目录使用自动化脚本：

```bash
# 在仓库根目录（nikkiup2u3/）执行
node deploy.mjs
```

该脚本会依次完成：

1. 在 `app/` 下执行 `npm run build`
2. 将 `app/dist/assets/` 复制到根目录 `assets/`
3. 将 `app/dist/index.html` 复制到根目录 `index.html`

完成后提交根目录的变更即可推送到 GitHub Pages。

## 其他命令

```bash
npm run lint      # ESLint 检查
npm run preview   # 预览 build 产物（本地）
```

## 对原始代码的改动

1.把旧的 index.html 备份为 index_old.html，用新构建产物替换index.html，支持返回旧版
2.model.js：putAll 和 put 加了防御性判断，跳过空项，避免 chooseAccessories 在某些关卡数据下因 null.type崩溃。
3.tool.js：clone 函数加了 WeakSet 循环引用保护，遇到已访问过的对象直接返回原引用，防止深度递归导致内存溢出。
