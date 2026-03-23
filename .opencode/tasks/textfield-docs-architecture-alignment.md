# Task

Update the full TextField documentation page in the web docs application so it accurately reflects the current TextField architecture and real usage patterns.

# Context

Before implementing any code, you MUST read and comply with:

- /dashforge/.opencode/policies/reaction-v2.md

This policy is mandatory wherever the docs describe or intersect with Reactive V2 behavior.

The TextField component is a core Dashforge primitive and now represents more than a simple wrapper:

- it supports standalone/controlled usage
- it supports DashForm integration through the bridge
- it supports validation gating behavior
- it supports visibleWhen-driven rendering behavior
- it supports multiple layouts
- it acts as the base for composed field behaviors such as Select mode

The current TextField docs may now be partially outdated and must be aligned carefully.

This is a documentation alignment task.
It is NOT a core architecture refactor task.

# Scope

## In scope

Update the documentation files under:

- application name: `web`
- folder name: `web/src/pages/Docs/components/text-field`

Using the current real implementation and the existing docs structure/components as the source to inspect and update.

At minimum, inspect and update the equivalent of:

- `TextFieldDocs.tsx`
- `TextFieldExamples.tsx`
- `TextFieldPlayground.tsx`
- `TextFieldCapabilities.tsx`
- `TextFieldScenarios.tsx`
- `TextFieldApi.tsx`
- `TextFieldNotes.tsx`
- `TextFieldLayoutVariants.tsx`
- any existing `demos/*` used by the TextField docs page
- any playground helpers related to TextField docs

## Out of scope

Do NOT implement in this task:

- new TextField core behavior
- new form engine behavior
- component refactors unrelated to docs/demo correctness
- broad docs redesign
- changes to non-TextField component docs
- new reconciliation behavior
- new validation semantics
- new visibility engine semantics

# Goal

Bring the entire TextField docs page into alignment with the real current TextField architecture so it becomes the authoritative usage guide for developers.

At the end of this task, the TextField docs page must:

- present correct examples
- reflect current supported usage patterns
- avoid outdated or misleading patterns
- clearly explain TextField architecture and responsibilities
- preserve the existing docs page structure and visual system as much as possible

# Rules

1. Read and follow `/dashforge/.opencode/policies/reaction-v2.md`.
2. Do not introduce new core behavior in docs examples.
3. Preserve the existing docs structure unless a change is strictly necessary.
4. Do not leave examples in an outdated architectural state.
5. Prefer real, correct usage over decorative examples.
6. Keep the docs coherent for developers using the component in production.
7. All code comments and JSDoc must be in English.
8. Keep changes surgical but complete.

# Constraints

## Application and folder constraints

- application name: `web`
- folder name: `web/src/pages/Docs/components/text-field`

You must inspect the real current files before proposing changes.
Do not assume current content from memory.

## Documentation alignment constraints

The updated docs must clearly distinguish these usage modes:

### 1. Standalone / controlled usage

The docs must explain and demonstrate TextField as a normal controlled component.
Interactive examples in this category must manage value correctly and not depend on old implicit patterns.

### 2. DashForm integration

The docs must explain and demonstrate TextField inside DashForm with current correct usage.

This should reflect the current bridge-based architecture:

- registration through DashForm
- value binding
- validation state coming from form context
- touched / submit gating behavior

### 3. Visibility behavior

The docs must explain `visibleWhen` accurately.
It should not imply that visibleWhen belongs to the form engine itself.
It must reflect current behavior:

- component-level conditional rendering
- engine-driven predicate
- no misleading claims about automatic orchestration

### 4. Validation behavior

The docs must accurately explain current validation display behavior:

- explicit props precedence
- auto error binding
- touched/submitted gating
- no misleading “always-live validation” claims if not true

### 5. Layout behavior

The docs must accurately explain:

- floating
- stacked
- inline
- the relation between layout and MUI variant

### 6. Select composition note

The docs should make it clear that TextField is also the base for select-mode composition, without turning the page into Select docs.
This should be explanatory, not duplicative.

## API documentation constraints

The API Reference must be updated to reflect the real current API.

At minimum, verify and document:

- `name`
- `rules`
- `visibleWhen`
- `layout`
- explicit `error` / `helperText` precedence
- relevant inherited props
- any current internal behavior that affects practical usage
- current default behavior

Do not leave outdated type or behavior descriptions.

## Content constraints

The page should explain, in a disciplined way:

- TextField is an intelligent Dashforge component, not just a raw MUI wrapper
- standalone usage remains supported
- DashForm integration is first-class
- validation behavior is gated, not noisy
- visibleWhen is component-level but engine-driven
- layout is an architectural concern, not only a styling tweak
- TextField is the foundation for composed field behaviors

## Playground constraints

Inspect the current TextField playground carefully.

Decide whether it should remain focused on:

- visual/layout/state exploration
  or
- broader architectural examples

Prefer keeping the playground simple unless a small correction is necessary.

Do not overcomplicate the playground.

## Demo constraints

Review and update existing demo sections so they accurately reflect:

- controlled usage
- DashForm usage
- validation behavior
- visibility behavior
- layout behavior

Use realistic, working examples.
Do not introduce fake architectural claims.

# Output

Produce the following:

## 1. Implementation plan

Describe exactly which docs files will be updated and why.

## 2. Architecture alignment summary

Explain how the docs will be updated to reflect:

- standalone/controlled usage
- DashForm usage
- validation gating
- visibleWhen behavior
- layout modes
- TextField’s role as a foundation component

## 3. File-by-file plan

For each relevant file, explain:

- application name
- folder name
- filename
- what must change
- why it must change

## 4. Validation strategy

Explain how you will verify:

- examples are correct
- docs are aligned with current implementation
- no outdated patterns remain

## 5. Notes

Explicitly confirm:

- existing docs structure will be preserved as much as possible
- no new core TextField behavior will be introduced
- the docs will become the authoritative reference for current TextField usage

# Suggested implementation sequence

1. Inspect the current TextField docs files in `web/src/pages/Docs/components/text-field`
2. Compare current docs content against the current real TextField implementation
3. Identify all outdated examples and outdated API descriptions
4. Propose the minimum complete set of documentation updates
5. Preserve structure while correcting the architecture narrative
6. Prepare for implementation only after the plan is approved

# Final instruction

Do not write code yet.

This is a PLAN task only.

The purpose is to prepare a careful documentation alignment plan for the TextField docs page so we do not make mistakes in one of the most developer-facing documentation surfaces.
