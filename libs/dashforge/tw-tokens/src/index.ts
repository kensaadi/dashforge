/**
 * @dashforge/tw-tokens
 *
 * Tailwind-shaped design tokens for the Dashforge TW renderer ecosystem.
 *
 * **Isolation contract**: this package is intentionally separate from
 * `@dashforge/tokens` (MUI shape). The two ecosystems share only the
 * bridge layer (`@dashforge/forms` + `@dashforge/ui-core` + `@dashforge/rbac`).
 * See `voglio-estendere-dashforge-con-shiny-parnas.md` v2 (2026-05-15).
 *
 * @module @dashforge/tw-tokens
 */
export * from './theme/index.js';

/**
 * Package version (synced with `package.json` at publish time).
 */
export const VERSION = '0.1.0-beta';
