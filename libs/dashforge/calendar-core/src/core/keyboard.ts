/**
 * Keyboard key resolution for calendar grids.
 *
 * Intentionally DOM-free: it maps a plain `KeyboardEvent.key` *string* to a
 * semantic action, so the headless core stays decoupled from the DOM. UI
 * skins read `event.key`, call {@link resolveCalendarKey}, and act on the
 * result.
 *
 * @module @dashforge/calendar-core/core/keyboard
 */
import type { ArrowDirection } from '../types.js';

/** A semantic action triggered by a key press inside a calendar grid. */
export type CalendarKeyAction = ArrowDirection | 'select' | 'monthForward' | 'monthBackward';

/**
 * Maps a `KeyboardEvent.key` value to a calendar action, or `null` when the
 * key is not a calendar control.
 *
 * - Arrow keys → roving focus movement.
 * - `Enter` / `Space` → `'select'`.
 * - `PageDown` / `PageUp` → `'monthForward'` / `'monthBackward'`.
 */
export function resolveCalendarKey(key: string): CalendarKeyAction | null {
  switch (key) {
    case 'ArrowUp':
      return 'up';
    case 'ArrowDown':
      return 'down';
    case 'ArrowLeft':
      return 'left';
    case 'ArrowRight':
      return 'right';
    case 'Enter':
    case ' ':
    case 'Spacebar':
      return 'select';
    case 'PageUp':
      return 'monthBackward';
    case 'PageDown':
      return 'monthForward';
    default:
      return null;
  }
}
