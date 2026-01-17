/**
 * 核心游戏引擎类型定义
 * 支持多种消除类游戏复用
 */

import { ReactNode } from 'react';

/** 游戏道具状态 */
export enum ItemStatus {
    /** 正常状态（在场景中） */
    Normal = 0,
    /** 队列中 */
    InQueue = 1,
    /** 已消除 */
    Eliminated = 2,
}

/** 位置信息 */
export interface Position {
    x: number;
    y: number;
}

/** 图标定义 */
export interface GameIcon<SoundName = string> {
    /** 唯一标识名 */
    name: string;
    /** 显示内容：字符串/图片URL/ReactNode */
    content: ReactNode;
    /** 点击音效 */
    clickSound: SoundName;
    /** 消除音效 */
    eliminateSound: SoundName;
}

/** 音效定义 */
export interface GameSound<SoundName = string> {
    name: SoundName;
    src: string;
}

/** 游戏道具（场景中的元素） */
export interface GameItem<SoundName = string> {
    /** 唯一ID */
    id: string;
    /** 图标信息 */
    icon: GameIcon<SoundName>;
    /** 状态 */
    status: ItemStatus;
    /** 位置 */
    position: Position;
    /** 是否被覆盖 */
    isCovered: boolean;
}

/** 游戏配置 */
export interface GameConfig {
    /** 游戏唯一标识 */
    id: string;
    /** 游戏名称 */
    name: string;
    /** 游戏描述 */
    description: string;
    /** 游戏图标（emoji 或 URL） */
    icon: string;
    /** 几个相同消除（羊了个羊=3，烧烤摊=2） */
    matchCount: number;
    /** 队列最大容量 */
    queueSize: number;
    /** 虚拟网格大小 */
    gridSize: number;
    /** 最大关卡数 */
    maxLevel: number;
    /** 路由路径 */
    path: string;
}

/** 主题配置 */
export interface GameTheme<SoundName = string> {
    /** 主题ID */
    id: string;
    /** 主题标题 */
    title: string;
    /** 主题描述 */
    desc?: string;
    /** 背景音乐 */
    bgm?: string;
    /** 背景图片 */
    background?: string;
    /** 背景颜色 */
    backgroundColor?: string;
    /** 背景模糊 */
    backgroundBlur?: boolean;
    /** 深色模式 */
    dark?: boolean;
    /** 纯净模式（无广告等） */
    pure?: boolean;
    /** 图标列表 */
    icons: GameIcon<SoundName>[];
    /** 音效列表 */
    sounds: GameSound<SoundName>[];
    /** 操作音效映射 */
    operateSoundMap?: {
        pop?: SoundName;
        undo?: SoundName;
        shuffle?: SoundName;
    };
}

/** 游戏状态 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'win' | 'lose';

/** 游戏完整状态 */
export interface GameState<SoundName = string> {
    /** 场景道具列表 */
    scene: GameItem<SoundName>[];
    /** 队列道具列表 */
    queue: GameItem<SoundName>[];
    /** 当前关卡 */
    level: number;
    /** 当前得分 */
    score: number;
    /** 游戏状态 */
    status: GameStatus;
    /** 已用时间（毫秒） */
    usedTime: number;
}

/** 场景生成配置 */
export interface SceneGeneratorConfig {
    /** 当前关卡 */
    level: number;
    /** 图标列表 */
    icons: GameIcon[];
    /** 消除所需数量 */
    matchCount: number;
    /** 网格大小 */
    gridSize: number;
}

/** 场景范围配置（不同关卡对应不同的网格范围） */
export interface SceneRange {
    min: number;
    max: number;
}
