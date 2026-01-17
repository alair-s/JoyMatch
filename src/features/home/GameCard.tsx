/**
 * 游戏卡片组件
 * 用于首页展示各个游戏入口
 */

import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { GameConfig } from '../../core/engine/types';
import { routeUtils } from '../../app/router';

interface GameCardProps {
    game: GameConfig;
    /** 是否即将上线 */
    comingSoon?: boolean;
}

export const GameCard: FC<GameCardProps> = ({ game, comingSoon = false }) => {
    const cardContent = (
        <>
            {/* 装饰背景 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {/* 图标 */}
            <div className="relative text-5xl z-10 transform transition-transform group-hover:scale-110">
                {game.icon}
            </div>

            {/* 游戏名称 */}
            <h3 className="relative z-10 text-lg font-bold text-white tracking-wide">
                {game.name}
            </h3>

            {/* 描述 */}
            <p className="relative z-10 text-xs text-white/70 text-center px-3">
                {game.description}
            </p>

            {/* 即将上线标签 */}
            {comingSoon && (
                <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs px-2 py-0.5 rounded-full font-medium">
                    敬请期待
                </div>
            )}

            {/* 悬浮光效 */}
            {!comingSoon && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12" />
                </div>
            )}
        </>
    );

    const baseClassName = `
        relative overflow-hidden
        w-40 h-48 rounded-2xl
        flex flex-col items-center justify-center gap-3
        transition-all duration-300 ease-out
        backdrop-blur-sm border border-white/10
    `;

    if (comingSoon) {
        return (
            <div
                className={`${baseClassName} bg-gray-800/50 cursor-not-allowed opacity-60`}
            >
                {cardContent}
            </div>
        );
    }

    return (
        <Link
            to={routeUtils.getGamePath(game.id)}
            className={`${baseClassName} bg-gradient-to-br from-purple-600/80 to-pink-600/80 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30`}
        >
            {cardContent}
        </Link>
    );
};
