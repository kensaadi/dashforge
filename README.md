# Dashforge

A composable UI framework for building data-driven React applications with type-safe forms, dynamic theming, and built-in access control.

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

## First Release: v0.1.0-alpha

This is the first public alpha release of Dashforge. All packages are available on npm under the `@dashforge` scope.

**Stability Notice:**

This is an alpha release. While APIs may evolve, the core architecture is already used in real-world scenarios. Public APIs may change in future versions based on community feedback.

**What's Included:**

- Complete theming system with light/dark mode support
- Form bridge with react-hook-form integration
- MUI-based component library
- RBAC utilities for access control
- Full TypeScript support

**Known Limitations:**

- API surface may change based on feedback
- Documentation is still evolving
- Some advanced use cases may require direct interaction with underlying libraries

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
