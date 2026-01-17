/**
 * 烧烤摊主题导出
 */

export * from './default';

import { bbqDefaultTheme } from './default';
import { GameTheme } from '../../../core/engine/types';

/** 烧烤摊所有可用主题 */
export const bbqThemes: GameTheme<string>[] = [bbqDefaultTheme];

/** 获取默认主题 */
export const getDefaultBBQTheme = () => bbqDefaultTheme;
