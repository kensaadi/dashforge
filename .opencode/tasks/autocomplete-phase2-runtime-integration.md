Task name
autocomplete-phase2-runtime-integration

Read task from
./dashforge/.opencode/tasks/autocomplete-phase2-runtime-integration.md

Mandatory policies
./dashforge/.opencode/policies/reaction-v2.md

Mode
BUILD

Scope
Implement ONLY Phase 2 from the approved plan:

- runtime integration
- optionsFromFieldData
- useFieldRuntime
- loading state handling
- display sanitization
- unresolved value detection
- dev warnings

Constraints

- Do NOT refactor existing structure
- Do NOT modify Phase 1 behavior
- Do NOT implement multiple mode
- Do NOT add async search
- Do NOT expand scope

Success criteria

- all existing Phase 1 tests still passing
- Phase 2 tests added and passing
- typecheck passing
- Reactive V2 policy respected
- no automatic reset
- form value remains source of truth
- unresolved values handled via display sanitization only

Output
./dashforge/.opencode/reports/autocomplete-phase2-runtime-integration-build.md
