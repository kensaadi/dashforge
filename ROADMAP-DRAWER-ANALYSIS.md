# Drawer — Roadmap Analysis (pre-sprint)

> **Status**: Architectural analysis — locked design for Sprint 6 SHIP #4.
>
> **Ship target**: `@dashforge/tw@1.2.0` — closes Sprint 6 SHIP bucket alongside
> Link, Select, Slider, Progress, Stepper.
>
> **Depends on**: [#108](https://github.com/kensaadi/dashforge/issues/108) —
> Blueprint Builder V2 dogfood report (G-12).
>
> **Adjacent to**: [#3](https://github.com/kensaadi/dashforge/issues/3) —
> AppShell v2 rebuild. Drawer composes INSIDE AppShell but does NOT depend
> on it; the two ship independently.

## 1. Cross-ecosystem decision — TW-only

Drawer ships in `@dashforge/tw` only, not in `@dashforge/ui`. Follows the
strategy set for the whole Sprint 6 slate (Link / Select / Slider /
Progress / Stepper — all TW-only). Rationale:

- **MUI already has `<Drawer>` + `<SwipeableDrawer>`** — battle-tested,
  APG-compliant, integrated with MUI's theme. Consumers on the
  `@dashforge/ui` side use `import { Drawer } from '@mui/material'`
  directly. Wrapping it in `@dashforge/ui` to add `visibleWhen` +
  `access` would be ~80 LOC of busywork with no material value.
- **TW has no equivalent** — Radix ships `Dialog`, `Popover`, `Menu` but
  no edge-anchored `Drawer`. That's the gap.
- **Two-ecosystem isolation is deliberate** — the tw-tokens memory locks
  this as architecture v2 (2026-05-15). Only the bridge layer (`forms`,
  `ui-core`, `rbac`) is shared. Every SHIP primitive respects this.
- **Cross-package concerns are already covered** — `visibleWhen` (from
  `@dashforge/ui-core`), `access` (from `@dashforge/rbac`), and Option C
  theming all work in the TW component without a MUI counterpart.

If a real MUI consumer later needs `resize`-with-persistence on their
Drawer, that lands as a targeted `@dashforge/ui` `<DrawerWithResize>`
add-on — a small wrapper over MUI's own component, ~40 LOC. Not preemptive.

## 2. Distinct positioning vs Dialog / Popover / Menu

The three existing TW overlays are attached to different anchor logic:

| Primitive | Anchor | Sizing | Typical use |
|---|---|---|---|
| **Popover** | Attaches to a trigger element via floating-ui | Fits its own content | Info cards, dropdowns, form field pickers |
| **Dialog** | Centers on the viewport | Bounded `max-w-*` tier | Confirmations, focused tasks, modal forms |
| **Drawer** | Anchored to a viewport edge (left/right/top/bottom), full length of that axis | Bounded on the free axis, spans the fixed axis | Inspector panels, side filters, mobile navigation, tool drawers |

Drawer is NOT a Dialog with sliding-in animation — the positioning +
interaction model are genuinely distinct (edge-anchored, full length of
one axis, may be persistent alongside canvas content). Ships as a
separate primitive.

## 3. The 5 confirmed decisions

### 3.1 Position axis word: `position`

Chosen against MUI's `anchor` and Chakra/Radix's `side`. Reasoning:
- `#108` acceptance criteria already uses `position="right" | "left" | ...`
- Natural English reads at the call site: `<Drawer position="right">`
- No conflict with the CSS `position` property in the class chain — the
  content wrapper is always `fixed`, hardcoded in the base.

### 3.2 Ship `variant="persistent"` in v1

Not deferred. Blueprint Builder V2 needs both `temporary` (mobile bottom
sheet, filter drawer) and `persistent` (right-side Inspector coexisting
with canvas). Deferring `persistent` blocks the primary dogfood consumer.

Implementation is cheap: `<RadixDialog.Root modal={variant === 'temporary'}>`.
When `modal={false}`, Radix drops:
- focus trap
- scroll lock
- pointer-events blocking outside content
- backdrop

That IS the `persistent` semantic. ~10 LOC delta over the `temporary`
base. Ship both.

### 3.3 NO bottom-sheet swipe gestures in v1

Backdrop tap + Esc + explicit close button cover 100% of the close paths.
Swipe-to-close on `position="bottom"` mobile requires either
`@use-gesture/react` (new dep, 25kb gz) or a hand-rolled pointer/velocity
tracker (~100 LOC + browser compat matrix). Neither fits Sprint 6's
time budget.

Defer to Sprint 7+ when there's a real Blueprint mobile touch use case
that isn't served by the existing close mechanisms.

### 3.4 Simple `onOpenChange(open: boolean) => void` — no `reason` param

MUI passes `reason: 'escapeKeyDown' | 'backdropClick'` on Drawer's
`onClose`. Dialog in `@dashforge/tw` does NOT pass a reason — consumers
that want to differentiate use `disableEscapeClose` / `disableBackdropClose`
explicit props.

Drawer keeps parity with Dialog. If a consumer needs the escape-vs-backdrop
distinction, they:
- Wire `disableEscapeClose={true}` and handle Esc themselves via a
  keydown listener on the drawer content.
- Or wire `disableBackdropClose={true}` and add a custom "cancel" button.

Doesn't cover 100% of consumer needs, but keeps the API surface aligned
with the sibling primitive.

### 3.5 Monolithic API — `title` / `footer` props + `children` = body

Not compound (`<Drawer.Header>` / `<Drawer.Body>` / `<Drawer.Footer>`).
Reasoning:
- Dialog is monolithic (`title`, `description`, `children`) — Drawer
  copies the pattern 1:1 for consistency.
- Compound children add value when there's conditional rendering across
  sub-parts. Drawer has neither: header / body / footer are always
  present-or-absent based on presence of the corresponding prop.
- Consumers who need deep header customization use `slotProps.header`
  (className override) or override the whole header by setting
  `title={null}` and rendering a custom `<div>` at the top of `children`.

## 4. Slot roster + variant axes

### 4.1 Slots (9 total)

| Slot | Purpose | Rendered when |
|---|---|---|
| `root` | Reserved for CSS-var context; not currently used | always |
| `overlay` | Backdrop | `variant === 'temporary'` only |
| `content` | The Drawer panel itself (positioned + sized) | always |
| `header` | Top region holding title + close button | `title != null \|\| showCloseButton` |
| `title` | The `<RadixDialog.Title>` element | `title != null` |
| `closeButton` | The × button | `showCloseButton && !disableBackdropClose` |
| `body` | Main scrollable content region | always |
| `footer` | Bottom region for action bar | `footer != null` |
| `resizeHandle` | Drag handle on the free edge | `resize === true` |

### 4.2 Variant axes (Option C configurable)

| Axis | Values | Default | Purpose |
|---|---|---|---|
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Which edge the Drawer anchors to |
| `size` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Width (left/right) OR height (top/bottom) preset |
| `variant` | `'temporary' \| 'persistent'` | `'temporary'` | Modal vs non-modal semantics |
| `showCloseButton` | `boolean` | `true` | Render the × button |

Behavioral state (`open`, `onOpenChange`, `disableBackdropClose`,
`disableEscapeClose`, `resize` and family) is per-instance — NOT in
`DrawerVariantProps`. Option C's `defaults` is for visual identity only.

## 5. Resize handle — design details

### 5.1 API

```ts
resize?: boolean;                    // default false
resizeKey?: string;                  // localStorage key (namespaced 'df.drawer.')
resizeMin?: number;                  // px, default 240
resizeMax?: number;                  // px, default 800
onSizeChange?: (px: number) => void; // controlled resize opt-in
```

### 5.2 Behavior

- Handle rendered on the OPPOSITE edge from `position` (right drawer → handle on its LEFT edge)
- Pointer drag: `pointerdown` → capture → `pointermove` calculates delta → `pointerup` releases
- Delta sign flip based on which edge the handle is on (right drawer's handle at its left edge → dragging left grows the drawer, sign is `-1 * delta`)
- Commit: writes to internal state + calls `onSizeChange` + persists to `localStorage.setItem('df.drawer.<resizeKey>', size)`
- SSR-safe: initial read of `localStorage` in `useEffect` (not the state initializer) — evita hydration mismatch
- Clamp: min/max applied on every commit
- Keyboard a11y:
  - `role="separator"`, `aria-orientation`, `aria-valuenow / -min / -max`
  - `tabIndex={0}` — reachable via Tab
  - `ArrowLeft/Right` (horizontal) / `ArrowUp/Down` (vertical) — move by 1px
  - `Shift + Arrow` — move by 8px
- Dev-warn (once) when `resize=true` AND `resizeKey` is `undefined` — dev only, guarded by `NODE_ENV`

### 5.3 Storage schema

Key: `df.drawer.<resizeKey>`. Value: numeric width/height in px, as string.

Consumer `resizeKey="blueprintInspector"` → `localStorage["df.drawer.blueprintInspector"] = "420"`

Namespace prefix locks against collisions with unrelated app storage.

## 6. Bridge integration

Drawer is NOT a form field — no `name`, no `bridge.register`, no
`bridge.setValue`. Follows the same catalog convention as Dialog /
Popover / Menu:
- `visibleWhen: (engine: Engine) => boolean` — reactive predicate. Same
  contract as Slider, Progress, Stepper. Renders `null` when false.
- `access: AccessRequirement` — RBAC gate via `useAccessState`. Hidden
  when `visible === false`.

## 7. Test plan — ~34 tests total

### 7.1 Base rendering (5)

1. Renders portal content when `open={true}`
2. Doesn't render when `open={false}` (Radix unmounts by default)
3. `title` renders inside the `title` slot
4. `footer` renders inside the `footer` slot
5. `sx` shortcut merged onto content className

### 7.2 Position matrix (5)

6-9. Each of `right / left / top / bottom` applies the correct edge-anchor + border-side class
10. Default `position="right"` when omitted

### 7.3 Controlled interface (4)

11. Fires `onOpenChange(false)` on Esc
12. Fires `onOpenChange(false)` on backdrop click (temporary only)
13. `disableEscapeClose` suppresses the Esc handler
14. `disableBackdropClose` suppresses the backdrop handler

### 7.4 Variant temporary vs persistent (3)

15. `variant="temporary"` renders the overlay slot
16. `variant="persistent"` does NOT render the overlay slot
17. `variant="persistent"` mounts Radix with `modal={false}`

### 7.5 Accessibility (4)

18. Content carries `role="dialog"` + `aria-modal="true"` for temporary
19. Content carries `role="dialog"` but NOT `aria-modal` for persistent
20. Close button carries `aria-label="Close"`
21. Resize handle carries `role="separator"` + orientation + valuenow

### 7.6 Resize handle drag + persistence (7)

22. Not rendered when `resize={false}` (default)
23. Rendered on the free edge for each position (parametric)
24. `pointerdown` + `pointermove` updates the content style
25. Commit persists to `localStorage['df.drawer.<key>']`
26. Reads persisted size from `localStorage` on mount (SSR-safe useEffect)
27. Clamps to `resizeMin` / `resizeMax`
28. Keyboard: ArrowKey moves by 1, Shift+Arrow by 8

### 7.7 Dev-warns (2)

29. `resize=true` + missing `resizeKey` → single dev-warn
30. Dev-warn suppressed in `NODE_ENV === 'production'`

### 7.8 Precedence chain (Option C) — 6 tests (separate file)

31. Level 1 — TV defaults (`position='right'`, `size='md'`, `variant='temporary'`)
32. Level 2 — `theme.components.Drawer.defaults` wins over TV
33. Level 3 — instance prop wins over theme
34. Level 4 — `sx` merged via `tailwind-merge`
35. `slotProps` — theme slotProps then instance slotProps
36. DS-identity scenario (bare `<Drawer>` inherits full identity)

## 8. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Focus trap in `persistent` mode confuses users | Med | Documentation: explicitly note persistent variant leaves keyboard nav to the consumer; recommend `tabIndex={-1}` on content + explicit focus management if needed |
| localStorage abuse when `resizeKey` omitted | Low | Dev-warn on mount; consumers see the warning in their console during dev |
| Mobile resize handle too small to grab | Low | 8px logical width + 8px hitbox padding via `padding` class (visible bar only 2px) |
| Bottom drawer + soft keyboard on iOS | Low | Skip in v1; document as known limitation. iOS keyboard-avoiding is an app-shell concern, not a Drawer concern |
| Radix Dialog `modal={false}` + accessible focus | Med | Follow shadcn/ui Sheet's pattern; document `persistent` requires `tabIndex` on the content root for keyboard reach |

## 9. Timeline

- ROADMAP + spec review: **0.5h** (this doc)
- Source (variants + types + component + resize logic): **10h**
- Tests (34 total): **6h**
- Docs (MDX + demos + sidebar entry in docs-lab): **5h**
- Verify in Blueprint Builder V2 shell (smoke test): **2h**

**Total: ~24h** part-time, 2 sprint-days full-focus. Target ship:
2026-07-16 → 2026-07-18.

## 10. Post-ship

Once Drawer lands:
- Sprint 6 SHIP bucket complete (Slider ✅, Progress ✅, Stepper ✅, Drawer ✅)
- Ready for `@dashforge/tw@1.2.0` publish
- #3 (AppShell v2) can opt to compose `<Drawer>` inside a new `inspector` slot — non-blocking, optional
- Blueprint dogfood: replace the `<Card>`-inside-`AppShell.footer` workaround with a real `<Drawer position="right">`

## 11. Follow-ups explicitly out of v1 scope

- Bottom-sheet swipe-to-close (Sprint 7+ if there's real demand)
- Multi-drawer stack (2 open at once, one pushing the other)
- `permanent` variant (covered by `AppShell.nav` desktop already)
- Snap points on resize (`resizeSnaps?: number[]`) — nice-to-have, ship if implementation converges under 2h
- `@dashforge/ui` mirror — punt until a real MUI consumer asks
