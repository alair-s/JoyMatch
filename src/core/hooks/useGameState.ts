/**
 * 游戏状态管理 Hook
 * 提供通用的消除游戏状态管理逻辑
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
    GameItem,
    GameConfig,
    GameTheme,
    GameStatus,
    ItemStatus,
} from '../engine/types';
import { MatchEngine, SceneGenerator } from '../engine/MatchEngine';
import { useTimer } from './useTimer';
import { useSound } from './useSound';

interface UseGameStateOptions<T extends string> {
    /** 游戏配置 */
    config: GameConfig;
    /** 当前主题 */
    theme: GameTheme<T>;
    /** 初始关卡 */
    initialLevel?: number;
    /** 初始分数 */
    initialScore?: number;
    /** 初始时间 */
    initialTime?: number;
}

interface UseGameStateReturn<T extends string> {
    /** 场景道具 */
    scene: GameItem<T>[];
    /** 队列道具 */
    queue: GameItem<T>[];
    /** 队列位置映射 */
    queuePositions: Record<string, number>;
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
    /** 点击道具 */
    clickItem: (index: number) => Promise<void>;
    /** 弹出（移出队首） */
    pop: () => void;
    /** 撤销（移出队尾） */
    undo: () => void;
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
    /** 剩余道具数量 */
    remainingCount: number;
}

// 等待工具函数
const waitTimeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 本地存储键
const STORAGE_KEYS = {
    level: 'game_level',
    score: 'game_score',
    time: 'game_time',
};

export function useGameState<T extends string>(
    options: UseGameStateOptions<T>
): UseGameStateReturn<T> {
    const { config, theme, initialLevel = 1, initialScore = 0, initialTime = 0 } = options;
    const { matchCount, queueSize, maxLevel } = config;

    // 基础状态
    const [scene, setScene] = useState<GameItem<T>[]>([]);
    const [queue, setQueue] = useState<GameItem<T>[]>([]);
    const [level, setLevel] = useState(initialLevel);
    const [score, setScore] = useState(initialScore);
    const [status, setStatus] = useState<GameStatus>('idle');
    const [isAnimating, setIsAnimating] = useState(false);
    const [queuePositions, setQueuePositions] = useState<Record<string, number>>({});

    // 计时器
    const timer = useTimer({ initialTime });

    // 音效
    const sound = useSound({
        sounds: theme.sounds,
        bgm: theme.bgm,
    });

    // 弹出计数器（用于弹出位置计算）
    const popCountRef = useRef(0);

    // 是否已开始游戏
    const hasStartedRef = useRef(false);

    // 初始化场景
    useEffect(() => {
        const newScene = SceneGenerator.generate(level, theme.icons, matchCount);
        const checkedScene = MatchEngine.checkCover(newScene);
        setScene(checkedScene);
    }, []);

    // 更新队列排序
    useEffect(() => {
        const positions = MatchEngine.calculateQueuePositions(queue);
        setQueuePositions(positions);
    }, [queue]);

    // 缓存关卡进度
    useEffect(() => {
        if (hasStartedRef.current) {
            localStorage.setItem(`${config.id}_${STORAGE_KEYS.level}`, level.toString());
            localStorage.setItem(`${config.id}_${STORAGE_KEYS.score}`, score.toString());
            localStorage.setItem(`${config.id}_${STORAGE_KEYS.time}`, timer.time.toString());
        }
    }, [level, score, timer.time, config.id]);

    // 更新覆盖状态
    const updateCover = useCallback((sceneToCheck: GameItem<T>[]) => {
        const checked = MatchEngine.checkCover(sceneToCheck);
        setScene(checked);
    }, []);

    // 点击道具
    const clickItem = useCallback(
        async (index: number) => {
            if (status === 'win' || status === 'lose' || isAnimating) return;

            // 首次点击开始游戏
            if (!hasStartedRef.current) {
                hasStartedRef.current = true;
                setStatus('playing');
                timer.start();
                sound.playBgm();
            }

            const currentScene = [...scene];
            const item = currentScene[index];

            // 被覆盖或不在正常状态则不能点击
            if (item.isCovered || item.status !== ItemStatus.Normal) return;

            // 更新状态为队列中
            item.status = ItemStatus.InQueue;

            // 播放点击音效
            sound.play(item.icon.clickSound as T);

            // 更新队列
            const newQueue = [...queue, item];
            setQueue(newQueue);
            updateCover(currentScene);

            // 动画锁
            setIsAnimating(true);
            await waitTimeout(150);

            // 检查是否可以消除
            const matchedItems = MatchEngine.checkMatch(newQueue, matchCount);

            if (matchedItems) {
                // 消除成功，加分
                setScore((prev) => prev + matchCount);

                // 播放消除音效
                sound.play(item.icon.eliminateSound as T);

                // 更新场景中的状态为已消除
                const matchedIds = new Set(matchedItems.map((i) => i.id));
                const updatedScene = currentScene.map((s) =>
                    matchedIds.has(s.id) ? { ...s, status: ItemStatus.Eliminated } : s
                );

                // 从队列中移除已消除的
                const updatedQueue = newQueue.filter((q) => !matchedIds.has(q.id));
                setQueue(updatedQueue);
                updateCover(updatedScene);

                // 检查是否通关
                if (MatchEngine.isWin(updatedScene)) {
                    if (level >= maxLevel) {
                        // 最终胜利
                        setStatus('win');
                        timer.pause();
                    } else {
                        // 进入下一关
                        setScore((prev) => prev + level);
                        setLevel((prev) => prev + 1);
                        setQueue([]);
                        const nextScene = SceneGenerator.generate(
                            level + 1,
                            theme.icons,
                            matchCount
                        );
                        updateCover(nextScene);
                    }
                }
            } else {
                // 检查是否失败
                if (MatchEngine.isGameOver(newQueue, queueSize)) {
                    setStatus('lose');
                    timer.pause();
                }
            }

            setIsAnimating(false);
        },
        [
            scene,
            queue,
            status,
            isAnimating,
            level,
            maxLevel,
            matchCount,
            queueSize,
            theme.icons,
            timer,
            sound,
            updateCover,
        ]
    );

    // 弹出（移出队首到场景下方）
    const pop = useCallback(() => {
        if (queue.length === 0) return;

        setScore((prev) => prev - 1);

        const newQueue = [...queue];
        const item = newQueue.shift()!;

        // 找到场景中对应的道具
        const sceneIndex = scene.findIndex((s) => s.id === item.id);
        if (sceneIndex !== -1) {
            const newScene = [...scene];
            newScene[sceneIndex] = {
                ...newScene[sceneIndex],
                status: ItemStatus.Normal,
                position: {
                    x: 100 * (popCountRef.current % 7),
                    y: 800,
                },
            };
            popCountRef.current++;
            updateCover(newScene);
        }

        setQueue(newQueue);
        sound.play((theme.operateSoundMap?.pop || 'sound-shift') as T);
    }, [queue, scene, theme.operateSoundMap, sound, updateCover]);

    // 撤销（移出队尾回到原位）
    const undo = useCallback(() => {
        if (queue.length === 0) return;

        setScore((prev) => prev - 1);

        const newQueue = [...queue];
        const item = newQueue.pop()!;

        // 找到场景中对应的道具，恢复状态
        const sceneIndex = scene.findIndex((s) => s.id === item.id);
        if (sceneIndex !== -1) {
            const newScene = [...scene];
            newScene[sceneIndex] = {
                ...newScene[sceneIndex],
                status: ItemStatus.Normal,
            };
            updateCover(newScene);
        }

        setQueue(newQueue);
        sound.play((theme.operateSoundMap?.undo || 'sound-undo') as T);
    }, [queue, scene, theme.operateSoundMap, sound, updateCover]);

    // 洗牌
    const shuffle = useCallback(() => {
        setScore((prev) => prev - 1);
        const shuffled = SceneGenerator.shuffle(level, scene);
        updateCover(shuffled);
        sound.play((theme.operateSoundMap?.shuffle || 'sound-wash') as T);
    }, [level, scene, theme.operateSoundMap, sound, updateCover]);

    // 下一关
    const nextLevel = useCallback(() => {
        if (level >= maxLevel) return;

        setScore((prev) => prev - level);
        setLevel((prev) => prev + 1);
        setQueue([]);

        const newScene = SceneGenerator.generate(level + 1, theme.icons, matchCount);
        updateCover(newScene);
    }, [level, maxLevel, theme.icons, matchCount, updateCover]);

    // 重新开始
    const restart = useCallback(() => {
        setStatus('idle');
        setScore(0);
        setLevel(1);
        setQueue([]);
        timer.reset();
        hasStartedRef.current = false;
        popCountRef.current = 0;

        const newScene = SceneGenerator.generate(1, theme.icons, matchCount);
        updateCover(newScene);

        // 清除本地存储
        localStorage.removeItem(`${config.id}_${STORAGE_KEYS.level}`);
        localStorage.removeItem(`${config.id}_${STORAGE_KEYS.score}`);
        localStorage.removeItem(`${config.id}_${STORAGE_KEYS.time}`);
    }, [theme.icons, matchCount, config.id, timer, updateCover]);

    // 计算剩余道具数量
    const remainingCount = scene.filter((i) => i.status === ItemStatus.Normal).length;

    return {
        scene,
        queue,
        queuePositions,
        level,
        score,
        status,
        usedTime: timer.time,
        isAnimating,
        clickItem,
        pop,
        undo,
        shuffle,
        nextLevel,
        restart,
        sound,
        maxLevel,
        remainingCount,
    };
}
