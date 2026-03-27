Task name
autocomplete-architecture-review

Plan source
./autocomplete-architecture-review.md

Mandatory policies
./dashforge/.opencode/policies/reaction-v2.md

Mode
PLAN

Output file
./dashforge/.opencode/reports/autocomplete-architecture-review-plan.md

Instructions

1. Read the task definition:
   ./autocomplete-architecture-review.md

2. Read and strictly enforce the policy:
   ./dashforge/.opencode/policies/reaction-v2.md

3. Analyze the task in the context of the current Dashforge system:

   - libs/dashforge/ui/src/components/TextField/TextField.tsx
   - libs/dashforge/ui/src/components/TextField/textField.select.ts
   - libs/dashforge/ui/src/components/TextField/textField.types.ts
   - libs/dashforge/ui/src/components/Select/Select.tsx

4. Use as behavioral reference:

   - uploaded file: AutocompleteDataField.tsx

5. Produce a complete architecture review and implementation plan as defined in the task file.

6. Respect the Dashforge Task Flow Policy:

   - This is PLAN phase only
   - Do NOT write implementation code
   - Do NOT generate patches or diffs
   - Do NOT modify files

7. Be critical and explicit:

   - Challenge weak assumptions
   - Identify architectural risks
   - Highlight missing decisions
   - Reject implicit behavior

8. Enforce Dashforge architectural principles:

   - Component = display layer only
   - Engine / form = source of truth
   - No reconciliation
   - No automatic reset
   - No hidden side effects
   - Runtime state is separate from form state
   - UI may sanitize display but MUST NOT mutate data

9. Validate polymorphism requirement:

   The Autocomplete must:

   - work standalone (controlled/uncontrolled)
   - work inside DashForm (bridge-controlled)
   - share a single internal pipeline

10. Validate internal model:

Explicitly evaluate the need for a normalized option model:

- value
- label
- raw
- optional disabled

11. Validate runtime behavior:

Explicitly define:

- optionsFromFieldData
- loadingFromFieldData
- unresolved value handling
- freeSolo vs option-derived value

12. Validate source of truth:

Clearly define:

- standalone mode
- DashForm mode
- invalid combinations
- dev warnings

13. Compare explicitly:

- TextField (foundation)
- Select (integration pattern)
- AutocompleteDataField.tsx (real-world behavior)

14. Produce output EXACTLY in the structure defined in the task.

15. Save the result to:

./dashforge/.opencode/reports/autocomplete-architecture-review-plan.md
