# 项目设置指南 / Project Setup Guide

## 前置要求 / Prerequisites

- Node.js 18.x or higher
- pnpm (推荐) / npm / yarn
- Supabase 账户 / Supabase account

## 安装步骤 / Installation Steps

### 1. 安装依赖 / Install Dependencies

```bash
pnpm install
# or
npm install
```

### 2. 配置环境变量 / Configure Environment Variables

复制 `.env.example` 到 `.env` 并填入你的 Supabase 凭证：

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

编辑 `.env` 文件：

Edit `.env` file:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ENV=development
```

### 3. 启动开发服务器 / Start Development Server

```bash
pnpm dev
# or
npm run dev
```

应用将在 http://localhost:5173 运行

The app will run at http://localhost:5173

## 项目结构 / Project Structure

```
src/
├── lib/
│   ├── components/     # UI 组件 / UI Components
│   ├── services/       # 业务逻辑和 API / Business logic and APIs
│   ├── stores/         # 状态管理 / State management
│   ├── types/          # TypeScript 类型 / TypeScript types
│   └── utils/          # 工具函数 / Utility functions
├── routes/             # 页面路由 / Page routes
├── app.css             # 全局样式 / Global styles
└── app.html            # HTML 模板 / HTML template
```

## 核心技术栈 / Core Technologies

- **前端框架 / Frontend**: SvelteKit + TypeScript
- **样式 / Styling**: Tailwind CSS + DaisyUI
- **图表 / Charts**: Chart.js + chartjs-plugin-streaming
- **后端 / Backend**: Supabase (PostgreSQL + Auth + Storage)
- **构建工具 / Build Tool**: Vite

## 可用命令 / Available Commands

```bash
# 开发模式 / Development
pnpm dev

# 构建生产版本 / Build for production
pnpm build

# 预览生产构建 / Preview production build
pnpm preview

# 类型检查 / Type checking
pnpm check

# 类型检查（监听模式） / Type checking (watch mode)
pnpm check:watch
```

## 主题配置 / Theme Configuration

项目使用工业风格主题，配色方案：

The project uses an industrial theme with the following color scheme:

- **主色 / Primary**: 橙色 #FF6B35
- **背景 / Background**: 黑色/深灰 #1A1A1A
- **强调色 / Accent**: 金色 #FFD700
- **波形 / Waveform**: 绿色 #00FF00

## 下一步 / Next Steps

1. 配置 Supabase 数据库表 / Configure Supabase database tables
2. 实现用户认证 / Implement user authentication
3. 开发仪器界面组件 / Develop instrument interface components
4. 实现实时波形显示 / Implement real-time waveform display

## 故障排除 / Troubleshooting

### 依赖安装失败 / Dependency Installation Fails

尝试清除缓存：

Try clearing the cache:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 类型错误 / Type Errors

运行类型检查：

Run type checking:

```bash
pnpm check
```

### Supabase 连接问题 / Supabase Connection Issues

确保 `.env` 文件中的凭证正确，并且 Supabase 项目已启用。

Ensure credentials in `.env` are correct and Supabase project is enabled.
