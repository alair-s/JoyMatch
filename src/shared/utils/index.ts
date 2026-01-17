/**
 * 共享工具函数
 */

/** 等待指定时间 */
export const waitTimeout = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/** 生成随机字符串 */
export const randomString = (len: number): string => {
    const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let res = '';
    while (len > 0) {
        res += pool[Math.floor(pool.length * Math.random())];
        len--;
    }
    return res;
};

/** 时间戳转换为可读时间字符串 */
export const formatTime = (time: number): string => {
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

/** 本地存储键 */
export const STORAGE_KEYS = {
    LAST_LEVEL: 'lastLevel',
    LAST_SCORE: 'lastScore',
    LAST_TIME: 'lastTime',
    PLAYING_THEME_ID: 'playingThemeId',
    USER_NAME: 'username',
    USER_ID: 'userId',
};

/** 重置分数存储 */
export const resetScoreStorage = () => {
    localStorage.setItem(STORAGE_KEYS.LAST_LEVEL, '1');
    localStorage.setItem(STORAGE_KEYS.LAST_SCORE, '0');
    localStorage.setItem(STORAGE_KEYS.LAST_TIME, '0');
};
