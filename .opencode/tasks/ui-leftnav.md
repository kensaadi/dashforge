Task

Implement LeftNav v1 (framework-agnostic) in Dashforge UI following Dashforge UI Component Policy.
TDD-first is mandatory.

Application

Dashforge – libs/dashforge/ui

Component Name

LeftNav

Target Directory

libs/dashforge/ui/src/components/LeftNav/

Scope

Build a router-agnostic sidebar navigation component that supports:

Desktop: permanent drawer with animated width (expanded/collapsed)

Mobile: temporary drawer (overlay) below configurable breakpoint

Expanded mode: inline collapses

Collapsed mode: click-based Popper flyout for collapsible items

Active state: pill background

Sizes: sm | md | lg

Slots: header, footer

Controlled + uncontrolled state for:

drawer open

expanded collapses expandedIds

Constraints:

No DashFormContext, no DashFormBridge (plain UI component only)

No router imports (react-router, next/navigation, etc.)

No i18n imports

No global stores (valtio, swr, etc.)

No any in runtime code, no as never, no cascading casts

No console.log

Public types + JSDoc in English

Files To Create

libs/dashforge/ui/src/components/LeftNav/types.ts

libs/dashforge/ui/src/components/LeftNav/LeftNav.tsx

libs/dashforge/ui/src/components/LeftNav/LeftNav.styled.ts

libs/dashforge/ui/src/components/LeftNav/index.ts

libs/dashforge/ui/src/components/LeftNav/LeftNav.unit.test.tsx

(Optionals only if strictly needed by implementation)

libs/dashforge/ui/src/components/LeftNav/utils.ts (no exports unless necessary)

Step 1 – Define Intents (Tests First)

Create only tests first in:

libs/dashforge/ui/src/components/LeftNav/LeftNav.unit.test.tsx

Test Setup Requirements

Use existing Dashforge test utilities (Testing Library).

If media query needs mocking, do it inside the test file (no new infra).

Intent A – Plain Render & Slots
Test A1: renders header and footer slots

Given header and footer nodes

Expect both to be in the document

Test A2: forwards className to root

Render with className="x"

Expect root container has class x

Intent B – Router-Agnostic Link Contract
Test B1: calls renderLink for leaf items

Provide 2 leaf items

renderLink is a mock function

Expect it is called for each leaf item exactly once

Ensure the returned node is rendered

Test B2: applies active pill when isActive(item) is true

isActive returns true for a specific item

Expect that item is rendered with aria-current="page"

Expect pill styling marker is applied (use a stable selector: e.g. data-dash-active="true")

Intent C – Controlled vs Uncontrolled Drawer Open
Test C1: controlled open does not mutate internal state

Render with open={false} and onOpenChange=mock

Click toggle button (you must expose a stable test id: data-testid="LeftNav.Toggle")

Expect onOpenChange(true) called

Re-render with open={false}

Expect drawer still collapsed

Test C2: uncontrolled open toggles with defaultOpen

Render with defaultOpen={false}

Click toggle

Expect drawer becomes open (assert via width state marker: data-dash-open="true")

If onOpenChange provided, expect it called

Intent D – Inline Collapse (Expanded Mode)
Test D1: clicking collapse toggles children inline in expanded mode

Render with open={true} (expanded)

Item with type='collapse' and children

Click collapse row

Expect children visible

Click again

Expect children hidden

Test D2: controlled expandedIds calls onExpandedIdsChange

Render with expandedIds={[]}, onExpandedIdsChange=mock

Click collapse

Expect callback called with array containing collapse id

Intent E – Flyout (Collapsed Mode, Click)
Test E1: collapsed + click collapse opens popper flyout

Render with open={false} (collapsed)

Click collapse item

Expect flyout content visible

Test E2: click-away closes flyout

Open flyout

Click document body

Expect flyout content hidden

Test E3: Escape closes flyout

Open flyout

Press Escape

Expect flyout content hidden

Test E4: opening another collapse closes previous flyout

Open flyout A

Click collapse B

Expect A content hidden, B content visible

Intent F – Mobile Variant Close-on-Navigate
Test F1: on mobile, clicking leaf closes drawer if closeOnNavigateMobile=true

Mock breakpoint so component behaves as mobile temporary

Render with open={true}, onOpenChange=mock, closeOnNavigateMobile={true}

Click a leaf item

Expect onOpenChange(false) called

Intent G – Size Variants
Test G1: size changes item height marker

Render size="sm" and assert an item has data-dash-size="sm"

Render size="lg" and assert data-dash-size="lg"

(Implementation must add stable data attributes for testability.)

STOP HERE. No implementation until all tests above exist.

Step 2 – Implement Component

Create component files listed above.

Implementation requirements:

Public Types (types.ts)

Implement:

LeftNavItemType = 'group' | 'collapse' | 'item'

LeftNavSize = 'sm' | 'md' | 'lg'

LeftNavItem model:

id, type, label, key, icon?, disabled?, badge?, children?, dividerBefore?

Callback types:

renderLink(item, children)

isActive(item)

Props interface LeftNavProps exactly matching test expectations.

Styling (LeftNav.styled.ts)

Use MUI styled + shouldForwardProp where needed.

Width transition uses theme.transitions.create('width').

Active pill uses theme vars (e.g. theme.vars.palette.primary.lighter) and works in dark mode via vars.

Do NOT add new global theme keys.

Component Logic (LeftNav.tsx)

Resolve open state (controlled vs uncontrolled).

Resolve expandedIds state (controlled vs uncontrolled).

Build expanded mode renderer (inline Collapse).

Build collapsed mode renderer (Popper flyout on click).

Maintain flyout state:

activeFlyoutId: string | null

close on click-away and Escape

opening a new one closes previous

Mobile behavior:

useMediaQuery(theme.breakpoints.down(breakpoint))

temporary drawer when mobile (unless mobileVariant='disabled')

close on navigate for leaf items when mobile + option enabled

Add stable test attributes used by tests:

root data-dash-open

active item data-dash-active

size data-dash-size

toggle button data-testid="LeftNav.Toggle"

Exports (index.ts)

Export LeftNav and relevant types.

Step 3 – Minimal Optional Integration

Not required (no form, no RHF).
Only add a smoke test if needed for breakpoints/popper.

Verification

Run:

npx nx run @dashforge/ui:typecheck
npx nx run @dashforge/ui:test

Requirements:

0 type errors

All tests pass

0 skipped tests

Acceptance Criteria

LeftNav.unit.test.tsx exists and all tests pass.

Component is router-agnostic (verified: no router imports).

Component is form-agnostic (verified: no DashFormContext/Bridge imports).

No console.log.

No unsafe casts (any in runtime, as never, cascading casts).

Active pill background implemented and testable via data-dash-active.

Collapsed flyout is click-based and closes via click-away and Escape.

Mobile leaf click closes temporary drawer when configured.

Summary of changes provided.
