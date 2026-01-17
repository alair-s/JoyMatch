/**
 * 游戏计时器 Hook
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerOptions {
    /** 初始时间（毫秒） */
    initialTime?: number;
    /** 更新间隔（毫秒） */
    interval?: number;
}

interface UseTimerReturn {
    /** 已用时间（毫秒） */
    time: number;
    /** 是否正在计时 */
    isRunning: boolean;
    /** 开始计时 */
    start: () => void;
    /** 暂停计时 */
    pause: () => void;
    /** 重置计时器 */
    reset: () => void;
    /** 停止并重置 */
    stop: () => void;
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
    const { initialTime = 0, interval = 10 } = options;

    const [time, setTime] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);

    const startTimeRef = useRef<number>(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const start = useCallback(() => {
        if (isRunning) return;

        startTimeRef.current = Date.now() - time;
        setIsRunning(true);

        intervalRef.current = setInterval(() => {
            setTime(Date.now() - startTimeRef.current);
        }, interval);
    }, [isRunning, time, interval]);

    const pause = useCallback(() => {
        clearTimer();
        setIsRunning(false);
    }, [clearTimer]);

    const reset = useCallback(() => {
        clearTimer();
        setTime(initialTime);
        setIsRunning(false);
    }, [clearTimer, initialTime]);

    const stop = useCallback(() => {
        clearTimer();
        setTime(initialTime);
        setIsRunning(false);
    }, [clearTimer, initialTime]);

    // 清理定时器
    useEffect(() => {
        return () => {
            clearTimer();
        };
    }, [clearTimer]);

    return {
        time,
        isRunning,
        start,
        pause,
        reset,
        stop,
    };
}
