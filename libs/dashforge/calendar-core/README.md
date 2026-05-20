# @dashforge/calendar-core

Headless calendar engine for Dashforge — the UI-agnostic logic layer behind the
date / time / range picker suites.

It ships **pure date math**, the **month-grid view-model**, and the
**`useCalendar`** React hook. It renders nothing and styles nothing: the
`@dashforge/ui` (MUI) and `@dashforge/tw` (Tailwind) calendar suites build their
own presentation layers on top of this single source of truth.

## Design contract

- **Zero runtime dependencies.** Date math is hand-rolled; `Date` is used only
  transiently and always in UTC, so results are timezone-independent.
  Localization uses the built-in `Intl` API.
- **Headless.** No JSX, no styling, no DOM coupling. `useCalendar` returns a
  data view-model (`weeks`) plus action callbacks.
- **ISO string model.** Dates are `YYYY-MM-DD` strings. Min/max comparisons rely
  on the fact that such strings sort chronologically under lexicographic order.

## Surface

- `core/` — pure functions: `toISODate` / `parseISODate`, `getDaysInMonth`,
  `addDays` / `addMonths`, `compareISODate`, `buildMonthGrid`, `Intl`-backed
  locale helpers, time-string parsing, keyboard key resolution.
- `react/` — the `useCalendar` hook.

This package is part of the shared logic layer; it is not tied to either UI
ecosystem.
