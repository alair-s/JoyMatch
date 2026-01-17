/**
 * 羊了个羊 - 默认主题
 */

import { GameTheme } from '../../../core/engine/types';

const icons = ['🎨', '🌈', '⚙️', '💻', '📚', '🐯', '🐤', '🐼', '🐏', '🍀'] as const;

export type DefaultSoundNames = 'button-click' | 'triple' | 'sound-shift' | 'sound-undo' | 'sound-wash';

export const defaultTheme: GameTheme<DefaultSoundNames> = {
    id: 'sheep-default',
    title: '有解的羊了个羊',
    desc: '真的可以通关~',
    dark: true,
    backgroundColor: '#8dac85',
    icons: icons.map((icon) => ({
        name: icon,
        content: icon,
        clickSound: 'button-click',
        eliminateSound: 'triple',
    })),
    sounds: [
        {
            name: 'button-click',
            src: 'https://minio.streakingman.com/solvable-sheep-game/sound-button-click.mp3',
        },
        {
            name: 'triple',
            src: 'https://minio.streakingman.com/solvable-sheep-game/sound-triple.mp3',
        },
        {
            name: 'sound-shift',
            src: 'https://minio.streakingman.com/solvable-sheep-game/sound-shift.mp3',
        },
        {
            name: 'sound-undo',
            src: 'https://minio.streakingman.com/solvable-sheep-game/sound-undo.mp3',
        },
        {
            name: 'sound-wash',
            src: 'https://minio.streakingman.com/solvable-sheep-game/sound-wash.mp3',
        },
    ],
    bgm: 'https://minio.streakingman.com/solvable-sheep-game/sound-disco.mp3',
    operateSoundMap: {
        pop: 'sound-shift',
        undo: 'sound-undo',
        shuffle: 'sound-wash',
    },
};
