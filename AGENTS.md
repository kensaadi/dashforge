# Dashforge Project Rules (Mandatory)

This repository is Dashforge.

CRITICAL:

- You MUST follow the instruction files loaded via opencode.json (they are mandatory).
- All tasks, test names, and code comments must be written in English.

Testing standard:

- TDD-first for every new UI component (tests first, then implementation).
- 0 skipped tests (always).
- No console.log in components.
- No `any`/`as never`/cascading casts in public boundaries.

If asked to create a new component:

1. Write unit tests first (intents)
2. Implement the component
3. Run typecheck + tests and report results

When asked to create a new component, use the template located at:
.opencode/templates/create-ui-component.md
