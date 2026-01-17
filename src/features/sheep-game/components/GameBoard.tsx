/**
 * 羊了个羊 - 游戏面板组件
 */

import React, { FC } from 'react';
import { GameItem, ItemStatus } from '../../../core/engine/types';

interface GameBoardProps {
    scene: GameItem<string>[];
    queuePositions: Record<string, number>;
    onClickItem: (index: number) => void;
}

export const GameBoard: FC<GameBoardProps> = ({
    scene,
    queuePositions,
    onClickItem,
}) => {
    return (
        <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            {/* 游戏场景区域 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="relative w-[12.5%] h-[12.5%]">
                    {scene.map((item, idx) => {
                        const isInQueue = item.status === ItemStatus.InQueue;
                        const isEliminated = item.status === ItemStatus.Eliminated;

                        // 计算位置
                        const x = isInQueue
                            ? queuePositions[item.id] ?? item.position.x
                            : item.position.x;
                        const y = isInQueue ? 945 : item.position.y;

                        return (
                            <div
                                key={item.id}
                                onClick={() => onClickItem(idx)}
                                className={`
                                    absolute w-full h-full
                                    rounded-lg shadow-md
                                    transition-all duration-150 ease-out
                                    flex items-center justify-center
                                    cursor-pointer select-none
                                    ${item.isCovered ? 'bg-gray-400' : 'bg-white'}
                                    ${isEliminated ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                                `}
                                style={{
                                    transform: `translateX(${x}%) translateY(${y}%)`,
                                }}
                            >
                                <div
                                    className={`
                                        w-full h-full flex items-center justify-center
                                        text-2xl sm:text-3xl
                                        ${item.isCovered ? 'opacity-40' : 'opacity-100'}
                                    `}
                                >
                                    {typeof item.icon.content === 'string' ? (
                                        item.icon.content.startsWith('data:') ||
                                        item.icon.content.startsWith('/') ||
                                        item.icon.content.startsWith('http') ? (
                                            <img
                                                src={item.icon.content}
                                                alt=""
                                                className="w-4/5 h-4/5 object-contain"
                                            />
                                        ) : (
                                            <span>{item.icon.content}</span>
                                        )
                                    ) : (
                                        item.icon.content
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
