/**
 * 羊了个羊 - 游戏信息显示组件
 */

import React, { FC } from 'react';

interface GameInfoProps {
    level: number;
    maxLevel: number;
    score: number;
    remainingCount: number;
    usedTime: number;
}

/** 时间戳转换为可读时间字符串 */
const formatTime = (time: number): string => {
    try {
        const hours = Math.floor(time / (1000 * 60 * 60));
        const minutes = Math.floor((time - 1000 * 60 * 60 * hours) / (1000 * 60));
        const seconds = (
            (time - 1000 * 60 * 60 * hours - 1000 * 60 * minutes) /
            1000
        ).toFixed(3);

        if (hours) {
            return `${hours}小时${minutes}分${seconds}秒`;
        } else if (minutes) {
            return `${minutes}分${seconds}秒`;
        } else {
            return `${seconds}秒`;
        }
    } catch {
        return '时间转换出错';
    }
};

export const GameInfo: FC<GameInfoProps> = ({
    level,
    maxLevel,
    score,
    remainingCount,
    usedTime,
}) => {
    return (
        <div className="text-center text-white/90 space-y-1 py-4">
            <div className="text-lg font-bold">
                关卡 {level}/{maxLevel} · 剩余 {remainingCount}
            </div>
            <div className="text-sm opacity-80">
                得分 <span className="text-amber-400 font-bold">{score}</span>
            </div>
            <div className="text-xs opacity-60">
                用时 {formatTime(usedTime)}
            </div>
        </div>
    );
};
