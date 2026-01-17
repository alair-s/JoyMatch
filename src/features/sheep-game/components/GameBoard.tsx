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

/** 渲染单个道具图标 */
const ItemIcon: FC<{ item: GameItem<string> }> = ({ item }) => (
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
);

export const GameBoard: FC<GameBoardProps> = ({
    scene,
    queuePositions,
    onClickItem,
}) => {
    // 分离场景道具和队列道具
    const sceneItems = scene.filter(
        (item) => item.status === ItemStatus.Normal || item.status === ItemStatus.Eliminated
    );
    const queueItems = scene.filter((item) => item.status === ItemStatus.InQueue);

    return (
        <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            {/* 游戏场景区域 */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="relative w-[12.5%] h-[12.5%]">
                    {sceneItems.map((item, idx) => {
                        const originalIdx = scene.findIndex((s) => s.id === item.id);
                        const isEliminated = item.status === ItemStatus.Eliminated;

                        return (
                            <div
                                key={item.id}
                                onClick={() => onClickItem(originalIdx)}
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
                                    transform: `translateX(${item.position.x}%) translateY(${item.position.y}%)`,
                                }}
                            >
                                <ItemIcon item={item} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/** 队列区域组件 - 显示已选中的牌 */
interface GameQueueProps {
    scene: GameItem<string>[];
    queuePositions: Record<string, number>;
}

export const GameQueue: FC<GameQueueProps> = ({ scene, queuePositions }) => {
    const queueItems = scene.filter((item) => item.status === ItemStatus.InQueue);

    // 根据 queuePositions 排序队列（相同图标会聚合在一起）
    const sortedQueueItems = [...queueItems].sort((a, b) => {
        const posA = queuePositions[a.id] ?? 0;
        const posB = queuePositions[b.id] ?? 0;
        return posA - posB;
    });

    return (
        <div className="h-16 bg-amber-900/30 mx-4 mb-4 rounded-xl relative overflow-hidden">
            {/* 队列槽位背景 */}
            <div className="absolute inset-0 flex">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex-1 border-r border-amber-900/20 last:border-r-0"
                    />
                ))}
            </div>

            {/* 队列中的牌 */}
            {sortedQueueItems.map((item, idx) => {
                // 每个槽位占 1/7，留出一点间距
                const slotPercent = 100 / 7;
                const leftPercent = idx * slotPercent;

                return (
                    <div
                        key={item.id}
                        className="absolute top-1 bottom-1 bg-white rounded-lg shadow-md flex items-center justify-center transition-all duration-150 ease-out"
                        style={{
                            left: `calc(${leftPercent}% + 4px)`,
                            width: `calc(${slotPercent}% - 8px)`,
                        }}
                    >
                        <div className="text-2xl sm:text-3xl">
                            {typeof item.icon.content === 'string' ? (
                                item.icon.content.startsWith('data:') ||
                                item.icon.content.startsWith('/') ||
                                item.icon.content.startsWith('http') ? (
                                    <img
                                        src={item.icon.content}
                                        alt=""
                                        className="w-10 h-10 object-contain"
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
    );
};
