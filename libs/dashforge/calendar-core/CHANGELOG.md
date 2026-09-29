# Changelog — @dashforge/calendar-core

All notable changes to `@dashforge/calendar-core` are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
with `-alpha` / `-beta` / `-rc` pre-release tags.

## [2.0.1] — 2026-09-29

Lockstep release. This package is unchanged; it moves because internal
dependencies are declared with `workspace:*`, which pnpm rewrites at pack time
to the EXACT sibling version. Leaving it on 2.0.0 would pin its siblings to a
version carrying the `@dashforge/ui-core` defect this release fixes.

See [`@dashforge/ui-core` 2.0.1](https://github.com/kensaadi/dashforge/blob/main/libs/dashforge/ui-core/CHANGELOG.md)
for what was actually wrong.

### Fixed

- **The exported `VERSION` constant told the truth again.** It had drifted
  from `package.json` and stayed there, because `prepare-release.mjs` only
  rewrote it when it already matched, which made the first drift permanent.
  `ui-core` and `forms` were publishing `'0.2.3-beta'`, `calendar-core` and
  `tw-theme` and `tw-tokens` `'0.2.0-beta'`, and `tw` `'1.5.2'`, all on 2.0.0.
  The script rewrites it unconditionally now and says so when it had drifted.

- **A type-test declaration no longer rides along in the tarball.** The
  `exclude` patterns matched `*.test.ts` with a dot, and these files spell it
  with a hyphen: `path.type-test.ts`, `autocomplete.props.type-test.ts`. The
  `__tests__` directory is excluded as a directory now, alongside the hyphen
  spelling.

## [2.0.0] — 2026-09-28

**Every `@dashforge/*` package moves to `2.0.0` together.** Until now each
library carried its own number and there was no single version to name.
The lockstep is not a preference: internal dependencies are declared with
`workspace:*`, which pnpm rewrites at pack time to the EXACT sibling
version, so publishing a subset would pin a 2.0.0 package to whichever 1.x
its siblings happened to be at, and a consumer resolving two copies of the
engine is a duplicate-React-context failure.

**What this means for you:** upgrade all `@dashforge/*` packages in the
same step. A mixed 1.x / 2.0.0 install will not resolve.

No functional change. This package's public surface is identical to
`1.0.0`; the major is the workspace-wide alignment described below.

### Fixed

- **A clean checkout could not be built, and a package built from one
  shipped without its types.** `tsBuildInfoFile` sat at the project root
  instead of inside `dist`, so deleting `dist` left the incremental cache
  behind. `tsc --build` then read a valid cache describing declarations
  that no longer existed, declared the project up to date and emitted
  nothing, and any dependent failed with `TS6305`. It survived this long
  only because nothing had ever wiped `dist`: every run reused the
  previous one's output. Verified by deleting every `dist`,
  `.tsbuildinfo` and `out-tsc` in the workspace and building from there.

### Changed

- **Declaration output is deterministic.** `@nx/rollup` hard-codes
  `declaration: true` and `rootDir: projectRoot`, so the bundler emitted a
  second full copy of every declaration under `dist/src` plus a one-line
  `dist/index.d.ts` re-export wrapper, while `tsc` emitted the real flat
  tree. Whichever target ran last decided what the package published.
  `typecheck` now always runs after `build`, emits the declarations and
  drops the copy it makes redundant.

- Build artefacts (`*.d.ts.map`, `*.tsbuildinfo`) are excluded from the
  published tarball.

## [1.0.0] — 2026-05-23

**Stable release.** First semver-stable version. The public API is now
governed by strict semver — any future breaking change requires a major
bump. Functionally identical to the previous beta tarball.

- Version: `1.0.0`
- Cross-package `@dashforge/*` peer-dependency ranges updated to `^1.0.0`.
- See the [top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md#100---2026-05-23) for the coordinated release context.
- See [`MIGRATION.md`](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md) for the upgrade guide from any `0.x-beta` to `1.0.0` (no code changes required).

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

- Initial headless calendar engine — Phase 1 of the Calendar Suite build.
  - `core/` — zero-dependency date utilities: ISO parse/format, calendar
    arithmetic, lexicographic comparison, month-grid construction,
    `Intl`-backed localization, time-string parsing, keyboard key resolution.
  - `react/` — the `useCalendar` hook: a headless month-grid view-model with
    controllable month/year and roving focus, month/year navigation, and
    arrow-key movement.
