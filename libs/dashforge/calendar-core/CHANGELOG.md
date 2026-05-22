# Changelog — @dashforge/calendar-core

All notable changes to `@dashforge/calendar-core` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

## [0.2.0-beta] — 2026-05-21

### Added

- **`useDateRange`** — a headless date-range-selection hook for Sprint 7
  part 2 of the Calendar Suite. Composes `useCalendar` and layers a range
  state machine on top: a first click sets the range start, a second sets
  the end (auto-swapped if it lands earlier), a third restarts; `hoverDate`
  drives a live preview band. Renders one or more consecutive months
  (`monthCount`, `1` or `2`) so a skin can present a single calendar or a
  side-by-side dual-month range picker. Every cell carries pre-computed
  range flags — `isRangeStart` / `isRangeEnd` / `isInRange` /
  `isRangePreview`.
- New exported types: `DateRange`, `CalendarRangeDay`, `CalendarRangeWeek`,
  `CalendarRangeMonth`, `UseDateRangeOptions`, `UseDateRangeResult`.

## [0.1.0-beta] — 2026-05-20

### Added

- Initial headless calendar engine — Phase 1 of the Calendar Suite build
  (see `libs/dashforge/ui/CALENDAR-SUITE-EVALUATION.md`).
  - `core/` — zero-dependency date utilities: ISO parse/format, calendar
    arithmetic, lexicographic comparison, month-grid construction,
    `Intl`-backed localization, time-string parsing, keyboard key resolution.
  - `react/` — the `useCalendar` hook: a headless month-grid view-model with
    controllable month/year and roving focus, month/year navigation, and
    arrow-key movement.
