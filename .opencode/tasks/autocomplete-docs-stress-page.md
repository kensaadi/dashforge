# Task

Create a new dedicated docs stress page for `Autocomplete` inside the docs app, following the existing docs page architecture and patterns already used in the current `pages` structure.

# Context

The Autocomplete component is now considered feature-complete for the current scope:

- static mode
- freeSolo
- generic option mapping
- runtime integration (Reactive V2)
- loading state handling
- display sanitization
- unresolved value warnings

We now want to move from component implementation to **docs-app stress testing**.

This is NOT the final public `web/docs` showcase page yet.

This task is only about the internal docs app stress/playground area, where components are tested with real examples in a dirty but controlled environment before public publication.

Relevant existing page patterns are in the current docs app pages structure, including examples like:

- `pages/reactions-v2/*`
- `pages/form-stress/*`

Use those as architectural references for folder structure, page composition, sections, exports, and example organization.

# Scope

Plan the implementation of a new `Autocomplete` stress page in the docs app.

The plan must define:

- where the new page should live
- which files should be created
- how examples should be split
- how to keep the page aligned with the existing docs app architecture
- which Autocomplete scenarios must be demonstrated and stress-tested

# Goal

Produce a concrete implementation plan for a new docs app page dedicated to Autocomplete, with realistic examples covering the current supported feature set.

# Rules

1. Respect the existing docs app architecture.
   Follow the same style and composition patterns already used in:

   - `reactions-v2`
   - `form-stress`

2. This is a PLAN task only.
   Do NOT write code.
   Do NOT modify files.
   Do NOT generate patches.

3. The page must be designed for stress testing, not final marketing/public docs.
   It can be pragmatic and example-heavy, but it must still be structured and clean.

4. Examples must reflect the REAL supported scope only.
   Include current supported Autocomplete capabilities:

   - static options
   - freeSolo behavior
   - generic options with mappers
   - bound usage with DashForm
   - runtime options via Reactive V2
   - loading state
   - unresolved value behavior / sanitization
   - warnings / misuse scenarios only if they can be demonstrated safely in docs

5. Do NOT include out-of-scope features:

   - multiple mode
   - async search
   - remote filtering
   - speculative future APIs

6. Keep architecture clean.
   Prefer a page composed of small example sections/components rather than one giant file.

7. The plan must clearly separate:

   - page shell
   - reusable section component(s)
   - individual example components
   - optional mock data / helper files

8. Respect Reactive V2 policy when planning runtime examples.
   No automatic reset.
   No reconciliation.
   Display-layer sanitization only.

# Constraints

- PLAN ONLY
- No implementation
- No refactoring of unrelated docs app pages
- No public `web/docs` work yet
- No new component features
- No expansion beyond current supported Autocomplete scope

# Output

Return the result in this exact structure:

1. Executive Summary

   - concise verdict
   - whether the docs stress page should proceed now

2. Existing Architecture Signals

   - what patterns should be reused from current docs pages
   - what should be kept consistent

3. Recommended Page Structure

   - proposed folder
   - proposed files
   - responsibility of each file

4. Required Example Scenarios

   - list the exact Autocomplete examples to include
   - explain why each one is necessary

5. Runtime / Reactive V2 Examples

   - define which runtime examples should exist
   - define how unresolved value and loading should be demonstrated

6. Out of Scope

   - clearly list what must NOT be included

7. Implementation Phases

   - phase 1: page scaffold
   - phase 2: examples
   - phase 3: verification / cleanup

8. Final Recommendation
   - go / no-go
   - what should be validated before moving later to public `web/docs`

# Important

Be precise.
Be architecture-aware.
Do NOT invent a different docs structure.
Do NOT propose a huge monolithic page.
Do NOT treat this as final public documentation.
