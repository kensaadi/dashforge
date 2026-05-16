# @dashforge/tw-theme

> ⚠ **Status**: scaffolding — `private: true`, not yet published to npm.
> Available locally via `pnpm pack` / `pnpm link` while the
> `@dashforge/tw-*` ecosystem stabilises in F2/F3 of the *dashforge-tw*
> roadmap. The MUI side of Dashforge (`@dashforge/ui`,
> `@dashforge/theme-mui`, `@dashforge/theme-core`) is **fully isolated**
> from this package — the two ecosystems share only the bridge layer
> (`@dashforge/forms` + `@dashforge/ui-core` + `@dashforge/rbac`).

Theme adapter + runtime provider for the Dashforge **Tailwind**
renderer. Consumes [`@dashforge/tw-tokens`](../tw-tokens) token shapes;
emits a Tailwind preset whose token values resolve to CSS variables and
a React provider that injects those variables on `<html>` for
**runtime theme swap without rebuilding Tailwind**.

---

## Public API surface (F2)

| Symbol | Purpose |
|---|---|
| `dashforgePreset(theme?)` | Tailwind preset factory (build-time). Spread into your `tailwind.config.ts` `presets: []`. |
| `<DashforgeTailwindProvider>` | React provider that injects CSS vars + the `data-dash-tw-theme` attribute on `<html>` reactively. |
| `useDashTWTheme()` | Reactive hook → `DeepReadonly<TWTheme>` snapshot of the active theme. |
| `setMode(mode)` | Imperative: switch between the two shipped defaults. |
| `toggleMode()` | Imperative: flip the active mode. |
| `setTheme(theme)` | Imperative: replace the active theme. |
| `replaceTheme(theme)` | Alias of `setTheme`. |
| `patchTheme(deepPartial)` | Imperative: deep-merge a partial onto the active theme (brand override at runtime). |
| `serverSideStyleTag(theme)` | SSR helper — renders an inline `<style>` block for the initial paint. Prevents FOUC. |
| `twThemeCssVars(theme)` | Lower-level pure builder — `TWTheme → Record<varName, value>`. |
| `hexToRgbTriplet(hex)` | Lower-level helper — `'#3b82f6'` → `'59 130 246'` (Tailwind `<alpha-value>` format). |

All types are re-exported from `@dashforge/tw-tokens` for convenience
(`TWTheme`, `TWThemeMeta`, `TWColorScale`, `TWColorTokens`,
`TWSpacingScale`, `TWRadiusTokens`, `TWFontSizeTokens`).

---

## Quick start

### 1. Tailwind config (build-time)

```ts
// tailwind.config.ts
import { dashforgePreset } from '@dashforge/tw-theme';

export default {
  presets: [dashforgePreset()],
  content: [
    './src/**/*.{ts,tsx}',
    // Critical: include the package's dist so Tailwind sees the
    // classes referenced by future @dashforge/tw components.
    './node_modules/@dashforge/tw/dist/**/*.js',
  ],
};
```

The preset emits color references as
`rgb(var(--df-tw-color-{role}-{tone}) / <alpha-value>)` so all
modifier syntax (`bg-primary-500/50`, `text-danger-700/30`) keeps
working. Spacing / radius / fontSize tokens map to
`var(--df-tw-spacing-{key})` etc.

### 2. App shell

```tsx
import { DashforgeTailwindProvider } from '@dashforge/tw-theme';

export default function App({ children }) {
  return <DashforgeTailwindProvider>{children}</DashforgeTailwindProvider>;
}
```

On mount, the provider reads the initial mode via the priority cascade
(`localStorage` → `matchMedia('(prefers-color-scheme: dark)')` →
`'light'`), injects the matching CSS vars on `document.documentElement`,
and sets `data-dash-tw-theme="{light|dark}"`.

### 3. Toggle mode programmatically

```tsx
import { setMode, toggleMode } from '@dashforge/tw-theme';

<button onClick={toggleMode}>Toggle theme</button>
<button onClick={() => setMode('dark')}>Force dark</button>
```

Both functions mutate the shared store; **every** consumer of
`useDashTWTheme()` re-renders, the provider re-injects the new CSS
vars on `<html>`, and Tailwind's `data-dash-tw-theme="dark"` selector
flips. No page reload. The new mode is persisted to localStorage and
synced across tabs via the `storage` event.

> 📘 **Surface contract note.** Components from
> [`@dashforge/tw`](../tw/README.md) use `bg-white` as the *elevated
> surface* for inputs/checkboxes — a deliberate "white card on dark
> canvas" choice à la Material elevation. If you expect the input
> background to track the dark mode automatically and find it stays
> white, you're hitting the documented surface contract, not a bug.
> See *Common consumer pitfalls → Dark mode "doesn't work" visually*
> in the [`@dashforge/tw` README](../tw/README.md#2-dark-mode-doesnt-work-visually)
> for the three resolution strategies (elevation-style, full-dark
> override, project surface token).

### 4. Runtime brand override (no Tailwind rebuild)

```tsx
import { patchTheme } from '@dashforge/tw-theme';

patchTheme({
  color: {
    primary: {
      '500': '#9333ea',  // purple
      '600': '#7e22ce',
    },
  },
});
```

Deep-merged onto the active theme: sibling shades are preserved. The
provider re-injects the new CSS-var values; every component using
`bg-primary-500` etc. picks up the change immediately.

### 5. SSR (Next.js, Remix, Astro)

```tsx
// app/layout.tsx (Next.js)
import {
  DashforgeTailwindProvider,
  serverSideStyleTag,
  defaultTWThemeLight,
} from '@dashforge/tw-theme';

export default function RootLayout({ children }) {
  // Decide the initial mode server-side (cookie, header, etc.)
  const theme = defaultTWThemeLight;

  return (
    <html lang="en" data-dash-tw-theme={theme.meta.mode}>
      <head
        dangerouslySetInnerHTML={{ __html: serverSideStyleTag(theme) }}
      />
      <body>
        <DashforgeTailwindProvider initialMode={theme.meta.mode}>
          {children}
        </DashforgeTailwindProvider>
      </body>
    </html>
  );
}
```

The inline `<style>` block primes the CSS variables on `:root` for the
initial paint — no FOUC. The client provider then takes over and
mirrors any subsequent theme mutations on
`document.documentElement.style`, which has higher specificity than
the static block.

---

## Component-side access

Most components should use Tailwind classes (`bg-primary-500`,
`text-neutral-950`) and let the CSS vars do the work. For the rare
case where a component needs a raw token value at render time:

```tsx
import { useDashTWTheme } from '@dashforge/tw-theme';

function Sparkline() {
  const theme = useDashTWTheme();
  return <svg stroke={theme.color.primary['500']} />;
}
```

The hook's return type is `DeepReadonly<TWTheme>` — the snapshot is
frozen, and the public type **does not leak** `Snapshot<T>` from
`valtio`. Consumers never need to install or import Valtio.

---

## Isolation contract

This package shares **nothing** with the MUI side of Dashforge except
the bridge layer:

| Concern | TW side | MUI side |
|---|---|---|
| Tokens | `@dashforge/tw-tokens` | `@dashforge/tokens` |
| Theme runtime | `@dashforge/tw-theme` | `@dashforge/theme-core` |
| Components | `@dashforge/tw` | `@dashforge/ui` |
| localStorage key | `dashforge:tw-theme:mode` | `dashforge:theme:mode` |
| CSS var prefix | `--df-tw-*` | `--df-*` (future) |
| Dark-mode attribute | `data-dash-tw-theme` | (separate runtime) |

The two ecosystems can coexist in the same app — they will not collide
on storage, CSS variable scope, or attribute selectors.

---

## Building + testing

```bash
nx build @dashforge/tw-theme   # rollup CJS + ESM + .d.ts
nx test @dashforge/tw-theme    # vitest, jsdom-where-needed
nx typecheck @dashforge/tw-theme
```
