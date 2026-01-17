/**
 * 烧烤摊游戏状态管理 Hook
 * 
 * 游戏规则：
 * - 9个烧烤炉（3x3布局）
 * - 每个烧烤炉有6个卡片位置：上面3个可操作，下面3个是预览
 * - 拖动卡片到其他烧烤炉的空位
 * - 操作区3张相同时自动消除，预览区卡片移上来，预览区从卡片池补充
 * - 卡片池空了且所有卡片消除 = 胜利
 * - 所有操作区满了且无法消除 = 失败
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
    GameConfig,
    GameTheme,
    GameStatus,
    GameIcon,
} from '../engine/types';
import { randomString, shuffle as shuffleArray } from '../engine/MatchEngine';
import { useTimer } from './useTimer';
import { useSound } from './useSound';

// 卡片数据
interface Card<T> {
    id: string;
    icon: GameIcon<T>;
}

// 烧烤炉数据结构
interface Grill<T> {
    id: number;
    // 操作区（上面3个位置，可拖动）
    activeSlots: (Card<T> | null)[];
    // 预览区（下面3个位置，不可操作）
    previewSlots: (Card<T> | null)[];
}

interface UseBBQGameStateOptions<T extends string> {
    config: GameConfig;
    theme: GameTheme<T>;
    initialLevel?: number;
    initialScore?: number;
    initialTime?: number;
}

interface UseBBQGameStateReturn<T extends string> {
    /** 9个烧烤炉 */
    grills: Grill<T>[];
    /** 当前选中的卡片 */
    selectedCard: { grillId: number; slotIndex: number } | null;
    /** 卡片池剩余数量 */
    cardPoolCount: number;
    /** 当前关卡 */
    level: number;
    /** 当前分数 */
    score: number;
    /** 游戏状态 */
    status: GameStatus;
    /** 已用时间 */
    usedTime: number;
    /** 是否动画中 */
    isAnimating: boolean;
    /** 点击操作区卡片 */
    clickActiveSlot: (grillId: number, slotIndex: number) => Promise<void>;
    /** 拖拽移动卡片 */
    dragMove: (
        sourceGrillId: number,
        sourceSlotIndex: number,
        targetGrillId: number,
        targetSlotIndex: number
    ) => Promise<void>;
    /** 洗牌 */
    shuffle: () => void;
    /** 下一关 */
    nextLevel: () => void;
    /** 重新开始 */
    restart: () => void;
    /** 音效相关 */
    sound: ReturnType<typeof useSound<T>>;
    /** 最大关卡 */
    maxLevel: number;
    /** 剩余卡片数量（场上+卡片池） */
    remainingCount: number;
}

// 常量
const GRILL_COUNT = 9;
const ACTIVE_SLOTS = 3; // 操作区位置数
const PREVIEW_SLOTS = 3; // 预览区位置数
const MATCH_COUNT = 3; // 3个相同消除
const MIN_EMPTY_SLOTS = 1; // 每个烧烤炉操作区最少空位数

// 等待工具函数
const waitTimeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 本地存储键
const STORAGE_KEYS = {
    level: 'game_level',
    score: 'game_score',
    time: 'game_time',
};

/**
 * 生成卡片池
 */
function generateCardPool<T extends string>(
    level: number,
    icons: GameIcon<T>[]
): Card<T>[] {
    // 根据关卡决定卡片池大小
    const setsCount = 6 + level * 3; // 关卡越高，卡片越多
    
    const cards: Card<T>[] = [];
    for (let i = 0; i < setsCount; i++) {
        const icon = icons[i % icons.length];
        // 每组3张相同的卡片
        for (let j = 0; j < MATCH_COUNT; j++) {
            cards.push({
                id: randomString(6),
                icon,
            });
        }
    }
    
    return shuffleArray(cards);
}

/**
 * 生成初始烧烤炉状态
 */
function generateGrills<T extends string>(
    level: number,
    cardPool: Card<T>[]
): { grills: Grill<T>[]; remainingPool: Card<T>[] } {
    const maxActiveCards = ACTIVE_SLOTS - MIN_EMPTY_SLOTS;
    const activeCardsPerGrill = Math.min(maxActiveCards, 1 + Math.floor(level / 3));
    // 预览区始终填满（不需要空位）
    const previewCardsPerGrill = PREVIEW_SLOTS;
    
    const grills: Grill<T>[] = [];
    let poolIndex = 0;
    
    for (let i = 0; i < GRILL_COUNT; i++) {
        // 操作区
        const activeSlots: (Card<T> | null)[] = [];
        for (let j = 0; j < ACTIVE_SLOTS; j++) {
            if (j < activeCardsPerGrill && poolIndex < cardPool.length) {
                activeSlots.push(cardPool[poolIndex++]);
            } else {
                activeSlots.push(null);
            }
        }
        
        // 预览区
        const previewSlots: (Card<T> | null)[] = [];
        for (let j = 0; j < PREVIEW_SLOTS; j++) {
            if (j < previewCardsPerGrill && poolIndex < cardPool.length) {
                previewSlots.push(cardPool[poolIndex++]);
            } else {
                previewSlots.push(null);
            }
        }
        
        grills.push({ id: i, activeSlots, previewSlots });
    }
    
    // 返回剩余的卡片池
    return { grills, remainingPool: cardPool.slice(poolIndex) };
}

/**
 * 检查烧烤炉操作区是否可消除
 */
function checkGrillMatch<T>(grill: Grill<T>): boolean {
    const cards = grill.activeSlots.filter((c): c is Card<T> => c !== null);
    if (cards.length < MATCH_COUNT) return false;
    
    const firstName = cards[0].icon.name;
    return cards.length === MATCH_COUNT && cards.every((c) => c.icon.name === firstName);
}

/**
 * 自动上移：只有当操作区3个位置全部为空时，才触发上移
 * 预览区整体移到操作区，卡片池补充预览区
 */
function autoPromote<T>(
    grill: Grill<T>,
    cardPool: Card<T>[]
): { grill: Grill<T>; remainingPool: Card<T>[] } {
    // 检查操作区是否全部为空
    const isActiveAllEmpty = grill.activeSlots.every((slot) => slot === null);
    
    // 如果操作区不是全部为空，不触发上移
    if (!isActiveAllEmpty) {
        return { grill, remainingPool: cardPool };
    }
    
    const remainingPool = [...cardPool];
    
    // 检查预览区是否有卡片
    const previewHasCards = grill.previewSlots.some((c) => c !== null);
    
    let newActiveSlots: (Card<T> | null)[];
    let newPreviewSlots: (Card<T> | null)[];
    
    if (previewHasCards) {
        // 预览区有卡片 → 整体移到操作区
        newActiveSlots = [...grill.previewSlots];
        
        // 从卡片池补充预览区
        newPreviewSlots = [];
        for (let i = 0; i < PREVIEW_SLOTS; i++) {
            if (remainingPool.length > 0) {
                newPreviewSlots.push(remainingPool.shift()!);
            } else {
                newPreviewSlots.push(null);
            }
        }
    } else {
        // 预览区为空 → 卡片池直接补充操作区
        newActiveSlots = [];
        for (let i = 0; i < ACTIVE_SLOTS; i++) {
            if (remainingPool.length > 0) {
                newActiveSlots.push(remainingPool.shift()!);
            } else {
                newActiveSlots.push(null);
            }
        }
        
        // 继续补充预览区
        newPreviewSlots = [];
        for (let i = 0; i < PREVIEW_SLOTS; i++) {
            if (remainingPool.length > 0) {
                newPreviewSlots.push(remainingPool.shift()!);
            } else {
                newPreviewSlots.push(null);
            }
        }
    }
    
    return {
        grill: {
            ...grill,
            activeSlots: newActiveSlots,
            previewSlots: newPreviewSlots,
        },
        remainingPool,
    };
}

/**
 * 对所有烧烤炉执行自动上移（只处理操作区全空的烧烤炉）
 */
function autoPromoteAll<T>(
    grills: Grill<T>[],
    cardPool: Card<T>[]
): { grills: Grill<T>[]; remainingPool: Card<T>[] } {
    const newGrills: Grill<T>[] = [];
    let remainingPool = [...cardPool];
    
    for (const grill of grills) {
        const result = autoPromote(grill, remainingPool);
        remainingPool = result.remainingPool;
        newGrills.push(result.grill);
    }
    
    return { grills: newGrills, remainingPool };
}

/**
 * 检查是否还有空位可以移动
 */
function hasEmptySlot<T>(grills: Grill<T>[]): boolean {
    return grills.some((g) => g.activeSlots.some((slot) => slot === null));
}

/**
 * 检查是否有可消除的组合
 */
function hasMatchableGrill<T>(grills: Grill<T>[]): boolean {
    return grills.some((g) => checkGrillMatch(g));
}

/**
 * 计算场上卡片总数
 */
function countCardsOnBoard<T>(grills: Grill<T>[]): number {
    return grills.reduce((sum, g) => {
        const activeCount = g.activeSlots.filter((c) => c !== null).length;
        const previewCount = g.previewSlots.filter((c) => c !== null).length;
        return sum + activeCount + previewCount;
    }, 0);
}

export function useBBQGameState<T extends string>(
    options: UseBBQGameStateOptions<T>
): UseBBQGameStateReturn<T> {
    const { config, theme, initialLevel = 1, initialScore = 0, initialTime = 0 } = options;
    const { maxLevel } = config;

    const [grills, setGrills] = useState<Grill<T>[]>([]);
    const [cardPool, setCardPool] = useState<Card<T>[]>([]);
    const [selectedCard, setSelectedCard] = useState<{ grillId: number; slotIndex: number } | null>(null);
    const [level, setLevel] = useState(initialLevel);
    const [score, setScore] = useState(initialScore);
    const [status, setStatus] = useState<GameStatus>('idle');
    const [isAnimating, setIsAnimating] = useState(false);

    const timer = useTimer({ initialTime });
    const sound = useSound({ sounds: theme.sounds, bgm: theme.bgm });
    const hasStartedRef = useRef(false);

    // 初始化
    useEffect(() => {
        const pool = generateCardPool(level, theme.icons);
        const { grills: newGrills, remainingPool } = generateGrills(level, pool);
        setGrills(newGrills);
        setCardPool(remainingPool);
    }, []);

    // 缓存关卡进度
    useEffect(() => {
        if (hasStartedRef.current) {
            localStorage.setItem(`${config.id}_${STORAGE_KEYS.level}`, level.toString());
            localStorage.setItem(`${config.id}_${STORAGE_KEYS.score}`, score.toString());
            localStorage.setItem(`${config.id}_${STORAGE_KEYS.time}`, timer.time.toString());
        }
    }, [level, score, timer.time, config.id]);

    // 处理消除后的逻辑（接收当前 cardPool 作为参数，避免闭包问题）
    const handleElimination = useCallback(
        async (
            currentGrills: Grill<T>[],
            currentPool: Card<T>[],  // 使用传入的 cardPool
            targetGrillId: number,
            eliminatedCard: Card<T>
        ): Promise<{ newGrills: Grill<T>[]; newPool: Card<T>[]; isWin: boolean; isLose: boolean }> => {
            // 播放消除音效
            sound.play(eliminatedCard.icon.eliminateSound as T);
            setScore((prev) => prev + MATCH_COUNT * 10);

            // 先清空被消除的烧烤炉操作区
            const grillsAfterClear = currentGrills.map((g) => {
                if (g.id === targetGrillId) {
                    return {
                        ...g,
                        activeSlots: [null, null, null] as (Card<T> | null)[],
                    };
                }
                return g;
            });

            // 对所有烧烤炉执行自动上移（使用传入的 cardPool）
            const { grills: newGrills, remainingPool } = autoPromoteAll(grillsAfterClear, currentPool);

            setGrills(newGrills);
            setCardPool(remainingPool);

            await waitTimeout(300);

            // 检查胜利：场上无卡片且卡片池空
            const cardsOnBoard = countCardsOnBoard(newGrills);
            if (cardsOnBoard === 0 && remainingPool.length === 0) {
                return { newGrills, newPool: remainingPool, isWin: true, isLose: false };
            }

            // 检查失败：没有空位且没有可消除的
            const hasEmpty = hasEmptySlot(newGrills);
            const hasMatch = hasMatchableGrill(newGrills);
            if (!hasEmpty && !hasMatch) {
                return { newGrills, newPool: remainingPool, isWin: false, isLose: true };
            }

            return { newGrills, newPool: remainingPool, isWin: false, isLose: false };
        },
        [cardPool, sound]
    );

    // 处理移动后的逻辑
    const handleAfterMove = useCallback(
        async (
            grillsAfterMove: Grill<T>[],
            targetGrillId: number,
            movedCard: Card<T>
        ) => {
            // 先检查是否有烧烤炉操作区全空，如果有就触发上移
            const { grills: grillsAfterPromote, remainingPool: poolAfterPromote } = autoPromoteAll(grillsAfterMove, cardPool);
            
            // 无论是否有上移，都更新状态（确保移动生效）
            setGrills(grillsAfterPromote);
            setCardPool(poolAfterPromote);

            // 检查目标烧烤炉是否可消除
            const targetGrill = grillsAfterPromote.find((g) => g.id === targetGrillId)!;

            if (checkGrillMatch(targetGrill)) {
                // 消除后会触发自动上移（在 handleElimination 中，传入正确的 cardPool）
                const result = await handleElimination(grillsAfterPromote, poolAfterPromote, targetGrillId, movedCard);

                if (result.isWin) {
                    if (level >= maxLevel) {
                        setStatus('win');
                        timer.pause();
                    } else {
                        // 下一关
                        setScore((prev) => prev + level * 50);
                        setLevel((prev) => prev + 1);
                        const newPool = generateCardPool(level + 1, theme.icons);
                        const { grills: nextGrills, remainingPool: nextRemaining } = generateGrills(level + 1, newPool);
                        setGrills(nextGrills);
                        setCardPool(nextRemaining);
                    }
                } else if (result.isLose) {
                    setStatus('lose');
                    timer.pause();
                }
            } else {
                // 没有消除，检查是否死局
                const hasEmpty = hasEmptySlot(grillsAfterPromote);
                const hasMatch = hasMatchableGrill(grillsAfterPromote);

                if (!hasEmpty && !hasMatch) {
                    setStatus('lose');
                    timer.pause();
                }
            }
        },
        [cardPool, handleElimination, level, maxLevel, theme.icons, timer]
    );

    // 点击操作区卡片
    const clickActiveSlot = useCallback(
        async (grillId: number, slotIndex: number) => {
            if (status === 'win' || status === 'lose' || isAnimating) return;

            if (!hasStartedRef.current) {
                hasStartedRef.current = true;
                setStatus('playing');
                timer.start();
                sound.playBgm();
            }

            const targetGrill = grills.find((g) => g.id === grillId);
            if (!targetGrill) return;

            const targetSlot = targetGrill.activeSlots[slotIndex];

            // 没有选中卡片时
            if (!selectedCard) {
                if (targetSlot) {
                    setSelectedCard({ grillId, slotIndex });
                    sound.play(targetSlot.icon.clickSound as T);
                }
                return;
            }

            // 点击同一位置，取消选中
            if (selectedCard.grillId === grillId && selectedCard.slotIndex === slotIndex) {
                setSelectedCard(null);
                return;
            }

            // 获取源卡片
            const sourceGrill = grills.find((g) => g.id === selectedCard.grillId);
            if (!sourceGrill) {
                setSelectedCard(null);
                return;
            }
            const sourceCard = sourceGrill.activeSlots[selectedCard.slotIndex];
            if (!sourceCard) {
                setSelectedCard(null);
                return;
            }

            // 目标有卡片，切换选中
            if (targetSlot) {
                setSelectedCard({ grillId, slotIndex });
                sound.play(targetSlot.icon.clickSound as T);
                return;
            }

            // 移动卡片
            setIsAnimating(true);
            sound.play(sourceCard.icon.clickSound as T);

            const newGrills = grills.map((g) => {
                if (g.id === selectedCard.grillId) {
                    const newActiveSlots = [...g.activeSlots];
                    newActiveSlots[selectedCard.slotIndex] = null;
                    return { ...g, activeSlots: newActiveSlots };
                }
                if (g.id === grillId) {
                    const newActiveSlots = [...g.activeSlots];
                    newActiveSlots[slotIndex] = sourceCard;
                    return { ...g, activeSlots: newActiveSlots };
                }
                return g;
            });

            setGrills(newGrills);
            setSelectedCard(null);

            await waitTimeout(200);
            await handleAfterMove(newGrills, grillId, sourceCard);
            setIsAnimating(false);
        },
        [grills, selectedCard, status, isAnimating, timer, sound, handleAfterMove]
    );

    // 拖拽移动卡片
    const dragMove = useCallback(
        async (
            sourceGrillId: number,
            sourceSlotIndex: number,
            targetGrillId: number,
            targetSlotIndex: number
        ) => {
            if (status === 'win' || status === 'lose' || isAnimating) return;

            if (!hasStartedRef.current) {
                hasStartedRef.current = true;
                setStatus('playing');
                timer.start();
                sound.playBgm();
            }

            if (sourceGrillId === targetGrillId && sourceSlotIndex === targetSlotIndex) return;

            const sourceGrill = grills.find((g) => g.id === sourceGrillId);
            const targetGrill = grills.find((g) => g.id === targetGrillId);
            if (!sourceGrill || !targetGrill) return;

            const sourceCard = sourceGrill.activeSlots[sourceSlotIndex];
            const targetSlot = targetGrill.activeSlots[targetSlotIndex];

            if (!sourceCard || targetSlot !== null) return;

            setIsAnimating(true);
            sound.play(sourceCard.icon.clickSound as T);

            const newGrills = grills.map((g) => {
                if (g.id === sourceGrillId) {
                    const newActiveSlots = [...g.activeSlots];
                    newActiveSlots[sourceSlotIndex] = null;
                    return { ...g, activeSlots: newActiveSlots };
                }
                if (g.id === targetGrillId) {
                    const newActiveSlots = [...g.activeSlots];
                    newActiveSlots[targetSlotIndex] = sourceCard;
                    return { ...g, activeSlots: newActiveSlots };
                }
                return g;
            });

            setGrills(newGrills);
            setSelectedCard(null);

            await waitTimeout(200);
            await handleAfterMove(newGrills, targetGrillId, sourceCard);
            setIsAnimating(false);
        },
        [grills, status, isAnimating, timer, sound, handleAfterMove]
    );

    // 洗牌
    const shuffle = useCallback(() => {
        if (score < 10) return;
        setScore((prev) => prev - 10);
        setSelectedCard(null);

        const allActiveCards: Card<T>[] = [];
        grills.forEach((g) => {
            g.activeSlots.forEach((card) => {
                if (card) allActiveCards.push(card);
            });
        });

        const shuffledCards = shuffleArray(allActiveCards);

        let cardIndex = 0;
        const newGrills = grills.map((g) => {
            const newActiveSlots = g.activeSlots.map((slot) => {
                if (slot !== null && cardIndex < shuffledCards.length) {
                    return shuffledCards[cardIndex++];
                }
                return slot;
            });
            return { ...g, activeSlots: newActiveSlots };
        });

        setGrills(newGrills);
        sound.play((theme.operateSoundMap?.shuffle || 'sound-wash') as T);
    }, [grills, score, theme.operateSoundMap, sound]);

    // 下一关
    const nextLevel = useCallback(() => {
        if (level >= maxLevel) return;
        setScore((prev) => Math.max(0, prev - level * 10));
        setLevel((prev) => prev + 1);
        setSelectedCard(null);

        const newPool = generateCardPool(level + 1, theme.icons);
        const { grills: newGrills, remainingPool } = generateGrills(level + 1, newPool);
        setGrills(newGrills);
        setCardPool(remainingPool);
    }, [level, maxLevel, theme.icons]);

    // 重新开始
    const restart = useCallback(() => {
        setStatus('idle');
        setScore(0);
        setLevel(1);
        setSelectedCard(null);
        timer.reset();
        hasStartedRef.current = false;

        const newPool = generateCardPool(1, theme.icons);
        const { grills: newGrills, remainingPool } = generateGrills(1, newPool);
        setGrills(newGrills);
        setCardPool(remainingPool);

        localStorage.removeItem(`${config.id}_${STORAGE_KEYS.level}`);
        localStorage.removeItem(`${config.id}_${STORAGE_KEYS.score}`);
        localStorage.removeItem(`${config.id}_${STORAGE_KEYS.time}`);
    }, [theme.icons, config.id, timer]);

    // 计算剩余卡片数量
    const remainingCount = useMemo(() => {
        return countCardsOnBoard(grills) + cardPool.length;
    }, [grills, cardPool]);

    return {
        grills,
        selectedCard,
        cardPoolCount: cardPool.length,
        level,
        score,
        status,
        usedTime: timer.time,
        isAnimating,
        clickActiveSlot,
        dragMove,
        shuffle,
        nextLevel,
        restart,
        sound,
        maxLevel,
        remainingCount,
    };
}
