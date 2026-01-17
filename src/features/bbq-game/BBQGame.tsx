/**
 * 烧烤摊 - 游戏主页面
 * 使用数据路由 lazy 加载
 * 
 * 与羊了个羊的区别：
 * - matchCount = 2（两个相同即可消除）
 * - queueSize = 5（队列更小）
 */

import React from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { useGameState } from '../../core/hooks/useGameState';
import { BBQ_GAME_CONFIG } from '../../shared/config/games';
import { getDefaultBBQTheme } from './themes';
import { GameBoard } from '../sheep-game/components/GameBoard';
import { GameControls } from '../sheep-game/components/GameControls';
import { GameInfo } from '../sheep-game/components/GameInfo';
import { GameResult } from '../sheep-game/components/GameResult';
import type { GameLoaderData } from '../../app/router';

function BBQGame() {
    const navigate = useNavigate();
    const theme = getDefaultBBQTheme();
    const loaderData = useLoaderData() as GameLoaderData | undefined;

    const {
        scene,
        queuePositions,
        level,
        score,
        status,
        usedTime,
        remainingCount,
        maxLevel,
        clickItem,
        pop,
        undo,
        shuffle,
        nextLevel,
        restart,
        sound,
    } = useGameState({
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
            {/* 烧烤摊特色：顶部烟雾效果 */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-900/30 to-transparent pointer-events-none" />

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
            </div>

            {/* 游戏提示 */}
            <div className="text-center text-amber-400/60 text-sm mb-2">
                💡 两个相同食材即可配对
            </div>

            {/* 游戏面板 */}
            <div className="flex-1 flex items-center justify-center px-4 py-2">
                <GameBoard
                    scene={scene}
                    queuePositions={queuePositions}
                    onClickItem={clickItem}
                />
            </div>

            {/* 烤架区域（队列） */}
            <div className="h-16 bg-gradient-to-r from-orange-950 via-red-900 to-orange-950 mx-4 mb-4 rounded-xl border-2 border-orange-800/50 shadow-inner">
                <div className="w-full h-full flex items-center justify-center text-orange-700/50 text-sm">
                    🔥 烤架 🔥
                </div>
            </div>

            {/* 控制按钮 */}
            <div className="pb-8">
                <GameControls
                    onPop={pop}
                    onUndo={undo}
                    onShuffle={shuffle}
                    onNextLevel={nextLevel}
                />
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

// 默认导出 + Component 导出（支持 lazy 加载）
export default BBQGame;
export const Component = BBQGame;
export { BBQGame };
