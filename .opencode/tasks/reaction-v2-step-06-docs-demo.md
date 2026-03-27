# Task

Integrate a real Reactive V2 demo page into the docs application and wire it into the docs routes, so we can validate the current Reactive V2 architecture end-to-end before extending the pattern to other components.

# Context

Before implementing any code, you MUST read and comply with:

- /dashforge/.opencode/policies/reaction-v2.md

This policy is mandatory.
If any part of this task appears to conflict with the policy, the policy takes precedence.

Reactive V2 foundations are already implemented across previous steps:

- runtime store
- reaction engine
- real field-change wiring
- Select runtime integration
- unresolved-value policy

Before extending Reactive V2 to other components, we want an intermediate validation step:
a real demo page inside the docs app that proves the current architecture works correctly in practice.

This is NOT a refactor task.
This is a docs/demo integration task with real working examples.

# Scope

## In scope

1. Create a docs page component at:

   - application name: `docs`
   - folder name: `docs/src/pages/reactions-v2`
   - filename: `ReactionV2.tsx`

2. Integrate the page into the docs routing system at:

   - application name: `docs`
   - folder name: `docs/app`
   - filename: `app.tsx`

3. Preserve the current docs application structure and conventions
4. Add a small set of focused Reactive V2 examples on the page
5. Use the real current Reactive V2 implementation already present in the codebase
6. Make the examples useful to manually verify that the current architecture behaves correctly

## Out of scope

Do NOT implement in this task:

- new Reactive V2 core features
- new reaction engine semantics
- component refactors unrelated to the demo page
- broad docs redesign
- final marketing documentation
- unresolved-value UX changes
- reconciliation
- automatic value reset
- visibleWhen architecture changes

# Goal

Create a real docs validation page for Reactive V2 so we can manually verify the current implementation before extending the pattern to additional components.

At the end of this task, the docs app must contain:

- a new `ReactionV2.tsx` page
- a route connected from `docs/app/app.tsx`
- a small set of live examples that prove the current Reactive V2 flow works correctly

# Rules

1. Read and follow `/dashforge/.opencode/policies/reaction-v2.md`.
2. Do not introduce new core architecture decisions in this task.
3. Do not refactor existing components unless strictly necessary for wiring the docs demo.
4. Preserve the existing docs application structure.
5. Keep the demo examples focused and useful.
6. Prefer real working examples over decorative UI.
7. All code comments and JSDoc must be in English.
8. Keep the implementation surgical.

# Constraints

## Application and file constraints

### Docs page component

- application name: `docs`
- folder name: `docs/src/pages/reactions-v2`
- filename: `ReactionV2.tsx`

### Docs app routing

- application name: `docs`
- folder name: `docs/app`
- filename: `app.tsx`

You must inspect the current docs app routing and page structure before making changes.
Do not assume naming or route patterns without reading the real files.

## Demo content constraints

The page must include a few concrete live examples to verify Reactive V2 behavior.

At minimum, include examples equivalent to:

### Example 1 — Country → Province

Purpose:

- verify Select runtime options loading
- verify reaction execution on field change
- verify dependent options update

Behavior:

- selecting a country changes province options
- province uses runtime-driven options

### Example 2 — Country → Province → City

Purpose:

- verify chained reactions
- verify multiple runtime-driven selects
- verify real field-change flow across more than one dependency level

Behavior:

- country changes province options
- province changes city options

### Example 3 — Unresolved value scenario

Purpose:

- verify current unresolved-value policy
- confirm field remains visually empty when current value cannot be resolved
- confirm demo behavior is aligned with current architecture

This example must remain aligned with the current approved policy:

- no automatic reset
- no reconciliation
- no user-facing unresolved message
- dev warning behavior remains internal/dev-only

### Example 4 — Generic option shape with mappers

Purpose:

- verify that runtime options are not locked to `{ value, label }`
- confirm component-level mapping works correctly

Behavior:

- runtime options use a custom shape such as `{ id, name, active }`
- Select uses `getOptionValue`, `getOptionLabel`, and optionally `getOptionDisabled`

## Demo design constraints

The page should be practical, not overdesigned.

It should help us verify:

- field changes trigger reactions
- runtime options update correctly
- Select integration works
- unresolved behavior is correct
- generic option shapes work

Use a layout that is clear enough for testing, but do not turn this into a visual redesign task.

## Data constraints

Use local/mock async data sources where appropriate.
The point is to validate architecture and behavior, not backend integration.

Examples should be deterministic and easy to understand.

## Routing constraints

The new page must be reachable through the existing docs application routing structure.
Do not break existing routes.
Follow the current docs route conventions exactly.

# Output

Produce the following:

## 1. Implementation

Add the new docs page and wire it into the docs routes.

## 2. File-by-file report

At the end, provide a report with:

- application name
- folder name
- filename
- what changed
- why it changed

## 3. Example summary

List the examples added on the page and what each one verifies.

## 4. Validation

Run and report:

- typecheck
- relevant tests
- any manual verification notes if appropriate for the docs demo

## 5. Notes

Explicitly confirm:

- docs structure was preserved
- route was added correctly
- no new core Reactive V2 behavior was introduced
- the page uses the existing approved architecture

# Suggested implementation sequence

1. Inspect current docs route structure in `docs/app/app.tsx`
2. Inspect existing docs pages to match structure and style
3. Create `docs/src/pages/reactions-v2/ReactionV2.tsx`
4. Add the new route in `docs/app/app.tsx`
5. Add the live Reactive V2 examples
6. Validate manually and via typecheck/tests
7. Produce final report

# Final instruction

Do not go beyond this step.

Do not extend Reactive V2 to additional components in this task.

This task is only for:

- docs demo integration
- route wiring
- real example validation

aligned with:

`/dashforge/.opencode/policies/reaction-v2.md`
