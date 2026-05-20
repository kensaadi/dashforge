/**
 * @dashforge/calendar-core
 *
 * Headless calendar engine — the UI-agnostic logic layer behind the
 * Dashforge date / time / range picker suites. Zero runtime dependencies.
 *
 * **Isolation contract**: this is shared *logic* (hooks + pure functions),
 * never shared *UI*. The `@dashforge/ui` (MUI) and `@dashforge/tw` (Tailwind)
 * calendar suites each build their own presentation layer on top of it.
 *
 * @module @dashforge/calendar-core
 */
export * from './types.js';
export * from './core/index.js';
export * from './react/index.js';

/** Package version (synced with `package.json` at publish time). */
export const VERSION = '0.1.0-beta';
