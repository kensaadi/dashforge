/**
 * @dashforge/tw
 *
 * Tailwind-rendered UI components for the Dashforge ecosystem.
 *
 * Architectural contract (plan v2 — 2026-05-15):
 *  - **Props-driven**: each Tailwind utility that matters for the public
 *    API becomes a typed prop. `sx` + `slotProps` are escape hatches.
 *  - **Tokens as source of truth**: components reference colors /
 *    spacing / radius / fontSize through `@dashforge/tw-tokens` via the
 *    `dashforgePreset()` from `@dashforge/tw-theme`.
 *  - **Shared bridge with MUI side**: both ecosystems consume
 *    `@dashforge/forms` + `@dashforge/ui-core` + `@dashforge/rbac`.
 *    No styling code is shared.
 *  - **Variant API**: `tailwind-variants` (TV) with `slots` +
 *    `compoundVariants`.
 *
 * F3 surface (tier-1, this release):
 *  - `<Button>` (action, RBAC only, `asChild` polymorphism)
 *  - `<TextField>` (bridge-integrated, 7 slots)
 *  - `<Checkbox>` (bridge-integrated, Radix Checkbox primitive)
 *  - `<Switch>` (bridge-integrated, Radix Switch primitive)
 *
 * @module @dashforge/tw
 */

// ───── Components ─────
export { Button } from './components/Button/Button.js';
export type { ButtonProps } from './components/Button/button.types.js';
export { buttonVariants } from './components/Button/button.variants.js';

export { TextField } from './components/TextField/TextField.js';
export type {
  TextFieldProps,
  TextFieldSlotProps,
} from './components/TextField/textField.types.js';
export { textFieldVariants } from './components/TextField/textField.variants.js';

export { Checkbox } from './components/Checkbox/Checkbox.js';
export type {
  CheckboxProps,
  CheckboxSlotProps,
} from './components/Checkbox/checkbox.types.js';
export { checkboxVariants } from './components/Checkbox/checkbox.variants.js';

export { Switch } from './components/Switch/Switch.js';
export type {
  SwitchProps,
  SwitchSlotProps,
} from './components/Switch/switch.types.js';
export { switchVariants } from './components/Switch/switch.variants.js';

// ───── Hooks ─────
export { useAccessState } from './hooks/useAccessState.js';

// ───── Utilities ─────
export { cn } from './utils/cn.js';

// Re-export tailwind-variants for consumers building app-level variants
// against the same canonical version used by the library.
export { tv } from 'tailwind-variants';
export type { VariantProps } from 'tailwind-variants';

/**
 * Package version (synced with `package.json` at publish time).
 */
export const VERSION = '0.0.1';
