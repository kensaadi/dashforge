# Dashforge

[![CI](https://img.shields.io/github/actions/workflow/status/kensaadi/dashforge/ci.yml?branch=main&logo=github&label=CI)](https://github.com/kensaadi/dashforge/actions/workflows/ci.yml)
[![@dashforge/ui](https://img.shields.io/npm/v/@dashforge/ui?label=%40dashforge%2Fui&color=cb3837&logo=npm)](https://www.npmjs.com/package/@dashforge/ui)
[![@dashforge/tw](https://img.shields.io/npm/v/@dashforge/tw?label=%40dashforge%2Ftw&color=cb3837&logo=npm)](https://www.npmjs.com/package/@dashforge/tw)
[![License](https://img.shields.io/github/license/kensaadi/dashforge?color=blue)](./LICENSE)
[![Stars](https://img.shields.io/github/stars/kensaadi/dashforge?style=flat&logo=github&color=ffcc00)](https://github.com/kensaadi/dashforge/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/kensaadi/dashforge?logo=github)](https://github.com/kensaadi/dashforge/commits/main)

A composable React framework for **data-driven applications**. Two UI
editions — Material UI and Tailwind — share a single type-safe form
bridge, an RBAC engine, and a reactive theming system. Write your form
schema and access rules once, render them with either visual stack.

> 📚 **[Documentation](https://dashforge-ui.com)**
> · 🚀 **[Starter Kits](https://dashforge-ui.com/starter-kits)**
> · 📝 **[Changelog](./CHANGELOG.md)**
> · 🔄 **[Migration](./MIGRATION.md)**

---

## Why Dashforge

Building admin panels, dashboards and internal tools in React typically
means writing the same `<Controller>` wrapper, the same RBAC
hide/disable/readonly logic, the same dynamic-field engine, and the
same theme plumbing — in every project. Dashforge is the layer that
codifies those patterns, so you stop rewriting them.

- **Form bridge over `react-hook-form`** — `DashForm` + per-field
  subscriptions. Fewer re-renders than plain RHF, zero `<Controller>`
  boilerplate at call sites.
- **RBAC built in** — every field accepts an `access` prop with
  `hide` / `disable` / `readonly` semantics evaluated against the
  current subject + policy.
- **Reactions & dependent fields** — declarative `watch` → `run` rules
  with async-safe stale-response guards.
- **Reactive theming** — Valtio-powered store, mode swap (light/dark),
  cross-tab sync. No CSS rebuild on theme change.
- **Two skins, one contract** — pick MUI v9 or Tailwind; the bridge
  layer is identical on both. Swap (or run both) without rewriting
  business logic.

## Pick your edition

| You want… | Use | Why |
|---|---|---|
| MUI v9 + Emotion as the design system | **`@dashforge/ui`** | Thin layer over `@mui/material`; for Table / DataGrid / Dialog / Tooltip / Popover use MUI X and `@mui/material` directly |
| Tailwind CSS as the design system | **`@dashforge/tw`** | Self-contained component library (37 components incl. Table, DataGrid, Pagination, Dialog, Tooltip, Popover, Accordion, Foundation primitives) — no MUI dependency |
| Just the form bridge | **`@dashforge/forms`** + **`@dashforge/rbac`** | Visual-stack agnostic; bring your own components and use the bridge hooks |

The two editions are **fully isolated** at the visual layer. They
share only the bridge (`@dashforge/forms`, `@dashforge/rbac`, theming
core, `@dashforge/calendar-core`). A form schema written for MUI runs
unchanged on Tailwind and vice versa.

## Quick start — MUI edition

```bash
npm install @dashforge/ui @dashforge/forms @dashforge/rbac \
            @dashforge/theme-mui \
            @mui/material @emotion/react @emotion/styled react-hook-form
```

The bridge core (`@dashforge/tokens`, `@dashforge/theme-core`,
`@dashforge/ui-core`, `@dashforge/calendar-core`) is pulled in
transitively.

```tsx
import { DashForm } from '@dashforge/forms';
import { TextField, Select, Button } from '@dashforge/ui';

export function SignupForm() {
  return (
    <DashForm
      defaultValues={{ email: '', plan: 'free' }}
      onSubmit={(data) => console.log(data)}
    >
      <TextField
        name="email"
        label="Email"
        rules={{ required: 'Email is required' }}
      />
      <Select
        name="plan"
        label="Plan"
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
        ]}
      />
      <Button type="submit" variant="contained">Sign up</Button>
    </DashForm>
  );
}
```

## Quick start — Tailwind edition

```bash
npm install @dashforge/tw @dashforge/tw-theme \
            @dashforge/forms @dashforge/rbac tailwindcss
```

`@dashforge/tw-tokens` and `@dashforge/calendar-core` are pulled in
transitively.

```ts
// tailwind.config.ts
import { dashforgePreset } from '@dashforge/tw-theme';
export default {
  presets: [dashforgePreset()],
  content: ['./src/**/*.{ts,tsx}'],
};
```

```tsx
import { DashforgeTailwindProvider } from '@dashforge/tw-theme';
import { DashForm } from '@dashforge/forms';
import { TextField, Select, Button } from '@dashforge/tw';

export function App() {
  return (
    <DashforgeTailwindProvider>
      <DashForm
        defaultValues={{ email: '', plan: 'free' }}
        onSubmit={(data) => console.log(data)}
      >
        <TextField
          name="email"
          label="Email"
          rules={{ required: 'Email is required' }}
        />
        <Select
          name="plan"
          label="Plan"
          options={[
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
          ]}
        />
        <Button type="submit" variant="solid">Sign up</Button>
      </DashForm>
    </DashforgeTailwindProvider>
  );
}
```

The form schema (`name`, `rules`, RBAC `access`, `visibleWhen`,
reactions) is byte-identical across both editions.

## Architecture

```
                ┌─────────────────────────────────────────────┐
                │             Your application                │
                └─────────────────────────────────────────────┘
                       │                              │
                       ▼                              ▼
              ┌─────────────────┐           ┌─────────────────┐
              │  @dashforge/ui  │           │  @dashforge/tw  │
              │   (MUI skin)    │           │ (Tailwind skin) │
              └────────┬────────┘           └────────┬────────┘
                       │                             │
                       └──────────────┬──────────────┘
                                      │
                                      ▼
              ┌──────────────────────────────────────────┐
              │             Shared bridge layer          │
              │  forms · rbac · ui-core · calendar-core  │
              │  tokens · theme-core · theme-mui ·       │
              │  tw-tokens · tw-theme                    │
              └──────────────────────────────────────────┘
```

The bridge layer is the **portability contract**. Components on either
edition consume it through the same `useDashFieldMeta` /
`useDashRegister` / `useRbac` hooks — guaranteeing identical behavior
across visual stacks.

## Packages

Eleven publishable packages, two visual editions, one shared core.

### MUI edition

| Package | Description |
|---|---|
| [`@dashforge/ui`](./libs/dashforge/ui) | Component library on MUI v9 — TextField, Select, Autocomplete, Calendar, Tabs, AppShell, and more |
| [`@dashforge/theme-mui`](./libs/dashforge/theme-mui) | MUI theme adapter — bridges Dashforge tokens to MUI's theming system |

### Tailwind edition

| Package | Description |
|---|---|
| [`@dashforge/tw`](./libs/dashforge/tw) | Component library on Tailwind — 37 components including Table, DataGrid, Pagination, Dialog, Tooltip, Popover, Accordion + Foundation primitives |
| [`@dashforge/tw-theme`](./libs/dashforge/tw-theme) | Tailwind preset + reactive provider — `dashforgePreset()`, CSS-var runtime, mode switching |
| [`@dashforge/tw-tokens`](./libs/dashforge/tw-tokens) | Design tokens for the Tailwind edition |

### Shared bridge

| Package | Description |
|---|---|
| [`@dashforge/forms`](./libs/dashforge/forms) | Type-safe form bridge on `react-hook-form` — `DashForm`, per-field subscriptions, reactions, field arrays |
| [`@dashforge/rbac`](./libs/dashforge/rbac) | Role-based access control engine — policies, subjects, `<Can>`, `useRbac`, per-field `access` prop |
| [`@dashforge/ui-core`](./libs/dashforge/ui-core) | Headless utilities — engine, dependency tracker, rule evaluator, store helpers |
| [`@dashforge/calendar-core`](./libs/dashforge/calendar-core) | Headless calendar / date-range engine shared by both editions' date pickers |
| [`@dashforge/theme-core`](./libs/dashforge/theme-core) | Reactive theming store (Valtio) — mode swap, cross-tab sync |
| [`@dashforge/tokens`](./libs/dashforge/tokens) | Design tokens for the MUI edition |

## What you get

### Form layer

- `DashForm` with per-field subscriptions (fewer renders than plain RHF)
- Async-safe reactions with stale-response guards (`isLatest()`)
- Runtime field data — populate `Select` / `Autocomplete` options from
  reaction output without bridge ceremony
- `useDashFieldArray` for dynamic lists with stable keys
- Form Closure v1 error gating (errors show on `touched || submitCount > 0`)
- Schema-agnostic: works with any resolver (`zod`, `yup`, `joi`, custom)

### Access control

- Declarative policies with `Subject`, `Resource`, `Action`, `Effect`
- Per-field `access` prop with `hide` / `disable` / `readonly` semantics
- Group + option-level access on `RadioGroup`
- `<Can>` and `useCan()` for arbitrary gated regions
- Pluggable condition evaluators

### Components

- **MUI** (`@dashforge/ui`): 23 components — text fields, selects,
  autocompletes, switches, radio groups, calendar, date / time / range
  pickers, OTP field, tabs, AppShell, top bar, breadcrumbs, snackbar,
  confirm dialog, left nav, more
- **Tailwind** (`@dashforge/tw`): 37 components — everything above plus
  Table, DataGrid, Pagination, Skeleton, Dialog, Tooltip, Popover,
  Accordion, and Foundation primitives (Box, Stack, Grid, Container,
  Divider, AspectRatio, Typography, VisuallyHidden)

### Theming

- Token-driven design system — colors, typography, spacing, radii
- CSS-var runtime — theme changes do not retrigger Tailwind builds
- Light / dark mode swap + cross-tab synchronisation
- Per-tenant theming via single-token overrides

## Documentation

- **Live docs site**: <https://dashforge-ui.com> — pages for every
  component with inline live previews and "Open in StackBlitz" sandboxes
- **Starter kits**: <https://dashforge-ui.com/starter-kits>
- **Per-package READMEs**: `libs/dashforge/<pkg>/README.md`
- **Per-package CHANGELOGs**: `libs/dashforge/<pkg>/CHANGELOG.md`
- **Migration guide**: [`MIGRATION.md`](./MIGRATION.md)

## Requirements

- **Node** ≥ 22
- **React** 18 or 19
- **MUI edition**: `@mui/material@^9.0.0` + `@emotion/react` +
  `@emotion/styled`
- **Tailwind edition**: `tailwindcss ≥ 3.4.1`

## Status

Dashforge is at **`1.0.0`** — production-ready, public API stable
under semver. Breaking changes require a major bump.

Each package versions independently post-`1.0.0`. Cross-package
compatibility is governed by the peer-dependency ranges declared in
each `package.json`.

## Contributing

The codebase is an [Nx](https://nx.dev/) monorepo using pnpm
workspaces. Common workflows:

```bash
pnpm install                                       # install workspace deps
pnpm exec nx run-many -t lint typecheck test build # the full gate
pnpm exec nx run @dashforge/<pkg>:test             # single package tests
```

Contributions are welcome — please align with the existing architecture,
type-safety conventions, and the testing patterns documented in each
package.

## License

[MIT](./LICENSE) — © 2026 Dashforge contributors.
