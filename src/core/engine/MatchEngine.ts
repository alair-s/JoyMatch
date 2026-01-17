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
    static checkCover<T>(scene: GameItem<T>[], itemSize = 100): GameItem<T>[] {
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
        startX = 50,
        spacing = 100
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
        gridUnit = 100
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
        matchCount = 3
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

/**
 * 烧烤摊场景生成器
 * 固定9宫格位置，每个位置叠多张卡片
 */
export class BBQSceneGenerator {
    // 9宫格固定位置（3x3布局）
    private static readonly GRID_POSITIONS: Position[] = [
        { x: 0, y: 0 },   { x: 1, y: 0 },   { x: 2, y: 0 },
        { x: 0, y: 1 },   { x: 1, y: 1 },   { x: 2, y: 1 },
        { x: 0, y: 2 },   { x: 1, y: 2 },   { x: 2, y: 2 },
    ];

    /**
     * 根据关卡获取网格配置
     * @param level 关卡
     * @returns { gridCols: 列数, stackCount: 每格叠几张 }
     */
    private static getGridConfig(level: number): { gridCols: number; stackCount: number } {
        // 随着关卡增加，网格和叠层都会增加
        if (level <= 3) return { gridCols: 3, stackCount: 2 + level }; // 3x3, 3-5张
        if (level <= 6) return { gridCols: 3, stackCount: 4 + level }; // 3x3, 8-10张
        if (level <= 10) return { gridCols: 4, stackCount: 3 + Math.floor(level / 2) }; // 4x4
        return { gridCols: 4, stackCount: 5 + Math.floor(level / 3) }; // 更多
    }

    /**
     * 生成固定网格位置
     */
    private static generateGridPositions(
        gridCols: number,
        gridUnit: number,
        offsetX: number,
        offsetY: number
    ): Position[] {
        const positions: Position[] = [];
        for (let row = 0; row < gridCols; row++) {
            for (let col = 0; col < gridCols; col++) {
                positions.push({
                    x: offsetX + col * gridUnit,
                    y: offsetY + row * gridUnit,
                });
            }
        }
        return positions;
    }

    /**
     * 生成烧烤摊场景
     * @param level 关卡
     * @param icons 图标列表
     * @param matchCount 消除所需数量（默认2）
     * @param gridUnit 网格单元大小（默认110）
     */
    static generate<T>(
        level: number,
        icons: GameIcon<T>[],
        matchCount = 2,
        gridUnit = 110
    ): GameItem<T>[] {
        const { gridCols, stackCount } = this.getGridConfig(level);
        const positions = this.generateGridPositions(gridCols, gridUnit, 20, 20);
        const totalCards = positions.length * stackCount;

        // 确保卡片总数是 matchCount 的倍数（可以全部消除）
        const adjustedTotal = Math.floor(totalCards / matchCount) * matchCount;

        // 生成成对的图标（确保可消除）
        const iconList: GameIcon<T>[] = [];
        const setsNeeded = adjustedTotal / matchCount;

        for (let i = 0; i < setsNeeded; i++) {
            const icon = icons[i % icons.length];
            // 每组添加 matchCount 个相同图标
            for (let j = 0; j < matchCount; j++) {
                iconList.push(icon);
            }
        }

        // 打乱图标顺序
        const shuffledIcons = shuffle(iconList);

        // 生成场景道具
        const scene: GameItem<T>[] = [];
        let iconIndex = 0;

        // 为每个位置生成叠牌
        for (const pos of positions) {
            for (let stack = 0; stack < stackCount && iconIndex < shuffledIcons.length; stack++) {
                scene.push({
                    id: randomString(6),
                    icon: shuffledIcons[iconIndex++],
                    status: ItemStatus.Normal,
                    position: { ...pos },
                    isCovered: false, // 覆盖状态由 checkStackCover 计算
                });
            }
        }

        return scene;
    }

    /**
     * 检查叠牌覆盖状态（同位置只有最上面的可点击）
     */
    static checkStackCover<T>(scene: GameItem<T>[]): GameItem<T>[] {
        // 按位置分组
        const positionGroups = new Map<string, GameItem<T>[]>();

        for (const item of scene) {
            if (item.status !== ItemStatus.Normal) continue;

            const key = `${item.position.x},${item.position.y}`;
            if (!positionGroups.has(key)) {
                positionGroups.set(key, []);
            }
            positionGroups.get(key)!.push(item);
        }

        // 每个位置只有最后一个（最上面）不被覆盖
        const result = scene.map((item) => {
            if (item.status !== ItemStatus.Normal) {
                return { ...item, isCovered: false };
            }

            const key = `${item.position.x},${item.position.y}`;
            const group = positionGroups.get(key)!;
            const isTop = group[group.length - 1].id === item.id;

            return { ...item, isCovered: !isTop };
        });

        return result;
    }

    /**
     * 洗牌（重新打乱图标分配，位置不变）
     */
    static shuffle<T>(scene: GameItem<T>[]): GameItem<T>[] {
        // 收集所有正常状态的道具
        const normalItems = scene.filter((item) => item.status === ItemStatus.Normal);
        const icons = normalItems.map((item) => item.icon);

        // 打乱图标
        const shuffledIcons = shuffle(icons);

        // 重新分配图标
        let iconIndex = 0;
        return scene.map((item) => {
            if (item.status !== ItemStatus.Normal) return item;
            return {
                ...item,
                icon: shuffledIcons[iconIndex++],
            };
        });
    }
}

/**
 * 烧烤摊消除引擎
 * 特点：点击选中，两个相同即消除（不需要队列）
 */
export class BBQMatchEngine {
    /**
     * 检查场景中是否有可配对的卡片
     * @param scene 场景
     * @param selectedItem 当前选中的卡片
     * @param matchCount 消除所需数量
     * @returns 可消除的卡片列表，如果没有则返回 null
     */
    static findMatch<T>(
        scene: GameItem<T>[],
        selectedItem: GameItem<T>,
        matchCount = 2
    ): GameItem<T>[] | null {
        // 查找场景中相同图标且可点击的卡片
        const sameIconItems = scene.filter(
            (item) =>
                item.status === ItemStatus.Normal &&
                !item.isCovered &&
                item.icon.name === selectedItem.icon.name &&
                item.id !== selectedItem.id
        );

        // 加上当前选中的卡片
        const allMatched = [selectedItem, ...sameIconItems];

        if (allMatched.length >= matchCount) {
            return allMatched.slice(0, matchCount);
        }

        return null;
    }

    /**
     * 判断游戏是否失败（没有可消除的配对）
     */
    static isGameOver<T>(scene: GameItem<T>[], matchCount = 2): boolean {
        // 获取所有可点击的卡片
        const clickableItems = scene.filter(
            (item) => item.status === ItemStatus.Normal && !item.isCovered
        );

        // 按图标分组
        const groups = new Map<string, number>();
        for (const item of clickableItems) {
            const count = groups.get(item.icon.name) || 0;
            groups.set(item.icon.name, count + 1);
        }

        // 检查是否有任何可配对的组合
        for (const count of groups.values()) {
            if (count >= matchCount) {
                return false; // 还有可消除的
            }
        }

        // 如果还有卡片但没有可消除的配对，游戏结束
        return clickableItems.length > 0;
    }

    /**
     * 判断游戏是否胜利
     */
    static isWin<T>(scene: GameItem<T>[]): boolean {
        return !scene.some((item) => item.status === ItemStatus.Normal);
    }
}
