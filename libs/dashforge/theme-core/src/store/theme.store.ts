import { proxy } from 'valtio';
import type { DashforgeTheme } from '@dashforge/tokens';
import { defaultLightTheme } from '@dashforge/tokens';

/**
 * Internal theme store (NOT exported publicly)
 */
const internalThemeStore = proxy<DashforgeTheme>({
  ...defaultLightTheme,
});

export { internalThemeStore as themeStore };
