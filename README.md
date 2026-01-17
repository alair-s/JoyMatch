# 🎮 JoyMatch

一个支持多游戏的消除类小游戏平台，采用大厂架构设计。

## ✨ 特性

- 🎯 **多游戏支持** - 首页选择不同游戏（羊了个羊、烧烤摊等）
- 🔧 **核心引擎复用** - 抽象的消除引擎，支持不同消除规则
- 🎨 **主题系统** - 每个游戏支持多主题切换
- 📱 **响应式设计** - 适配移动端和桌面端
- ⚡ **懒加载** - 路由级别代码分割

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **构建**: Vite 7
- **路由**: React Router v6 (Data Router)
- **样式**: Tailwind CSS v4
- **状态**: React Hooks

## 📁 项目结构

```
src/
├── app/                    # 应用入口
│   ├── App.tsx            # 根组件
│   └── router.tsx         # 路由配置（数据路由模式）
│
├── core/                   # 核心游戏引擎（可复用）
│   ├── engine/
│   │   ├── types.ts       # 类型定义
│   │   └── MatchEngine.ts # 消除算法
│   └── hooks/
│       ├── useGameState.ts # 游戏状态管理
│       ├── useTimer.ts     # 计时器
│       └── useSound.tsx    # 音效管理
│
├── features/               # 功能模块（按游戏划分）
│   ├── home/              # 首页（游戏选择）
│   ├── sheep-game/        # 🐑 羊了个羊
│   └── bbq-game/          # 🍢 烧烤摊
│
└── shared/                 # 共享模块
    ├── config/games.ts    # 游戏配置中心
    └── utils/             # 工具函数
```

## 🎮 游戏列表

| 游戏 | 消除规则 | 状态 |
|-----|---------|------|
| 🐑 羊了个羊 | 3 个相同消除 | ✅ 已上线 |
| 🍢 烧烤摊 | 2 个相同消除 | 🚧 开发中 |
| 🧩 拼图大师 | 2 个相同消除 | 📋 规划中 |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🔧 添加新游戏

1. 在 `features/` 下创建新游戏模块
2. 在 `shared/config/games.ts` 注册游戏配置
3. 在 `app/router.tsx` 添加路由

```typescript
// shared/config/games.ts
export const NEW_GAME_CONFIG: GameConfig = {
    id: 'new-game',
    name: '新游戏',
    matchCount: 2,  // 消除规则
    queueSize: 5,
    // ...
};
```

## 📖 架构设计

### 消除引擎

```typescript
// 核心引擎支持配置化消除规则
const config = {
    matchCount: 3,  // 羊了个羊：3 消
    // matchCount: 2,  // 烧烤摊：2 消
};

// 统一的游戏状态管理
const { scene, queue, clickItem, pop, undo, shuffle } = useGameState({
    config,
    theme,
});
```

### 数据路由

```typescript
// React Router v6 数据路由模式
createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            { index: true, loader: homeLoader, element: <HomePage /> },
            { path: 'game/sheep', loader: gameLoader, element: <SheepGame /> },
        ],
    },
]);
```

## 🙏 致谢

基于 [solvable-sheep-game](https://github.com/StreakingMan/solvable-sheep-game) 进行二次创作，感谢原作者 StreakingMan。

## 📄 License

MIT
