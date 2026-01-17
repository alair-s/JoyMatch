/**
 * 烧烤摊 - 游戏面板组件
 * 9个烧烤炉，每个烧烤炉：上3操作位 + 下3预览位
 * 支持拖拽移动卡片
 */

import React, { FC, useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    useDraggable,
    useDroppable,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GameIcon } from '../../../core/engine/types';

// 卡片数据
interface Card<T> {
    id: string;
    icon: GameIcon<T>;
}

// 烧烤炉数据结构
interface Grill<T> {
    id: number;
    activeSlots: (Card<T> | null)[];
    previewSlots: (Card<T> | null)[];
}

interface BBQGameBoardProps {
    grills: Grill<string>[];
    selectedCard: { grillId: number; slotIndex: number } | null;
    onClickActiveSlot: (grillId: number, slotIndex: number) => void;
    onDragMove?: (
        sourceGrillId: number,
        sourceSlotIndex: number,
        targetGrillId: number,
        targetSlotIndex: number
    ) => void;
}

// 渲染卡片图标
const CardIcon: FC<{ icon: GameIcon<string>; size?: 'sm' | 'md' | 'lg' }> = ({
    icon,
    size = 'md',
}) => {
    const sizeClass = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';
    const imgSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-7 h-7';

    if (typeof icon.content === 'string') {
        if (
            icon.content.startsWith('data:') ||
            icon.content.startsWith('/') ||
            icon.content.startsWith('http')
        ) {
            return <img src={icon.content} alt="" className={`${imgSize} object-contain`} />;
        }
        return <span className={sizeClass}>{icon.content}</span>;
    }
    return <>{icon.content}</>;
};

// 可拖拽的卡片
const DraggableCard: FC<{
    card: Card<string>;
    grillId: number;
    slotIndex: number;
    isSelected: boolean;
    onClick: () => void;
}> = ({ card, grillId, slotIndex, isSelected, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `${grillId}-${slotIndex}`,
        data: { card, grillId, slotIndex },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={`
                w-9 h-9 sm:w-10 sm:h-10 rounded-md
                flex items-center justify-center
                transition-all duration-150
                cursor-grab active:cursor-grabbing
                touch-none
                ${
                    isSelected
                        ? 'bg-amber-300 border-2 border-amber-500 scale-110 shadow-lg shadow-amber-400/50 z-20'
                        : 'bg-amber-100 border border-amber-300 hover:scale-105 hover:shadow-md'
                }
            `}
        >
            <CardIcon icon={card.icon} />
        </div>
    );
};

// 可放置的空槽位
const DroppableSlot: FC<{
    grillId: number;
    slotIndex: number;
    onClick: () => void;
}> = ({ grillId, slotIndex, onClick }) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `drop-${grillId}-${slotIndex}`,
        data: { grillId, slotIndex },
    });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={`
                w-9 h-9 sm:w-10 sm:h-10 rounded-md
                flex items-center justify-center
                transition-all duration-150
                cursor-pointer
                border border-dashed
                ${
                    isOver
                        ? 'bg-green-500/40 border-green-400 scale-105'
                        : 'bg-orange-900/40 border-orange-700/50 hover:bg-orange-800/50'
                }
            `}
        >
            <span className={`text-xs ${isOver ? 'text-green-300' : 'text-orange-700/40'}`}>
                {isOver ? '✓' : '+'}
            </span>
        </div>
    );
};

// 预览区槽位（不可操作）
const PreviewSlot: FC<{ card: Card<string> | null }> = ({ card }) => {
    return (
        <div
            className={`
                w-9 h-9 sm:w-10 sm:h-10 rounded-md
                flex items-center justify-center
                ${
                    card
                        ? 'bg-stone-600/50 border border-stone-500/30'
                        : 'bg-stone-800/50 border border-stone-700/30'
                }
            `}
        >
            {card && (
                <div className="opacity-50">
                    <CardIcon icon={card.icon} size="sm" />
                </div>
            )}
        </div>
    );
};

// 拖拽时显示的覆盖层
const DragOverlayCard: FC<{ card: Card<string> }> = ({ card }) => {
    return (
        <div
            className="
                w-10 h-10 sm:w-11 sm:h-11 rounded-md
                flex items-center justify-center
                bg-amber-200 border-2 border-amber-400
                shadow-xl shadow-amber-500/40
                cursor-grabbing
            "
        >
            <CardIcon icon={card.icon} size="lg" />
        </div>
    );
};

// 单个烧烤炉
const GrillUnit: FC<{
    grill: Grill<string>;
    selectedCard: { grillId: number; slotIndex: number } | null;
    onClickActiveSlot: (slotIndex: number) => void;
}> = ({ grill, selectedCard, onClickActiveSlot }) => {
    // 检查操作区是否3个相同（即将消除）
    const activeCards = grill.activeSlots.filter((c): c is Card<string> => c !== null);
    const willEliminate =
        activeCards.length === 3 &&
        activeCards.every((c) => c.icon.name === activeCards[0].icon.name);

    return (
        <div
            className={`
                relative p-2 rounded-xl
                bg-gradient-to-b from-stone-700 to-stone-800
                border-2 transition-all duration-200
                ${
                    willEliminate
                        ? 'border-green-400 shadow-lg shadow-green-500/30 animate-pulse'
                        : 'border-stone-600'
                }
            `}
        >
            {/* 烤架图案 */}
            <div
                className="absolute inset-2 opacity-20 pointer-events-none rounded-lg"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 6px,
                        rgba(139, 69, 19, 0.3) 6px,
                        rgba(139, 69, 19, 0.3) 8px
                    )`,
                }}
            />

            {/* 操作区（上面3个） */}
            <div className="flex gap-1 mb-1 relative z-10">
                {grill.activeSlots.map((card, idx) => {
                    const isSelected =
                        selectedCard?.grillId === grill.id && selectedCard?.slotIndex === idx;

                    if (card) {
                        return (
                            <DraggableCard
                                key={card.id}
                                card={card}
                                grillId={grill.id}
                                slotIndex={idx}
                                isSelected={isSelected}
                                onClick={() => onClickActiveSlot(idx)}
                            />
                        );
                    } else {
                        return (
                            <DroppableSlot
                                key={`empty-${idx}`}
                                grillId={grill.id}
                                slotIndex={idx}
                                onClick={() => onClickActiveSlot(idx)}
                            />
                        );
                    }
                })}
            </div>

            {/* 分隔线 + 火焰效果 */}
            <div className="relative h-3 flex items-center justify-center my-1">
                <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
                <span className="text-[10px] relative z-10">🔥</span>
            </div>

            {/* 预览区（下面3个） */}
            <div className="flex gap-1 relative z-10 opacity-70">
                {grill.previewSlots.map((card, idx) => (
                    <PreviewSlot key={`preview-${idx}`} card={card} />
                ))}
            </div>
        </div>
    );
};

export const BBQGameBoard: FC<BBQGameBoardProps> = ({
    grills,
    selectedCard,
    onClickActiveSlot,
    onDragMove,
}) => {
    const [activeCard, setActiveCard] = useState<Card<string> | null>(null);
    const [dragSource, setDragSource] = useState<{ grillId: number; slotIndex: number } | null>(
        null
    );

    // 配置传感器（支持鼠标和触摸）
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 移动8px后才开始拖拽
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200, // 长按200ms开始拖拽
                tolerance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { card, grillId, slotIndex } = event.active.data.current as {
            card: Card<string>;
            grillId: number;
            slotIndex: number;
        };
        setActiveCard(card);
        setDragSource({ grillId, slotIndex });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { over } = event;

        if (over && dragSource && onDragMove) {
            const dropData = over.data.current as { grillId: number; slotIndex: number };
            if (dropData) {
                onDragMove(
                    dragSource.grillId,
                    dragSource.slotIndex,
                    dropData.grillId,
                    dropData.slotIndex
                );
            }
        }

        setActiveCard(null);
        setDragSource(null);
    };

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="w-full max-w-[420px] mx-auto">
                {/* 说明 */}
                <div className="mb-3 text-center">
                    <div className="text-amber-400/80 text-xs">
                        拖拽卡片到空位 · 凑3个相同消除 🔥
                    </div>
                </div>

                {/* 9个烧烤炉 (3x3) */}
                <div
                    className="grid grid-cols-3 gap-2 p-3 rounded-2xl"
                    style={{
                        background: `linear-gradient(135deg, #3d2817 0%, #2a1a0f 50%, #3d2817 100%)`,
                        boxShadow: `inset 0 2px 10px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.4)`,
                    }}
                >
                    {grills.map((grill) => (
                        <GrillUnit
                            key={grill.id}
                            grill={grill}
                            selectedCard={selectedCard}
                            onClickActiveSlot={(slotIndex) => onClickActiveSlot(grill.id, slotIndex)}
                        />
                    ))}
                </div>

                {/* 操作提示 */}
                <div className="mt-4 text-center text-amber-400/60 text-sm">
                    <span>🖱️ 拖拽或点击移动卡片</span>
                </div>
            </div>

            {/* 拖拽覆盖层 */}
            <DragOverlay>
                {activeCard ? <DragOverlayCard card={activeCard} /> : null}
            </DragOverlay>
        </DndContext>
    );
};
