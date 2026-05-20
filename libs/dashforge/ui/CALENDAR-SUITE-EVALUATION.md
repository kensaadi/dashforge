# Calendar Suite — Architecture Evaluation & Implementation Plan

> Sprint 7 (Part 1) deliverable. **Analysis only — no production code.**
> Target: a custom **date + time + range** picker suite for `@dashforge/ui`
> (MUI side), clean-room, modelled on the Atlassian Design System architecture,
> with an assessment of a shared core reusable by `@dashforge/tw`.

---

## 1. Executive summary & recommendation

The current `DateTimePicker` (both `@dashforge/ui` and `@dashforge/tw`) wraps the
**native HTML date input**. It works, but the picker UI is not controllable,
not themable, has no range selection, no disabled-dates, no inline mode, and
diverges from the Dashforge dark-mode identity.

This document analyses the Atlassian Design System (Atlaskit) `calendar` +
`datetime-picker` packages as an architectural reference and proposes a
**clean-room** Dashforge implementation.

**Key finding from the source analysis:** Atlaskit's calendar logic is
**almost dependency-free** — `date-fns` is used only for `parseISO` in a
min/max comparison and is trivially removable (ISO `YYYY-MM-DD` strings sort
lexicographically). Of 19 calendar source files, **~15 are pure logic** with no
UI coupling; the seam between logic and presentation is the `Week[]` view-model.

**Recommendation:**

1. Build a custom calendar suite **clean-room, zero runtime dependencies**,
   date math hand-rolled, i18n via the built-in `Intl` API.
2. Extract the logic into a **shared headless package `@dashforge/calendar-core`**
   (hooks + utils + types, no UI, no styling) — analogous to the existing
   shared bridge layer (`forms`/`ui-core`/`rbac`).
3. Build **two thin UI skins** on top of that core: MUI components for
   `@dashforge/ui` first, Tailwind components for `@dashforge/tw` after.
4. Ship the suite across a **chain of minor releases** (see §7).

The decision points requiring sign-off are collected in §9.

---

## 2. Current state & gap analysis

### 2.1 What exists today

| | `@dashforge/ui` (MUI) | `@dashforge/tw` (Tailwind) |
|---|---|---|
| Component | `DateTimePicker` (~607 LOC) | `DateTimePicker` (~319 LOC) |
| Render | native `<input type="date\|time\|datetime-local">` inside MUI TextField | native input + tailwind-variants |
| Date library | none | none |
| Calendar/DatePicker/TimePicker/DateRangePicker | **none** | **none** |

### 2.2 The ISO/timezone contract to preserve

`@dashforge/ui/src/components/DateTimePicker/DateTimePicker.tsx` already encodes
a value contract that the new suite **must not regress**:

- **Storage**: ISO 8601 UTC strings (`value` / `onChange` are `string | null`).
- `isoToInputValue` (~lines 96–123): ISO → native input string, mode-aware.
- `inputValueToIso` (~lines 131–195): input string → ISO; `date` mode anchors
  to `T12:00` to dodge DST midnight transitions; `time` mode needs a base date.
- `lastValidIsoRef` (~lines 284, 363–365, 410–421): caches the last valid ISO so
  intermediate invalid keystrokes don't lose the date component.

### 2.3 Gap — what the native input cannot do

- No range (start–end) selection.
- No themable / brand-consistent picker UI; the browser owns the popup.
- No disabled-dates (explicit list or predicate).
- No always-on inline calendar.
- No explicit locale / week-start control.
- Dark-mode inconsistency (the native control follows the OS, not the Dashforge
  theme mode).

---

## 3. Target scope — date + time + range suite

Components the suite must deliver:

| Component | Role |
|---|---|
| `Calendar` | Low-level month-grid primitive (controlled, ISO-based). |
| `DatePicker` | Text input + `Calendar` popup. Single date. |
| `TimePicker` | Time input + options list (12h/24h). |
| `DateTimePicker` | `DatePicker` + `TimePicker` composed; full ISO value. |
| `DateRangePicker` | Start–end date selection (greenfield — see §4.6). |

### 3.1 Feature matrix

| Capability | In scope | Notes |
|---|---|---|
| Month grid, 6-week stable height | ✅ | |
| Keyboard roving focus (arrow keys, grid pattern) | ✅ | WCAG APG date-grid |
| Locale / month-day names | ✅ | via `Intl.DateTimeFormat` |
| Configurable week-start day | ✅ | |
| `minDate` / `maxDate` | ✅ | lexicographic ISO comparison |
| Disabled dates: explicit list + predicate | ✅ | |
| Range selection (start–end, in-range styling) | ✅ | greenfield |
| Time selection: fixed list + free-type | ✅ | |
| 12h / 24h time formats | ✅ | display/parse only; stored 24h |
| Inline (always-on) vs popover mode | ✅ | |
| Preset shortcuts (Today, Last 7 days…) | ⚠️ later | range-picker enhancement |
| Multi-month view | ⚠️ later | range-picker enhancement |

---

## 4. Atlaskit architecture — extracted

Source studied (clean-room, read-only): `@atlaskit/calendar@17.2.20` and
`@atlaskit/datetime-picker@17.8.4` (Apache-2.0), from
`pioug/atlassian-frontend-mirror` → `design-system/{calendar,datetime-picker}`.

### 4.1 `@atlaskit/calendar` decomposition

A single memo + forwardRef component composed of **5 logic hooks**, **5
presentation components**, **4 pure utilities**:

```
calendar.tsx (orchestrator)
├─ logic hooks (no JSX)
│  ├─ useControlledDateState  reconcile controlled/uncontrolled date fields
│  ├─ useHandleDateChange     month/year nav + arrow-key navigate()
│  ├─ useHandleDateSelect     day select + container keydown dispatch
│  ├─ useFocusing             onFocus/onBlur passthrough
│  ├─ useLocale               weekday/month names (via Intl)
│  └─ useGetWeeks             builds the Week[] view-model
│     └─ getBaseCalendar → getDaysInMonth ; dateToString → pad
└─ presentation (JSX + primitives + Compiled CSS)
   ├─ Header        month/year title + prev/next icon buttons
   ├─ WeekHeader    weekday column headers
   ├─ WeekDays      rowgroup; maps Week[] → rows
   └─ Date          single day <button> cell (owns its focus effect)
```

### 4.2 Date model & state

- **Pure numeric model — no persistent `Date` object.** Displayed month is three
  numbers `{ day, month (1-indexed), year }`; selected dates are an
  `Array<ISO string>` (`YYYY-MM-DD`). `Date` is instantiated only transiently
  for day-of-week math, then discarded.
- Controlled vs uncontrolled is reconciled **per field** (`useControlledDateState`):
  if the controlled prop is `undefined`, internal state is used.
- "Now" is captured **once** (lazy ref) so re-renders don't drift defaults.

### 4.3 Date math — `date-fns` is barely used

`date-fns` appears in the calendar **only as `parseISO`**, only inside
`useGetWeeks`, and only **conditionally** (skipped unless `minDate`/`maxDate`
are set). Its sole job: turn ISO strings into `Date` for `<` / `>` comparison.

> Because `YYYY-MM-DD` strings are lexicographically ordered, min/max checks can
> be plain **string comparisons**. **`date-fns` is fully removable.** A
> zero-dependency calendar core is not just feasible — the Atlaskit code is
> already 99% there.

Everything else is hand-rolled: `getDaysInMonth` (the `new Date(y, m+1, 0)`
trick), `getBaseCalendar` (grid generation by raw arithmetic), `dateToString` +
`pad` (ISO formatting by string concat), month rollover (integer branching).

### 4.4 Week-grid, keyboard, a11y

- **Grid**: `getBaseCalendar` builds a flat day array with leading/trailing
  sibling-month days; the grid is forced to a constant **6 rows** so height
  never jumps; `useGetWeeks` chunks it into `Week` objects, each day carrying
  flags (`isDisabled`, `isFocused`, `isSelected`, `isToday`, `isSiblingMonth`).
- **Keyboard**: container is `role="grid"`; keydown dispatches `Enter`/`Space`
  → select, arrows → `navigate(dir)` with month/year rollover. **Roving
  tabindex**: only the focused day is `tabIndex 0`, all others `-1`; focus is
  *declarative* — a `useEffect` calls `.focus()` on the focused cell.
- **a11y**: full ARIA grid pattern (`grid` / `rowgroup` / `row` / `columnheader`
  / `gridcell`); each day button has `aria-label`, `aria-current="date"`,
  `aria-disabled`, `aria-pressed`. The header uses an `aria-live` region that
  stays inert on mount and becomes `polite` only after the first navigation.

### 4.5 i18n

`useLocale` delegates to `@atlaskit/locale`, a thin wrapper over the browser
**`Intl.DateTimeFormat`**. No hardcoded month/day names; the BCP-47 locale
string flows straight to `Intl`. `weekStartDay` rotates the weekday arrays.

### 4.6 `@atlaskit/datetime-picker` architecture

- **DatePicker**: renders `@atlaskit/select` (react-select) as the combobox and
  **injects `@atlaskit/calendar` as the select's custom `Menu`** — the calendar
  popup *is* the select menu. Typed text moves the calendar view; the value is
  committed on Enter / day click. Positioning via `@atlaskit/popper` (legacy) or
  the native top-layer Popover API (behind a feature flag).
- **TimePicker**: a **fixed list of time options** (default 09:00–18:00, 30-min
  steps) by default; switches to a *creatable* (free-type) select when
  `timeIsEditable`. Time parsing is hand-rolled regex + a 12h→24h conversion
  table. Value stored as 24h `HH:mm`; 12h is display/parse only.
- **DateTimePicker**: renders `DatePicker` + `TimePicker` side-by-side, owns the
  composite state, recombines into a full ISO string, emits only when **both**
  date and time are present.
- **ISO contract**: date `YYYY-MM-DD`; datetime `${date}T${time}${zone}`. There
  is **no real timezone engine** — the zone is a string suffix; DST is
  effectively delegated to the consumer via a `parseValue` prop.
- **Range: none.** Atlaskit's suite is strictly single-date. The calendar's
  `selected` is always a one-element array. **Range is greenfield for us.**

### 4.7 Logic / presentation seam — the headless extraction

Of 19 calendar source files, **~15 are pure logic** (4 framework-free utils + 6
hooks with no JSX/styling + types/constants). Only the 5 `internal/components/*`
files and the JSX half of `calendar.tsx` are presentation. **The seam is the
`Week[]` view-model.** A headless `useCalendar` hook can return the `Week[]`
data (each cell pre-flagged) plus handlers; a UI skin only maps that to rows and
applies its own styling. The one cross-cutting concern is the roving-focus
effect — the core surfaces `isFocused` / `shouldSetFocus` per cell, each skin
wires its own focus ref.

> **Conclusion: a UI-agnostic headless core is a realistic, low-risk extraction.
> Atlaskit's own architecture practically invites it.**

---

## 5. Blueprint — clean-room implementation for `@dashforge/ui`

### 5.1 Layering

```
@dashforge/calendar-core  (NEW, headless — no UI, no styling, zero deps)
   ├─ date utils      pure functions, ISO-string based
   ├─ useCalendar     month-grid view-model + nav + keyboard
   ├─ useCalendarRange  range selection state
   ├─ useTimeOptions  time list generation + parsing
   └─ Intl locale adapter
        │
        ├──────────────► @dashforge/ui skin   (MUI primitives + useDashTheme)
        └──────────────► @dashforge/tw skin   (tailwind-variants + Radix)   [later]
```

### 5.2 `_shared/date/` — the date utility module

Zero-dependency, pure functions (no `date-fns`):

- `getDaysInMonth(year, month)`
- `buildMonthGrid(year, month, weekStartDay)` → flat cell array (6×7)
- `chunkIntoWeeks(cells, weekStartDay)` → `Week[]`
- `toISODate({y,m,d})` / `parseISODate(iso)` — string ↔ numeric
- `compareISO(a, b)` — lexicographic, replaces `date-fns` min/max checks
- `addDays` / `addMonths` — integer math
- `isToday`, `isSameDay`, `isInRange`
- Time: `generateTimeOptions(step)`, `parseTimeString`, `to24h`, `formatTime`

### 5.3 `useCalendar` headless hook

Inputs: `month`, `year`, `selected`, `minDate`, `maxDate`, `disabled[]`,
`disabledDateFilter`, `weekStartDay`, `locale`.
Returns: `weeks: Week[]` (pre-flagged cells), `monthLabel`, `yearLabel`,
`goToNextMonth/PrevMonth`, `navigate(dir)`, `selectDate(iso)`, `focusedDate`,
`onContainerKeyDown`. Mirrors Atlaskit's hook composition, rewritten original.

### 5.4 MUI skin (`@dashforge/ui`)

- **`Calendar`** — renders `weeks` with `@mui/material` primitives + `useDashTheme()`
  tokens; ARIA grid pattern; roving focus. Standalone (inline) usable.
- **`DatePicker`** — pair the existing Dashforge text input with a `Calendar` in
  a popup. **Do not** adopt react-select (Atlaskit's choice); use
  `@mui/material` `Popover`/`Popper` for the popup (an overlay *component*, not a
  date library — consistent with the "no MUI picker libraries" constraint).
- **`TimePicker`** — a time-options list; evaluate building on the existing
  `@dashforge/ui` `Select` / `Autocomplete` vs a bespoke list (see §8).
- **`DateTimePicker`** — compose `DatePicker` + `TimePicker`; recombine to ISO;
  **preserve the §2.2 contract** (UTC storage, `T12:00` date anchor,
  last-valid-ISO fallback).
- **`DateRangePicker`** — greenfield: a 2-element `selected` model, in-range cell
  styling between start and end, two-step selection (pick start, then end).
- Integration: bridge forms (`DashFormContext` → `bridge.register` →
  `useDashFieldMeta` → `resolveValidationState`), RBAC (`useAccessState`),
  `FieldLayoutShell` for label/helper/error/layout, theming via `useDashTheme`.
- **Migration**: keep the native `DateTimePicker` until the custom suite reaches
  parity; introduce the new components additively, deprecate later.

---

## 6. Shared core & portability to `@dashforge/tw`

### 6.1 The three options

| Option | Description |
|---|---|
| **(i) Shared headless core** | New package `@dashforge/calendar-core` — hooks + date utils + types, **no UI, no styling**. Both `@dashforge/ui` and `@dashforge/tw` build thin skins on it. |
| **(ii) Duplicate per ecosystem** | Implement the calendar logic twice, once in each package — as tokens/themes/components are duplicated today. |
| **(iii) MUI only now** | Build for `@dashforge/ui` only; defer the tw side and decide later. |

### 6.2 Tension with the isolation principle

Dashforge's architecture states: *the two UI ecosystems are fully isolated; only
the bridge layer (`forms` + `ui-core` + `rbac`) is shared.*

A calendar **core** as proposed in option (i) is **logic-only** — hooks, pure
date functions, types. It renders **no styled UI**. That makes it structurally
the same kind of artifact as the bridge layer, which is *already* a sanctioned
shared exception. The isolation principle bans shared **UI/presentation** (so it
can't leak one ecosystem's look into the other); it does not ban shared
**logic**. A headless `@dashforge/calendar-core` therefore **extends** the
existing shared-logic layer rather than violating the principle.

The Atlaskit analysis (§4.7) is direct evidence the seam is clean: 15/19 files
are already pure logic.

### 6.3 Recommendation

**Option (i)** — build `@dashforge/calendar-core` as a headless package, with
two skins. But **phase it**: build the MUI skin first (validating the core
against a real consumer), then the tw skin. This avoids designing the core in a
vacuum while still committing to a single source of truth for the hard parts
(date math, grid, keyboard, a11y, i18n, range logic). Option (ii) duplicates the
most bug-prone code (DST, range, keyboard) — rejected. Option (iii) is the
fallback if the user prefers strict isolation over a new shared package.

---

## 7. Effort estimate & phasing

Phased into a chain of **minor releases**. Sizes are relative (S/M/L).

| Phase | Deliverable | Package(s) | Size |
|---|---|---|---|
| 1 | `@dashforge/calendar-core` — date utils, `useCalendar`, types, unit tests | new pkg | **L** |
| 2 | MUI `Calendar` + `DatePicker` | `@dashforge/ui` minor | **L** |
| 3 | MUI `TimePicker` + custom `DateTimePicker` (replaces native) | `@dashforge/ui` minor | **M** |
| 4 | MUI `DateRangePicker` (+ `useCalendarRange` in core) | `@dashforge/ui` minor | **M** |
| 5 | tw skin — `Calendar`/`DatePicker`/`TimePicker`/`DateTimePicker`/`DateRangePicker` | `@dashforge/tw` minor(s) | **L** |
| 6 | Docs + StackBlitz examples (both docs sites) | docs-lab | **M** |

Each phase is independently shippable and additive. The native `DateTimePicker`
stays available until phase 3 reaches parity.

---

## 8. Risks & open questions

- **Timezone / DST.** Atlaskit punts (zone as a string suffix). The current
  Dashforge native `DateTimePicker` does *more* (the `T12:00` anchor,
  last-valid-ISO fallback). The suite must keep at least today's behaviour;
  going further (full TZ support) without a date library is hard — `Intl` +
  careful UTC arithmetic is the zero-dep path. **Decision needed:** match
  current behaviour, or invest in fuller TZ handling.
- **i18n week-start.** `Intl.DateTimeFormat` gives month/day names reliably.
  Automatic week-start per locale needs `Intl.Locale.weekInfo`, which has
  uneven browser support — fall back to an explicit `weekStartDay` prop.
- **a11y.** The WCAG APG date-grid pattern (roving focus, `aria-live`) must be
  hand-built; `@dashforge/tw` has no roving-focus precedent.
- **TimePicker base.** Build on the existing `Select` / `Autocomplete` of each
  ecosystem, or a bespoke list? Reuse is faster but couples the time picker to
  those components' quirks. **Decision needed.**
- **Bundle.** Zero runtime dependencies → negligible footprint; the cost is our
  own code + maintenance.
- **New shared package.** `@dashforge/calendar-core` needs sign-off as an
  extension of the shared-logic layer (see §6.2).

---

## 9. Decision required

To proceed to the build sprint, please confirm:

1. **Approach** — clean-room, zero runtime dependencies, date math hand-rolled,
   i18n via `Intl`. (Recommended.)
2. **Shared core** — approve `@dashforge/calendar-core` as a new **headless**
   shared package (option (i), §6) — or fall back to option (ii)/(iii).
3. **Phasing** — the 6-phase chain of minor releases in §7.
4. **Timezone** — match the current native behaviour (recommended), or scope
   fuller TZ handling.
5. **TimePicker** — build on existing `Select`/`Autocomplete`, or bespoke.

On approval, this generates the build sprint (starting with Phase 1).

---

*Reference material: `@atlaskit/calendar@17.2.20`, `@atlaskit/datetime-picker@17.8.4`
(Apache-2.0), studied clean-room from a sparse checkout of
`pioug/atlassian-frontend-mirror`. No Atlaskit code is copied into Dashforge.*
