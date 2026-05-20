# Changelog — @dashforge/calendar-core

All notable changes to `@dashforge/calendar-core` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

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
