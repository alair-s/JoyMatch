/**
 * 羊了个羊主题导出
 */

export * from './default';

import { defaultTheme } from './default';
import { GameTheme } from '../../../core/engine/types';

/** 羊了个羊所有可用主题 */
export const sheepThemes: GameTheme<string>[] = [defaultTheme];

/** 获取默认主题 */
export const getDefaultSheepTheme = () => defaultTheme;
