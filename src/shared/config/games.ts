/**
 * 游戏配置注册中心
 * 所有游戏都在这里注册
 */

import { GameConfig } from '../../core/engine/types';

interface GameRegistration {
    config: GameConfig;
    comingSoon?: boolean;
}

/** 羊了个羊游戏配置 */
export const SHEEP_GAME_CONFIG: GameConfig = {
    id: 'sheep',
    name: '羊了个羊',
    description: '经典三消挑战',
    icon: '🐑',
    matchCount: 3,
    queueSize: 7,
    gridSize: 8,
    maxLevel: 50,
    path: '/game/sheep',
};

/** 烧烤摊游戏配置 */
export const BBQ_GAME_CONFIG: GameConfig = {
    id: 'bbq',
    name: '烧烤摊',
    description: '配对烧烤食材',
    icon: '🍢',
    matchCount: 2,
    queueSize: 5,
    gridSize: 6,
    maxLevel: 30,
    path: '/game/bbq',
};

/** 更多游戏配置（可继续扩展） */
export const PUZZLE_GAME_CONFIG: GameConfig = {
    id: 'puzzle',
    name: '拼图大师',
    description: '考验你的眼力',
    icon: '🧩',
    matchCount: 2,
    queueSize: 6,
    gridSize: 6,
    maxLevel: 20,
    path: '/game/puzzle',
};

/** 所有游戏配置列表 */
export const GAME_CONFIGS: GameRegistration[] = [
    { config: SHEEP_GAME_CONFIG, comingSoon: false },
    { config: BBQ_GAME_CONFIG, comingSoon: true },
    { config: PUZZLE_GAME_CONFIG, comingSoon: true },
];

/** 根据ID获取游戏配置 */
export const getGameConfigById = (id: string): GameConfig | undefined => {
    return GAME_CONFIGS.find((g) => g.config.id === id)?.config;
};
