import type { TWTheme } from '@dashforge/tw-tokens';
import { twThemeCssVars } from './cssVars.js';

/**
 * Render an inline `<style>` block that primes the document with the
 * theme's CSS variables before React mounts. Use in SSR (Next.js,
 * Remix, Astro) to prevent a flash of un-themed content (FOUC) on
 * initial paint.
 *
 * The emitted CSS scopes the variables under
 * `:root[data-dash-tw-theme="<mode>"]`. Pair this with setting the
 * matching attribute on `<html>` in your server output, so the
 * variables resolve immediately while the client-side
 * `DashforgeTailwindProvider` performs its first effect.
 *
 * Once `DashforgeTailwindProvider` mounts on the client, it injects
 * the same vars inline on `document.documentElement.style` — those
 * overrides have higher specificity than the SSR `<style>` block, so
 * a runtime `setMode('dark')` / `patchTheme` correctly takes effect
 * without conflicting with the initial server-rendered values.
 *
 * @example Next.js `app/layout.tsx`
 * ```tsx
 * import {
 *   serverSideStyleTag,
 *   defaultTWThemeLight,
 * } from '@dashforge/tw-theme';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="en" data-dash-tw-theme="light">
 *       <head
 *         dangerouslySetInnerHTML={{
 *           __html: serverSideStyleTag(defaultTWThemeLight),
 *         }}
 *       />
 *       <body>
 *         <DashforgeTailwindProvider>{children}</DashforgeTailwindProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * @param theme - The theme whose CSS variable values should prime the document.
 * @returns A complete `<style id="dashforge-tw-init">...</style>` HTML string.
 */
export function serverSideStyleTag(theme: TWTheme): string {
  const vars = twThemeCssVars(theme);
  const decls = Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(';');
  return `<style id="dashforge-tw-init">:root[data-dash-tw-theme="${theme.meta.mode}"]{${decls}}</style>`;
}
