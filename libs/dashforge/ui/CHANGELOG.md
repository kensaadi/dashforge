# Changelog — @dashforge/ui

All notable changes to `@dashforge/ui` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

> For the cross-package release context, see the
> [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

## [1.4.0] — 2026-09-15

Bug fixes + API parity round-up across the field family, driven by the
inventory-kit port onto the MUI flavour. Seven register entries closed
(BUG 14 through BUG 20 in `libs/dashforge/README-BUG.md`), one of which
(BUG 19 multi-select) lands as a type-level widening with the runtime
storage adapter deferred to a follow-up.

### Fixed

- **`visibleWhen` no longer white-screens `<RadioGroup>` / `<Autocomplete>`**
  (BUG 16). Both components called hooks (`useAccessState`,
  `useEngineVisibility`, then per-option `useAccessState` inside a `.map`)
  AFTER an early `return null` on the visibility predicate. When the
  predicate flipped, React saw a different hook count and threw
  *"Rendered more/fewer hooks than expected"*, unmounting the whole tree.
  Fixed by moving every hook above every early return, and by introducing
  a new plural hook `useAccessStates(accesses[])` in `@dashforge/ui/hooks`
  that resolves an array of access requirements in ONE call — decoupling
  React's hook count from `options.length` (previously the code did
  `options.map(useAccessState)` with an `eslint-disable-next-line`, which
  broke the rules of hooks any time options loaded asynchronously). See
  `README-BUG.md` § BUG 16.

- **An explicit `helperText` no longer hides the field's validation
  message** (BUG 17). The resolver in
  `TextField/textField.validation.ts` (shared by `TextField`,
  `TimePicker`, `DatePicker`, `DateRangePicker`, `DateTimePicker`) had
  the precedence inverted: `explicitHelperText ??
  (allowAutoError ? autoErr?.message : undefined)` short-circuited on
  the explicit prop, so any non-nullish `helperText` (a constant hint
  like `"Unique, uppercase"`) permanently hid the required-field
  error message. Same shape found inline in `Textarea`, `NumberField`,
  and `RadioGroup`. All four now compute `autoMessage ?? explicitHelperText`
  — the validation message wins while it is showing, and the explicit
  prop is the fallback for the no-error state. The `error` boolean
  precedence is unchanged. `rest.error === false` still suppresses the
  auto channel entirely for Textarea/NumberField. See `README-BUG.md`
  § BUG 17.

- **`<AppShell>` main content no longer overflows the viewport by the
  nav width** (BUG 18). The shell is a flex row and `LeftNav` is a
  permanent Drawer (in-flow) on desktop, so `flexGrow: 1` alone fills
  the remainder of the row. Earlier revisions layered `marginLeft:
  ${navWidth}px` + `width: calc(100% - ${navWidth}px)` on `main` on
  top of the flex, counting the nav width a second and third time and
  overflowing by exactly the nav width on desktop. Fix: removed both
  properties from the `main` sx, kept `flexGrow: 1`, added `minWidth:
  0` so wide children (tables, charts) cannot push the flex item past
  the row. The `mainSx` escape hatch is preserved; the redundant
  `data-dash-main-margin-left` marker was removed. See `README-BUG.md`
  § BUG 18.

### Added

- **`<Autocomplete>` gained a `layout` prop** (`'floating' | 'stacked' |
  'inline'`, defaults to `'floating'`) and reopened MUI's native
  `renderInput` escape from the passthrough (BUG 14). When `layout` is
  stacked/inline, the internal `MuiTextField` renders without label /
  helperText and the whole thing wraps in `FieldLayoutShell`, aligning
  Autocomplete with `<TextField layout="stacked">` /
  `<Select layout="stacked">` peers. Autocomplete was the only field
  in `ui` that could not be stacked. Applied to BOTH branches
  (bridge-integrated and standalone). See `README-BUG.md` § BUG 14.

- **`<Textarea>` and `<NumberField>` gained the same `layout` prop**
  (BUG 15). Achieves API parity with `<TextField>`; the three fields
  now share the same layout API. NumberField uses a `wrapWithLayout`
  helper around each of its four render return sites (controlled /
  uncontrolled / bridge-fallback controlled+uncontrolled /
  bridge-integrated) so the shell wrapping is applied consistently.
  See `README-BUG.md` § BUG 15.

- **`<Autocomplete required>` and `<RadioGroup required>` now compile**
  (BUG 20). Autocomplete forwards `required` to the internal
  `MuiTextField` in `renderInput` (both branches). RadioGroup passes
  it to `<FormControl required>` in all three branches (standalone,
  bridge-fallback, bridge-integrated), so MUI's `<FormLabel>` gets
  the asterisk (`Mui-required` class) and the semantics propagate to
  the group. The inventory-kit workaround `requiredLabel.tsx` drew a
  literal `*` in label text but set no a11y marker; the fix restores
  proper announcement to assistive technology (HTML5 `required` or
  `aria-required`, depending on the widget). Presentational only,
  as with MUI: form-submit enforcement still requires
  `rules={{ required: … }}`. See `README-BUG.md` § BUG 20.

- **`<Autocomplete multiple>` and `<Select multiple>` compile**
  (BUG 19, partial). Widened the internal `MuiAutocompleteProps
  <T, Multiple, …>` generic pin from `false` to `boolean`; widened
  the public `value` / `onChange` signatures to `TValue | TValue[] |
  null`; added `multiple?: boolean` to both props types.
  `Select.multiple` forwards through `slotProps.select` so MUI's
  native multi-select rendering activates. **Type-level scope
  only** in this release: full bridge-integrated multi-select
  storage (value adapter that maps `TValue[]` ↔
  `NormalizedOption<TValue>[]`, chip rendering rules, `CheckboxGroup`
  for the small-set case) is tracked as a follow-up feature. The
  workaround `inventory-kit/…/MultiSelectField.tsx` remains valid in
  the interim. See `README-BUG.md` § BUG 19.

### Internal

- New plural hook `useAccessStates(accesses[])` alongside
  `useAccessState`, added to `libs/dashforge/ui/src/hooks/useAccessState.ts`.
  Resolves an array of RBAC requirements in one hook call. Used by
  RadioGroup's per-option access resolution; safe to adopt anywhere
  else `arr.map(useAccessState)` was written.

### Tests

- New regression guards, all in `libs/dashforge/ui/src`:
  `RadioGroup/RadioGroup.visibleWhen.test.tsx` (2, BUG 16 flip
  invariant); `TextField/textField.validation.test.ts` (6, BUG 17
  resolver-level precedence); `Autocomplete/Autocomplete.multiple.test.tsx`
  (2, BUG 19 type-level surface); `_shared/requiredProp.test.tsx`
  (4, BUG 20 asterisk + a11y); `_shared/layoutStacked.test.tsx`
  (9, BUG 14 + 15 stacked-layout smoke). Also 5 new
  `useAccessStates` unit tests, and updated the AppShell B1 test +
  new B3 test that pin the BUG 18 sx contract.
- Updated the three existing tests (Select / TextField /
  NumberField / RadioGroup) that encoded the OLD (broken) BUG 17
  precedence.
- Suite total: 598 passed, 1 skipped, 0 failed. `nx typecheck` +
  `nx build` also green.

### Downstream cleanup enabled by this release

After adopting `@dashforge/ui@1.4.0`, the following inventory-kit
workarounds become redundant and can be deleted:

- `client/shared/forms/useFieldHint.ts` (BUG 17)
- `mainSx={{ marginLeft: 0, width: '100%', minWidth: 0 }}` on
  `<AppShell>` (BUG 18)
- `client/mui/src/components/fields/StackedField.tsx` (BUG 14)
- `client/mui/src/components/fields/requiredLabel.tsx` (BUG 20)
- `client/mui/src/components/fields/MultiSelectField.tsx` — still
  needed today; only removable when the BUG 19 follow-up ships full
  bridge multi-storage.

## [1.3.1] — 2026-08-15

Patch: fixes the label ordering of the `tooltip` help icon relative to
the required asterisk.

### Fixed

- **`tooltip` + `required` ordering** — the required `*` is part of the
  primary label block and now always precedes the help `ⓘ` (`Label * ⓘ`,
  or `ⓘ Label *` for `position: 'before'`). Previously the icon rendered
  between the label and the asterisk. Applies to every form input.

## [1.3.0] — 2026-08-15

Adds a label-help **`tooltip`** prop to every form input. No breaking
changes vs 1.2.0 — every existing consumer works unchanged.

### Added

- **`tooltip` prop on all form inputs** — `TextField`, `NumberField`,
  `Textarea`, `Select`, `Autocomplete`, `OTPField`, `Checkbox`, `Switch`,
  `RadioGroup`, `DatePicker`, `TimePicker`, `DateTimePicker`,
  `DateRangePicker`. Renders a `ⓘ` help affordance in the label row that
  reveals its content on hover / focus:
  - **String shorthand** — `tooltip="Your legal name"` — or a config
    object `{ content, icon?, position?: 'before' | 'after', side? }`.
  - **Default icon is a built-in inline SVG** (info-circle) — no
    icon-library dependency, so it always renders. Pass any `ReactNode` as
    `icon` to override it.
  - **Anti-CLS** — hover-only popup, no reserved layout space.
  - The MUI twin of `@dashforge/tw`'s `tooltip` prop. (Theme-level
    defaults via `theme.components.*` are TW-only — on MUI set `icon` /
    `position` per instance.)

### Internal

- New shared `_internal/fieldTooltip` helper wired through
  `FieldLayoutShell` and the inputs that render their own label.

## [1.2.0] — 2026-08-14

Adds the `<Video>` display primitive — the moving-image twin of
`<Image>`. No breaking changes vs 1.1.0 — every existing consumer works
unchanged.

### Added

- **`<Video>`** — the MUI-flavoured twin of `@dashforge/tw`'s `<Video>`
  (same public API, MUI internals), and the moving-image sibling of
  `<Image>`. A thin wrapper over the native `<video>`:
  - **No layout shift** — `aspectRatio` (or `width` + `height`) reserves
    the box before load.
  - **Poster + skeleton** — a `poster` shows before playback; without one
    a MUI `<Skeleton>` fills the reserved box until the first frame is
    ready (cache-aware, no flash).
  - **Graceful error** — a muted fallback replaces the player on failure.
  - **Controls on by default**; `autoPlay` / `loop` / `muted` /
    `playsInline` / `preload` and other native `<video>` attributes are
    forwarded, and `<source>` children are supported for multi-format
    delivery. Supports `access` (RBAC) and `visibleWhen` gating.

## [1.1.0] — 2026-08-14

Adds the `<Image>` display primitive and gating-aware `<Box>` / `<Stack>`
/ `<Grid>` layout overrides. No breaking changes vs 1.0.0 — every existing
consumer works unchanged.

### Added

- **`<Image>`** — the MUI-flavoured twin of `@dashforge/tw`'s `<Image>`
  (same public API, MUI internals). A thin wrapper over the native
  `<img>`: no layout shift (`aspectRatio` reserves the box), a MUI
  `<Skeleton>` while loading (cache-aware, no flash), a graceful error
  fallback, lazy by default. Forwards native `<img>` attributes, `fit`
  (`object-fit`) and `rounded`. Supports `access` (RBAC) and `visibleWhen`
  gating.
- **`<Box>` / `<Stack>` / `<Grid>`** — gating-aware overrides of the MUI
  layout primitives. Every native MUI prop is forwarded unchanged; each
  adds `access` (RBAC) and `visibleWhen` (form-engine reactive), so any
  region can be hidden or dimmed by permission or form state:
  - `access` with `onUnauthorized: 'hide'` removes the subtree;
    `'disable'` / `'readonly'` render it dimmed and non-interactive
    (`opacity` + `pointer-events: none` + `aria-disabled`).
  - `visibleWhen(engine)` renders the region only when the predicate is
    true inside a `<DashForm>` (no-op elsewhere).
  - Drop-in: swap the `@mui/material` import for `@dashforge/ui` — identical
    behaviour until a gating prop is set.

### Internal

- Added the shared `useGating` hook (+ `gatedSx` helper) backing the
  visibility + RBAC resolution for the layout primitives.
- Excluded `test-utils/` and `test-setup.ts` from the published build —
  their stray `.d.ts` declarations no longer ship in the tarball.

## [1.0.0] — 2026-05-23

**Stable release.** First semver-stable version. The public API is now
governed by strict semver — any future breaking change requires a major
bump. Functionally identical to the previous beta tarball.

- Version: `1.0.0`
- Cross-package `@dashforge/*` peer-dependency ranges updated to `^1.0.0`.
- See the [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#100---2026-05-23) for the coordinated release context.
- See [`MIGRATION.md`](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md) for the upgrade guide from any `0.x-beta` to `1.0.0` (no code changes required).

## [0.4.0-beta] — 2026-05-22

**Sprint 7 — Tabs.** Adds a custom `Tabs` component.

### Added

- **`<Tabs>`** — declarative tab navigation. A custom, clean-room
  implementation on a headless `useTabs` engine — it does **not** wrap
  `@mui/material`'s `Tabs`. Implements the WAI-ARIA APG tabs pattern:
  arrow-key navigation, automatic activation, roving tabindex, and the
  `tablist` / `tab` / `tabpanel` roles. Two variant axes — `variant`
  (`underline` | `pill`) and `orientation` (`horizontal` | `vertical`);
  controlled / uncontrolled selection; per-tab `disabled`; and a
  `keepMounted` prop (default `false` — only the active panel is mounted).
  The prop surface mirrors the `@dashforge/tw` `Tabs`.
- New exported types: `TabsProps`, `TabItem`.

## [0.3.0-beta] — 2026-05-21

**Sprint 7 — Calendar suite (part 2).** Completes the custom date-picker
suite: `TimePicker`, `DateRangePicker`, and a rebuilt `DateTimePicker` —
all on the shared headless `@dashforge/calendar-core` engine.

### Added

- **`<TimePicker>`** — a form-bound time-of-day field: an editable input
  paired with a dropdown of time options. Free-typed input is normalized
  via `parseTimeString` on blur / Enter. Stores a canonical 24-hour
  `"HH:mm"` string (`hour12` is display-only). Bridge + RBAC +
  `FieldLayoutShell`.
- **`<DateRangePicker>`** — a form-bound start/end date field: a read-only
  input paired with a dual-month range calendar popup, built on the new
  `useDateRange` engine. Stores a `{ start, end }` pair of ISO dates.

### Changed

- **BREAKING — `<DateTimePicker>` replaced.** The legacy native-input
  `DateTimePicker` (HTML `datetime-local` / `date` / `time`) is replaced by
  a custom component — a `Calendar` popup paired with a time list, on
  `@dashforge/calendar-core`. New storage contract: a naive ISO datetime
  `"YYYY-MM-DDTHH:mm"` (no seconds, no timezone). The `mode` prop is
  removed — use `DatePicker` for date-only, `TimePicker` for time-only;
  `min` / `max` / `step` / `onValueChange` become `minDate` / `maxDate` /
  `stepMinutes` / `onChange`. The `DateTimePickerMode` type export is
  removed. No deprecation cycle — the library has no consumers yet.

### Dependencies

- Requires **`@dashforge/calendar-core` `0.2.0-beta`** — the `useDateRange`
  engine.

## [0.2.4-beta] — 2026-05-20

**Sprint 7 — Calendar suite (part 1).** Adds the first two components of
the custom date-picker suite, built on the new shared headless engine
`@dashforge/calendar-core`.

### Added

- **`<Calendar>`** — a standalone, inline month-grid date primitive.
  Renders the `useCalendar` view-model from `@dashforge/calendar-core`
  with MUI primitives + the Dashforge theme; full WCAG grid pattern with
  roving tab-index keyboard navigation. Controlled / uncontrolled
  selection, `minDate` / `maxDate`, explicit + predicate disabled dates,
  configurable week-start day, `Intl`-localized labels.
- **`<DatePicker>`** — a bridge-integrated single-date form field: a
  read-only input paired with a `<Calendar>` popup (MUI `Popper`).
  Integrates with the form bridge, RBAC, and `FieldLayoutShell`. Stores a
  plain ISO `YYYY-MM-DD` date (no time, no timezone — removing the DST
  round-trip hazards of the legacy native `DateTimePicker`, which stays
  available).

### Fixed

- **`Select` / `Autocomplete`** — resolved pre-existing implicit-`any`
  errors (`TS7006`) on the `sourceOptions.map` callback parameter. The
  `optionsFromFieldData ? … : …` ternary produced a union of array types
  that degraded the callback parameter to an implicit `any`; an explicit
  `sourceOptions` type annotation fixes it. Type-only change — no runtime
  behaviour change.

### Dependencies

- New dependency: **`@dashforge/calendar-core`** — the shared headless
  calendar engine.

## [0.2.3-beta] — 2026-05-16

- Lockstep version bump aligning the `fixed`-relationship release group
  with the patch released for `@dashforge/forms`, `@dashforge/ui-core`,
  and `@dashforge/rbac` (post-build `.d.ts` flattener + minor lint
  cleanup). **No runtime source change.**

### Tooling — known debt scoped

- `src/components/Autocomplete/Autocomplete.tsx` has several hooks
  called after `if (!isVisible) return null` early-returns — a real
  Rules-of-Hooks violation surfaced once `eslint-plugin-react-hooks`
  was wired into the workspace. The component is StrictMode-safe in
  practice because the `visibleWhen` decision is stable per mount,
  but the lint error needs to be cleared by lifting ~200 LoC of
  hooks above the early-return guards. **Tracked as a dedicated
  follow-up — for now the rule is `off` ONLY for that one file via
  `eslint.config.mjs`. The rest of the package is strictly checked.**

### Context

- For the parallel `@dashforge/tw 0.1.0-beta` first public beta of
  the Tailwind ecosystem, see the
  [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md).

## [0.2.2-beta] — 2026-05-15

- Version bump for lockstep peer alignment with the workspace `0.2.2-beta`
  maintenance release. This package has no source change.
- See the
  [top-level 0.2.2-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#022-beta--2026-05-15)
  for cross-package context (`@dashforge/theme-mui` `MuiAlert` v9 fix +
  F1 scaffolding of the `@dashforge/tw-*` Tailwind ecosystem as private,
  unpublished packages — the MUI side of the form components in this
  package is unaffected).

## [0.2.1-beta] — 2026-05-14

- Version bump for lockstep peer alignment with the workspace `0.2.1-beta`
  bug-fix release (`@dashforge/forms` `DashForm` `resolver` passthrough fix).
  This package has no source change. See the
  [top-level 0.2.1-beta notes](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#021-beta--2026-05-14).

## [0.2.0-beta] — 2026-05-14

### Changed

- **All 10 form components migrated to the simplified bridge access
  pattern.** Under the `0.2.0-beta` freeze, `register` / `unregister` /
  `getValue` / `setValue` / `getError` / `isTouched` / `isDirty` /
  `subscribeField` are no longer optional on `DashFormBridge`. The
  defensive `bridge.method?.(...)` double-chain has been simplified to
  `bridge.method(...)` in:
  - `TextField`, `Textarea`, `Select`, `Autocomplete`, `RadioGroup`,
    `Checkbox`, `Switch`, `NumberField`, `DateTimePicker`, `OTPField`.
  - Helper modules `textField.select.ts` and `textField.validation.ts`.

  Semantics are unchanged (`bridge` itself is still nullable, so the
  outer `if (!bridge)` / `bridge?.` guard remains; only the second
  optional chain is dropped).

- **`createMockBridge`** (in `test-utils/mockBridge.ts`) updated to the
  new contract: implements the now-required `subscribeField` (broadcast
  style — every listener fires on any state mutation), drops the four
  removed version-string getters, and updates its JSDoc to describe the
  new reactivity model.

- **`renderWithRuntime`** test wrapper docstring updated to describe
  reactivity via `subscribeField` listeners instead of the legacy
  version getters.

- **`Select.test.tsx`** and **`Select.characterization.test.tsx`** mock
  bridges updated: removed the four deprecated assertions, added
  `unregister` / `isDirty` / `subscribeField` to satisfy the required
  surface. `Select.test.tsx`'s wrapper now uses a per-effect notifier
  that wakes subscribed listeners on every relevant RHF state change.

### Documentation

- **README rewritten** to reflect the current API surface:
  - Peer-dep line corrected to `@mui/material@^9.0.0` (was a stale
    `^7.0.0`).
  - Peer-dep versions of `@dashforge/*` updated to `^0.2.0-beta`.
  - Usage example uses the actual exported names (`TextField`,
    `Select`, `Checkbox` — not the fabricated `DashTextField` /
    `DashSelect` / `DashButton` from the old boilerplate).
  - "What you get" section enumerates the real catalog of form inputs
    + layout + feedback primitives + RBAC integration.
  - "Documentation" section linking the package CHANGELOG, top-level
    CHANGELOG, `MIGRATION.md`, and the roadmap.

### Test totals

- `@dashforge/ui`: **484 / 485** passing, 1 skipped (unchanged from
  `0.1.9-alpha`).

### Backwards compatibility

For application code consuming `@dashforge/ui` form components inside a
`DashFormProvider`, no migration is required — component public APIs
are unchanged. Custom test fixtures that rely on a mocked bridge
should be updated to match the new contract; see
[`MIGRATION.md`](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md#019-alpha--020-beta).

## [0.1.9-alpha] — 2026-05-13

### Added

- **3 new unit tests for `DateTimePicker` `lastValidIsoRef` fallback.**
  `src/components/DateTimePicker/DateTimePicker.unit.test.tsx` now
  documents the time-mode editing behavior: (1) the picker preserves
  the last valid ISO when the bridge briefly returns an empty string
  mid-edit (the `||` vs `??` fallback path), (2) the ref stays at the
  last NON-EMPTY ISO across multiple edit cycles, (3) with no previous
  valid ISO the fallback degrades gracefully to "today" without
  crashing. Pure behavioral lockdown of existing code — no source
  change to `DateTimePicker.tsx`.

### Test totals

- `@dashforge/ui`: **484 / 485** passing, 1 skipped (was 481 / 482;
  +3 from the new `lastValidIsoRef` cases).

### Backwards compatibility

No public API change. No behavioral change. No prop signature change
on `DateTimePicker` or any other component. Consumers on `^0.1.8-alpha`
can upgrade to `0.1.9-alpha` with no code change.

## [0.1.8-alpha] — 2026-05-13

### Changed

- **Stale dev warning corrected.** The dev-only `console.warn` emitted by
  `Autocomplete` and `Select` when a stored value can't be resolved against
  the loaded options used to say `"The form value remains unchanged (no
  automatic reset)"`. That hasn't been true since `0.1.6-alpha` — the
  components actually auto-reset the value to `null`. The message now
  accurately reflects the runtime behavior and mentions the version that
  introduced auto-reset.

### Internal

- Packaging: the published tarball now includes `CHANGELOG.md`.

## [0.1.7-alpha] — 2026-05-11

### Changed

- **MUI v9 slotProps migration.** Peer dependency `@mui/material` bumped from
  `^7.0.0` to `^9.0.0`. All 9 form components migrated from the deprecated
  `InputProps` / `inputProps` / `InputLabelProps` / `inputRef` props to the
  v9 `slotProps` API:

  | Old prop          | New location                       |
  | ----------------- | ---------------------------------- |
  | `inputRef`        | `slotProps.htmlInput.ref` (TextField family) or `slotProps.input.ref` (SwitchBase family) |
  | `InputProps`      | `slotProps.input`                  |
  | `inputProps`      | `slotProps.htmlInput`              |
  | `InputLabelProps` | `slotProps.inputLabel`             |

  Touched: `TextField`, `Textarea`, `Select` (via `textField.select.ts`),
  `Autocomplete` (`params.InputProps` → `params.slotProps.input` inside
  `renderInput`), `Checkbox`, `Switch`, `DateTimePicker`. `NumberField` and
  `RadioGroup` did not use the deprecated props internally.

- Non-form components also adapted to v9:
  - `LeftNav`: `PaperProps` → `slotProps.paper`; `ModalProps` → `slotProps.root`.
    Without this, the `role="navigation"` and `data-dash-open` attributes were
    silently dropped under v9.
  - `Snackbar`: `TransitionComponent` → `slots.transition`. Slide `direction`
    prop now flows through `slotProps.transition`.

### Fixed

- Eliminated the four persistent React deprecation warnings that fired on
  every render of every form component under MUI v9 (`InputProps`,
  `inputProps`, `InputLabelProps`, `inputRef`).
- `LeftNav` accessibility: the `role="navigation"` landmark is back.

### Internal

- 19 existing tests in `Snackbar`, `ConfirmDialog` and `LeftNav` updated to
  assert against the new MUI v9 atomic class names (compound classes like
  `MuiAlert-filledSuccess` split into `MuiAlert-filled` + `MuiAlert-colorSuccess`).

## [0.1.6-alpha] — 2026-05-10

### Added

- **Per-field subscriptions** via the new `useDashFieldMeta(name)` hook from
  `@dashforge/forms`. All form components migrate from the legacy
  `void bridge?.errorVersion;`-style global subscribe to per-field subscribe.
  Editing field `B` no longer re-renders field `A`.
- **Auto-reset for unresolved Select / Autocomplete values.** When loaded
  options no longer contain the current value (e.g. a parent field changed
  and a reaction reloaded options for a different scope), the form value is
  now auto-cleared to `null` so the user can pick a valid option.
- **`DateTimePicker.layout` prop** — `'stacked'` (default) or `'inline'`.
  `'floating'` is silently downgraded to `'stacked'` with a dev warning,
  since native date/time inputs always render a placeholder mask that
  overlaps the floating label.

### Fixed

- `useAccessState` hooks-rules violation under React 19 StrictMode (used to
  wrap `useRbac()` in try/catch).
- Memory leak on dynamic field unmount: bridge-bound components now defer
  `bridge.unregister(name)` to `queueMicrotask` so cleanup only fires on
  real unmount, not on every bridge identity change.
- `DateTimePicker` time-mode losing the date component during typing.

## [0.1.5-alpha] and earlier

See git history at <https://github.com/kensaadi/dashforge/commits/main/libs/dashforge/ui>.
