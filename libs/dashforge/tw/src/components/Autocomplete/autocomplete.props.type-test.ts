/**
 * Type-only regression tests for `AutocompleteProps` (Bug 2 fix,
 * type-surface split — see `libs/dashforge/README-BUG.md` § BUG 2).
 *
 * This file exists to prevent an accidental re-flattening of the
 * discriminated union — if a future edit merges `AutocompleteFormMixin`
 * and `AutocompleteStandaloneMixin` back into one shape, the `@ts-expect-error`
 * assertions below will start firing (or stop firing) and CI typecheck
 * will fail.
 *
 * No runtime code — deliberately excluded from the test runner (`.type-test.ts`,
 * not `.test.ts`). Compilation IS the assertion.
 */
import type { AutocompleteProps } from './autocomplete.types';

const dummyOptions = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

// ─── OK: form-mode props (rules present, controlled/uncontrolled absent) ───

const formOnly: AutocompleteProps = {
  name: 'field',
  options: dummyOptions,
  rules: { required: 'Required' },
};
void formOnly;

const formWithoutRules: AutocompleteProps = {
  name: 'field',
  options: dummyOptions,
  // rules omitted — still valid form-mode use (the bridge will read
  // an empty rules set). Falls into either branch of the union
  // depending on inference — TypeScript picks whichever matches all
  // present properties.
};
void formWithoutRules;

// ─── OK: standalone-mode props (value / defaultValue / onValueChange) ───

const standaloneControlled: AutocompleteProps = {
  name: 'field',
  options: dummyOptions,
  value: 'a',
  onValueChange: (_v) => undefined,
};
void standaloneControlled;

const standaloneUncontrolled: AutocompleteProps = {
  name: 'field',
  options: dummyOptions,
  defaultValue: 'a',
};
void standaloneUncontrolled;

// ─── ERROR: mixing modes — the bug-2 misuse pattern ───

// @ts-expect-error — `rules` and `defaultValue` are mutually exclusive:
//   rules marks form mode (defaultValue set on <DashForm defaultValues>),
//   defaultValue marks standalone mode (no bridge to talk to).
const misuse1: AutocompleteProps = {
  name: 'field',
  options: dummyOptions,
  rules: { required: 'Required' },
  defaultValue: 'a',
};
void misuse1;

// @ts-expect-error — same class of misuse, with `value` instead.
const misuse2: AutocompleteProps = {
  name: 'field',
  options: dummyOptions,
  rules: { required: 'Required' },
  value: 'a',
};
void misuse2;

// @ts-expect-error — same class of misuse, with `onValueChange`.
const misuse3: AutocompleteProps = {
  name: 'field',
  options: dummyOptions,
  rules: { required: 'Required' },
  onValueChange: (_v) => undefined,
};
void misuse3;
