Task name
autocomplete-phase2-sanitization-fix

Read task from
./dashforge/.opencode/reports/autocomplete-architecture-review-plan.md

Mandatory policies
./dashforge/.opencode/policies/reaction-v2.md

Mode
BUILD

Scope
Fix ONLY display sanitization logic.

Requirements

1. Remove type-based logic:

- DELETE any logic based on typeof value (string/number)

2. Implement correct rule:

IF optionsFromFieldData === true AND runtime.status === 'ready':

- IF value matches normalizedOptions → show option
- ELSE → display null (sanitize)

ELSE:

- preserve current freeSolo behavior

3. Preserve:

- no form value mutation
- no automatic reset
- current freeSolo behavior in static mode

4. Tests

- Ensure existing test still passes
- Add test for:
  string unresolved value in runtime → MUST be sanitized

Constraints

- Do NOT refactor
- Do NOT change API
- Do NOT touch other logic

Success criteria

- all tests passing
- correct sanitization behavior (type-independent)

Output
./dashforge/.opencode/reports/autocomplete-phase2-sanitization-fix-build.md
