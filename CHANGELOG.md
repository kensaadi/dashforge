# Dashforge Changelog

All notable changes to the Dashforge monorepo are documented here. Per-package
changelogs (where present) describe deeper, package-scoped detail. This file is
the entrypoint for understanding cross-package releases.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
The project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

---

## [0.1.8-alpha] — 2026-05-13

> **Packaging + docs cleanup release.** No functional changes. Two themes:
> (1) every `@dashforge/*` package now ships its `CHANGELOG.md` inside the
> npm tarball (was only `@dashforge/forms` before); (2) a stale developer
> warning in `Autocomplete`/`Select` that mentioned "no automatic reset"
> has been corrected to reflect the actual `0.1.6-alpha+` behavior.

Affected packages (all bumped to `0.1.8-alpha`):

| Package                | Notes                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `@dashforge/tokens`    | New `CHANGELOG.md`; included in tarball via `files[]`.                                         |
| `@dashforge/theme-core`| New `CHANGELOG.md`; included in tarball via `files[]`.                                         |
| `@dashforge/theme-mui` | New `CHANGELOG.md`; rollup config copies it to `dist/`.                                        |
| `@dashforge/ui-core`   | New `CHANGELOG.md`; rollup config copies it to `dist/`.                                        |
| `@dashforge/rbac`      | New `CHANGELOG.md`; rollup config copies it to `dist/`.                                        |
| `@dashforge/forms`     | (`CHANGELOG.md` was already shipping since 0.1.7-alpha) Version bump only.                     |
| `@dashforge/ui`        | New `CHANGELOG.md`; rollup config copies it to `dist/`. Stale `warnUnresolvedValue` corrected. |

### Changed

- **Dev warning correction in `Autocomplete` and `Select`.** When a stored
  value can't be resolved against the loaded options, the `console.warn`
  message used to say *"The form value remains unchanged (no automatic
  reset)"*. That hasn't been accurate since `0.1.6-alpha` introduced the
  auto-reset effect — the value is actually cleared to `null` so the user
  can pick a valid option. The warning now reads:

  > *"The form value has been auto-reset to null so the user can pick a
  > valid option (introduced in 0.1.6-alpha)."*

  Pure message change. No runtime behavior change.

### Internal — packaging

- Every package now has a per-package `CHANGELOG.md` at its root. Each one
  links to this top-level changelog for cross-package release context.
- Each package's `files[]` array in `package.json` now includes
  `CHANGELOG.md`, so the file is published in the npm tarball.
- For packages built with Rollup (`@dashforge/{theme-mui,ui-core,rbac,forms,ui}`),
  the `rollup.config.cjs` `assets[]` array now globs `CHANGELOG.md` from the
  package root into `dist/`. This way the changelog is also available inside
  `node_modules/@dashforge/<pkg>/dist/` for consumers that resolve through
  the dist subtree.

### Documentation

- Outdated inline docstrings in `Select.tsx`, `textField.select.ts`,
  `Select.unresolved-display.test.tsx`, and `Select.runtime-loading.test.tsx`
  that described the pre-`0.1.6-alpha` "no automatic reset" policy have been
  rewritten to describe the actual behavior with a clear historical note.

### Tests

- All `@dashforge/ui` tests still passing (**481 / 482**, 1 skipped). The
  warning message change is not asserted in any test — only doc comments
  needed updating.

---

## [0.1.7-alpha] — 2026-05-11

> **MUI v9 compatibility release.** Migrates `@dashforge/ui` and
> `@dashforge/theme-mui` from `@mui/material@^7` to `@mui/material@^9`,
> eliminating the four persistent React deprecation warnings
> (`InputProps`, `inputProps`, `InputLabelProps`, `inputRef`) that fired on
> every render of every form component. No public API breaks.

Affected packages:

| Package                | Notes                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `@dashforge/ui`        | All 9 form components migrated to `slotProps`. Snackbar, ConfirmDialog and LeftNav fixed for v9.    |
| `@dashforge/theme-mui` | Peer dep bumped to `@mui/material@^9.0.0`. Theme overrides untouched (slot signatures unchanged).   |

### Changed

- **Peer dependency** `@mui/material` widened from `^7.0.0` to `^9.0.0`
  in both `@dashforge/ui` and `@dashforge/theme-mui`. The workspace
  dev-dependency is also bumped so tests and builds run against v9.
- **`@dashforge/ui` form components** — all internal usage of the deprecated
  top-level props is migrated to the new MUI v9 `slotProps` API:

  | Old prop          | New location                       |
  | ----------------- | ---------------------------------- |
  | `inputRef`        | `slotProps.htmlInput.ref` (TextField family) or `slotProps.input.ref` (SwitchBase family) |
  | `InputProps`      | `slotProps.input`                  |
  | `inputProps`      | `slotProps.htmlInput`              |
  | `InputLabelProps` | `slotProps.inputLabel`             |

  Touched: `TextField`, `Textarea`, `Select` (via `textField.select.ts`),
  `Autocomplete` (`params.InputProps` → `params.slotProps.input` inside
  `renderInput`), `Checkbox`, `Switch`, `DateTimePicker`.
  `NumberField` and `RadioGroup` did not use the deprecated props internally
  so they only inherit the cleaner downstream behavior.

- **`@dashforge/ui` non-form components** also adapted to v9:
  - `LeftNav`: `PaperProps` → `slotProps.paper`; `ModalProps` → `slotProps.root`.
    Without this, the `role="navigation"` and `data-dash-open` attributes
    were silently dropped under v9.
  - `Snackbar`: `TransitionComponent` → `slots.transition`. The Slide
    `direction` prop now flows through `slotProps.transition`.

### Fixed

- **Four persistent React deprecation warnings** in the browser console
  (one per deprecated prop, fired on every render of every form component
  under MUI v9) are eliminated. End-to-end browser smoke on the
  `~/projects/web/learn/dash` consumer shows zero React deprecation errors.
- **`LeftNav` accessibility**: the `role="navigation"` landmark that
  silently disappeared after the v9 bump is back. Drawer + RBAC tests for
  `LeftNav` pass again.

### Backwards compatibility

The public API of `@dashforge/ui` components does **not** change. The
deprecated MUI props were always:

- Either explicitly `Omit`-ed from the component prop types (`TextField`,
  `Select`, `Autocomplete`), so consumers couldn't pass them anyway;
- Or forwarded internally to the new `slotProps` shape (`DateTimePicker`,
  which still accepts `inputProps` and `InputLabelProps` as `@deprecated`
  props for ergonomic backward compat).

`DateTimePickerProps` now explicitly types `inputProps` and `InputLabelProps`
as `@deprecated` because MUI v9 removed them from `TextFieldProps` —
without the explicit re-declaration TypeScript would have flagged the
existing destructuring as an error.

### Internal

- 19 existing tests in `Snackbar`, `ConfirmDialog` and `LeftNav` were
  updated to assert against the new MUI v9 class names (compound classes
  like `MuiAlert-filledSuccess` and `MuiButton-containedError` were split
  into two atomic classes: `MuiAlert-filled` + `MuiAlert-colorSuccess` etc.).
  No component behavior change — purely test-side assertion updates.
- Full test suite back to baseline: **481 passing / 1 skipped** in
  `@dashforge/ui` (482 total).

---

## [0.1.6-alpha] — 2026-05-10

> **Performance + correctness release.** Restores Dashforge's core promise of
> "fewer renders than plain RHF" via per-field subscriptions, fixes two
> hook-rules / lifecycle bugs flagged in the libs CR, and tightens
> dependent-field UX.

Affected packages (all bumped to `0.1.6-alpha`):

| Package                | Notes                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `@dashforge/ui-core`   | Bridge interface gains `subscribeField`, `unregister` (both optional, fully backwards-compatible).          |
| `@dashforge/forms`     | New `useDashFieldMeta` hook. Bridge identity stabilized; per-field listeners replace global version-bumps.  |
| `@dashforge/rbac`      | New `useRbacOptional` (non-throwing variant of `useRbac`) used by access-aware UI hooks.                    |
| `@dashforge/ui`        | All form components migrate to per-field subscribe; deferred unregister on real unmount; auto-reset policy. |
| `@dashforge/tokens`    | Version bump only (peer alignment).                                                                         |
| `@dashforge/theme-core`| Version bump only (peer alignment).                                                                         |
| `@dashforge/theme-mui` | Version bump only (peer alignment).                                                                         |

### Added

- **`useDashFieldMeta(name)` hook** in `@dashforge/forms` — canonical way to
  subscribe a UI component to its own field's `value` / `error` / `touched` /
  `dirty` / `submitCount` / `allowAutoError`. Backed by `useSyncExternalStore`
  with a primitive-equality cache, so unrelated field edits do not re-render
  the consumer.
- **`useRbacOptional()` hook** in `@dashforge/rbac` — non-throwing version of
  `useRbac()` that returns `null` when `RbacProvider` is absent. Eliminates the
  hooks-rules violation in `useAccessState` (previously wrapped `useRbac()` in
  try/catch).
- **`bridge.unregister?(name)`** in `DashFormBridge` — releases engine + RHF
  state for a field. Form UI components now call this on real unmount,
  preventing the `getNode(name)` memory-leak after dynamic field removal.
- **`bridge.subscribeField?(name, listener)`** in `DashFormBridge` — per-field
  subscription primitive used by `useDashFieldMeta`.
- **`DateTimePicker.layout` prop** — `'stacked'` (default) or `'inline'`.
  `'floating'` is silently downgraded to `'stacked'` with a dev warning, since
  native `<input type="date|time|datetime-local">` always renders a placeholder
  mask that overlaps the floating label.

### Changed

- **Bridge identity is now stable across keystrokes.** Previously the bridge
  object identity changed every time `valuesVersion`, `errorVersion`,
  `touchedVersion`, `dirtyVersion`, or `submitCount` advanced — which forced
  every consumer of `useContext(DashFormContext)` to re-render. The bridge is
  now memoized on the structural deps (`engine`, `runtimeStore`, `rhf`,
  `adapter`, `debug`, `subscribeField`); reactivity is delegated to per-field
  listeners + `useDashFieldMeta`.
- **All 9 UI form components** (`TextField`, `Textarea`, `NumberField`,
  `Checkbox`, `Switch`, `RadioGroup`, `Select`, `Autocomplete`, `OTPField`,
  `DateTimePicker`) replaced the legacy `void bridge?.errorVersion;`-style
  global subscribe with a single `useDashFieldMeta(name)` call.
- **Unresolved-value policy for `Select` and `Autocomplete`** — when loaded
  options can no longer resolve the current form value (e.g. a parent field
  changed and a reaction reloaded options for a different scope), the form
  value is now auto-reset to `null` instead of being preserved silently.
  Previously the user saw a blank control but the form still submitted a stale
  id. **This is a behavior change; see Migration below.**
- **`Autocomplete` object-mapped mode** (custom `getOptionValue` /
  `getOptionLabel`): the displayed text is now strictly derived from the
  matched option's label. The raw stored id can never appear in the input, and
  the freeSolo "commit typed text on blur" path is disabled — typing a label
  string would otherwise overwrite the id and break the round-trip.

### Fixed

- **CR fix #2 — Rules of Hooks violation in `useAccessState`.** The hook
  previously called `useRbac()` inside a `try/catch`, which threw when
  `RbacProvider` was absent and changed the hook count between renders under
  React 19 StrictMode. Refactored to call `useRbacOptional()` unconditionally
  and branch on its return value. Eliminates the
  `"Rendered more hooks than during the previous render."` warning.
- **CR fix #3 — Memory leak on dynamic field unmount.** Bridge-bound field
  components now defer `bridge.unregister(name)` to a `queueMicrotask` after
  unmount, guarded by a mounted-ref. This fixes:
  - the original leak (engine / RHF state stayed attached after unmount), and
  - a regression introduced by the naïve fix where `useEffect`'s cleanup ran
    on every render because the bridge identity used to change every keystroke
    — destroying values on the very first keystroke. Bridge identity is now
    stable, but the deferred-cleanup pattern is preserved as defense-in-depth.
- **`DateTimePicker` time-mode loses base date.** When typing `13:45` into a
  time field bound to `2026-02-25T10:00:00.000Z`, intermediate keystrokes
  (`'1'`, `'13'`, `'13:'`, `'13:4'`) all parsed as invalid time and wrote
  `null` to the bridge, dropping the date component. The next valid parse then
  fell back to **today**, silently changing year/month/day. A new
  `lastValidIsoRef` keeps the most recent valid ISO and is used as the
  fallback `baseIso` during partial typing.
- **`DateTimePicker` floating label overlapping native placeholder.** Native
  date/time inputs always render a mask (e.g. `mm/dd/yyyy`) that visually
  collided with the MUI floating label. The component now defaults to
  `layout="stacked"` and warns if `floating` is requested.
- **`Autocomplete` showing raw id instead of label.** Three independent
  causes: missing sanitization in object-mapped mode, local `inputValue`
  state pollution from MUI's internal "reset" reason, and `inputRef={
  registration.ref}` leaking the RHF stored value (an id) into the DOM,
  overriding the controlled `inputValue`. All three are fixed; the registered
  ref is no longer wired to the visible input in object-mapped mode.
- **`Autocomplete` React 19 key-spread warning.** `<li {...props}>` in
  `renderOption` now extracts `key` first and applies it explicitly, complying
  with React 19's restriction on spreading `key`.

### Performance

The Dashforge tagline — "fewer re-renders than plain RHF" — is now backed by
the per-field subscription model:

- A bridge-bound `<TextField name="A">` re-renders **only** when field `A`'s
  value, error, touched, dirty, or submitCount changes. Editing field `B`
  does not touch field `A`'s reconciler.
- Form-wide getters (`bridge.errorVersion` etc.) remain readable for
  diagnostic / introspection use, but components no longer subscribe through
  them.
- Verified end-to-end with a `React.Profiler`-instrumented test harness
  exercising 9 components, dependent fields with reactions, RBAC gating, and
  a 50× stress submit.

### Migration

Most consumers do **not** need to change anything. Two cases require
attention:

1. **Unresolved Select / Autocomplete values are now reset to `null`.** If
   your code intentionally relied on the previous "preserve unresolved value"
   behavior (e.g. round-tripping a value that's expected to materialize on a
   later runtime load), guard the value yourself before passing it to the
   form, or hold it outside form state until the option list contains it.
2. **Custom components reading `bridge.getError(name)` / `bridge.getValue(name)`
   directly during render** will no longer re-render automatically when those
   values change, because the bridge object identity is now stable. Migrate
   to `useDashFieldMeta(name)` (preferred) or call `bridge.subscribeField(
   name, onChange)` from a `useSyncExternalStore` of your own. The 9 first-
   party UI components have already been migrated.

### Internal

- Test suite recovered from 325 → 0 failures across `forms`, `rbac`,
  `ui-core`, and `ui` (481 / 482 passing in `@dashforge/ui`, 1 skipped).
- Outdated tests for the pre-0.1.6 "no automatic reset" Select policy were
  updated to assert the new auto-reset contract.
- Pre-existing typecheck noise in `DashFormProvider.resolver.test.tsx` and
  `reactionIntegration.test.tsx` (test-only `bridge.register possibly
  undefined`) is **not** addressed in this release; it predates the refactor.

---

For per-package detail, see the package-scoped CHANGELOG.md files (currently
only `libs/dashforge/forms/CHANGELOG.md`).
