Goal
Create a comprehensive implementation plan for an Autocomplete component stress testing page in the internal docs app, following the existing documentation architecture patterns used in pages/reactions-v2/ and pages/form-stress/.
Instructions
Task Details:

- Task name: autocomplete-docs-stress-page
- Mode: PLAN (no implementation, only planning)
- Task file: ./dashforge/.opencode/tasks/autocomplete-docs-stress-page.md
- Mandatory policy: ./dashforge/.opencode/policies/reaction-v2.md
- Output file: ./dashforge/.opencode/reports/autocomplete-docs-stress-page-plan.md
  Key Constraints:
- This is PLAN mode only - no code implementation, no file modifications, no patches
- Must follow existing docs app architecture patterns from reactions-v2 and form-stress pages
- Must respect Reactive V2 policy (no automatic reset, display-only sanitization)
- Focus on stress testing / playground environment (NOT final public docs yet)
- Must include only currently supported Autocomplete features (NO out-of-scope features like multiple selection or async search)
  Scope Requirements:
  The plan must define:

1. Where the new page should live
2. Which files should be created
3. How examples should be split
4. How to align with existing docs app architecture
5. Which Autocomplete scenarios must be demonstrated and stress-tested
   Supported Autocomplete Features (Current Scope):

- Static options
- FreeSolo behavior
- Generic options with mappers (getOptionValue, getOptionLabel, getOptionDisabled)
- Bound usage with DashForm
- Runtime options via Reactive V2 (optionsFromFieldData)
- Loading state
- Unresolved value behavior / display sanitization
- Dev warnings for misuse scenarios
  Out of Scope (Must NOT include):
- Multiple selection mode
- Async search
- Remote filtering
- Speculative future APIs
  Discoveries
  Existing Docs Architecture Patterns
  From exploration of docs/src/pages/ structure:

1. Page Structure Pattern:
   - Main page component is a shell/container (e.g., ReactionV2.tsx, FormStressPage.tsx)
   - Uses MUI Box + Stack for layout with consistent maxWidth
   - Header with title + description
   - Optional Alert for policy notices
   - Composed of multiple example components (not monolithic)
2. Example Component Pattern:
   - Each example is self-contained in its own file
   - Uses ExampleSection wrapper for consistent styling (Paper + title + description)
   - Contains own DashForm instance, type interfaces, and reaction definitions
   - Mock data imported from separate mockDataSources.ts file
3. File Organization:
   - Flat structure with clear naming (no nested subdirectories)
   - Pattern: pages/<page-name>/ containing:
     - Main page component (<PageName>.tsx)
     - Reusable section wrapper (ExampleSection.tsx)
     - Mock data file (mockDataSources.ts)
     - Individual example components (\*Example.tsx)
     - Barrel export (index.ts)
4. Routing Pattern:
   - Pages registered in docs/src/app/app.tsx in <Routes>
   - TopNav includes link to page
   - Simple route paths (e.g., /form-stress, /reactions-v2)
   - Page imported via barrel export
5. Mock Data Pattern:
   - Centralized in mockDataSources.ts
   - Async functions with simulated delays (delay() helper)
   - Deterministic data (no randomness)
   - TypeScript interfaces for custom shapes
   - Example: fetchProvinces(), fetchCities(), etc.
     Autocomplete Component Current State
     From Phase 1 & Phase 2 implementation:

- Component is stable: 33/33 tests passing, typecheck passing
- Supports generic types: <Autocomplete<TValue, TOption>>
- Runtime integration complete with optionsFromFieldData prop
- Display sanitization implemented (mode-based: runtime vs static)
- Unresolved value detection with dev warnings
- Loading state disables component
- FreeSolo mode always active (allows arbitrary text input)
  Key API Props:
  interface AutocompleteProps<TValue, TOption> {
  name: string;
  options: TOption[];
  optionsFromFieldData?: boolean; // Phase 2: Runtime integration
  getOptionValue?: (option: TOption) => TValue;
  getOptionLabel?: (option: TOption) => string;
  getOptionDisabled?: (option: TOption) => boolean;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  visibleWhen?: (engine: Engine) => boolean;
  // ... other props
  }
  Reactive V2 Policy Key Points
- §1.5: No automatic reconciliation - form values never reset automatically
- §3.4: No UI messaging for unresolved values (no error messages shown to user)
- Display sanitization is UI-only (form state unchanged)
- Dev warnings emitted in dev mode only, deduplicated per bridge instance
  Accomplished
  ✅ Completed

1. Architecture Research:
   - Explored existing docs pages (reactions-v2, form-stress)
   - Identified clear patterns for page structure, examples, and routing
   - Understood mock data organization
   - Reviewed routing setup in app.tsx
2. Autocomplete Component Review:
   - Read component interface and props
   - Understood current supported features
   - Verified Phase 2 runtime integration is complete
   - Confirmed display sanitization logic
3. Plan Creation (IN PROGRESS):
   - Drafted comprehensive implementation plan following template structure
   - Defined 9 files to be created in pages/autocomplete-stress/
   - Specified 7 example scenarios with clear responsibilities
   - Created 3 implementation phases with time estimates
   - Included validation checklist and success criteria
     📝 Plan Structure (Completed Draft)
     Recommended folder structure:
     docs/src/pages/autocomplete-stress/
     ├── AutocompleteStressPage.tsx # Main page shell
     ├── ExampleSection.tsx # Reusable section wrapper
     ├── mockDataSources.ts # Mock data + helpers
     ├── StaticOptionsExample.tsx # Example 1: Basic static options
     ├── FreeSoloExample.tsx # Example 2: FreeSolo behavior
     ├── GenericOptionsExample.tsx # Example 3: Generic options with mappers
     ├── RuntimeOptionsExample.tsx # Example 4: Runtime options (Reactive V2)
     ├── LoadingStateExample.tsx # Example 5: Loading state
     ├── UnresolvedValueExample.tsx # Example 6: Unresolved value policy demo
     ├── DisabledOptionsExample.tsx # Example 7: Disabled options
     └── index.ts # Barrel export
     Implementation phases:

- Phase 1: Page Scaffold (2-3 hours) - Create structure and routing
- Phase 2: Examples Implementation (6-8 hours) - Build all 7 examples
- Phase 3: Verification & Cleanup (2-3 hours) - Test, validate, polish
  ❌ Blocked: Cannot Write Plan File
  Issue: Attempted to write plan to ./dashforge/.opencode/reports/autocomplete-docs-stress-page-plan.md but received permission error.
  Error: Tool call denied - edit permission denied for reports directory pattern.
  Workaround needed: Plan content is complete and ready, but requires different approach to persist it.
  Relevant Files / Directories
  Files Read (for research)
- ./dashforge/.opencode/tasks/autocomplete-docs-stress-page.md - Task specification
- ./dashforge/.opencode/policies/reaction-v2.md - Reactive V2 policy (sections on sanitization, reconciliation)
- ./dashforge/docs/src/pages/form-stress/FormStressPage.tsx - Example page pattern
- ./dashforge/docs/src/pages/form-stress/StressSection.tsx - Section wrapper pattern
- ./dashforge/docs/src/pages/reactions-v2/ReactionV2.tsx - Main page shell pattern
- ./dashforge/docs/src/pages/reactions-v2/ExampleSection.tsx - Reusable section component
- ./dashforge/docs/src/pages/reactions-v2/mockDataSources.ts - Mock data pattern
- ./dashforge/docs/src/pages/reactions-v2/CountryProvinceExample.tsx - Example component pattern
- ./dashforge/docs/src/pages/reactions-v2/UnresolvedValueExample.tsx - Unresolved value demo
- ./dashforge/docs/src/pages/reactions-v2/index.ts - Barrel export pattern
- ./dashforge/docs/src/app/app.tsx - Routing setup (lines 414-429)
- ./dashforge/libs/dashforge/ui/src/components/Autocomplete/Autocomplete.tsx - Component API (lines 1-150)
  Directories Referenced
- ./dashforge/docs/src/pages/ - All docs pages
- ./dashforge/docs/src/pages/reactions-v2/ - Primary pattern reference
- ./dashforge/docs/src/pages/form-stress/ - Secondary pattern reference
  Target Output File (NEEDS WRITING)
- ./dashforge/.opencode/reports/autocomplete-docs-stress-page-plan.md - Complete plan draft ready but blocked from writing
  Future Files to Create (from plan)
- ./dashforge/docs/src/pages/autocomplete-stress/ - New directory to create
- All 9 files listed above in "Plan Structure" section
  What Needs to Happen Next

1. Resolve file write issue: Find correct way to persist the plan report (may need different file location or permission)
2. Review plan: Once written, plan should be reviewed for completeness
3. Get approval: Verify plan aligns with team expectations before BUILD phase
4. Transition to BUILD mode: After plan approval, switch to implementation task with BUILD mode to actually create the stress page
   The plan is conceptually complete and comprehensive - it just needs to be persisted to the correct location for review.
   ▣ Compaction · claude-sonnet-4.5 · 48.9s
   I need to stop and ask for clarification about how to proceed with this plan.
   Current Situation
   I have a complete, comprehensive implementation plan ready for the Autocomplete stress testing page. The plan includes:

- ✅ Full file structure (9 files to create)
- ✅ 7 detailed example scenarios with responsibilities
- ✅ 3-phase implementation strategy with time estimates
- ✅ Validation checklist and success criteria
- ✅ Architecture alignment with existing docs patterns
  The Problem
  The task specification asks me to write the plan to:
  ./dashforge/.opencode/reports/autocomplete-docs-stress-page-plan.md
  However, when I attempted to write to this location, I received a permission denied error - the reports directory pattern is blocked from edits.
  Questions for You
  Option 1: Share the plan inline here
- I can present the full plan in this chat response
- You can copy it manually if needed
- Quickest way to review the content
  Option 2: Different file location
- Is there a different directory where I should write this plan?
- Perhaps .opencode/tasks/ or a different location?
  Option 3: Skip the file write
- Maybe the plan file output is optional?
- We could proceed directly to reviewing the plan content
  Which approach would you prefer?
  I want to make sure the plan gets to you in the format that's most useful. Should I:

1. Just present the full plan here in markdown so you can review it?
2. Try writing to a different location you specify?
3. Something else?
