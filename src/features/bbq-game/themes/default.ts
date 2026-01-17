/**
 * 烧烤摊 - 默认主题
 */

import { GameTheme } from '../../../core/engine/types';

/** 烧烤食材图标 */
const bbqIcons = [
    '🍢', // 串
    '🥩', // 牛排
    '🍖', // 肉
    '🌽', // 玉米
    '🥬', // 蔬菜
    '🍄', // 蘑菇
    '🧅', // 洋葱
    '🫑', // 青椒
    '🦐', // 虾
    '🦑', // 鱿鱼
] as const;

export type BBQSoundNames = 'sizzle' | 'match' | 'pop' | 'undo' | 'shuffle';

export const bbqDefaultTheme: GameTheme<BBQSoundNames> = {
    id: 'bbq-default',
    title: '深夜烧烤摊',
    desc: '配对相同的食材',
    dark: true,
    backgroundColor: '#2d1810',
    background: undefined, // 可以添加烧烤摊背景图
    icons: bbqIcons.map((icon) => ({
        name: icon,
        content: icon,
        clickSound: 'sizzle',
        eliminateSound: 'match',
    })),
    sounds: [
        {
            name: 'sizzle',
            src: 'https://minio.streakingman.com/solvable-sheep-game/sound-button-click.mp3',
        },
        {
            name: 'match',
            src: 'https://minio.streakingman.com/solvable-sheep-game/sound-triple.mp3',
        },
        {
            name: 'pop',
            src: 'https://minio.streakingman.com/solvable-sheep-game/sound-shift.mp3',
        },
        {
            name: 'undo',
            src: 'https://minio.streakingman.com/solvable-sheep-game/sound-undo.mp3',
        },
        {
            name: 'shuffle',
            src: 'https://minio.streakingman.com/solvable-sheep-game/sound-wash.mp3',
        },
    ],
    // TODO: 添加烧烤摊专属BGM
    bgm: 'https://minio.streakingman.com/solvable-sheep-game/sound-disco.mp3',
    operateSoundMap: {
        pop: 'pop',
        undo: 'undo',
        shuffle: 'shuffle',
    },
};
