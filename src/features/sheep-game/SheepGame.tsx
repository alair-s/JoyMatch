/**
 * 羊了个羊 - 游戏主页面
 * 使用数据路由 lazy 加载
 */

import React from 'react';
import { useNavigate, useLoaderData } from 'react-router-dom';
import { useGameState } from '../../core/hooks/useGameState';
import { SHEEP_GAME_CONFIG } from '../../shared/config/games';
import { getDefaultSheepTheme } from './themes';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { GameInfo } from './components/GameInfo';
import { GameResult } from './components/GameResult';
import type { GameLoaderData } from '../../app/router';

function SheepGame() {
    const navigate = useNavigate();
    const theme = getDefaultSheepTheme();
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
        config: loaderData?.config || SHEEP_GAME_CONFIG,
        theme,
        initialLevel: loaderData?.savedProgress?.level,
        initialScore: loaderData?.savedProgress?.score,
        initialTime: loaderData?.savedProgress?.time,
    });

    const handleBackHome = () => navigate('/');

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: theme.backgroundColor || '#8dac85' }}
        >
            {/* 顶部区域 */}
            <div className="flex items-center justify-between p-4">
                <button
                    onClick={handleBackHome}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
                >
                    ← 返回
                </button>
                <h1 className="text-xl font-bold text-white">{theme.title}</h1>
                <button
                    onClick={sound.toggleBgm}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-xl transition-colors"
                >
                    {sound.isBgmPlaying ? '🔊' : '🔈'}
                </button>
            </div>

            {/* 游戏信息 */}
            <GameInfo
                level={level}
                maxLevel={maxLevel}
                score={score}
                remainingCount={remainingCount}
                usedTime={usedTime}
            />

            {/* 游戏面板 */}
            <div className="flex-1 flex items-center justify-center px-4 py-2">
                <GameBoard
                    scene={scene}
                    queuePositions={queuePositions}
                    onClickItem={clickItem}
                />
            </div>

            {/* 队列区域 */}
            <div className="h-16 bg-amber-900/30 mx-4 mb-4 rounded-xl" />

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
export default SheepGame;
export const Component = SheepGame;
export { SheepGame };
