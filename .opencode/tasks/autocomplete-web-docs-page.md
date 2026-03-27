# Task

Plan the implementation of the public `Autocomplete` documentation page inside the web docs application.

# Context

The `Autocomplete` component is now considered sealed for the current supported scope.

Completed and validated:

- static options
- freeSolo behavior
- generic option mapping
- DashForm integration
- Reactive V2 runtime integration
- loading state handling
- display sanitization
- unresolved value dev warnings
- internal docs stress page already implemented and used as validation layer

We now want to add `Autocomplete` to the public docs app (`web`) in the same quality level and architectural style used for other published component docs.

This task is about the PUBLIC docs layer, not the internal stress playground.

# Goal

Produce a precise implementation plan for adding a proper public docs page for `Autocomplete` in the web docs app.

The page must be:

- clean
- public-facing
- structured like the existing published component pages
- focused on developer experience
- aligned with the real supported API only

# Scope

Plan ONLY the public docs implementation for `Autocomplete`, including:

- route/page integration
- page file structure
- examples organization
- API presentation strategy
- content sections
- what should be demonstrated
- what should explicitly stay out of scope

# Rules

1. Respect the current web docs architecture exactly.
   Reuse the same structure, patterns, layout, naming, and section composition already used by other published component documentation pages in `web/src`.

2. This is a PLAN task only.
   Do NOT implement code.
   Do NOT modify files.
   Do NOT generate patches.

3. This is PUBLIC documentation, not a stress page.
   The page must be clean and curated.
   Examples should be representative and high signal.
   Do NOT port the internal playground page as-is.

4. Only document the real supported scope of Autocomplete:

   - static options
   - freeSolo
   - generic options with mappers
   - DashForm usage
   - runtime options via Reactive V2
   - loading state
   - disabled options
   - unresolved value behavior (documented carefully, not as user-facing UI messaging)

5. Do NOT include unsupported or future features:

   - multiple mode
   - async search
   - remote filtering
   - speculative API proposals

6. The plan must clearly separate:

   - page shell
   - documentation sections
   - example/demo components
   - shared mock/demo data
   - optional API reference section

7. Runtime behavior must remain aligned with Reactive V2 policy:

   - no automatic reset
   - no reconciliation
   - display sanitization only
   - unresolved warnings are developer-console behavior, not UI messaging

8. The page must explain behavior clearly for developers, especially:
   - freeSolo semantics
   - value storage expectations
   - generic option mapping
   - runtime option loading behavior
   - unresolved value handling

# Constraints

- PLAN ONLY
- No implementation
- No internal docs/stress page refactor
- No component changes
- No API redesign
- No expansion beyond current supported behavior

# Output

Return the result in this exact structure:

1. Executive Summary

   - concise verdict
   - whether the public docs page should proceed now

2. Existing Web Docs Architecture Signals

   - what existing published docs patterns must be reused
   - what must stay consistent with current public docs structure

3. Recommended Page Structure

   - proposed folder
   - proposed files
   - responsibility of each file

4. Recommended Documentation Sections

   - page sections in order
   - what each section should communicate

5. Required Demo Examples

   - exact examples to include
   - what each one proves
   - which examples should be omitted compared to the internal stress page

6. Runtime / Reactive V2 Documentation Strategy

   - how runtime behavior should be explained
   - how unresolved value behavior should be documented
   - how loading and sanitization should be demonstrated publicly

7. API Reference Strategy

   - how to present props / generics / important constraints
   - what should be emphasized for developers

8. Out of Scope

   - clearly list what must NOT appear on the public page

9. Implementation Phases

   - phase 1: page scaffold
   - phase 2: curated demos
   - phase 3: API/content refinement

10. Final Recommendation

- go / no-go
- what must be validated before merging the public docs page

# Important

Be precise.
Be architecture-aware.
Do NOT treat the internal stress page as the final public page.
Do NOT propose a giant monolithic page.
Do NOT invent unsupported features.
