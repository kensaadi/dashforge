# @dashforge/tw

> ⚠ **Status**: scaffolding — `private: true`, not yet published to npm.
> Available locally via `pnpm pack` / `pnpm link` while the
> `@dashforge/tw-*` ecosystem stabilises (sprint *dashforge-tw* F3–F8).
> The MUI side of Dashforge (`@dashforge/ui`, `@dashforge/theme-mui`,
> `@dashforge/theme-core`) is **fully isolated** from this package — the
> two ecosystems share only the bridge layer (`@dashforge/forms` +
> `@dashforge/ui-core` + `@dashforge/rbac`).

Tailwind-rendered UI components for the Dashforge ecosystem.

Components are **props-driven** (every Tailwind utility that matters
for the public API becomes a typed prop — `size`, `color`, `variant`,
`layout`, …). Raw `className` / `sx` / `slotProps` exist as escape
hatches for the cases the prop surface doesn't cover.

## Quick start

Install the three TW packages alongside the shared bridge layer:

```bash
pnpm add @dashforge/tw @dashforge/tw-theme @dashforge/tw-tokens \
        @dashforge/forms @dashforge/ui-core @dashforge/rbac \
        react react-dom tailwindcss
```

Wire the Tailwind preset + theme provider as described in
[`@dashforge/tw-theme`](../tw-theme/README.md), then mount components
inside a `DashFormProvider`:

```tsx
import { DashForm } from '@dashforge/forms';
import { Button, TextField, Checkbox, Switch } from '@dashforge/tw';

export function SignUp() {
  return (
    <DashForm defaultValues={{ email: '', terms: false, newsletter: true }}>
      <TextField
        name="email"
        label="Email"
        type="email"
        rules={{ required: 'Email is required' }}
        required
        fullWidth
      />
      <Checkbox name="terms" label="I accept the Terms & Conditions" />
      <Switch name="newsletter" label="Subscribe to the newsletter" />
      <Button type="submit" variant="solid" color="primary">Sign up</Button>
    </DashForm>
  );
}
```

## F3 surface (tier-1)

| Component | Bridge integration | Notes |
|---|---|---|
| `<Button>` | RBAC-only (action, no form state) | `variant` × `color` × `size`, `loading`, `fullWidth`, `asChild` (Radix Slot polymorphism). |
| `<TextField>` | Full form bridge | 7-slot TV recipe (root/label/requiredMark/inputWrapper/input/helperText/errorText). Layouts: `stacked` (default), `inline`. Floating label deferred. |
| `<Checkbox>` | Full form bridge | Radix `Checkbox.Root` + `Indicator`. Inline `<CheckIcon>` SVG, no icon dep. |
| `<Switch>` | Full form bridge | Radix `Switch.Root` + `Thumb`, translate-x animated. |

All four components mirror the MUI-side semantics at the bridge level:
same `name` / `rules` / `visibleWhen` / `access` props, same StrictMode-
safe unregister pattern, same per-field re-render isolation via
`useDashFieldMeta`.

## Override system

```tsx
<TextField
  name="email"
  label="Email"
  // root override (raw classes — last wins via tailwind-merge)
  sx="md:w-1/2"
  // per-slot override (typed)
  slotProps={{
    input: { className: 'font-mono tracking-wide' },
    label: { className: 'uppercase text-secondary-700' },
  }}
/>
```

`sx` is a `className` shortcut for the root slot (string or
`ClassValue` accepted by `clsx`). `slotProps` is the canonical
per-slot override path. Both go through the package's `cn()` (wraps
`clsx` + `tailwind-merge`) so override classes reliably beat the
variant defaults regardless of stylesheet order.

---

## Common consumer pitfalls

The following are **not library bugs** — they're use-time issues that
emerge from how the host application is set up. Documented here so you
can avoid them or recognise the symptom quickly.

### 1. Labels / helper text appear centered

**Symptom.** Form labels and the `helperText` / `errorText` lines of
`<TextField>`, `<Checkbox>`, `<Switch>` render center-aligned, even
though the variants emit no `text-center` class.

**Root cause.** A parent element (typically `#root`, often a residue
of the Vite React template — `text-align: center` is set in the
default `src/index.css`) imposes a global text-align, and the
component's `<label>` / `<p>` inherit it because the variants do not
declare an explicit `text-align: left`.

**Fix.** In your application's global stylesheet, remove or scope down
the inherited centering:

```css
/* Before — Vite React template default */
#root {
  text-align: center;   /* leaks into every form component below */
}

/* After — restrict centering to the placeholder hero only */
#root {
  /* nothing here */
}
.hero-section {
  text-align: center;
}
```

The library does **not** add `text-left` defensively to its variants:
this is a deliberate choice — components inherit normal text-align,
which is what a neutral parent provides.

### 2. Dark mode "doesn't work" visually

**Symptom.** You call `setMode('dark')` (or `toggleMode()`) from
`@dashforge/tw-theme`, the `data-dash-tw-theme="dark"` attribute flips
on `<html>`, but the form looks broken — inputs and checkboxes remain
on white surfaces while the text turns light, causing low/no contrast.

**Root cause.** TW components use `bg-white` (a Tailwind built-in
literal, NOT a CSS variable) as the surface for inputs and checkbox
controls. This is **intentional**: white is the "elevated surface"
contract — the assumption is that elevated surfaces stand out against
the page background even in dark mode (the same convention you find in
Material Design's elevation system).

When your host page also uses `bg-white` for its content cards, the
components blend into the card and there's no visible "dark mode
swap" because the surface stack stays light end-to-end.

**Fix.** Pick one of three strategies depending on what your design
language wants:

1. **Elevation-style dark mode** (recommended for app dashboards):
   keep `bg-white` on components, set your *page* background to
   `bg-neutral-50`. The `neutral` scale **inverts automatically**
   in `defaultTWThemeDark` (`neutral-50` ↔ `neutral-950`), so the
   SAME class resolves to a light surface in light mode and a dark
   surface in dark mode — no `dark:` variant or manual swap needed.
   Inputs stay as visible white cards on a dark canvas.

   ```tsx
   <DashforgeTailwindProvider>
     <main className="min-h-screen bg-neutral-50">
       {/* page bg: #fafafa in light, #0a0a0a in dark — automatic */}
       <Card className="bg-white">{/* form here */}</Card>
     </main>
   </DashforgeTailwindProvider>
   ```

   ⚠ **Known limitation of this strategy**: form labels and
   helperText use `text-neutral-900` which ALSO inverts (becomes a
   light shade in dark mode). On a literal-white card the label
   contrast drops. For a fully dark-friendly form on a white card,
   move to strategy 2 or 3.

2. **Fully-dark surfaces** (recommended for content-heavy sites):
   override each component's input surface via `slotProps`:

   ```tsx
   <TextField
     name="email"
     slotProps={{
       inputWrapper: { className: 'dark:bg-neutral-900 dark:border-neutral-700' },
     }}
   />
   ```

3. **Introduce a project-wide surface token** (recommended if you
   build many forms): extend the Tailwind preset with a custom
   `surface` color whose CSS variable changes between modes, then
   set a single `data-app-surface` class your components use. This is
   an application-level decision; the library doesn't ship a
   `surface.input` token (yet — under discussion for a post-1.0
   release).

---

## Building + testing

```bash
nx build @dashforge/tw      # rollup ESM + d.ts
nx test @dashforge/tw       # vitest
nx typecheck @dashforge/tw  # tsc --noEmit on tsconfig.lib.json
```

See the workspace root README for monorepo-wide commands.

## See also

- [`@dashforge/tw-theme`](../tw-theme/README.md) — Tailwind preset +
  reactive theme provider + SSR helper.
- [`@dashforge/tw-tokens`](../tw-tokens/README.md) — token type
  contracts + default light / dark themes.
- [`@dashforge/forms`](../forms/README.md) — form bridge consumed by
  both ecosystems (MUI + TW).
