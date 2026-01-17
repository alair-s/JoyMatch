/**
 * 应用路由配置 - 数据路由模式
 */

import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, redirect, Outlet, Link } from 'react-router-dom';
import { GAME_CONFIGS, getGameConfigById } from '../shared/config/games';

// ============================================
// 路由 ID 常量
// ============================================
export const ROUTE_IDS = {
    ROOT: 'root',
    HOME: 'home',
    GAME: 'game',
} as const;

// ============================================
// 懒加载组件
// ============================================
const HomePage = lazy(() => import('../features/home/HomePage'));
const SheepGame = lazy(() => import('../features/sheep-game/SheepGame'));
const BBQGame = lazy(() => import('../features/bbq-game/BBQGame'));

// ============================================
// 加载状态组件
// ============================================
const Loading = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-white/60 text-sm">加载中...</span>
        </div>
    </div>
);

// ============================================
// 错误处理组件
// ============================================
const ErrorPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-8xl">😵</div>
        <h1 className="text-3xl font-bold text-white">页面出错了</h1>
        <p className="text-white/60 text-center max-w-md">请刷新页面或返回首页</p>
        <Link
            to="/"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all"
        >
            返回首页
        </Link>
    </div>
);

// ============================================
// 404 组件
// ============================================
const NotFound = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-8xl">🔍</div>
        <h1 className="text-3xl font-bold text-white">页面不存在</h1>
        <p className="text-white/60 text-center max-w-md">你访问的页面可能已被移除或地址错误</p>
        <Link
            to="/"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all"
        >
            返回首页
        </Link>
    </div>
);

// ============================================
// 根布局组件
// ============================================
const RootLayout = () => (
    <Suspense fallback={<Loading />}>
        <Outlet />
    </Suspense>
);

// ============================================
// Loader 函数
// ============================================

/** 首页 Loader */
const homeLoader = async () => {
    return {
        games: GAME_CONFIGS,
        timestamp: Date.now(),
    };
};

/** 游戏页 Loader */
const gameLoader = async ({ params }: { params: { gameId?: string } }) => {
    const { gameId } = params;
    const config = getGameConfigById(gameId || '');

    // 游戏不存在 - 返回 null，让组件处理
    if (!config) {
        return { config: null, savedProgress: null, error: 'not_found' };
    }

    // 游戏未上线，重定向首页
    const registration = GAME_CONFIGS.find((g) => g.config.id === gameId);
    if (registration?.comingSoon) {
        return redirect('/');
    }

    const savedProgress = {
        level: parseInt(localStorage.getItem(`${gameId}_game_level`) || '1', 10),
        score: parseInt(localStorage.getItem(`${gameId}_game_score`) || '0', 10),
        time: parseInt(localStorage.getItem(`${gameId}_game_time`) || '0', 10),
    };

    return { config, savedProgress, error: null };
};

// ============================================
// 路由配置
// ============================================

export const router = createBrowserRouter([
    {
        id: ROUTE_IDS.ROOT,
        path: '/',
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                id: ROUTE_IDS.HOME,
                index: true,
                loader: homeLoader,
                element: <HomePage />,
                errorElement: <ErrorPage />,
            },
            {
                id: ROUTE_IDS.GAME,
                path: 'game',
                errorElement: <ErrorPage />,
                children: [
                    {
                        id: 'sheep-game',
                        path: 'sheep',
                        loader: gameLoader,
                        element: <SheepGame />,
                        errorElement: <ErrorPage />,
                    },
                    {
                        id: 'bbq-game',
                        path: 'bbq',
                        loader: gameLoader,
                        element: <BBQGame />,
                        errorElement: <ErrorPage />,
                    },
                ],
            },
            {
                path: '*',
                element: <NotFound />,
            },
        ],
    },
]);

// ============================================
// 路由工具函数
// ============================================

export const routeUtils = {
    getGamePath: (gameId: string) => `/game/${gameId}`,
    getHomePath: () => '/',
};

// ============================================
// Loader 数据类型
// ============================================

export interface HomeLoaderData {
    games: typeof GAME_CONFIGS;
    timestamp: number;
}

export interface GameLoaderData {
    config: ReturnType<typeof getGameConfigById> | null;
    savedProgress: {
        level: number;
        score: number;
        time: number;
    } | null;
    error: string | null;
}
