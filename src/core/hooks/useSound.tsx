/**
 * 游戏音效管理 Hook
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { GameSound } from '../engine/types';

interface UseSoundOptions<T extends string> {
    /** 音效列表 */
    sounds: GameSound<T>[];
    /** BGM 地址 */
    bgm?: string;
    /** BGM 音量（0-1） */
    bgmVolume?: number;
}

interface UseSoundReturn<T extends string> {
    /** 播放音效 */
    play: (soundName: T) => void;
    /** 播放 BGM */
    playBgm: () => void;
    /** 暂停 BGM */
    pauseBgm: () => void;
    /** 切换 BGM */
    toggleBgm: () => void;
    /** BGM 是否播放中 */
    isBgmPlaying: boolean;
    /** BGM 音频元素引用 */
    bgmRef: React.RefObject<HTMLAudioElement | null>;
    /** 渲染音效元素 */
    renderSoundElements: () => React.ReactNode;
}

export function useSound<T extends string>(
    options: UseSoundOptions<T>
): UseSoundReturn<T> {
    const { sounds, bgm, bgmVolume = 0.5 } = options;

    const soundRefMap = useRef<Record<string, HTMLAudioElement>>({});
    const bgmRef = useRef<HTMLAudioElement>(null);
    const [isBgmPlaying, setIsBgmPlaying] = useState(false);

    // 播放音效
    const play = useCallback((soundName: T) => {
        const audio = soundRefMap.current[soundName];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
                // 忽略自动播放限制错误
            });
        }
    }, []);

    // 播放 BGM
    const playBgm = useCallback(() => {
        if (bgmRef.current) {
            bgmRef.current.volume = bgmVolume;
            bgmRef.current.play().catch(() => {
                // 忽略自动播放限制错误
            });
            setIsBgmPlaying(true);
        }
    }, [bgmVolume]);

    // 暂停 BGM
    const pauseBgm = useCallback(() => {
        if (bgmRef.current) {
            bgmRef.current.pause();
            setIsBgmPlaying(false);
        }
    }, []);

    // 切换 BGM
    const toggleBgm = useCallback(() => {
        if (isBgmPlaying) {
            pauseBgm();
        } else {
            playBgm();
        }
    }, [isBgmPlaying, playBgm, pauseBgm]);

    // 同步 BGM 状态
    useEffect(() => {
        if (!bgmRef.current) return;

        if (isBgmPlaying) {
            bgmRef.current.volume = bgmVolume;
            bgmRef.current.play().catch(() => {});
        } else {
            bgmRef.current.pause();
        }
    }, [isBgmPlaying, bgmVolume]);

    // 渲染音效元素
    const renderSoundElements = useCallback(() => {
        return (
            <>
                {/* BGM */}
                {bgm && <audio ref={bgmRef} loop src={bgm} />}
                {/* 音效 */}
                {sounds.map((sound) => (
                    <audio
                        key={sound.name}
                        ref={(ref) => {
                            if (ref) soundRefMap.current[sound.name] = ref;
                        }}
                        src={sound.src}
                    />
                ))}
            </>
        );
    }, [bgm, sounds]);

    return {
        play,
        playBgm,
        pauseBgm,
        toggleBgm,
        isBgmPlaying,
        bgmRef,
        renderSoundElements,
    };
}
