# @dashforge/tw

**A props-driven React UI library on top of Tailwind CSS.** Every utility
that matters for the public API becomes a typed prop — `size`, `color`,
`variant`, `layout`, … — so you write components that read like a design
system and render output that's pure Tailwind. Raw `className` / `sx` /
`slotProps` stay available as escape hatches for the cases the prop
surface doesn't cover.

> **Status**: `1.0.0` — **stable release**. Public API frozen, semver
> guaranteed. 37 components shipped across forms, data display,
> navigation, feedback, layout primitives, and providers. The MUI side
> of Dashforge (`@dashforge/ui`, `@dashforge/theme-mui`,
> `@dashforge/theme-core`) is **fully isolated** from this package — the
> two ecosystems share only the bridge layer (`@dashforge/forms` +
> `@dashforge/ui-core` + `@dashforge/rbac`).

## Why Dashforge TW

- **Props, not utility soup** — component APIs that read like MUI,
  render output that's pure Tailwind. No more 40-class `<button>` tags
  copied across the codebase.
- **Dark mode built in** — CSS-variable inversion via the
  `dashforgePreset` Tailwind preset. Same JSX renders in light and dark
  without a single `dark:` variant.
- **RBAC-aware out of the box** — every interactive component takes an
  `access` prop, hidden / disabled / read-only centrally via
  `@dashforge/rbac`.
- **Bridge-integrated forms** — Form Closure v1, controlled error
  gating, StrictMode-safe registration, per-field re-render isolation
  via the shared `@dashforge/forms` engine.
- **Router-agnostic** — pass `linkComponent` to use React Router, Next,
  TanStack Router, or any other navigation primitive.
- **TypeScript-first** — typed tokens, typed variants, typed slot
  overrides, augmentable per-package.

## Component catalog

### Form components (13)

`Button` · `TextField` · `Checkbox` · `Switch` · `RadioGroup` ·
`Textarea` · `NumberField` · `OTPField` · `Autocomplete` ·
`DatePicker` · `DateRangePicker` · `TimePicker` · `DateTimePicker`

All bridge-integrated, RBAC-aware (`access` prop), Form Closure v1
error gating, StrictMode-safe.

### Navigation & shell (4)

`AppShell` · `LeftNav` · `TopBar` · `Breadcrumbs`

Router-agnostic — pass a `linkComponent` prop for SPA navigation
(React Router, Next, TanStack Router, …). Mobile-responsive shell
with drawer + body scroll lock.

### Layout primitives (8)

`Box` · `Container` · `Stack` · `Grid` · `Divider` · `AspectRatio` ·
`Typography` · `VisuallyHidden`

Polymorphic via `as` prop, dark-mode-aware, prop-driven spacing /
sizing / alignment.

### Data display (3)

`Table` · `DataGrid` · `Pagination`

Virtualized rows, sticky columns (left + right), server-side mode,
per-column filter chips, column resize / reorder / visibility,
controlled or uncontrolled state.

### Disclosure (2)

`Accordion` · `Tabs`

Radix-based, keyboard-accessible, fully styled through props.

### Overlay (3)

`Dialog` · `Popover` · `Tooltip`

Portal-rendered, focus-trapped, dismiss-on-esc + click-outside
out of the box.

### Feedback (1)

`Skeleton`

### Date (1)

`Calendar` — standalone month grid. Also powers `DatePicker` /
`DateRangePicker` / `DateTimePicker` under the hood, but exported on
its own for custom layouts.

### Providers (2)

`ConfirmDialogProvider` + `useConfirm()` · `SnackbarProvider` +
`useSnackbar()`

Imperative APIs (`await confirm({...})`, `enqueue({...})`) backed by
queues, FIFO ordering, and dedup. Built on native `<dialog>` for AAA
a11y where possible.

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

## Theme-level component defaults (Option C, since 1.2.0)

Instead of repeating `sx` / instance props on every component, pin
your DS identity once in the theme and every instance inherits it.

```tsx
import { patchTheme } from '@dashforge/tw-theme';

patchTheme({
  components: {
    // Component-level defaults — apply to every <Button> in the app
    Button: {
      defaults: { variant: 'solid', color: 'primary', size: 'md' },
    },
    Drawer: {
      defaults: { position: 'right', size: 'md', variant: 'temporary' },
    },
    // Slot-level defaults for compound components — override the visual
    // chrome without touching consumer call sites
    DataGrid: {
      slotProps: {
        header: { className: 'bg-neutral-100 font-semibold' },
        cell:   { className: 'py-3 text-sm' },
      },
    },
  },
});
```

**Precedence chain** (lowest → highest):

1. Tailwind-variants `defaultVariants` — component-level baseline
2. `theme.components.<Name>.defaults` — consumer-wide DS identity
3. Instance props — `<Button size="lg">` beats theme default
4. `sx` prop — merged last via `tailwind-merge`

Same 4-level chain applies to `slotProps` (theme slotProps → instance
slotProps). Backward-compat: consumers who don't set `theme.components`
get behavior identical to 1.1.x.

Full guide + per-component playgrounds:
[`/tw/docs/theme-system/component-defaults`](https://dashforge-docs-lab.pages.dev/tw/docs/theme-system/component-defaults).

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

### 2. Dark mode looks broken — surface ladder mismatch

**Symptom.** You call `setMode('dark')` (or `toggleMode()`) from
`@dashforge/tw-theme`, the `data-dash-tw-theme="dark"` attribute flips
on `<html>`, but the form looks washed-out — labels are barely visible
on the card, or the card itself stays bright white while everything
around it goes dark.

**Root cause.** This is a **page-level setup problem**, not a library
bug. All `@dashforge/tw` components use neutral-scale tokens
(`bg-neutral-50` for input surfaces, `text-neutral-900` for text)
which the `@dashforge/tw-tokens` dark theme inverts automatically
(`neutral-50` ↔ `neutral-950`, `neutral-100` ↔ `neutral-900`, etc.).
The library is fully dark-aware out of the box.

What goes wrong: the host page (or card container) uses literal
classes like `bg-white` or `text-black` that **don't** invert. The
ladder then breaks — components swap but the surrounding container
doesn't.

**Fix — use a 3-level elevation ladder of inverting neutral tokens
for page, card, and inputs.** All `bg-neutral-*` classes invert
automatically through the dashforge preset, so the same JSX produces
a coherent light AND dark layout without any `dark:` variant:

```tsx
<DashforgeTailwindProvider>
  {/* page = neutral-200  → #e5e5e5 light  /  #262626 dark */}
  <main className="min-h-screen bg-neutral-200 p-8">
    {/* card = neutral-100 → #f5f5f5 light  /  #171717 dark */}
    <div className="rounded-lg bg-neutral-100 p-8 shadow-md border border-neutral-200">
      {/* inputs = neutral-50 (built into the component variants)
          → #fafafa light  /  #0a0a0a dark */}
      <TextField name="email" label="Email" />
      <Checkbox name="terms" label="Accept" />
    </div>
  </main>
</DashforgeTailwindProvider>
```

The same JSX renders correctly in light AND dark mode. In light the
ladder goes outer-grayer → inner-brighter (standard elevation, "higher
surface = brighter"). In dark the ladder inverts to outer-lighter →
inner-darker ("inset feel"), which is the macOS Big Sur / modern dark-UI
convention.

**Anti-pattern to AVOID**: do NOT mix literal `bg-white` / `text-black`
into the elevation ladder, and do NOT use Tailwind's `dark:` variant
in your page — the dashforge preset handles dark mode through CSS
variable inversion, not through the standard Tailwind dark selector.
Adding `dark:bg-neutral-900` actually picks the WRONG end of the
inversion in dark mode (`neutral-900` inverts to `neutral-100` =
light grey) and breaks the layout.

**Alternative override (advanced):** if you need a specific input
on a non-standard surface, use `slotProps` to override that single
slot:

```tsx
<TextField
  name="email"
  slotProps={{ inputWrapper: { className: 'bg-neutral-100' } }}
/>
```

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
