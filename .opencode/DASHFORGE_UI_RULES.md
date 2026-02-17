# Dashforge UI — Component Rules & Conventions (Contract)

This document is the **source of truth** for building components in Dashforge.
It defines folder structure, naming, exports, and how predictive UI integrates with `@dashforge/ui-core`.

---

## 0) Repository Context

Monorepo layout (relevant parts):

- `libs/dashforge/ui` → UI package (components)
- `libs/dashforge/ui-core` → predictive/reactive engine (nodes + rules)
- `libs/dashforge/forms` → future consumer for form-specific abstractions (optional layer)
- `docs/` → docs/playground app (used to validate components visually)
- `web/` → additional app (not primary for UI validation)

---

## 1) Component Folder Rule (Mandatory)

**Every component must live in its own folder** and expose a local barrel `index.ts`.

**Location:**
`libs/dashforge/ui/src/lib/<ComponentName>/`

**Required files (minimum):**

- `<ComponentName>.tsx`
- `index.ts`

**Optional files (component-local only):**

- `<ComponentName>.stories.tsx`
- `<ComponentName>.test.tsx`
- `types.ts`
- `hooks.ts`
- `state.ts`
- `styles.ts`
- `utils.ts`

Example:
