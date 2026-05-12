# Dashforge

[![GitHub stars](https://img.shields.io/github/stars/kensaadi/dashforge?style=flat&logo=github&color=ffcc00)](https://github.com/kensaadi/dashforge/stargazers)
[![npm version (@dashforge/ui)](https://img.shields.io/npm/v/@dashforge/ui?label=%40dashforge%2Fui&color=cb3837&logo=npm)](https://www.npmjs.com/package/@dashforge/ui)
[![npm downloads](https://img.shields.io/npm/dw/@dashforge/ui?label=downloads&color=brightgreen&logo=npm)](https://www.npmjs.com/package/@dashforge/ui)
[![License](https://img.shields.io/github/license/kensaadi/dashforge?color=blue)](./LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/kensaadi/dashforge?logo=github)](https://github.com/kensaadi/dashforge/commits/main)
[![Issues](https://img.shields.io/github/issues/kensaadi/dashforge?logo=github)](https://github.com/kensaadi/dashforge/issues)

A composable UI framework for building data-driven React applications with type-safe forms, dynamic theming, and built-in access control.

> 📚 **[Documentation](https://dashforge-ui.com)** · 🛒 **[Starter Kits](https://dashforge-ui.com/starter-kits)** · 📝 **[Changelog](./CHANGELOG.md)** · 🗺️ **[Roadmap to 1.0](./ROADMAP-1.0.md)**

## What is Dashforge

Dashforge is a modular UI framework built on Material-UI that provides a foundation for building data-driven applications. It combines design tokens, reactive theming, form orchestration, and access control into a cohesive system.

Dashforge is designed for teams building complex admin and dashboard interfaces, where form logic, theming, and access control must work together without creating fragile coupling or unnecessary abstraction layers.

The framework is built around three core principles:

- **Composability**: Independent packages that work together without tight coupling
- **Type Safety**: Full TypeScript support with strict contracts at every boundary
- **Control**: Direct access to underlying primitives without excessive abstractions

This makes Dashforge particularly suited for admin panels, dashboards, and internal tools where form handling, theming, and permissions are critical requirements.

## Monorepo Structure

This repository is an Nx monorepo containing all Dashforge packages and internal tooling.

**Key directories:**

- `libs/dashforge/*` - All publishable npm packages
- `docs/` - Documentation and guides

The workspace uses Nx for build orchestration, dependency management, and task execution.

## Packages

Dashforge consists of seven publishable npm packages:

### Core Infrastructure

**@dashforge/tokens**  
Design tokens defining colors, typography, spacing, and other design primitives. Provides the foundation for consistent theming across the framework.

**@dashforge/theme-core**  
Reactive theming engine built on Valtio. Manages theme state, mode switching (light/dark), and cross-tab synchronization.

**@dashforge/theme-mui**  
Material-UI theme integration that bridges Dashforge design tokens with MUI's theming system.

### Form System

**@dashforge/forms**  
Type-safe form bridge for react-hook-form. Provides centralized form context, field registration, and validation orchestration without exposing react-hook-form internals.

### UI Components

**@dashforge/ui-core**  
Core React utilities and CSS animations used by higher-level components. Provides hooks, state management utilities, and animation primitives.

**@dashforge/ui**  
Complete MUI-based component library with form integration and RBAC support. Includes text fields, selects, autocompletes, and other common UI elements.

### Access Control

**@dashforge/rbac**  
Role-based access control utilities for React. Provides permission checking, role hierarchies, and component-level access control.

## Installation

Install packages individually based on your needs:

```bash
npm install @dashforge/ui @dashforge/theme-mui @dashforge/forms
```

For theming only:

```bash
npm install @dashforge/tokens @dashforge/theme-core
```

For RBAC:

```bash
npm install @dashforge/rbac
```

## Development

### Prerequisites

- Node.js 20.x or later
- pnpm 9.x or later

### Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/kensaadi/dashforge.git
cd dashforge
pnpm install
```

### Building

Build all packages:

```bash
pnpm nx run-many -t build --projects=@dashforge/*
```

Build a specific package:

```bash
pnpm nx build @dashforge/tokens
```

### Testing

Run tests for all packages:

```bash
pnpm nx run-many -t test --projects=@dashforge/*
```

Run tests for a specific package:

```bash
pnpm nx test @dashforge/ui
```

### Type Checking

Run type checks across all packages:

```bash
pnpm nx run-many -t typecheck --projects=@dashforge/*
```

## Build & Packaging

Each package is built independently with its own configuration:

- **TypeScript packages** (@dashforge/tokens, @dashforge/theme-core): Built with TypeScript compiler, output to `dist/`
- **React packages** (all others): Built with Rollup, output to `dist/`

All packages use ESM module format and include full TypeScript declarations.

Build artifacts are excluded from version control. Each package's `package.json` defines which files are published via the `files` field.

## Current Release: `0.1.7-alpha`

Dashforge is in **alpha**. All seven packages are published on npm under the
`@dashforge` scope and follow [Semantic Versioning](https://semver.org) with
`-alpha` / `-beta` / `-rc` pre-release tags.

**Latest:** [`0.1.7-alpha`](./CHANGELOG.md#017-alpha--2026-05-11) — MUI v9
slotProps migration: peer dep bumped to `@mui/material@^9.0.0`, all 9 form
components migrated from deprecated `InputProps`/`inputProps`/`InputLabelProps`/`inputRef`
to the v9 `slotProps` API. Zero breaking changes for consumers; console now
free of React deprecation warnings.

For the full history see [`CHANGELOG.md`](./CHANGELOG.md). For the path to
`1.0.0` see [`ROADMAP-1.0.md`](./ROADMAP-1.0.md).

**Stability Notice**

While the core architecture is already used in real-world scenarios, public
APIs may still evolve. Pin to an exact version (e.g. `"^0.1.7-alpha"`) and
review the changelog before each upgrade.

**What's Included**

- Complete theming system with light/dark mode support
- Form bridge with react-hook-form integration (per-field subscriptions for
  optimal re-render behavior)
- 9 MUI-based form components (TextField, Textarea, NumberField, Checkbox,
  Switch, RadioGroup, Select, Autocomplete, DateTimePicker, OTPField)
- RBAC utilities for access control with `hide` / `disable` / `readonly`
  semantics
- Full TypeScript support with strict contracts at every boundary

**Known Limitations**

- API surface may change based on feedback (see `ROADMAP-1.0.md`)
- Some MUI v9 deprecation warnings still surface in console; planned for
  cleanup before `1.0`
- Documentation is still evolving — only `@dashforge/forms` has a rich README
  today; the others are scheduled for `0.2.0-beta`

## Contributing

This project follows strict quality and testing standards:

- TDD-first approach for all UI components
- Zero skipped tests in the test suite
- No unsafe type casts at public boundaries
- All code and documentation written in English

Contributions should align with the existing architecture, design principles, and coding guidelines. See `AGENTS.md` for detailed development policies.

## License

MIT

See `LICENSE` file for full text.

---

**Repository:** https://github.com/kensaadi/dashforge  
**Issues:** https://github.com/kensaadi/dashforge/issues
