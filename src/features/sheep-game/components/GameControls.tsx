/**
 * 羊了个羊 - 游戏控制按钮组件
 */

import React, { FC } from 'react';

interface GameControlsProps {
    onPop: () => void;
    onUndo: () => void;
    onShuffle: () => void;
    onNextLevel: () => void;
}

export const GameControls: FC<GameControlsProps> = ({
    onPop,
    onUndo,
    onShuffle,
    onNextLevel,
}) => {
    const buttonClass = `
        flex-1 py-3 px-4
        bg-gradient-to-b from-amber-400 to-amber-500
        hover:from-amber-500 hover:to-amber-600
        active:from-amber-600 active:to-amber-700
        text-white font-bold
        rounded-xl shadow-lg
        transition-all duration-150
        border-2 border-amber-300/50
    `;

    return (
        <div className="flex gap-3 w-full max-w-[500px] mx-auto px-4">
            <button className={buttonClass} onClick={onPop}>
                弹出
            </button>
            <button className={buttonClass} onClick={onUndo}>
                撤销
            </button>
            <button className={buttonClass} onClick={onShuffle}>
                洗牌
            </button>
            <button className={buttonClass} onClick={onNextLevel}>
                下一关
            </button>
        </div>
    );
};
