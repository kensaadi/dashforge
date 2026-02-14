import { useSnapshot } from 'valtio';
import { themeStore } from '../store/theme.store';

/**
 * Reactive hook for Dashforge theme
 */
export function useDashTheme() {
  return useSnapshot(themeStore);
}
