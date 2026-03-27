# Task

Update the full Select documentation page in the web docs application so it accurately reflects the current Select architecture and real usage patterns after the Reactive V2 work.

# Context

Before implementing any code, you MUST read and comply with:

- /dashforge/.opencode/policies/reaction-v2.md

This policy is mandatory wherever the docs describe or demonstrate Reactive V2 behavior.

The Select component has evolved significantly:

- it supports plain/controlled usage
- it supports DashForm integration
- it supports runtime-driven options via Reactive V2
- it supports generic runtime option shapes through component-level mappers
- it has an approved unresolved-value policy
- it must not imply reconciliation or automatic value reset

The current Select docs page is now outdated in multiple places.
Some examples and docs sections still reflect an older architecture and can mislead developers.

This task is to update the documentation content and examples across the existing Select docs page structure.

# Scope

## In scope

Update the documentation files under:

- application name: `web`
- folder name: `web/src/pages/Docs/components/select`

Using the current real implementation and the provided docs structure/components as the source to inspect and update.

At minimum, inspect and update the equivalent of:

- `SelectDocs.tsx`
- `SelectExamples.tsx`
- `SelectPlayground.tsx`
- `SelectCapabilities.tsx`
- `SelectScenarios.tsx`
- `SelectApi.tsx`
- `SelectNotes.tsx`
- `SelectLayoutVariants.tsx`
- `demos/SelectFormIntegrationDemo.tsx`
- `demos/SelectConditionalDemo.tsx`
- `selectPlayground.helpers.ts`

## Out of scope

Do NOT implement in this task:

- new Select core architecture
- new Reactive V2 engine behavior
- component refactors unrelated to docs/demo correctness
- route changes outside what is strictly necessary for the existing Select docs page
- marketing redesign of the whole docs application
- changes to non-Select component docs
- new form engine semantics
- reconciliation
- automatic value reset

# Goal

Bring the entire Select docs page into alignment with the current real Select architecture so that developers can rely on it as the authoritative usage guide.

At the end of this task, the Select docs page must:

- present correct examples
- reflect current supported usage patterns
- avoid outdated or misleading patterns
- document the current architecture clearly
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
- folder name: `web/src/pages/Docs/components/select`

You must inspect the real current files before proposing changes.
Do not assume current content from memory.

## Documentation alignment constraints

The updated docs must clearly distinguish these usage modes:

### 1. Controlled / standalone usage

The docs must explain and demonstrate that Select can be used as a controlled component.
Examples in this category must not rely on outdated implicit behavior.
If a demo is interactive, it must manage value correctly.

### 2. DashForm integration

The docs must explain and demonstrate Select inside DashForm with current correct usage.

### 3. Reactive V2 / runtime-driven options

The docs must explain and demonstrate that Select now supports runtime-driven options through Reactive V2.

This must include:

- `optionsFromFieldData`
- runtime-driven option loading
- generic option shapes via:
  - `getOptionValue`
  - `getOptionLabel`
  - optionally `getOptionDisabled`

### 4. Unresolved value behavior

The docs must describe the approved policy accurately:

- unresolved values display as empty
- underlying value remains unchanged
- no automatic reconciliation
- no automatic reset
- no user-facing unresolved message
- developer-facing warning behavior is internal/dev-only

Do not describe or imply that the component auto-fixes data.

## Example correctness constraints

The docs examples must no longer rely on outdated Select behavior.

Specifically:

- interactive examples must behave correctly with current Select architecture
- plain examples must not accidentally depend on old uncontrolled behavior
- demos must not imply hidden reconciliation or resets
- examples must not suggest that runtime producers are forced to output `{ value, label }`

## API documentation constraints

The API Reference must be updated to reflect the real current API.

At minimum, verify and document:

- `options`
- `optionsFromFieldData`
- `getOptionValue`
- `getOptionLabel`
- `getOptionDisabled`
- `layout`
- `rules`
- `visibleWhen`
- controlled usage props where relevant
- current default behavior
- current architecture notes

Do not leave outdated type information.

## Docs content constraints

The page should explain, in a disciplined way:

- Select is built on top of TextField
- static options remain supported
- runtime options are now supported
- generic option shape support exists at component level
- unresolved behavior is intentional and architectural
- DashForm integration remains important
- Reactive V2 does not imply automatic reconciliation

## Playground constraints

Inspect the current playground carefully.

Decide whether it should remain:

- static/basic only
  or
- partially updated to reflect the current API more truthfully

But do not overcomplicate the playground.
If you update it, keep it aligned with the real current Select behavior.

## Demo constraints

The demos must help validate the current architecture.

You should review and update the existing demo sections so they accurately reflect:

- controlled usage
- DashForm usage
- conditional visibility
- runtime/reactive positioning where appropriate

Use mock/local examples only if needed.
Do not introduce backend dependencies.

# Output

Produce the following:

## 1. Implementation plan

Describe exactly which docs files will be updated and why.

## 2. Architecture alignment summary

Explain how the docs will be updated to reflect:

- controlled usage
- DashForm usage
- Reactive V2 runtime options
- generic option mappers
- unresolved value policy

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
- no new core Select behavior will be introduced
- the docs will become the authoritative reference for current Select usage

# Suggested implementation sequence

1. Inspect the current Select docs files in `web/src/pages/Docs/components/select`
2. Compare current docs content against the current real Select implementation
3. Identify all outdated examples and outdated API descriptions
4. Propose the minimum complete set of documentation updates
5. Preserve structure while correcting the architecture narrative
6. Prepare for implementation only after the plan is approved

# Final instruction

Do not write code yet.

This is a PLAN task only.

The purpose is to prepare a careful documentation alignment plan for the Select docs page so we do not make mistakes in the most developer-facing documentation surface.
