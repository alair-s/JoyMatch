/**
 * 羊了个羊 - 游戏结果组件
 */

import React, { FC } from 'react';
import { GameStatus } from '../../../core/engine/types';

interface GameResultProps {
    status: GameStatus;
    score: number;
    level: number;
    usedTime: number;
    onRestart: () => void;
    onBackHome: () => void;
}

/** 时间戳转换为可读时间字符串 */
const formatTime = (time: number): string => {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time - 1000 * 60 * 60 * hours) / (1000 * 60));
    const seconds = Math.floor(
        (time - 1000 * 60 * 60 * hours - 1000 * 60 * minutes) / 1000
    );

    if (hours) {
        return `${hours}小时${minutes}分${seconds}秒`;
    } else if (minutes) {
        return `${minutes}分${seconds}秒`;
    } else {
        return `${seconds}秒`;
    }
};

export const GameResult: FC<GameResultProps> = ({
    status,
    score,
    level,
    usedTime,
    onRestart,
    onBackHome,
}) => {
    if (status !== 'win' && status !== 'lose') return null;

    const isWin = status === 'win';

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-white/10">
                {/* 结果图标 */}
                <div className="text-7xl text-center mb-4">
                    {isWin ? '🎉' : '😢'}
                </div>

                {/* 标题 */}
                <h2
                    className={`text-3xl font-black text-center mb-6 ${
                        isWin
                            ? 'text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text'
                            : 'text-red-400'
                    }`}
                >
                    {isWin ? '恭喜通关！' : '游戏结束'}
                </h2>

                {/* 统计信息 */}
                <div className="space-y-3 mb-8">
                    <div className="flex justify-between text-white/80">
                        <span>关卡</span>
                        <span className="font-bold text-amber-400">{level}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                        <span>得分</span>
                        <span className="font-bold text-green-400">{score}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                        <span>用时</span>
                        <span className="font-bold text-blue-400">
                            {formatTime(usedTime)}
                        </span>
                    </div>
                </div>

                {/* 按钮 */}
                <div className="space-y-3">
                    <button
                        onClick={onRestart}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all"
                    >
                        再来一局
                    </button>
                    <button
                        onClick={onBackHome}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
                    >
                        返回首页
                    </button>
                </div>
            </div>
        </div>
    );
};
