/**
 * 消除游戏核心引擎
 * 包含所有消除类游戏通用的核心算法
 */

import { GameItem, ItemStatus, Position, GameIcon } from './types';

/**
 * 生成随机字符串
 */
export const randomString = (len: number): string => {
    const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let res = '';
    while (len > 0) {
        res += pool[Math.floor(pool.length * Math.random())];
        len--;
    }
    return res;
};

/**
 * O(n) 时间复杂度的 Fisher-Yates 洗牌算法
 */
export const shuffle = <T>(arr: T[]): T[] => {
    const result = arr.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

/**
 * 消除引擎类
 */
export class MatchEngine {
    /**
     * 检查队列中是否有可消除的组合
     * @param queue 当前队列
     * @param matchCount 消除所需数量
     * @returns 可消除的道具列表，如果没有则返回 null
     */
    static checkMatch<T>(
        queue: GameItem<T>[],
        matchCount: number
    ): GameItem<T>[] | null {
        // 按图标名称分组
        const groups = new Map<string, GameItem<T>[]>();

        for (const item of queue) {
            const key = item.icon.name;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(item);
        }

        // 查找满足消除条件的组
        for (const [, items] of groups) {
            if (items.length >= matchCount) {
                return items.slice(0, matchCount);
            }
        }

        return null;
    }

    /**
     * 检查覆盖关系（后面的元素覆盖前面的元素）
     * @param scene 场景道具列表
     * @param itemSize 道具尺寸（默认100）
     */
    static checkCover<T>(scene: GameItem<T>[], itemSize: number = 100): GameItem<T>[] {
        const result = scene.map((item) => ({ ...item, isCovered: false }));

        for (let i = 0; i < result.length; i++) {
            const current = result[i];
            if (current.status !== ItemStatus.Normal) continue;

            const { x: x1, y: y1 } = current.position;
            const x2 = x1 + itemSize;
            const y2 = y1 + itemSize;

            // 检查是否被后面的元素覆盖
            for (let j = i + 1; j < result.length; j++) {
                const other = result[j];
                if (other.status !== ItemStatus.Normal) continue;

                const { x, y } = other.position;
                // 两区域有交集则视为被覆盖
                const hasIntersection = !(
                    y + itemSize <= y1 ||
                    y >= y2 ||
                    x + itemSize <= x1 ||
                    x >= x2
                );

                if (hasIntersection) {
                    current.isCovered = true;
                    break;
                }
            }
        }

        return result;
    }

    /**
     * 判断游戏是否失败（队列满了）
     */
    static isGameOver<T>(queue: GameItem<T>[], queueSize: number): boolean {
        return queue.length >= queueSize;
    }

    /**
     * 判断游戏是否胜利（场景清空）
     */
    static isWin<T>(scene: GameItem<T>[]): boolean {
        return !scene.some((item) => item.status !== ItemStatus.Eliminated);
    }

    /**
     * 计算队列排序位置（相同图标聚合）
     */
    static calculateQueuePositions<T>(
        queue: GameItem<T>[],
        startX: number = 50,
        spacing: number = 100
    ): Record<string, number> {
        // 按图标分组，保持原有顺序
        const groups: Record<string, GameItem<T>[]> = {};
        const groupOrder: string[] = [];

        for (const item of queue) {
            const key = item.icon.name;
            if (!groups[key]) {
                groups[key] = [];
                groupOrder.push(key);
            }
            groups[key].push(item);
        }

        // 按分组顺序计算位置
        const positions: Record<string, number> = {};
        let x = startX;

        for (const key of groupOrder) {
            for (const item of groups[key]) {
                positions[item.id] = x;
                x += spacing;
            }
        }

        return positions;
    }
}

/**
 * 场景生成器
 */
export class SceneGenerator {
    // 不同关卡对应的网格范围
    private static readonly SCENE_RANGES = [
        [2, 6],
        [1, 6],
        [1, 7],
        [0, 7],
        [0, 8],
    ];

    // 位置偏移量池
    private static readonly OFFSETS = [0, 25, -25, 50, -50];

    /**
     * 生成随机位置
     */
    private static randomPosition(
        offsetPool: number[],
        range: number[],
        gridUnit: number = 100
    ): Position {
        const offset = offsetPool[Math.floor(offsetPool.length * Math.random())];
        const row = range[0] + Math.floor((range[1] - range[0]) * Math.random());
        const column = range[0] + Math.floor((range[1] - range[0]) * Math.random());

        return {
            x: column * gridUnit + offset,
            y: row * gridUnit + offset,
        };
    }

    /**
     * 生成游戏场景
     * @param level 关卡
     * @param icons 图标列表
     * @param matchCount 消除所需数量（默认3）
     */
    static generate<T>(
        level: number,
        icons: GameIcon<T>[],
        matchCount: number = 3
    ): GameItem<T>[] {
        // 根据关卡确定图标池
        const iconPool = icons.slice(0, 2 * level);
        const offsetPool = this.OFFSETS.slice(0, 1 + level);
        const range = this.SCENE_RANGES[Math.min(4, level - 1)];

        const scene: GameItem<T>[] = [];

        // 每隔5级增加图标池
        let compareLevel = level;
        while (compareLevel > 0) {
            iconPool.push(
                ...iconPool.slice(0, Math.min(10, 2 * (compareLevel - 5)))
            );
            compareLevel -= 5;
        }

        // 每个图标生成 matchCount * 2 张卡片（确保可以消除）
        for (const icon of iconPool) {
            for (let i = 0; i < matchCount * 2; i++) {
                const position = this.randomPosition(offsetPool, range);
                scene.push({
                    id: randomString(6),
                    icon,
                    status: ItemStatus.Normal,
                    position,
                    isCovered: false,
                });
            }
        }

        return scene;
    }

    /**
     * 洗牌场景（重新排列位置）
     */
    static shuffle<T>(level: number, scene: GameItem<T>[]): GameItem<T>[] {
        const shuffled = shuffle(scene);
        const offsetPool = this.OFFSETS.slice(0, 1 + level);
        const range = this.SCENE_RANGES[Math.min(4, level - 1)];

        return shuffled.map((item) => {
            if (item.status !== ItemStatus.Normal) return item;

            const position = this.randomPosition(offsetPool, range);
            return {
                ...item,
                position,
                isCovered: false,
            };
        });
    }
}
