/**
 * 首页 - 游戏选择页面
 * 使用数据路由 lazy 加载
 */

import React from 'react';
import { useLoaderData } from 'react-router-dom';
import { GameCard } from './GameCard';
import type { HomeLoaderData } from '../../app/router';

function HomePage() {
    const { games } = useLoaderData() as HomeLoaderData;

    const availableGames = games.filter((g) => !g.comingSoon);
    const comingSoonGames = games.filter((g) => g.comingSoon);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8">
            {/* 背景装饰 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: '1s' }}
                />
            </div>

            {/* 标题区域 */}
            <div className="relative z-10 text-center mb-12">
                <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-4 tracking-tight">
                    🎮 JoyMatch
                </h1>
                <p className="text-lg text-white/60 font-medium">
                    选择你喜欢的游戏开始挑战
                </p>
            </div>

            {/* 游戏卡片网格 */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {availableGames.map((game) => (
                    <GameCard key={game.config.id} game={game.config} />
                ))}
                {comingSoonGames.map((game) => (
                    <GameCard key={game.config.id} game={game.config} comingSoon />
                ))}
            </div>

            {/* 底部信息 */}
            <div className="relative z-10 mt-16 text-center">
                <p className="text-sm text-white/40">Made with ❤️ by JoyMatch Team</p>
                <div className="flex gap-4 justify-center mt-4">
                    <a
                        href="https://github.com/alair-s/JoyMatch"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/50 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}

// 默认导出 + Component 导出（支持 lazy 加载）
export default HomePage;
export const Component = HomePage;
export { HomePage };
