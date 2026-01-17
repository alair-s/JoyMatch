/**
 * 烧烤摊 - 游戏主页面
 * 
 * 游戏规则：
 * - 9个烧烤炉（3x3布局）
 * - 每个烧烤炉有6个卡片位置：上面3个可操作，下面3个是预览
 * - 点击卡片选中，再点击空位移动
 * - 操作区3张相同时自动消除，预览区卡片移上来
 */

import React from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { useBBQGameState } from '../../core/hooks/useBBQGameState';
import { BBQ_GAME_CONFIG } from '../../shared/config/games';
import { getDefaultBBQTheme } from './themes';
import { BBQGameBoard } from './components/BBQGameBoard';
import { GameInfo } from '../sheep-game/components/GameInfo';
import { GameResult } from '../sheep-game/components/GameResult';
import type { GameLoaderData } from '../../app/router';

function BBQGame() {
    const navigate = useNavigate();
    const theme = getDefaultBBQTheme();
    const loaderData = useLoaderData() as GameLoaderData | undefined;

    const {
        grills,
        selectedCard,
        cardPoolCount,
        level,
        score,
        status,
        usedTime,
        remainingCount,
        maxLevel,
        clickActiveSlot,
        dragMove,
        shuffle,
        nextLevel,
        restart,
        sound,
    } = useBBQGameState({
        config: loaderData?.config || BBQ_GAME_CONFIG,
        theme,
        initialLevel: loaderData?.savedProgress?.level,
        initialScore: loaderData?.savedProgress?.score,
        initialTime: loaderData?.savedProgress?.time,
    });

    const handleBackHome = () => navigate('/');

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: theme.backgroundColor || '#2d1810' }}
        >
            {/* 顶部烟雾效果 */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-900/20 to-transparent pointer-events-none" />

            {/* 顶部区域 */}
            <div className="relative flex items-center justify-between p-4">
                <button
                    onClick={handleBackHome}
                    className="px-4 py-2 bg-orange-900/50 hover:bg-orange-900/70 rounded-lg text-amber-200 font-medium transition-colors"
                >
                    ← 返回
                </button>
                <h1 className="text-xl font-bold text-amber-400">🔥 {theme.title}</h1>
                <button
                    onClick={sound.toggleBgm}
                    className="w-10 h-10 bg-orange-900/50 hover:bg-orange-900/70 rounded-full flex items-center justify-center text-xl transition-colors"
                >
                    {sound.isBgmPlaying ? '🔊' : '🔈'}
                </button>
            </div>

            {/* 游戏信息 */}
            <div className="text-amber-200">
                <GameInfo
                    level={level}
                    maxLevel={maxLevel}
                    score={score}
                    remainingCount={remainingCount}
                    usedTime={usedTime}
                />
                {/* 卡片池显示 */}
                <div className="text-center text-amber-400/70 text-xs mt-1">
                    📦 卡片池: {cardPoolCount} 张
                </div>
            </div>

            {/* 游戏面板 */}
            <div className="flex-1 flex items-center justify-center px-2 py-2">
                <BBQGameBoard
                    grills={grills}
                    selectedCard={selectedCard}
                    onClickActiveSlot={clickActiveSlot}
                    onDragMove={dragMove}
                />
            </div>

            {/* 控制按钮 */}
            <div className="pb-6 flex justify-center gap-4">
                <button
                    onClick={shuffle}
                    disabled={score < 10}
                    className="px-5 py-2.5 bg-orange-700 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-amber-100 rounded-xl font-medium transition-colors shadow-lg text-sm"
                >
                    🔀 洗牌 (-10)
                </button>
                <button
                    onClick={nextLevel}
                    disabled={level >= maxLevel}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow-lg text-sm"
                >
                    ⏭️ 跳关
                </button>
            </div>

            {/* 游戏结果弹窗 */}
            <GameResult
                status={status}
                score={score}
                level={level}
                usedTime={usedTime}
                onRestart={restart}
                onBackHome={handleBackHome}
            />

            {/* 音效元素 */}
            {sound.renderSoundElements()}
        </div>
    );
}

export default BBQGame;
export const Component = BBQGame;
export { BBQGame };
