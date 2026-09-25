# Dashforge — Known Bugs

A register of confirmed defects in the shipped libraries, written down
so they survive the session that found them.

**How to use this file.** Each entry is self-contained: symptom, cause
with `file:line`, how it was reproduced, and a proposed fix. Pick one,
fix it, move the entry to *Fixed* at the bottom with the commit that
closed it. Do not delete entries — a fixed bug with its reasoning
intact is what stops the same design coming back.

**How to add one.** Only entries that were actually reproduced, or read
straight out of the source with the lines quoted. A suspicion goes in
*Unconfirmed* at the bottom, not in the main list. Say plainly which of
the two it is.

Found while building the commercial kits (`~/projects/web/kits/`),
which is the point of those kits: they exercise the library the way a
customer will.

---

## BUG 1 — `<Autocomplete>` (tw): the listbox is not portaled

**Severity:** medium. Breaks the component in ordinary contexts,
silently, and in a way that depends on the parent rather than on
anything visible at the call site.

**Status:** **fixed** 2026-09-01. See *Fixed* section at bottom.

### Symptom

The dropdown is clipped, or scrolls away from its field, whenever any
ancestor has `overflow: hidden` or `overflow: auto`. Nothing warns; the
list simply ends early.

### Cause

`libs/dashforge/tw/src/components/Autocomplete/Autocomplete.tsx:1008`

```tsx
'absolute left-0 right-0 top-full',
```

The listbox is a `<ul>` sibling of the field, absolutely positioned
inside the `position: relative` wrapper. There is no portal anywhere in
the package — `grep -c createPortal` over the built `@dashforge/tw`
bundle returns `0`. Being in flow, the listbox obeys every `overflow`
up the tree.

### Where this bites inside the library itself

| Component | Line | Rule | Status |
|---|---|---|---|
| `Dialog` | `dialog.variants.ts:51` | `body: 'flex-1 overflow-y-auto'` | **reproduced** |
| `Accordion` | `accordion.variants.ts:20` | `content: 'overflow-hidden …'` | read from source |

**`Dialog` is the one that matters**, and it is confirmed. A plain
`<Dialog><DashForm><Autocomplete multiple/></DashForm></Dialog>` with
six options: opening the listbox turns the dialog body into a scroll
container and the list is cut off at the dialog's bottom edge. With
six roles, three are visible, the third is sliced in half, and the
last three are unreachable until the body is scrolled.

Scrolling the body does keep the listbox attached to its field —
measured, 60px of scroll moves the listbox 60px — because both live in
the same scrolling box. So the defect is the clipping alone, not
drift. It still means the control cannot be operated without scrolling
a dialog the user has no reason to think is scrollable.

This blocks the obvious next step for any CRUD screen built on the
library: **you cannot put a multi-select in a modal form.** More fields
in the modal make it worse, not better, because a taller body means a
dropdown is more likely to open near the clipped edge. So the portal
fix is a prerequisite for the modal pattern, not a polish item.

### Reproduction (verified)

`inventory-kit`, *Users & roles* → **Edit**. The kit's `SectionCard`
renders a `<section>` with `overflow-hidden` — it needs it so a flush
table's corners follow the rounded border — and it cut the six-item
role list off at roughly two and a half rows. Confirmed by walking the
DOM on the live page: the `<section>` is the ancestor carrying
`overflow: hidden`.

Minimal case:

```tsx
<Box sx="overflow-hidden">
  <Autocomplete name="tags" multiple options={TAGS} />
</Box>
```

### The asymmetry worth fixing

`<Popover>` in this same library is Radix-based and portals out. Inside
the very same `SectionCard`, `Popover` works and `Autocomplete` does
not. Two dropdown components, opposite behaviour with respect to their
container, and no way to tell from the call site which one you have.
That inconsistency is the real defect; the clipping is how it shows up.

### Proposed fix

Portal the listbox the way `Popover` does, anchored to the trigger with
flip/shift on viewport collision. Keep:

- width tied to the trigger's width,
- `aria-controls` / `aria-activedescendant` wiring,
- close on ancestor scroll,
- the existing keyboard model (it is not implicated).

### Current workaround downstream — remove when this is fixed

`inventory-kit/client/tailwind/src/components/primitives/SectionCard.tsx`
grew an `overflowVisible` prop that swaps `overflow-hidden` for
`overflow-visible`. It costs the corner clipping, so it only applies to
cards holding a form. It is a patch, and it is commented as one.

---

## BUG 2 — `<Autocomplete>` (tw): `defaultValue` is a silent no-op in form mode

**Severity:** low impact, high time-wasted. No error, no warning — the
field is simply empty and the prop was accepted by the types.

**Status:** **fixed** 2026-09-02, this time with the runtime rete
that closes the case the type-side split cannot see. See the *Fixed*
section at bottom for the full write-up.

### Symptom

```tsx
<DashForm defaultValues={{}}>
  <Autocomplete
    name="tags"
    multiple
    options={TAGS}
    defaultValue={['frontend', 'design']}
  />
</DashForm>
```

No chips render.

### Cause

`Autocomplete.tsx:315-336`. Inside the `if (isFormMode && bridge)`
branch, `resolvedValue` comes from `explicitValue` or from
`bridge.getValue(name)` (line 330). The branch that consults
`defaultValue` is line 334, reachable only when there is no bridge.

This **matches the typings** — `autocomplete.types.d.ts` documents
`defaultValue` as *"Default value for uncontrolled mode (no-op in form
mode)"*. So it is coherent, not a regression. The defect is that the
contract is visible only to somebody who opens the `.d.ts`, while the
prop is accepted without complaint at the call site.

### Verification of the type-surface split — REOPENS THIS

The split discriminates on the presence of **`rules`**:
`AutocompleteFormMixin` (which types `defaultValue?: never`) is
selected when `rules` is passed, `AutocompleteStandaloneMixin` (where
`defaultValue` is legal) when it is not.

`rules` is optional and most consumers never pass it. So being inside
a `<DashForm>` — the actual condition for form mode at runtime — does
not select the form-mode type.

Probed from `inventory-kit` against the built package:

```tsx
<DashForm defaultValues={{}}>
  <Autocomplete name="t1" multiple options={TAGS} defaultValue={['a']} />
  <Autocomplete name="t2" multiple options={TAGS} rules={{}} defaultValue={['a']} />
</DashForm>
```

```
src/Probe.tsx(10,8): error TS2322: ... rules: {}; defaultValue: string[] ...
```

One error, on `t2`. `t1` compiles clean — and `t1` is the snippet this
entry was opened with, and the one anybody writes. At runtime it still
silently renders no chips, since the fix was explicitly type-only.

**Why the discriminant cannot work as chosen.** Form mode is decided
at runtime by `useContext(DashFormContext)`, and TypeScript cannot see
a React context. `rules` was picked as a proxy for it and the proxy is
absent in the common case. Options, none free:

1. **Require `rules` in form mode.** Honest discriminant, but it makes
   every bridge-bound Autocomplete carry a prop it may not need.
2. **Runtime dev warning** when `defaultValue` is passed with a bridge
   present. Catches every case, at the cost of not being compile-time.
   This is what BUG 2 originally proposed.
3. **Make it work** — seed the bridge on first mount when
   `getValue(name)` is `undefined`. Still not recommended: two sources
   of truth for the initial value.

(2) is the one that actually closes the reported symptom, and it
composes with the split rather than replacing it.

### Related, worth checking with the fix

`Autocomplete.tsx:250` — `initialKey` consults `defaultValue` *before*
the bridge. So the input can start showing the right label while the
resolved value is empty. Check whether that produces a flash, or a
mismatch between visible text and selected value.

### Options, least invasive first

1. **Dev warning** when `defaultValue` is passed while a bridge is
   active, pointing at `DashForm`'s `defaultValues`.
2. **Type-level exclusion**, so TypeScript catches it before runtime.
3. **Make it work** — seed the bridge on first mount when
   `getValue(name)` is `undefined`. More convenient, but it creates two
   sources of truth for the initial value. Not recommended.

This applies to **every bridge-integrated component that exposes
`defaultValue`**, not only `Autocomplete`. Decide once, apply across
the set.

---

## BUG 3 — `<Autocomplete multiple>` (tw): the chevron wraps onto its own line in a narrow field

**Severity:** low — cosmetic, but it makes any form holding one look
unfinished.

**Status:** **fixed** 2026-09-01. See *Fixed* section at bottom.

### Symptom

Below roughly 400px of field width, with two chips selected, the
chevron button drops to a second row on the **left**, under the chips,
while the clear `×` stays on the first row. The control renders 90px
tall with an empty band in it.

### Cause

In multi mode the root becomes `flex-wrap` (`!h-auto py-1
min-h-[var(--ac-min-h,2.5rem)]`) and the chips container, the input,
the clear button and the chevron are all **direct flex children of
that wrapping row**. Measured inside a 398px field:

| child | width |
|---|---|
| chips container | 240px |
| input (`w-full`) | 124px |
| clear button | 32px |
| chevron button | 30px |
| **total** | **426px** |

`shrink-0` on the two buttons stops them from shrinking, so the last
one wraps instead. The input's `w-full` makes it worse by claiming
what is left before the buttons are considered.

### Reproduction (verified)

`inventory-kit`, *Users & roles* → **Edit** on somebody holding two
roles. The same component in a full-width card renders correctly — it
is width-dependent, which is why it only appeared when the form moved
into a dialog.

### Proposed fix

Only the chips should wrap. Put the chips container in its own
wrapping flex box and keep the input plus the two buttons in a
non-wrapping row beside it — or absolutely position the buttons
against the root and reserve their width with padding, which is what
the single-select variant effectively does.

---

## BUG 4 — `formState.isDirty`, `isValid` and `isSubmitting` never re-render a consumer

**Severity:** medium. The flags are *correct*; nothing repaints when
they change. A `disabled={!isDirty}` Save button can never be pressed,
and a `loading={isSubmitting}` button never shows its spinner.

**Status:** **fixed** 2026-09-01. See *Fixed* section at bottom.

### CORRECTION — this entry previously named the wrong cause

It first claimed `bridge.setValue` omits `shouldDirty`, so the form is
never marked dirty. That reading was wrong and the proposed fix would
not have helped.

`setValue` does still omit the options (`DashFormProvider.tsx:452`),
but the flag flips anyway: the tw controls also fire
`registration.onChange`, and RHF's native path marks the field dirty
through that. Adding `shouldDirty` there is belt-and-braces, not the
fix.

How the correction was reached: with the workaround removed, toggling
a `<Switch>` left Save disabled; adding a `useWatch` in the same
component — which changes nothing about dirtiness, only about
re-rendering — enabled it immediately. The value was right all along
and nobody was looking.

### Cause

`libs/dashforge/forms/src/core/DashFormProvider.tsx:146-150`

```ts
// Subscribe to formState fields to ensure reactivity
const errors = rhf.formState.errors;
const touchedFields = rhf.formState.touchedFields;
const dirtyFields = rhf.formState.dirtyFields;
const submitCount = rhf.formState.submitCount;
```

RHF's `formState` is a Proxy: a field is subscribed only if it is
READ. Four are. `isDirty`, `isValid`, `isSubmitting`, `isSubmitted`
and `isValidating` are not, so RHF never schedules a render when they
change — and neither the provider nor anything under it repaints.

The asymmetry is what makes this hard to spot from the outside:
`dirtyFields` IS subscribed, so per-field dirtiness works, while the
aggregate `isDirty` sitting next to it does not.

### Reproduction (verified)

`inventory-kit`, *Settings → Operations*: toggle "Require a batch
number". The switch moves; Save stays disabled. Add a `useWatch` to
the component reading `isDirty` and it enables on the same click.

### Proposed fix

Read the rest of the flags alongside the four:

```ts
const errors = rhf.formState.errors;
const touchedFields = rhf.formState.touchedFields;
const dirtyFields = rhf.formState.dirtyFields;
const submitCount = rhf.formState.submitCount;
// Proxy subscriptions — reading is what subscribes. Without these the
// values are correct and nothing re-renders to show them.
void rhf.formState.isDirty;
void rhf.formState.isValid;
void rhf.formState.isSubmitting;
void rhf.formState.isSubmitted;
void rhf.formState.isValidating;
```

Subscribing every flag costs a render on each transition, which is the
point of them. If that is judged too broad, the alternative is to
expose a `useDashFormState()` hook that subscribes in the CONSUMER —
better in principle, and a bigger change.

### Current workaround downstream — remove when this is fixed

`inventory-kit/.../admin/settings/SettingsSection.tsx` computes
dirtiness itself, comparing `useWatch()` against the values the form
mounted with. `useWatch` and not `rhf.watch()`: `watch()` subscribes
the component that called `useForm` — the provider — so the consumer
still never re-renders. That was the first attempt and it looked
exactly like the bug it was meant to work around.

---

## BUG 5 — `<Autocomplete multiple>` (tw): the control overflows its own width by ~6px

**Severity:** cosmetic, but it puts a horizontal scrollbar inside a
dialog, which reads as unfinished.

**Status:** **fixed** 2026-09-01. See *Fixed* section at bottom.

### Symptom

In a `<Dialog>`, the body grows a horizontal scrollbar under the form.
Nothing looks wrong until you notice the bar.

### Cause

Measured in `inventory-kit`, *Users & roles* → Edit, on a field 398px
wide with two chips:

| Element | width | right edge |
|---|---|---|
| root (`relative flex items-center`) | 398 | 839 |
| chips container (`flex flex-wrap`) | 240 | 682 |
| controls group (`flex flex-nowrap flex-1 min-w-[6rem]`) | 156 | 838 |
| chevron button (`shrink-0 px-2`) | 30 | **844** |

The chevron sits 6px past its own parent. The controls group is
`flex-nowrap` with `min-w-[6rem]`; when the chips take enough width,
the input inside will not shrink below that floor, and the `shrink-0`
buttons are pushed out rather than wrapped — which is the BUG 3 fix
working as designed, one pixel too far.

The dialog body is `overflow-y-auto`, and `overflow-x` computes to
`auto` with it, so the 6px becomes a scrollbar.

### Reproduction (verified)

`inventory-kit`, *Users & roles* → **Edit** on somebody holding two
roles. `body.scrollWidth` 403 vs `clientWidth` 398.

### Proposed fix

Let the input shrink: `min-w-0` on the controls group, or move the
`min-w-[6rem]` floor onto the input and allow the group to shrink past
it. Either keeps the buttons on the line without pushing them out.

### Verified fixed from the consuming kit

`inventory-kit`, *Users & roles* → Edit, two chips, 398px field, on the
`eb02888` build:

```
clientWidth 398   scrollWidth 398   overflowing elements: none
```

The children still measure the same — chips 240, controls group 156,
root 398 — and nothing exceeds its parent now. No scrollbar in the
dialog.

---

## BUG 6 — `<Dialog>`: the `actions` slot is styled and typed, but never rendered

**Severity:** low, but it is a declared API that silently does
nothing — the worst kind of small.

**Status:** **fixed** 2026-09-03. See *Fixed* section at bottom.

### Symptom

`slotProps.actions.className` is accepted by the types and has no
effect. Nothing in the rendered dialog corresponds to it.

### Cause

The slot exists in two of the three places it needs to:

```
dialog.variants.ts:13   *  - `actions`  — footer action bar
dialog.variants.ts:52   actions: 'flex justify-end gap-2 pt-2',
dialog.types.ts:35      actions?: { className?: string };
```

`Dialog.tsx` renders `{children}` and nothing else. There is no
`actions` prop and no footer region, so the class is dead and the
`slotProps` entry is a promise the component does not keep.

### Why it matters more than it looks

The variant encodes a DECISION — `justify-end`, primary action at the
bottom-right corner — and every consumer then has to rediscover it.
All six dialogs in `inventory-kit` had hand-rolled action rows, all
left-aligned, because the convention the library had already written
down was not reachable from the component.

### Proposed fix

Either render it:

```tsx
{actions && <div className={cn(v.actions(), slotProps?.actions?.className)}>{actions}</div>}
```

with an `actions?: ReactNode` prop — which also gives the footer a
place to live when the body scrolls, so the buttons stay put.

Or, if a footer is deliberately the consumer's job, delete the variant
and the slotProps entry so the types stop advertising it.

The first is better: the alignment is a design-system decision, not a
per-screen one.

---

## BUG 7 — `<Autocomplete>`: the listbox is dismissed by the focus that opened it

**Component:** `<Autocomplete>` (tw).

**Severity:** high. The field looks broken to anybody who types.

**Status:** FIXED, 2026-09-03. Regression from the BUG 1 portal fix.

### Symptom

Click the field and type one character: the suggestion list flashes and
vanishes. Type a second character and it appears. The first keystroke
after focusing NEVER shows suggestions, which reads as intermittent
rather than systematic — the reporter's words were "if you search for
the article it does not select it at all".

Measured on the movement form, watching `aria-expanded`:

```
t=13466   expanded: true    value: ""     ← opens on focus
t=13479   expanded: false   value: "C"    ← dismissed 13ms later
```

### Cause

`closePopover` is NOT involved — traced, never called. The dismissal
comes from Radix itself:

```
onDismiss                        @radix-ui/react-popover
  handleAndDispatchCustomEvent
    HTMLDocument.handleFocus     DismissableLayer, focusin listener
```

`Popover.Content` is wrapped in a `DismissableLayer`, which dismisses on
a `focusin` landing outside the layer. In a combobox the focused element
is the `<input>` — and the input is the ANCHOR, so it is outside
`Popover.Content` by construction. The layer therefore reads the field's
own focus as "focus outside" and closes.

Before BUG 1 the listbox was an inline `<ul>` inside the component root,
so no DismissableLayer existed and the question never arose. Portaling
the listbox was right; it just needs the layer told what "outside"
means for a combobox.

### Fix

`Autocomplete.tsx`, on `RadixPopover.Content` — guard both outside
handlers against the component root, which holds the input, the chevron
and the clear button:

```tsx
onFocusOutside={(event) => {
  if (rootRef.current?.contains(event.target as Node)) event.preventDefault();
}}
onInteractOutside={(event) => {
  if (rootRef.current?.contains(event.target as Node)) event.preventDefault();
}}
```

Anything genuinely outside still dismisses, so click-away is unchanged.

### Verified

In a real browser, against `inventory-kit`'s movement form: one
keystroke `C` now opens a filtered list of four; selecting sets the
value and closes; the chevron reopens; a click elsewhere in the dialog
dismisses. The 2020-test tw suite passes unchanged.

### Covered

TWO LAYERS, because one was not enough.

`Autocomplete.portal.test.tsx` (jsdom) pins the shared cause: both bugs
came from asking "is this inside my root?" to mean "is this mine?", and
that question now has one name — `isWithinCombobox(target, root,
listbox)`. Narrow it back to the root alone and three tests fail.

`inventory-kit/client/tailwind/e2e/autocomplete.spec.ts` (Playwright,
real Chromium) pins the SYMPTOM, which jsdom cannot reach — Radix's
focus dismissal does not run there. Remove the two outside-guards and
`the focus that opens the list does not also close it` fails, along with
mouse and keyboard selection.

One trap worth recording, because it cost a full cycle: the first
version of that e2e asserted with a plain `expect`, which polls and
passes on its FIRST sample — and that sample lands inside the ~13ms
window before the dismissal. It reported green against a build with the
bug deliberately restored. The assertion now waits 400ms first, and the
wait is the substance of the check rather than a workaround for it.

---

## BUG 8 — `<Autocomplete>`: an option cannot be picked with the MOUSE

**Component:** `<Autocomplete>` (tw).

**Severity:** high. Keyboard selection works, mouse selection does not —
which is worse than a total failure, because the field looks fine until
somebody reaches for the mouse.

**Status:** FIXED, 2026-09-03. Second regression from the BUG 1 portal
fix; sibling of BUG 7.

### Symptom

Type, get a filtered list, click an option. The list closes, the input
is left EMPTY, and the typed text is wiped too. Arrow keys + Enter
select correctly.

### Cause

The component's own click-outside effect:

```ts
document.addEventListener('mousedown', (event) => {
  const root = rootRef.current;
  if (root.contains(event.target)) return;   // inside → ignore
  closePopover();
  …resets the input…
});
```

Since BUG 1 the listbox is portaled to `document.body`, so it is NOT
inside `rootRef` — an option IS "outside" by that test. The mousedown on
an option therefore closes the popover and resets the input BEFORE the
option's own `onClick` can fire. The keyboard path raises no mousedown,
which is exactly why it kept working.

### Fix

`Autocomplete.tsx`, in the same handler — bail for the listbox as well
as the root:

```ts
if (root.contains(target)) return;
if (listboxRef.current?.contains(target)) return;
```

### The pattern behind BUG 7 and BUG 8

Both are the same mistake in two places: portaling the listbox moved it
out of the component's DOM subtree, and two pieces of code still asked
"is this inside my root?" to mean "is this mine?". Anything else that
reasons about containment in this component deserves the same look —
`rootRef` no longer spans the whole widget.

### Verified

In a real browser, on inventory-kit's movement form: type `CF`, click
`CF-ARB-1KG` with the mouse, the value commits and the popover closes;
the chevron reopens; a click elsewhere in the dialog dismisses and keeps
the committed value. tw's 2020 tests pass unchanged.

### Covered

`Autocomplete.portal.test.tsx`, five tests. Mutation-checked in both
directions:

  narrowing `isWithinCombobox` back to the root alone  →  3 fail,
  including the user-visible one ("commits the option on the full mouse
  sequence");

  widening the guard to "never dismiss"  →  the click-away test fails.

---

## BUG 9 — `tooltip` leaks onto the DOM element as an invalid attribute

**Component:** originally reported as "all nine field components
(tw)". Verified blast radius is **three**: `TextField`,
`NumberField`, `Textarea`. The other six (`Autocomplete`, `Select`,
`DatePicker`, `RadioGroup`, `Checkbox`, `Switch`) do not spread
`{...rest}` onto any DOM element and therefore cannot leak
structurally — see the *Fixed* section for the verification.

**Severity:** low. It works; it just emits HTML that is not valid.

**Status:** **fixed** 2026-09-03. See *Fixed* section at bottom.

### Symptom

A field given `tooltip="…"` renders the ⓘ correctly AND carries the
whole string as a raw attribute on the input:

```html
<input name="qty" required type="text" placeholder="0" inputmode="decimal"
       tooltip="The unit the ledger counts this article in. It is fixed after the first movement." … />
```

Four such inputs on one dialog in `inventory-kit`. React 19 passes
unknown lowercase attributes through without warning, so nothing in the
console says anything — it was noticed only because a Playwright
strict-mode error printed the element's full HTML.

### Cause

The prop is read from `props` and never removed from the spread:

```ts
const tooltipConfig = resolveFieldTooltip(props.tooltip, …);   // consumed
const { rules, visibleWhen, layout, size, label, helperText, …, ...rest } = merged;
                                                          // `tooltip` not here
<input {...rest} … />                                     // so it goes out
```

Same shape in all nine — `resolveFieldTooltip` is called in each, and
none lists `tooltip` among the destructured keys.

### Fix

Add `tooltip,` to each component's destructuring so it lands in the
consumed set rather than in `...rest`. Nine one-line edits.

Worth a guard afterwards: a test asserting the rendered input carries no
`tooltip` attribute would catch the next prop that forgets to get off
the bus.

---

## BUG 10 — `<DashForm>` renders a `<form>`, so it cannot be used outside a browser

**Severity:** high for any non-DOM renderer. The component is unusable
on React Native, and the failure names a host component rather than the
package, so nothing points at `@dashforge/forms`.

**Status:** **fixed** 2026-09-07 via Option 1 (doc-only). See *Fixed*
section at bottom.

### Symptom

Rendering `<DashForm>` on React Native throws immediately:

```
Render Error
View config getter callback for component `form` must be a function
(received `undefined`). Make sure to start component names with a
capital letter.
```

The component stack shows `<DashFormInner />` then `<DashFormProvider />`,
both from `@dashforge/forms/dist/index.esm.js`. React Native reads
`<form>` as a native host component, finds nothing registered under that
name, and fails.

### Cause

`libs/dashforge/forms/src/components/DashForm.tsx:27`

```tsx
return (
  <form {...formProps} onSubmit={handleSubmit}>
    {children}
  </form>
);
```

It is the **only** DOM element in the whole package. Everything else,
including `DashFormProvider`, the engine adapter and every hook, is
renderer-agnostic. Grepping the package for `<form|<div|<span|<input`
returns this one line plus three occurrences inside JSDoc examples.

### Reproduction (verified)

`dashforge-rn`, the React Native renderer, iOS simulator. A
`TextField` inside `<DashForm>` throws on first render. Replacing
`DashForm` with `DashFormProvider` renders correctly and the field
registers, reads its value from the engine and reports validation
exactly as expected.

### Why this was not caught earlier

The portability check that cleared this package looked for
`document.`, `window.`, `HTMLElement`, `navigator`, `localStorage` and
`addEventListener`. It did **not** look for JSX host elements, so a bare
`<form>` passed a review that was otherwise thorough. Worth repeating on
the other shared packages before the next renderer trusts them.

### Proposed fix

The `<form>` element buys one thing: the browser's native submit, which
`handleSubmit` is already wired to. Two options, least invasive first.

1. **Document `DashFormProvider` as the renderer-agnostic entry point**
   and `DashForm` as the DOM convenience wrapper. Costs nothing, and is
   what the RN renderer does today.
2. **Give `DashForm` a `component` prop** defaulting to `'form'`, so a
   non-DOM renderer can pass its own container. Keeps one public name
   across renderers at the cost of a prop nobody on the web will use.

Option 1 is enough. Option 2 only becomes worth it if a third
non-DOM renderer appears.

---

## BUG 11 — `@dashforge/forms` bundles valtio instead of externalising it

**Severity:** high. It ships `import.meta` in a published bundle, which
is a parse error for every CommonJS consumer, and it puts a second copy
of valtio in any app that already uses one.

**Status:** **fixed** 2026-09-07 (not shipped yet — awaits version
bump). See *Fixed* section at bottom.

### Symptom

Any CJS consumer of `@dashforge/forms@1.0.0` fails to parse it:

```
/…/@dashforge/forms/dist/index.esm.js:3093
  if ((import.meta.env ? import.meta.env.MODE : void 0) !== "production" && …
              ^^^^
SyntaxError: Cannot use 'import.meta' outside a module
```

Line 3093 is not our code. It is valtio's development check, inlined
into the bundle.

### Cause

`libs/dashforge/forms/package.json` declares exactly one dependency:

```json
"dependencies": { "react-hook-form": "^7.71.1" }
```

valtio appears nowhere, in `dependencies` or `peerDependencies`, yet the
published `dist/index.esm.js` contains 19 references to valtio internals
(`proxyStateMap`, `propProxyStates`) and 4 occurrences of `import.meta`.
The rollup build is inlining it rather than treating it as external.

Two consequences, and the second is the quieter one:

- **`import.meta` in a published bundle.** Valid in ESM, a parse error
  under CommonJS. Jest, ts-node, and any bundler configured for CJS all
  fail on it.
- **Two copies of valtio.** An app that uses valtio directly, as
  `@dashforge/rn` does for its theme store, gets its own instance plus
  the one inside `forms`. Valtio keys its proxies in module-level
  `WeakMap`s, so two instances do not share proxy identity: a proxy
  created by one is an ordinary object to the other.

### Reproduction (verified)

`dashforge-rn`, Jest with the React Native preset. Importing
`@dashforge/forms` in any test throws the parse error above. Worked
around locally with a Babel plugin rewriting `import.meta`, which is a
patch on the consumer side for a defect on the publisher side.

### Proposed fix

Add valtio to the rollup `external` list and declare it as a dependency
(or a peer, matching how `@dashforge/ui-core` treats it). The bundle
then imports valtio instead of containing it, `import.meta` never
reaches the published file, and consumers deduplicate to one instance.

Worth checking `@dashforge/ui-core` and `@dashforge/rbac` for the same
pattern in the same pass, since they share the build setup.

---

## BUG 12 — the workspace root installs `react` and `react-dom` as `dependencies`, so every downstream consumer risks a duplicate React

**Severity:** high for any consumer linked into an app with its own
copy of React (which is every real consumer). No warning; hooks return
`null` inside components rendered through Dashforge's providers, and
the failure names `useContext` / `useMemo` in the trace rather than
anything Dashforge-owned.

**Status:** **fixed** 2026-09-07. See *Fixed* section at bottom.

**Reproduced** 2026-09-07 from `~/projects/web/urbango`, an external
pnpm project consuming Dashforge via `link:`. See BUG 11 for the same
shape one level lower (valtio inlined into `@dashforge/forms`). This
is the same class of defect, at the workspace-root layer.

### Symptom

Any pnpm project that consumes a Dashforge subpackage via `link:` and
has its own copy of React sees, on first render:

```
Uncaught TypeError: Cannot read properties of null (reading 'useContext')
    at exports.useContext (react-dom_client.js:12422)
    at Meta (react-router)
Warning: Invalid hook call. Hooks can only be called inside of the body
of a function component. […] You might have more than one copy of React
in the same app.
```

Under SSR/prerender the same shape surfaces as
`Cannot read properties of null (reading 'useMemo')` from
`react-dom-server.node.development.js`, thrown by whichever
consumer of `useSnapshot` in `@dashforge/theme-core` runs first
(`DashforgeThemeProvider` in the reproduced case).

Both errors are the classic "two React instances share the app tree":
the dispatcher is set on one copy, the hook is looked up on the other.

### Cause

`dashforge/package.json` (workspace root, verified 2026-09-07):

```json
"dependencies": {
  "react": "^19.2.5",
  "react-dom": "^19.2.5",
  "react-router-dom": "6.30.3"
}
```

`pnpm-workspace.yaml` covers `packages/*`, `api`, and
`libs/dashforge/*`. Because React is declared as a `dependency` on the
root — not `devDependencies` and not confined to the workspace that
actually needs it — `pnpm install` materialises
`dashforge/node_modules/react` (currently `19.2.5`) alongside every
subpackage's symlink.

The subpackages themselves are already correct — verified across all
eleven `libs/dashforge/*/package.json`:

| Package | `react` in `dependencies`? | `react` in `peerDependencies` |
|---|---|---|
| `@dashforge/ui` | ❌ | `^18.0.0 \|\| ^19.0.0` |
| `@dashforge/tw` | ❌ | `^18.0.0 \|\| ^19.0.0` |
| `@dashforge/theme-mui` | ❌ | (none — inherits from consumer's MUI) |
| `@dashforge/theme-core` | ❌ | (none — depends only on tokens + valtio) |
| `@dashforge/forms` | ❌ | `^18.0.0 \|\| ^19.0.0` |
| `@dashforge/rbac` | ❌ | `^18.0.0 \|\| ^19.0.0` |
| `@dashforge/tw-theme` | ❌ | `^18.0.0 \|\| ^19.0.0` |
| `@dashforge/ui-core` | ❌ | `^18.0.0 \|\| ^19.0.0` |
| `@dashforge/calendar-core` | ❌ | `^18.0.0 \|\| ^19.0.0` |
| `@dashforge/tokens` | ❌ | — |
| `@dashforge/tw-tokens` | ❌ | — |

So the intent at the library layer is right. The root defeats it in
practice: when a consumer's file at
`dashforge/libs/dashforge/ui/src/…/DashforgeThemeProvider.tsx` writes
`import 'react'`, node module resolution walks up and hits
`dashforge/node_modules/react` before it ever reaches the consumer's
`node_modules`. Whatever version sits there wins — and it's the one the
root declared, not the one the consumer ships.

### Reproduction (verified)

`~/projects/web/urbango`, an external Vite 6 + React Router v7 project
consuming Dashforge via `link:`:

```json
"dependencies": {
  "@dashforge/ui": "link:../dashforge/libs/dashforge/ui",
  "@dashforge/theme-mui": "link:../dashforge/libs/dashforge/theme-mui",
  "react": "^19.1.1",
  "react-dom": "^19.1.1"
}
```

Installed with plain `pnpm install`, on `dashforge`'s current commit
(no changes to dashforge). Result:

```
urbango/node_modules/react/package.json    →  "version": "19.2.8"
dashforge/node_modules/react/package.json  →  "version": "19.2.5"
```

Two versions, two on-disk installations, two module identities. Vite
starts, first render throws the `useContext` null in `<Meta>` shown
above. Restarting into SSR prerender throws the `useMemo` null in
`react-dom-server`. Both traces name a Dashforge component
(`DashforgeThemeProvider`) or a component wrapped by it as the
render site; nothing in the trace points at
`@dashforge/*` as the cause.

### Why the existing library-side `peerDependencies` don't save this

The subpackage declaring `react` as a peer only tells the **consumer of
that subpackage** to bring its own React. It does not stop the
workspace root from installing one. Since `link:` bypasses pnpm's own
hoisting logic (the consumer's pnpm never sees Dashforge's install),
whichever `node_modules/react` the resolver reaches first wins — and
for a file inside `dashforge/libs/…` that's always the root's copy.

`resolve.dedupe` in Vite (or the equivalent bundler-side workaround)
can paper over this per-consumer, but only after every consumer has
been taught which alias to write. The root-side fix costs zero
consumer configuration.

### The pattern behind this and BUG 11

BUG 11 is the same shape, one layer lower: a subpackage's
`rollup.config` inlined valtio because `dashforge/package.json` didn't
declare it. Here the workspace root's package.json declares React
where it shouldn't. In both cases the effect is the same — a
Dashforge-shipped copy of a library the consumer already ships,
diverging silently at the resolver.

Worth checking, in the same pass, whether the root's
`react-router-dom` and any other runtime library in
`dashforge/package.json`'s `dependencies` are subject to the same
duplication if a consumer already has them.

### Proposed fix

Remove `react`, `react-dom`, and `react-router-dom` from
`dashforge/package.json`'s `dependencies`. Two moves, ordered by how
big the change is:

1. **If the root needs React for tooling** (build scripts, top-level
   tests, storybook, docs-lab — whichever workspace actually renders
   at the root) — move the three declarations to `devDependencies` on
   the root, or ideally into the specific workspace that renders
   (`docs-lab`, `api`, whichever). Development-time only, never
   published, no `dashforge/node_modules/react` at consumer link
   time.
2. **If nothing at the root actually renders** — delete the three
   entries outright. The subpackages already declare their peers.

After the change, verify:

```
ls dashforge/node_modules/react       → should not exist
pnpm ls -r --depth 0 react            → present only in the workspaces
                                        that legitimately need it
```

A consumer with its own React can then `link:` any Dashforge
subpackage without a duplicate-instance risk.

### Current workaround downstream — remove when this is fixed

`~/projects/web/urbango/vite.config.ts` carries a `react-singleton`
plugin (`enforce: 'pre'`, `resolveId` re-routing every
`react` / `react-dom` / `react-dom/{client,server}` /
`react/jsx-{,dev-}runtime` to a `this.resolve(source, HOST_ANCHOR)`
call anchored at `app/root.tsx`), plus `ssr.noExternal` covering
`@dashforge/*` and the deps that carry the drift transitively:
`valtio` (BUG 11), `motion` / `framer-motion`, `@radix-ui/*`,
`react-hook-form`, `tailwind-variants`, `tailwind-merge`, `clsx`.
Removing the root `react` install lets urbango drop the plugin AND
the `ssr.noExternal` list — the alias for `@dashforge/*` alone would
then suffice.

The urbango workaround is what today's session was closed on
(2026-09-07). It works but must be repeated in every future Dashforge
consumer until the root is cleaned up.

---

## BUG 13 — `<Button>` and `<IconButton>` never show a pointer cursor

**Severity:** low severity, high friction. Nothing breaks; every button in
every consumer app just fails to signal that it is clickable, which reads
as "the page is dead" to the person using it.

**Status:** **fixed** 2026-09-08 (not shipped yet — awaits version
bump). See *Fixed* section at bottom.

**Reproduced** 2026-09-08 in `~/projects/web/urbango`, on
`@dashforge/tw` 1.5.2.

### Symptom

Hovering any `<Button>` shows the default arrow cursor instead of the
pointer hand. Measured on four buttons in the urbango landing (two
`variant="solid"`, one `variant="outline"`, one `variant="ghost"` inside
`IconButton`):

```
getComputedStyle(btn).cursor  →  "default"   (expected "pointer")
```

The buttons are fully functional: focus ring, hover background, click
handlers all work. Only the cursor affordance is missing.

### Cause

`libs/dashforge/tw/src/components/Button/button.variants.ts`

```ts
export const buttonVariants = tv({
  base: [
    'inline-flex items-center justify-center gap-2',
    'font-medium',
    'rounded-md',
    'select-none whitespace-nowrap',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
  ],
  // …
```

There is no `cursor-pointer` in the base array. The reason this is a real
defect rather than a browser default worth relying on: **`<button>` has
`cursor: default` in every modern browser**, not `cursor: pointer`. UA
stylesheets have never set pointer on form controls; the pointer hand on
buttons across the web comes from application CSS or from a framework's
own base layer. Tailwind Preflight does not add it either, and Tailwind
v4 explicitly removed the `cursor-pointer` that some earlier resets
carried.

`IconButton` inherits the same base (`buttonVariants` is reused 1:1),
so it has the same gap.

### Reproduction (verified)

`~/projects/web/urbango`, landing `/it-IT`:

```tsx
<Button variant="solid" size="md">Attiva la tua centrale</Button>
<Button variant="outline" size="md">Leggi di più</Button>
```

Probed in a real browser:

```
[
  { label: "Attiva la tua centrale", cursor: "default" },
  { label: "Leggi di più",           cursor: "default" }
]
```

After adding `cursor: pointer` on the consumer side, the same probe
returns `"pointer"` for all of them.

### Proposed fix

Add `cursor-pointer` to the base array in `buttonVariants`:

```diff
   base: [
     'inline-flex items-center justify-center gap-2',
     'font-medium',
     'rounded-md',
+    'cursor-pointer',
     'select-none whitespace-nowrap',
     'transition-colors',
     'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
     'disabled:opacity-50 disabled:pointer-events-none',
   ],
```

`disabled:pointer-events-none` already neutralises the cursor on
disabled buttons (no pointer events, no cursor change), so no extra
`disabled:cursor-*` rule is needed.

**Worth auditing in the same pass**, since they are all interactive
elements that likely share the omission: `Link` (when rendered as
`<button>` via `asChild`), `MenuItem`, `Tab`, `Chip` if dismissible,
`Switch`, `Checkbox`, `RadioGroup` items, and the `Autocomplete` /
`Select` option rows. Anything a person clicks should say so.

### Current workaround downstream — remove when this is fixed

`~/projects/web/urbango/app/styles/app.css` carries a global rule:

```css
button:not(:disabled),
[role='button']:not([aria-disabled='true']) {
  cursor: pointer;
}
```

It is applied app-wide rather than per-instance `sx="cursor-pointer"`,
because the omission affects every button in the design system. Remove
the rule once `buttonVariants` carries the class itself.

---

## BUG 14 — `<Autocomplete>` (ui): no stacked label, and `renderInput` is removed from the passthrough

Found porting inventory-kit onto the MUI flavour (15/09/2026). Read
straight out of the source; the type-level half is reproduced by a
compile probe.

**Status:** **fixed** 2026-09-15. See *Fixed* section at bottom.

### Symptom

A form mixes `<TextField layout="stacked">`, `<Select layout="stacked">`
and `<DatePicker layout="stacked">` with an `<Autocomplete>`. The first
three put the label above the control; the Autocomplete keeps MUI's
floating label. The row does not align, and there is no prop to make it.

### Cause

`Autocomplete.tsx` declares no `layout`. That alone would be a gap and
not a defect — except the component also closes MUI's own way of doing
it. In MUI the Autocomplete's label lives inside `renderInput`, which is
the only place a consumer can control it, and the passthrough removes it:

```ts
// Autocomplete.tsx:106-123
type PassthroughProps = Partial<
  Omit<
    BaseMuiAutocompleteProps,
    | 'options'
    | 'freeSolo'
    | 'value'
    | 'onChange'
    | 'renderInput'   // ← line 116 — the native escape, removed
    | 'onBlur'
    | 'onInputChange'
    | 'name'
    | 'getOptionLabel'
    | 'getOptionDisabled'
  >
>;
```

So the component supports neither the library's own convention nor the
underlying library's. It is the only field in `ui` in that position:
`Textarea` and `NumberField` also lack `layout`, but they are
`Omit<MuiTextFieldProps, …>` with the passthrough open, so a consumer is
inconvenienced, not blocked (see BUG 15).

### Reproduction (verified)

Compile probe against `@dashforge/ui` from `inventory-kit/client/mui`:

| written | result |
|---|---|
| `<Autocomplete name="f" options={o} layout="stacked" />` | `TS2322 … not assignable to AutocompleteProps` |
| `<Autocomplete name="f" options={o} renderInput={() => <div/>} />` | `TS2322 … not assignable to AutocompleteProps` |
| `<TextField name="a" layout="stacked" />` | compiles |
| `<Select name="e" options={o} layout="stacked" />` | compiles |
| `<DatePicker name="d" layout="stacked" />` | compiles |

Checked and **not** part of this bug — these are correct as they stand:

- `RadioGroup` already renders `<FormLabel>` above the options
  (`RadioGroup.tsx:218`), so it is stacked by construction.
- `Checkbox` and `Switch` wrap in `FormControlLabel`; a boolean control's
  label belongs beside it, not above.

### Proposed fix

Cheapest first: **drop `'renderInput'` from the `Omit`**. It reopens
MUI's native API and implements nothing. The component builds its own
`renderInput` today, so accept an optional override and fall back to it.

Better, for consistency with the rest of the field set: accept
`layout?: FieldLayout` and route it through `FieldLayoutShell` the way
`Select.tsx:430` does.

### Current workaround downstream — remove when this is fixed

`inventory-kit/client/mui/src/components/fields/StackedField.tsx` — a
`FormLabel` + `useId` wrapper whose spacing and type scale were measured
off the DOM a stacked `DatePicker` produces, so the two labels match. It
is used exactly once, on the only Autocomplete that shares a row with
stacked fields.

---

## BUG 15 — `<Textarea>` and `<NumberField>` (ui): no `layout`, though they are the same `MuiTextField` as `<TextField>`, which has it

Read from source, 15/09/2026. Inconsistency rather than a defect —
recorded because it is one line of divergence in three siblings.

**Status:** **fixed** 2026-09-15. See *Fixed* section at bottom.

### Symptom

`<TextField layout="stacked">` compiles. `<Textarea layout="stacked">`
and `<NumberField layout="stacked">` do not, although all three wrap
`MuiTextField`.

### Cause

`TextField.tsx:53` declares `layout = 'floating'` and branches on it
(`:187`). `Textarea.tsx:17` (`Omit<MuiTextFieldProps, 'name'>`) and
`NumberField.tsx:14` (`Omit<MuiTextFieldProps, 'name'|'type'|'value'|'onChange'>`)
declare nothing: the word `layout` does not appear in either file.

Unlike BUG 14 the consumer is not blocked — the MUI passthrough is open,
so `multiline`, `minRows` and `slotProps` all reach the underlying
field. Verified by compile probe.

### Proposed fix

Give both the same `layout` prop and `FieldLayoutShell` branch as
`TextField`. The three share a base; they should share the API.

---

## BUG 16 — `visibleWhen` calls hooks after an early `return null`, so toggling it white-screens the app (ui: `RadioGroup`, `Autocomplete`)

Reproduced live in inventory-kit, 15/09/2026, and confirmed
pre-existing by stashing the kit's changes and re-testing.

**Status:** **fixed** 2026-09-15. See *Fixed* section at bottom.

### Symptom

A field with `visibleWhen` is mounted. The predicate flips. React throws
and unmounts the tree — the whole page goes blank:

- `RadioGroup` → *"Rendered more hooks than during the previous render"*
- `Autocomplete` → *"Rendered fewer hooks than expected"*

### Cause

Both components evaluate visibility, return early, and then call hooks.

`RadioGroup.tsx:146-167`:

```tsx
const isVisible = useEngineVisibility(engine, visibleWhen);
if (!isVisible) { return null; }              // 148
if (!groupAccessState.visible) { return null; }   // 153
…
// IMPORTANT: Resolve option-level access states at top level
// (hooks must be unconditional)
const optionAccessStates = options.map((option) =>
  // eslint-disable-next-line react-hooks/rules-of-hooks   ← 165
  useAccessState(option.access)                            // ← 166
);
```

The comment states the rule the code breaks, and the lint rule that
would have caught it is suppressed on the line above. When the predicate
is false the component returns at 148 and never reaches 166, so the hook
count differs between renders.

`Autocomplete.tsx` is the same shape, with more of it: `return null` at
388 and 394, then `useState` at 502, `useEffect` at 506, `useMemo` at
520, `useEffect` at 547 and 562 — and a second block of hooks at 803-808
in a different branch.

### Why this is the worst entry in this file

It does not degrade — it takes the application down. And `visibleWhen`
is the library's own conditional-field API, so the failure is on the
supported path.

### Proposed fix

Move every hook above the early returns and gate only the returned JSX:

```tsx
const optionAccessStates = options.map(…)   // hooks first, unconditionally
if (!isVisible) return null;                // then the early exits
```

`options.map(useAccessState)` is itself unsound — the hook count tracks
`options.length`, so a field whose options load asynchronously breaks the
same way with `visibleWhen` never used. Resolve option access in one
hook that takes the array, rather than one hook per option.

### Current workaround downstream — remove when this is fixed

inventory-kit mounts and unmounts these two from the parent instead of
using `visibleWhen`:

- `client/mui/src/features/movements/MovementForm.tsx` — `direction`
  (RadioGroup). `unitCost` still uses `visibleWhen`, which is fine
  because it is a `TextField`.
- `client/mui/src/features/counts/CountForms.tsx` — the Zone/Bin
  Autocompletes, rendered on `scopeKind`.

---

## BUG 17 — an explicit `helperText` permanently hides the field's validation message

Read from source, 15/09/2026, and hit in five fields of inventory-kit.

**Status:** **fixed** 2026-09-15. See *Fixed* section at bottom.

### Symptom

A field carries a constant hint — "Unique, uppercase", "Leave empty to
inherit from the category". The field is required, the user submits it
empty, validation fails, the field turns red — and no message ever
appears. The hint sits there instead. Removing the hint makes the error
appear.

### Cause

`components/TextField/textField.validation.ts:41-42`:

```ts
const helperText =
  explicitHelperText ?? (allowAutoError ? autoErr?.message : undefined);
```

`??` gives the explicit prop precedence over the validation message, and
an explicit hint is never nullish. So passing `helperText` at all closes
the channel the error would come through — permanently, not just while
the field is pristine.

The auto-binding itself is right: with no `helperText` passed, the error
arrives on its own with the touched/submitted gating at `:35`. It is the
precedence that is inverted.

### Proposed fix

The error is the more urgent of the two, so it should win while it is
showing:

```ts
const autoMessage = allowAutoError ? autoErr?.message : undefined;
const helperText = autoMessage ?? explicitHelperText;
```

One line below the field, error when there is one, hint otherwise —
which is what the field is documented to do.

### Current workaround downstream — remove when this is fixed

`inventory-kit/client/shared/forms/useFieldHint.ts` — reads
`useDashFieldMeta(name)` and returns `undefined` for the hint while an
error is visible, re-opening the channel from the outside.

---

## BUG 18 — `<AppShell>` (ui) counts the nav width three times on desktop

Measured in the browser, 15/09/2026: main content started at x=560 on a
1440px viewport with a 280px nav, and its right edge ran 187px past the
viewport.

**Status:** **fixed** 2026-09-15. See *Fixed* section at bottom.

### Symptom

With the nav expanded, the page content is pushed far right and overflows
horizontally. Collapsing the rail reduces the error but does not remove it.

### Cause

Three independent offsets for the same nav, each correct alone.

`AppShell.tsx:82-86` — the shell is a flex row:

```tsx
<Box sx={{ display: 'flex', minHeight: '100vh' }}>
```

`LeftNav.tsx:366-367` — on desktop the nav is a **permanent** Drawer,
which is in-flow and therefore already occupies its own column in that row:

```ts
const effectiveMobileVariant =
  isMobile && mobileVariant === 'temporary' ? 'temporary' : 'permanent';
```

`AppShell.tsx:121-123` — and then `main` is offset twice more:

```ts
flexGrow: 1,                            // already fills what the nav left
marginLeft: `${mainOffset}px`,          // pushes it again
width: `calc(100% - ${mainOffset}px)`,  // and narrows it a third time
```

`flexGrow: 1` beside an in-flow Drawer is the whole answer on its own.
The `marginLeft` and `width` belong to the other layout — a `fixed` or
`absolute` nav taken out of flow — and the two were merged.

### Proposed fix

Drop `marginLeft` and `width` from the `main` sx and keep `flexGrow: 1`,
since `LeftNav` is always `permanent` on desktop. Add `minWidth: 0` so a
wide child (a table, a chart) cannot push the flex item past the row.

If a non-flow nav variant is planned, branch on it explicitly rather than
applying both models at once.

### Current workaround downstream — remove when this is fixed

`inventory-kit/client/mui/src/components/layout/AppShell.tsx` passes the
library's own escape hatch:

```tsx
mainSx={{ marginLeft: 0, width: '100%', minWidth: 0 }}
```

---

## BUG 19 — there is no multi-select anywhere in `@dashforge/ui`

Read from source and reproduced by compile probe, 15/09/2026. `tw` has
`<Autocomplete multiple>`; `ui` has no equivalent.

**Status:** **partially fixed** 2026-09-15 (type-level widening).
See *Fixed* section at bottom.

### Symptom

A field holding `string[]` — roles on a user, tags on an article —
cannot be bound. `<Autocomplete multiple>` does not compile,
`<Select multiple>` does not compile, and there is no `CheckboxGroup`.

### Cause

`Autocomplete.tsx:99-104` pins MUI's `Multiple` generic to `false`:

```ts
type BaseMuiAutocompleteProps = MuiAutocompleteProps<
  AutocompleteOption,
  false,   // ← Multiple
  false,
  true
>;
```

`multiple` is not in the `Omit` list, so it survives into
`PassthroughProps` — but typed `false`, which is why the probe reports
`Type 'true' is not assignable to type 'false'` rather than an unknown
prop. The runtime never handles it either: the word `multiple` does not
appear once in the file's 949 lines, and the storage contract is scalar
throughout:

```ts
value?: TValue | null;                        // :139
onChange?: (value: TValue | null) => void;    // :141
// TValue extends string | number
```

`Select.tsx` is the same: `SelectProps<T extends string | number>`
(`:117`), no `multiple` anywhere in the file.

### Proposed fix

Widen `Autocomplete` to MUI's `Multiple` generic and make the bridge
value `TValue[] | TValue | null` accordingly, or ship a `CheckboxGroup`
for the small-set case. Porting `tw`'s Autocomplete API across is
probably the shortest route and keeps the two libraries at parity.

### Current workaround downstream — remove when this is fixed

`inventory-kit/client/mui/src/components/fields/MultiSelectField.tsx` —
a `Select multiple` built on MUI directly, bound through
`DashFormContext` with `bridge.setValue(name, next)` followed by
`registration.onChange(…)`. Note for whoever fixes this: `register` must
be called once per render, not inside the change handler — re-registering
mid-handler discards the value being written, which made the field behave
as a single-select.

---

## BUG 20 — `required` is rejected by `<Autocomplete>` and `<RadioGroup>` (ui)

Compile probe, 15/09/2026. Narrower than it first looked — an earlier
note in the kit's memory said four components, which was wrong and is
corrected here.

**Status:** **fixed** 2026-09-15. See *Fixed* section at bottom.

### Symptom

A required Autocomplete or RadioGroup cannot be marked as such. Every
other field in the same form can.

### Cause

Neither declares `required`, and neither inherits it: `AutocompleteProps`
builds on a filtered `PassthroughProps`, and `RadioGroupProps` is
`Omit<MuiRadioGroupProps, 'name'>` — MUI puts `required` on `FormControl`,
not on `RadioGroup`. The only occurrence of the word in
`RadioGroup.tsx` is a docstring example at `:93` (`rules={{ required: true }}`),
which is validation, not presentation.

By contrast `Select`, `Checkbox` and `Switch` **do** accept it, by
passthrough to MUI, even though they never declare it.

### Reproduction (verified)

| written | result |
|---|---|
| `<TextField required />`, `<Textarea required />`, `<NumberField required />`, `<DatePicker required />` | compiles |
| `<Select required />`, `<Checkbox required />`, `<Switch required />` | compiles (MUI passthrough) |
| `<Autocomplete required />` | `TS2322` |
| `<RadioGroup required />` | `TS2322` |

### Proposed fix

`RadioGroup` already renders `<FormControl>` at `:216` — pass `required`
to it and the `<FormLabel>` at `:218` gets MUI's asterisk for free.
`Autocomplete` should forward it to the `MuiTextField` it builds in its
internal `renderInput`.

### Current workaround downstream — remove when this is fixed

`inventory-kit/client/mui/src/components/fields/requiredLabel.tsx` —
builds the marker into the label node. Used only on those two components.
Worth noting that it is **not** equivalent: a marker drawn in the label
carries no `aria-required`, so the two fields are silent to assistive
technology in a way the rest of the form is not. That is the real cost of
this entry.

---

## BUG 21 — `<Checkbox>` and `<Switch>` (tw): no `required`, so a mandatory consent box cannot be marked

Read straight out of the source, 19/09/2026, while building a sign-up
form in `~/projects/web/urbango-project/ugo-web`.

**Severity:** medium. Not a crash and not a silent failure: the code
simply cannot express a required checkbox, and every consumer solves it
the same wrong way.

**Status:** **fixed v2, verified in the DOM** 2026-09-19 (awaits next
@dashforge/tw version bump). The 2026-09-19 v1 attempt landed the
asterisk but not `aria-required` on the DOM in real browsers (jsdom did
not surface the gap). v2 ships the a11y signal via ref + `useEffect`
and was measured in a browser — see the verification section below.

### Symptom

A form has a mandatory consent box — accept the privacy policy, accept
the terms. Every other field in the same form carries the asterisk that
says «this one is required». The checkbox cannot, because `required` is
not part of its props. The one field that legally must be ticked is the
only one that does not look like it.

### Cause

`tw/src/components/Checkbox/checkbox.types.ts` — `CheckboxProps`
declares, in full:

```
size name label tooltip rules visibleWhen checked defaultChecked
disabled helperText error access sx slotProps onCheckedChange
```

No `required`. And `CheckboxSlotProps` at `:27` is
`root control indicator label helperText errorText` — no
`requiredMark` either, so there is not even a styling hook to hang a
marker on.

Compare `tw/src/components/TextField/textField.types.ts:116`:

```ts
/** Render the asterisk + set the native `required` attribute. */
required?: boolean;
```

### The split is clean, which is what makes it look deliberate and is not

Twelve components in `tw` declare **both** `required?: boolean` and a
`requiredMark` slot:

`Autocomplete`, `DatePicker`, `DateRangePicker`, `DateTimePicker`,
`NumberField`, `OTPField`, `RadioGroup`, `Select`, `Slider`,
`TextField`, `Textarea`, `TimePicker`.

Two do not: **`Checkbox`** and **`Switch`**. They are exactly the two
boolean fields — the shape for which «required» is most often a legal
obligation rather than a preference.

⚠️ **This is `tw`, not `ui`, and it is not BUG 20.** That entry was
about `@dashforge/ui`, where MUI passthrough means `<Checkbox required/>`
compiles; it was fixed on 15/09/2026. The `tw` package is a separate
implementation over Radix and does not inherit anything from MUI. A
reader who remembers BUG 20 will assume this case is covered. It is not.

### Proposed fix

Add `required?: boolean` to `CheckboxProps` and `SwitchProps`, and a
`requiredMark` slot to both `SlotProps`, mirroring `TextField`:
render the asterisk in the label row and set the native `required`
attribute on the input, so `aria-required` comes with it.

The label of a checkbox sits next to the control rather than above it,
so the marker belongs at the end of the label text and not before it.
That is a layout decision the library should make once, which is the
argument for fixing it here instead of in every consumer.

### ✅ Verified in the DOM 19/09/2026 · v2 closes it

Measured in a real browser, on `/it-IT/agenzie-eventi` in `ugo-web`,
with `@dashforge/tw` linked from source and rebuilt:

```js
document.querySelector('button[role=checkbox]').getAttribute('aria-required')
// "true"

document.querySelector('button[role=checkbox]')
  .parentElement.querySelector('label').textContent.slice(-8)
// "rivacy.*"   ← the marker is there too
```

Both halves land: the ref + `useEffect` setter puts `aria-required` on
the element the browser actually shows, and the asterisk renders from
the same `required` variable. The entry is closed.

⚠️ **The first attempt to verify this reported a false negative**, and
it is worth recording why, because it will happen again to anyone
testing a linked Dashforge from a Vite app. Vite serves its optimized
deps with `Cache-Control: max-age=31536000, immutable`, and the `?v=`
browser hash does **not** change when a `link:`-ed package's `dist` is
rebuilt. The browser therefore keeps serving the pre-fix bundle from
its HTTP cache while the dev server, `curl` and the file on disk all
show the fixed one — so source, served bytes and running code disagree,
and only the running code is right. The measurement that finally
settled it read the function off the React fiber:

```js
const b = document.querySelector('button[role=checkbox]')
let f = b[Object.keys(b).find(k => k.startsWith('__reactFiber$'))]
while (f && f.type?.name !== 'Checkbox2') f = f.return
f.type.toString().includes('requiredMark')   // false → stale bundle
```

The cure is to refetch every `/.vite/deps/` URL with
`fetch(url, { cache: 'reload' })` and then reload; a plain reload, and
even `cmd+shift+r` in an embedded browser pane, is not enough.

### Workaround downstream — rimosso

`ugo-web/app/components/forms/privacy-consent.tsx` non disegna più
l'asterisco a mano: i quattro moduli passano `required` e
`slotProps.requiredMark`. Visivamente è corretto; l'accessibilità
aspetta il completamento del fix.

⚠️ **They are not identical to a screen reader.** A marker drawn in the
label carries no `aria-required` and sets no native `required`
attribute: the one field that must be ticked is the only one that
announces nothing. That is the real cost of this entry, and it is the
same cost BUG 20 recorded for `ui` before it was fixed.

---

## BUG 22 — `<Stepper>` + `<DashForm>`: a step's values are DELETED when it unmounts, so a multi-step form cannot read its own earlier answers

Reproduced 19/09/2026 in `~/projects/web/urbango-project/ugo-web`, on
the agency sign-up: a three-step form that collects a password on step
one and submits on step two.

**Severity:** high. It is silent, it only shows up at submit time, and
the natural reading of the API says it should work.

**Status:** **fixed v2, verified in the browser** 2026-09-19 (awaits
next @dashforge/forms + @dashforge/ui-core + @dashforge/tw +
@dashforge/ui version bumps).
The 2026-09-19 v1 attempt exposed `shouldUnregister` on the config but
did NOT gate the explicit `bridge.unregister()` calls in the 26 field
components on unmount, so the values disappeared regardless. v2 threads
the flag through the bridge contract and gates all 26 cleanups.
See *Fixed* section at bottom.

### Symptom

A form split across `<Step>`s cannot read, from a later step, what an
earlier step collected. `rhf.getValues()` does not return an empty
string for those fields: **the keys are gone entirely.**

Measured at the second step, after typing a password on the first:

```
Object.keys(rhf.getValues())
["email","fullName","phone","legalName","tradingName",
 "country","city","vat","agencyEmail","agencyPhone"]
```

`password` and `password2` were in `defaultValues`, were rendered as
bridge-managed `<TextField>`s with `rules`, were typed into with real
keystrokes, and passed their own step's validation. They are simply
not there any more.

### Cause

`<Stepper>` renders only the active step, so the previous step's
children unmount. React Hook Form then drops those fields from its
value store.

The revealing detail is **which fields survive**: `email`, `fullName`
and `phone` are in `defaultValues` and are never rendered as fields at
all. They are still there. Only the fields that were mounted and then
unmounted disappear — which is the opposite of what a consumer expects,
because those are the ones somebody actually filled in.

`DashFormProvider` builds the form with:

```ts
const rhf = useForm<TFieldValues>({ defaultValues, mode, resolver });
```

`libs/dashforge/forms/src/core/DashFormProvider.tsx:143`

No `shouldUnregister`, and **the option is not in `DashFormConfig`**, so
a consumer cannot set it either. `useDashRegister` unregisters from the
adapter on unmount (`useDashRegister.ts:137`) but leaves RHF alone, so
whatever RHF does here is its default and there is no way to change it
from outside.

### Why this matters more than it looks

A stepper exists to split a long form. Splitting a long form means
reading, at the end, what was answered at the beginning. As it stands
the two components cannot be combined for that, and nothing says so:
no warning, no type error, no runtime failure. The request goes out
with empty fields and the server rejects it, which is where the
developer starts looking — three layers away from the cause.

### Proposed fix

Add `shouldUnregister` to `DashFormConfig` and pass it through to
`useForm`, defaulting to `false`. A default of `false` is also the
right one for this pairing: a stepper's whole purpose is that earlier
answers survive.


### ⚠️ Riaperto 19/09/2026 · il fix non ha effetto, e la causa era un'altra

`shouldUnregister` è stato aggiunto a `DashFormConfig`, inoltrato da
`DashForm` e passato a `useForm` con default `false`. Verificato nel
sorgente e nel chunk servito al browser. **I valori spariscono
ugualmente.**

Misurato in `ugo-web`, al secondo passo, dopo aver digitato una
password sul primo:

```
Object.keys(rhf.getValues())
["email","fullName","phone","legalName","tradingName",
 "country","city","vat","agencyEmail","agencyPhone"]
```

Identico a prima del fix.

**Perché.** La cancellazione non è il comportamento automatico di RHF
allo smontaggio, che `shouldUnregister` governa. È una cancellazione
**esplicita**, in ogni componente di campo:

`tw/src/components/TextField/TextField.tsx:92`

```tsx
// StrictMode-safe unregister-on-unmount
useEffect(() => {
  isMountedRef.current = true;
  return () => {
    isMountedRef.current = false;
    const { bridge: cap, name: capName } = unregisterRef.current;
    queueMicrotask(() => {
      if (!isMountedRef.current) cap?.unregister?.(capName);
    });
  };
}, []);
```

e `bridge.unregister` in `forms/src/core/DashFormProvider.tsx:434` fa

```ts
rhf.unregister(fieldName);
adapter.unregisterField(fieldName);
```

`rhf.unregister()` **rimuove il valore** a prescindere da
`shouldUnregister`, che riguarda solo la pulizia automatica.

**Quattordici componenti hanno lo stesso schema:** `Autocomplete`,
`Checkbox`, `DatePicker`, `DateRangePicker`, `DateTimePicker`,
`NumberField`, `OTPField`, `RadioGroup`, `Select`, `Slider`, `Switch`,
`TextField`, `Textarea`, `TimePicker`.

### Fix proposto, corretto

⚠️ **Manca un pezzo prima di poter correggere i campi: oggi un campo
non ha modo di sapere come è configurato il form.** Il bridge espone
`register`, `unregister`, `getValue`, `setValue`, `trigger`… e
**nessun `shouldUnregister`**. Va aggiunto, altrimenti la cleanup non
ha niente da interrogare.

**Tre passi, in quest'ordine.**

**1 · Il bridge porta la politica.** In `ui-core/src/bridge/DashFormBridge.ts`
aggiungere al contratto:

```ts
/** Se il form dimentica i campi smontati. Rispecchia `useForm({ shouldUnregister })`. */
shouldUnregister: boolean;
```

e valorizzarlo in `forms/src/core/DashFormProvider.tsx`, dove il
bridge viene costruito, con lo stesso valore già passato a `useForm`.

**2 · I campi lo leggono.** In tutti e quattordici, la cleanup diventa:

```tsx
return () => {
  isMountedRef.current = false;
  const { bridge: cap, name: capName } = unregisterRef.current;
  // ⚠️ Solo se il form è configurato per dimenticare. Con
  // `shouldUnregister: false` il campo si smonta e il valore resta,
  // che è ciò che rende utilizzabile uno Stepper.
  if (!cap?.shouldUnregister) return;
  queueMicrotask(() => {
    if (!isMountedRef.current) cap?.unregister?.(capName);
  });
};
```

⚠️ **Non cancellare la cleanup e basta.** Il commento la chiama
«StrictMode-safe»: il `queueMicrotask` con il controllo su
`isMountedRef` esiste per non deregistrare durante il doppio montaggio
di React in StrictMode. Quel problema resta reale. Cambia **se**
deregistrare, non come.

**3 · Un test che lo tiene fermo.** Monta un campo dentro un
`DashForm`, scrivici un valore, smonta il campo, e verifica che
`rhf.getValues()` contenga ancora la sua chiave. Con
`shouldUnregister: true` deve invece sparire. Senza questo test la
regressione torna al primo refactoring, perché **un valore mancante non
fa fallire niente**: si scopre tre strati più in là, quando il server
rifiuta una richiesta con i campi vuoti.

### ✅ Verified in the browser 19/09/2026 · v2 closes it

Measured on the real sign-up in `ugo-web`, at submit time on step two,
after typing a password on step one:

```
Object.keys(rhf.getValues())
["email","fullName","phone","password","password2","legalName",
 "tradingName","country","city","vat","agencyEmail","agencyPhone","otp"]
```

`password` and `password2` survive the step boundary. The whole round
then ran with the downstream workaround **removed**: lead created,
code verified, `POST /register` → 200, `account` row written with a
60-character bcrypt hash. The entry is closed.

⚠️ **Clearing `node_modules/.vite` is not enough**, and the first
attempt to verify this reported a false negative for exactly that
reason. Vite serves optimized deps as `immutable` for a year and the
`?v=` hash does not move when a `link:`-ed package is rebuilt, so the
browser keeps running the pre-fix bundle. See the same note under
BUG 21 for the measurement that catches it and the refetch that cures
it.

### Downstream workaround — removed 19/09/2026

`ugo-web/app/registration/components/access-step.tsx` used to hand its
values up through an `onVerified` callback while its fields were still
mounted, with the parent keeping them in a `useRef`. Both are gone:
`register.tsx` reads `password` / `password2` straight off
`rhf.getValues()`.

⚠️ It worked, and it did not scale: every field that had to cross a
step boundary needed its own callback and its own slot in the ref. A
form of three steps and twenty fields would have been carrying most of
itself by hand, which is the job `DashForm` exists to do.

---

## BUG 23 — `<Select multiple>` (tw): the chip's remove button is nested INSIDE the trigger `<button>`, which is invalid HTML and breaks hydration

Reproduced 19/09/2026 in `~/projects/web/urbango-project/ugo-web`, on
the event-agency sign-up form, which uses a multi-select of Italian
regions / Swiss cantons.

**Severity:** medium-high. It is invalid HTML, React reports it as a
hydration error on every render of the page, and the nesting is the
kind the HTML parser rewrites — so the DOM the browser builds is not
the DOM the component described.

**Status:** open.

### Symptom

With at least one option chosen, the browser console carries, on every
load of a page holding a multi `<Select>`:

```
In HTML, <button> cannot be a descendant of <button>.
This will cause a hydration error.
```

and, on the next line:

```
<button> cannot contain a nested <button>.
```

React's own stack names the two elements: the outer
`<button role="combobox" name="areas" aria-required={true}>` and, inside
its chips list, `<button aria-label="Remove Lombardia">`.

### Cause

`tw/src/components/Select/Select.tsx:501` builds the chip's remove
control as a `<button>`:

```tsx
{!effectiveDisabled && (
  <button
    type="button"
    aria-label={`Remove ${labelToText(opt.label) || String(opt.value)}`}
    className={chipRemoveClasses}
    onClick={(e) => handleRemoveChip(opt, e)}
  >
    <ChipRemoveIcon />
  </button>
)}
```

and that markup is assigned to `triggerContent`, which
`Select.tsx:540-563` renders as the children of the trigger:

```tsx
<button
  id={controlId}
  type="button"
  role="combobox"
  ...
>
  {triggerContent}
  <ChevronDownIcon ... />
</button>
```

`<button>` has *phrasing content* as its content model, with no
interactive descendants allowed. The HTML parser does not nest the two:
it closes the outer button and hoists the inner one out, so the tree the
browser builds differs from the tree React rendered — which is exactly
what the hydration error is reporting.

### Why this matters more than a console warning

1. The parser's rewrite moves the remove buttons **out of the trigger**,
   which changes where clicks land and what the trigger's hit area is.
2. A nested interactive element is unreachable in the intended order for
   keyboard and screen-reader users: the outer button swallows the
   focusable child in some ATs and not others.
3. React 19 treats it as a hydration mismatch, and a page that reports
   hydration errors for a *library* component teaches consumers to
   ignore the ones that are their own fault.

### Proposed fix

Take the trigger off `<button>` and give the chips somewhere legal to
live. In order of cost:

1. **Render the trigger as a `<div role="combobox" tabIndex={0}>`** and
   keep every ARIA attribute already on it (`aria-haspopup`,
   `aria-expanded`, `aria-controls`, `aria-required`, `aria-invalid`,
   `aria-describedby`, `aria-disabled`). `handleTriggerKeyDown` already
   drives the listbox from the keyboard, so the only thing lost is the
   implicit Space/Enter activation, which that handler can add. This is
   the pattern the ARIA authoring practices use for an editable combobox
   and the one that makes the nesting legal.
2. **Or move the chips list out of the trigger**, rendering it as a
   sibling above or below, and leave only the summary text and the
   chevron inside the button. This changes the visual design, so it is
   the library's call, not a consumer's.

⚠️ Whatever the choice, `aria-required` and `aria-invalid` must stay on
the element that carries `role="combobox"`, or this re-opens BUG 21's
cost on a different component.

### How to verify it is fixed

On a page with a multi `<Select>` and at least one option chosen:

```js
!!document.querySelector('button[role=combobox] button')
// must be false; today it is true

document.querySelector('[role=combobox]').getAttribute('aria-required')
// must still be "true" on a required field
```

and the console must carry no `cannot be a descendant of <button>`
entry on load.

### No downstream workaround

`ugo-web` ships the form as it is: there is nothing a consumer can do
about markup a library renders from its own props.

---

## BUG 24 — `<Button>` (tw): no way to put one on an inverted surface, so any dark header or footer has to hand-roll it

Hit 19/09/2026 in `~/projects/web/urbango-project/ugo-web`, putting a
quiet «Dashboard» action into the marketing header.

**Severity:** medium. Nothing crashes and nothing is silent — the text
is simply unreadable, which at least shows. It matters because it makes
the library unusable on exactly the surfaces a marketing site has most
of: dark heroes, ink footers, inverted panels.

**Status:** open.

### Symptom

A header whose colours flip between a dark hero and a light scrolled
state cannot use `<Button>` at all. Every variant resolves to a fixed
foreground from the neutral or semantic scales, so on the dark half the
button is dark text on a dark ground.

### Cause

`tw/src/components/Button/button.variants.ts` — the `variant × color`
compound entries pin the text colour outright:

```
{ variant: 'ghost', color: 'primary',   class: 'text-primary-700 hover:bg-primary-50 …' }
{ variant: 'ghost', color: 'secondary', class: 'text-secondary-700 hover:bg-secondary-50 …' }
```

`outline` and `link` do the same. There is no axis that says «take the
colour from the surface you are on», and no `color` value meaning
«inverse». `sx` can override the text colour, but the hover and the
focus ring stay on the light scale, so the result is a button that is
readable at rest and wrong the moment a pointer touches it.

### Why this is the library's problem and not the page's

A design system that cannot be used on half of a marketing site teaches
its consumers to hand-roll buttons, and hand-rolled buttons are how a
system stops being one. The three places that already hand-roll in this
consumer are the nav, the mobile menu and the alliance pitch — all
three for this reason.

### Proposed fix

Two shapes, in order of cost:

1. **A `color="inverse"` value**, with compound entries that use the
   inverse tokens for text, hover and ring. Fits the existing axes,
   costs one set of rows, and is discoverable from the type.
2. **Or a `surface` axis** (`default` / `inverted`) orthogonal to
   `color`, for the case where an inverted *and* semantic button is
   needed (a danger action on a dark panel). More expressive, more rows.

⚠️ What must NOT be the answer is «use `sx`»: the override reaches the
text colour and leaves the hover and the focus ring behind, which is
the state where the problem is invisible until somebody moves a mouse.

### How to verify it is fixed

On a container with a dark background:

```tsx
<div style={{ background: '#201338' }}>
  <Button variant="ghost" color="inverse">Dashboard</Button>
</div>
```

The label must be readable at rest, on hover, and on keyboard focus.

### Current workaround downstream

`ugo-web/app/components/header/session-actions.tsx`,
`components/header/nav.tsx`, `components/header/mobile-menu.tsx` — the
header carries its own tint variables (`--nav-text`, `--nav-muted`,
`--nav-raised`, `--nav-cta-*`) set by `use-header-tint`, and the
actions are plain `<Link>`s styled from them.

⚠️ It works and it is not equivalent: those links get no focus ring
from the library, no `loading` state, and no `disabled` treatment. They
are buttons in appearance only, and every one of them is a place where
the system's behaviour has to be remembered by hand.

---

## BUG 25 — `<Divider orientation="vertical">` (tw) comes out `w-full`, so it breaks the row it was meant to divide

Hit 20/09/2026 in `~/projects/web/urbango-project/ugo-web`, separating
the groups of a toolbar.

**Severity:** medium. It is loud rather than silent — the layout is
visibly wrong — but the cause is invisible from the call site, and the
obvious `sx` fix does not work.

**Status:** open.

### Symptom

A row of buttons with vertical dividers between the groups does not
come out as a row. Every divider takes the full width of the container,
so each group is pushed onto a line of its own and the bar becomes five
rows tall.

Measured on the served page, the vertical divider's box:

```
class  "border-l self-stretch border-solid w-full h-5 mx-1 border-neutral-200"
width  621px      ← the whole container
```

### Cause

`tw/src/components/Divider/divider.variants.ts`, in
`dividerLineVariants`. Two axes disagree and the wrong one wins.

The orientation axis is right:

```
orientation: {
  horizontal: 'h-0 border-t',
  vertical:   'w-0 border-l self-stretch',
}
```

The segment axis is not orientation-aware:

```
segment: {
  full:  'w-full',      ← unconditional
  grow:  'flex-1',
}
```

A line-only divider renders with `segment: 'full'` whatever its
orientation, so a vertical one gets `w-0` from one axis and `w-full`
from the other. `tailwind-merge` keeps the later of two conflicting
width utilities, `w-full` wins, and the divider is a full-width bar
with a left border.

`full` means «span the divider's own main axis». For a horizontal line
that is the width; for a vertical one it is the **height**.

### Why `sx` does not save the call site

`sx="h-5 mx-1"` reads as the right fix and changes nothing about the
width: nothing in it conflicts with `w-full`, so the merge keeps it.
The consumer has to write `w-px` — a width, to beat a width — which
nobody guesses from a prop called `orientation`.

### Proposed fix

Make `segment` a compound of orientation, which is what it always
meant:

```
compoundVariants: [
  { orientation: 'horizontal', segment: 'full', class: 'w-full' },
  { orientation: 'vertical',   segment: 'full', class: 'h-full' },
]
```

and drop `full` from the plain `segment` axis, leaving `grow: 'flex-1'`
(which is already orientation-agnostic and correct).

⚠️ `orientation: vertical` should probably also stop emitting `w-0`:
with a `border-l` the element is 1px wide by its border, and `w-0` plus
a border is a shape that only reads as intentional to whoever wrote it.

### How to verify it is fixed

```tsx
<div className="flex flex-row items-center gap-1">
  <button>A</button>
  <Divider orientation="vertical" sx="h-5" />
  <button>B</button>
</div>
```

A and B must stay on the same line, with a 1px rule between them. Today
B is on the second line.

### Current workaround downstream

`ugo-web/app/components/editor/post-editor.tsx` — `sx="w-px h-5 mx-1"`,
where the `w-px` exists only to beat `w-full` and will look like
superstition to whoever reads it next. Remove it when this is fixed.

---

## BUG 26 — a few components hard-code bare `rounded`, which in Tailwind v4 reads no token, so they cannot be themed

Found 20/09/2026 in `~/projects/web/urbango-project/ugo-web`, giving
the dashboard a theme.

**Severity:** low, and worth an entry anyway: it is small, it is silent,
and it defeats the one thing a token system is for.

**Status:** open.

### Symptom

A consumer whose brand is square sets the radius scale to zero:

```css
@theme { --radius-xs: 0; --radius-sm: 0; --radius-md: 0; /* … */ }
```

Everything squares — Button, Card, Select, TextField — except a handful
of components, which keep a 4px corner nobody asked for and nothing can
reach.

Measured on the served page: `button[role=checkbox]` →
`border-radius: 4px`, with every radius token at `0px`.

### Cause

`tw/src/components/Checkbox/checkbox.variants.ts:24`

```
'rounded border bg-neutral-50',
```

⚠️ In Tailwind v4 `rounded` (no suffix) is **0.25rem hard-coded**, not
`var(--radius-sm)`. Only the suffixed utilities read the scale. So this
class is immune to the theme by construction.

The same bare `rounded` appears in `Slider` and `Skeleton`. `Avatar`,
`Box`, `Card`, `Image` and `Video` also match a grep for it, but there
it is the name of a **prop** (`rounded="lg"`), which is fine and not
this bug — the grep is noisier than the defect.

### Why it is worth fixing rather than working around

A design system's promise is that the brand lives in the tokens. One
component that ignores them is not a small visual difference: it is the
proof that the promise does not hold, and the consumer learns to stop
trusting the scale and to override per component — which is the state
this consumer was in before it had a theme at all.

### Proposed fix

Replace bare `rounded` with `rounded-sm` (the same 0.25rem default) in
`Checkbox`, `Slider` and `Skeleton`. Behaviour is identical out of the
box, and the class starts reading `--radius-sm`.

⚠️ Worth a lint rule rather than a one-off fix: bare `rounded`,
`shadow`, `blur` and `ring` are all v4 utilities that skip the token
scale, and any of them landing later reintroduces this quietly.

### How to verify it is fixed

With `--radius-sm: 0px` in the consumer's `@theme`:

```js
getComputedStyle(document.querySelector('button[role=checkbox]')).borderRadius
// must be "0px"; today it is "4px"
```

### Current workaround downstream

`ugo-web/app/components/forms/field-styles.ts` — `checkboxSlots.control`
carries an explicit `rounded-none`. It is one line in one place because
the consumer has a theme; without one it would have been four forms.

---

## BUG 27 — `<AppShell>` (tw): the root is `min-h-screen`, so the window scrolls and `main`'s own `overflow-y-auto` never engages

Found 20/09/2026 in `~/projects/web/urbango-project/ugo-web`, asking
the dashboard header to stay put.

**Severity:** low-medium. Nothing breaks; the shell simply does not do
the thing its own documentation draws, and two of its classes
contradict each other.

**Status:** open.

### Symptom

The header and the left nav scroll away with the page. A `<TopBar
sticky>` inside the header slot does not help: measured after scrolling
54px, the header sat at `top: -54`.

### Cause

`tw/src/components/AppShell/appShell.variants.ts`

```
root: 'flex flex-col min-h-screen bg-neutral-100',
body: 'flex flex-1 min-h-0',
main: 'flex-1 min-w-0 overflow-y-auto',
```

`main` declares itself the scroller. `root` is `min-h-screen`, so when
the content is taller than the viewport the ROOT grows, the window
scrolls, and `main` never overflows — its `overflow-y-auto` is dead
code in every page that is long enough to matter, which is every page
where it would have mattered.

The two classes describe two different layouts. The component's own
header comment draws the first one:

```
 *   ├────────┴─────────────────────────────────┤
 *   │              footer                      │
```

with a fixed header and nav, which is the layout `main: overflow-y-auto`
was written for.

### Proposed fix

Either make the root fill the viewport:

```
root: 'flex flex-col h-dvh overflow-hidden bg-neutral-100',
```

or, better, put it on an axis, because both layouts are legitimate and
a marketing-style shell wants the page to scroll:

```
layout: {
  viewport: 'h-dvh overflow-hidden',   // header and nav fixed
  page:     'min-h-screen',            // the window scrolls
}
```

⚠️ `h-dvh` and not `h-screen`: on a phone the address bar comes and
goes, and `100vh` is the height the screen has only while that bar is
hidden. `h-screen` produces a shell taller than the window — the page
scrolls again, on exactly the devices where it is most annoying.

⚠️ And the nav needs `overflow-y-auto` of its own in the fixed layout:
fixed must not mean clipped, or on a short screen the last items become
unreachable.

### How to verify it is fixed

With a page taller than the viewport:

```js
document.querySelector('main').scrollTop = 600
window.scrollY                                        // must stay 0
document.querySelector('header').getBoundingClientRect().top  // must stay 0
```

### Current workaround downstream

`ugo-web/app/theme/dashforge.ts` — `AppShell.slotProps` sets
`root: 'h-dvh overflow-hidden'` and `nav: 'overflow-y-auto'`. One place
because the consumer has a theme; without one it would have been every
shell in the product.

---

## BUG 28 — `<Dialog>` and `<Drawer>` (tw) ring their close button on `:focus`, so every dialog opened with the mouse shows a focus ring

Found 20/09/2026 in `~/projects/web/urbango-project/ugo-web`, opening a
read-only detail card from a click.

**Severity:** low, and cosmetic — but it is on the two components where
it is guaranteed to be seen, because both move focus there themselves.

**Status:** open.

### Symptom

Click anything that opens a `<Dialog>`. The `×` in the corner comes up
wearing a 2px ring, before the pointer has gone anywhere near it. It
reads as a framed button, not as focus: the first thing the eye lands
on in a panel is a box around the one control nobody came for.

Measured on the element the dialog had just focused, with the mouse:

```
document.activeElement                  // <button aria-label="Close">
el.matches(':focus-visible')            // false
getComputedStyle(el).boxShadow          // rgb(24,24,27) 0 0 0 2px  ← painted anyway
```

`:focus-visible` says no and the ring is there, which is the whole bug
in two lines.

### Cause

`tw/src/components/Dialog/dialog.variants.ts:48`

```
'focus:outline-none focus:ring-2 focus:ring-primary-500',
```

`tw/src/components/Drawer/drawer.variants.ts:80`

```
'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
```

Plain `:focus`, so it matches however focus arrived — and it always
arrives: Radix moves focus into the panel on open, and the close button
is the first focusable thing in it. A mouse click therefore paints a
ring every single time.

⚠️ **The library already knows better everywhere else.** 28 files use
`focus-visible:ring`; these two lines are the only `focus:ring` in
`tw/src`. It is not a policy, it is two lines that were missed — and
they landed on the two components that focus something on open, which
is why they are the ones you see.

### Proposed fix

```
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
```

in both files. Keyboard users keep the ring — Tab into the close button
and `:focus-visible` matches — and a mouse-opened panel comes up clean.

⚠️ Do NOT fix it by suppressing the focus move instead (`onOpenAutoFocus`
preventing default): focus has to enter the panel or Escape and Tab stop
belonging to it. The problem is what the ring is drawn on, not that the
button has focus.

### How to verify it is fixed

Open a dialog **by clicking**:

```js
const el = document.activeElement          // the Close button
el.matches(':focus-visible')               // false
getComputedStyle(el).boxShadow             // must now be 'none'
```

Then press Tab twice to come back to it: `:focus-visible` true, ring
painted.

### Current workaround downstream

None. `ugo-web` leaves it as it is: the ring is wrong but harmless, and
overriding it from the consumer's theme would mean re-specifying a focus
treatment for the one component whose default is out of step with the
other 28.

---

## BUG 29 — RITIRATO. Non era un difetto: `useDashFieldMeta` esiste e fa esattamente questo

Aperto e ritirato il 21/09/2026, lo stesso giorno.

**Status:** invalid.

### Cosa avevo scritto

Che da un componente figlio non c'è modo di seguire il VALORE di un
campo, perché `useDashFormState` copre solo lo stato del modulo.

### Perché è sbagliato

`useDashFieldMeta(name)` restituisce `{ value, error, touched, dirty,
submitCount, allowAutoError }` e si iscrive per davvero:
`useSyncExternalStore` sopra `bridge.subscribeField`, quindi il
consumatore si ridisegna solo quando cambia il SUO campo.

Non l'ho trovato perché ho cercato «watch» negli export e mi sono
fermato a `useDashFormState`. Il nome giusto c'era, e il commento in
`DashFormProvider.tsx` lo dice a chiare lettere: *«consumers must use
subscribeField/useDashFieldMeta to observe per-field state changes»*.

### Cosa resta vero, e vale la pena sapere

`rhf.watch(['a','b'])` letto durante il render da un figlio **non
iscrive quel figlio**, ed è un no-op silenzioso. Verificato nella
sorgente di react-hook-form 7.74.0:

- `watch` con un array chiama `_getWatch(names, dv, true)`, che
  registra i nomi in `control._names.watch` e RESTITUISCE i valori: la
  sottoscrizione non la crea (`dist/index.esm.mjs:2132`);
- la forma a callback, `watch(fn)`, invece sottoscrive davvero e
  torna una `Subscription`;
- il re-render vive in `useForm` (`:3010`), cioè nel provider, e il
  contesto di Dashforge è **identity-stable di proposito** — il
  bridge non cambia a ogni tasto premuto — quindi il figlio non si
  ridisegna.

⚠️ Questo però non è un difetto di Dashforge: è il motivo per cui
`useDashFieldMeta` esiste. Semmai varrebbe un avviso in sviluppo
quando `rhf.watch(names)` viene chiamato fuori dal provider, perché il
modo in cui fallisce — a volte sì e a volte no, a seconda di quale
altro stato locale provoca un render — costa più di un errore.

---

## BUG 30 — `<Chip>` (tw) hardcodes `rounded-full`, so a token theme that squares every corner cannot square the chip

Found 24/09/2026 in `~/projects/web/urbango-project/ugo-web`, putting a
status label on a row in an app whose theme sets every radius to `0px`.

**Reproduced and measured.** Rendered the chip inside that app and read
the computed style off the element:

```
chip   getComputedStyle(el).borderRadius   // 1.67772e+07px  ← calc(infinity * 1px)
card   getComputedStyle(el).borderRadius   // 0px
```

Everything around it is square because the theme says so; the chip is
round because the theme cannot reach it.

**Severity:** low, and cosmetic. It shows wherever a consumer theme
departs from the default radii, which is the case this library exists to
support.

**Status:** **NOT A DEFECT** — verified 24/09/2026. The central claim
(«`rounded-full` resolves to a literal, so overriding the token scale
leaves it untouched») is false under `dashforgePreset()`. `rounded-full`
IS token-driven here. See § Verifica below for the evidence. A narrower
request survives and is worth keeping — see § Cosa resta in piedi.

### Symptom

An app that squares every corner gets one component that stays a pill.
The chip is the only rounded thing on the page, which reads as a foreign
element rather than as a label.

### Cause

`tw/src/components/Chip/chip.variants.ts`, in the base:

```
base: [
  'inline-flex items-center gap-1 rounded-full font-medium',
  ...
```

`rounded-full` is not token driven. Tailwind v4 ships eight radius
tokens, `--radius-xs` through `--radius-4xl`, and `rounded-full` is none
of them: it resolves to a literal, so overriding the token scale leaves
it untouched. An app can zero all eight and the chip stays round.

### Defect or request

Calling it a defect rather than a feature ask, because the library
states the opposite intent for its own variants. From
`typography.variants.ts`:

> Each variant baseline maps to a Tailwind utility chain that resolves
> through the @dashforge/tw-tokens scale (so the visual stays in sync
> with the rest of the system when the token theme is patched).

The chip's radius does not resolve through anything a theme can patch.

⚠️ The counter-argument is fair and worth recording: a pill may be a
deliberate design decision for this component, in which case the answer
is a documented `shape` variant rather than a fix.

### What it would take

A `shape` variant (`pill` default, `square` opt-in), or a
`--radius-chip` token that defaults to full. Either keeps the current
look for everyone who has not asked for anything else.

### ✅ Verifica 24/09/2026 — la premessa è sbagliata: `rounded-full` È token-driven

Il report ragiona su **Tailwind vanilla**, dove `rounded-full` è il
literal `calc(infinity * 1px)` e i token sono `--radius-xs` …
`--radius-4xl`. Dashforge non usa quella scala: `dashforgePreset()`
**sostituisce** l'intero `borderRadius` con le proprie chiavi, e
`full` è una di quelle.

**1 · Il tipo dei token dichiara `full`.**
`tw-tokens/src/theme/types.ts:56-64` — `TWRadiusTokens` ha
`none · sm · md · lg · xl · 2xl · full`. Sette tier, non sei.

**2 · Il default le valorizza tutte.**
`tw-tokens/src/theme/defaults.ts:173-181` — `sharedRadius.full = '9999px'`.

**3 · Il preset mappa OGNI chiave a una CSS var, `full` compresa.**
`tw-theme/src/adapter/dashforgePreset.ts:191` fa
`borderRadius: mapKeysToCssVarRefs(theme.radius, 'radius')`, e
`mapKeysToCssVarRefs` (`:88-101`) itera su `Object.keys` senza
esclusioni.

**4 · Il runtime emette la variabile.**
`tw-theme/src/runtime/cssVars.ts:91-93` — il loop su
`Object.entries(theme.radius)` emette `--df-tw-radius-{key}` per
ognuna.

**Eseguito, non dedotto.** Tre probe temporanei contro il codice reale
(rimossi dopo la verifica):

```
--df-tw-radius-full            = 9999px
borderRadius keys              = none, sm, md, lg, xl, 2xl, full
borderRadius.full              = var(--df-tw-radius-full)      ← non un literal
theme con radius.full: '0rem'  → --df-tw-radius-full = 0rem
```

Quindi il chip di un consumer che vuole angoli vivi si squadra così:

```ts
patchTheme({ radius: { full: '0rem' } });
```

**5 · E comunque `sx` arriva al raggio, completamente.** Verificato
con un probe su `cn(chipVariants(), 'rounded-none')`: `twMerge` fa
last-wins e `rounded-full` sparisce dalla stringa. Idem con
`rounded-md`. Diversamente da BUG 24 — dove `sx` raggiunge il testo
ma lascia indietro hover e focus ring — qui la proprietà è una sola,
quindi l'override non lascia residui.

### ⚠️ Perché NON è lo stesso caso di BUG 26

Vale la pena tenerli distinti, perché sono stati aperti a quattro
giorni di distanza e sembrano lo stesso tema:

| | BUG 26 | BUG 30 |
|---|---|---|
| Classe | `rounded` bare | `rounded-full` |
| Esiste un token corrispondente? | no (`DEFAULT` non è nei sette tier) | **sì**, `radius.full` |
| Riprodotto? | sì, sulla pagina servita (`border-radius: 4px` con token a 0) | no, solo lettura da sorgente |
| Contratto rotto? | sì | no |

BUG 26 resta valido: `rounded` bare non corrisponde a nessuna chiave
del preset, quindi cade sul default di Tailwind e nessun tema lo
raggiunge. BUG 30 no: la chiave c'è.

### Cosa resta in piedi, e vale la pena tracciare

Il report ha un punto che sopravvive alla verifica, ma è **una
richiesta di feature, non un difetto**: `radius.full` è un martello
unico. Chi lo azzera per squadrare i chip squadra anche tutto il
resto che usa `rounded-full` in modo **semanticamente obbligato**.
Censiti gli otto che lo forzano nel `base`/`slots` (cioè senza asse
che lo possa cambiare):

| Componente | `rounded-full` forzato | La forma tonda è obbligata? |
|---|---|---|
| `RadioGroup` | ×2 | **sì** — un radio quadrato non è un radio |
| `Switch` | ×2 | **sì** — il thumb scorre dentro un binario |
| `Slider` | ×4 | **sì** — thumb e track |
| `Progress` | ×2 | convenzionale |
| `Stepper` | ×1 | convenzionale (pallino dello step) |
| `Badge` | ×1 | convenzionale |
| `LeftNav` | ×1 | convenzionale (pill dell'item attivo) |
| **`Chip`** | ×1 | **no** — è l'unico dove la forma è una scelta |

Altri cinque (`Avatar`, `Box`, `Image`, `Video`, `Skeleton`) espongono
già un asse `rounded`, quindi lì il consumer sceglie per istanza.

Il gap reale è quindi: **`Chip` è l'unico componente la cui forma è
opinabile e che non espone un asse per cambiarla**. Stessa forma di
BUG 21 (`Checkbox`/`Switch` senza `required` mentre dodici fratelli
ce l'avevano): non un difetto, una asimmetria di API.

**Proposta**, se si decide di chiuderlo: aggiungere a `Chip` un asse
`shape?: 'pill' | 'square'` con default `pill`, che sposti
`rounded-full` dal `base` al valore `pill` dell'asse. Additivo, zero
impatto su chi non lo passa, e allinea `Chip` alla convenzione di
`Box`/`Image`/`Video`. Costo stimato: mezz'ora più il test.

### Nota per l'agent che mantiene questo registro

Due volte su due, un report che parla di «token Tailwind» si è
rivelato ragionato sulla documentazione di Tailwind **vanilla**
invece che sul preset di Dashforge. Prima di aprire una voce che dice
«questa classe non legge nessun token», la verifica è:

1. la chiave esiste in `TWRadiusTokens` / `TWSpacingTokens` / … in
   `libs/dashforge/tw-tokens/src/theme/types.ts`?
2. `dashforgePreset()` la mappa? (`mapKeysToCssVarRefs` non esclude
   nulla, quindi basta che la chiave esista nel tema)
3. `twThemeCssVars()` emette la variabile?

Se le tre risposte sono sì, la classe È themeable e il report è
partito da una premessa sbagliata. Costa cinque minuti e evita di
aprire una voce che poi va ritirata.

## BUG 31 — `<Calendar>` (tw): a selectable sibling-month day is painted like a disabled one, and neither a consumer nor a theme can separate the two

Found 25/09/2026 in `~/projects/web/urbango-project/ugo-web`, on a
booking form whose `DatePicker` carries `minDate = today`: a hotel picks
the day a guest is driven to the airport, and yesterday is not a day.

**Severity:** low, and cosmetic. But it is cosmetic about *affordance*,
which is the one thing a date grid exists to communicate.

**Status:** open. Reported as a **request**, not a defect — see
§ Defect or request.

### Symptom

Today is 25/09/2026. The September grid opens and the user reads:

- 1–24 September: grey. Correct, they are past.
- 25–30 September: black. Correct.
- **1–11 October** (the trailing days of the 42-cell grid): **also
  grey — and fully selectable.**

So the grid uses one visual idiom, "greyed out", for two opposite
meanings: *you cannot pick this* and *you can pick this, it just belongs
to next month*. The user's report was literally «perché le date future
sono grigie? le posso selezionare comunque ma sono grigie».

### Measured, not read

Every one of the 42 buttons, via `getComputedStyle` on the running app:

| Cells | `aria-disabled` | `color` | `opacity` | Selectable |
|---|---|---|---|---|
| 31 Aug – 24 Sep | `true` | `rgb(212,212,216)` | `0.6` | no |
| 25 – 30 Sep | `false` | `rgb(24,24,27)` | `1` | yes |
| **1 – 11 Oct** | **`false`** | **`rgb(161,161,170)`** | **`1`** | **yes** |

Note the inversion that makes it worse than a plain collision: the
disabled grey composites to roughly `rgb(229)` on white, i.e. it is
*lighter* than the sibling-month grey at `rgb(161)`. The day you cannot
pick is the fainter one, the day you can pick is the stronger one, and
both are "not black". Nothing on the cell distinguishes them except a
difference of about 68 levels of luminance.

### Cause

`libs/dashforge/tw/src/components/Calendar/calendar.variants.ts:41`

```ts
siblingMonth: {
  true: 'text-neutral-400',
},
```

and ten lines below, `:51`

```ts
disabled: {
  true: 'cursor-default text-neutral-300 opacity-60 hover:bg-transparent',
},
```

Two independent axes, each muting the text, with no compound variant
reconciling them. (`cn`/tailwind-merge does resolve the *overlap*
correctly when a cell is both: 31 August comes out `neutral-300`. The
problem is not the overlap, it is that `siblingMonth` alone already
looks like `disabled` alone.)

### Why a consumer cannot fix it downstream

`libs/dashforge/tw/src/components/Calendar/Calendar.tsx:250-256`

```tsx
className={cn(
  calendarDayVariants({
    siblingMonth: day.isSiblingMonth,
    today: day.isToday,
    selected: day.isSelected,
    disabled: day.isDisabled,
  }),
  themeSlotProps?.day?.className, slotProps?.day?.className,
)}
```

`slotProps.day.className` is a flat string applied to **all 42 cells**,
and so is the theme-level `themeSlotProps.day.className`. There is no
per-state slot, no render prop, and no `showSiblingDays` switch. An app
that wants sibling days to read as selectable has exactly three
options, all bad: restyle every cell identically (which also erases the
disabled treatment), reach into the DOM after render, or fork the
component.

### Defect or request

**Request**, and deliberately not called a defect. Muting the days that
belong to the neighbouring month is the standard convention — React Day
Picker, MUI's `DateCalendar` and the HTML `<input type="date">` pickers
all do some version of it, and shipping it as the default is a
reasonable decision. What is missing is the *escape hatch*: the library
makes the decision and then leaves no supported way to depart from it,
which is the same API asymmetry recorded in BUG 26 and BUG 30.

⚠️ The counter-argument, recorded honestly: the two greys *are*
distinguishable, and a user who studies the grid can work out the rule.
The report is that at a glance they do not read as two categories — and
a date grid is scanned, not studied.

### Proposal, least invasive first

1. **`showSiblingDays?: boolean`, default `true`.** When `false`, the
   trailing and leading cells render as empty placeholders that keep the
   7-column geometry. This is the cheapest fix and it resolves the whole
   class of confusion for any form where "a day of the next month" is
   not a distinct concept — which is most forms. Additive, no impact on
   anyone who does not pass it.
2. **Let `slotProps.day` be a function of the day's state**, e.g.
   `day?: DaySlotProps | ((state: CalendarDayState) => DaySlotProps)`,
   with `CalendarDayState` being the four booleans already computed at
   `Calendar.tsx:251`. This is the general fix: it lets a theme restyle
   one state without touching the others, and it costs nothing at the
   call sites that pass an object today.

Point 1 alone would close the report. Point 2 is what stops the next
one of this shape from being opened.

### Current workaround downstream

None. Left as it ships: the click on a past day is correctly refused by
`selectDate`, so nothing is broken — only harder to read than it should
be.

## BUG 32 — BUG 17 was fixed only on the MUI side: `@dashforge/tw` still hides every validation message behind an explicit `helperText`

Found 25/09/2026 in `~/projects/web/urbango-project/ugo-web`, making a
telephone field required on a booking form. The field goes red on
submit and then tells the user the hint instead of what is wrong.

**Severity:** medium, and higher than BUG 17's original rating. It is
not a missing nicety: the field turns red and the sentence under it, now
also red, does not say why. A consumer who follows the library's own
advice and writes a helpful hint loses every validation message on that
field, and nothing warns.

**Status:** **fixed** 2026-09-25 (source; awaits the next
`@dashforge/tw` version bump). Report confirmed in full — see *Fixed*
section at bottom. **Reproduced in a running app and read from both
sources.** This is a defect, not a request: BUG 17 was recorded in
*Fixed* as closed «across all fields that shared the shape», and on
this renderer it was not. That wording has now been corrected in the
BUG 17 entry rather than deleted.

### The two lines, side by side

`libs/dashforge/ui/src/components/TextField/textField.validation.ts`,
fixed 15/09/2026:

```ts
const helperText = autoMessage ?? explicitHelperText;
```

`libs/dashforge/tw/src/components/_shared/resolveValidationState.ts:56`,
untouched:

```ts
const helperText =
  explicitHelperText ?? (allowAutoError ? autoErr?.message : undefined);
```

Same inverted precedence BUG 17 described, still there on the renderer
this library ships as its own.

### Why it was missed, which is the part worth keeping

The tw resolver's docstring says, at `:19-25`:

> **Renderer-agnostic** — copy of the MUI-side `textField.validation.ts`.
> […] Precedence rules (matches MUI side byte-for-byte)

The claim was true when it was written and is false now. BUG 17's fix
lists four files, all under `libs/dashforge/ui/`, and the register's
verification step was «grep of `import.*textField.validation`», which by
construction cannot reach a file that is a *copy* rather than an import.
A duplicated resolver with a comment promising it is a duplicate is
exactly the shape that survives a fix.

### Reproduction (verified in the browser)

A `<TextField name="phone" required helperText="…" rules={{ required: '…' }} />`
inside `<DashForm>`, submitted empty. Read off the live DOM:

```
input[name=phone]   aria-invalid = "true"
text under it       "Chi l'autista chiama se non trova l'ospite. …"   rgb(220, 38, 38)
```

The neighbouring `name="passenger"`, identical but with **no**
`helperText`, shows its rule's message in the same red. So the error
channel works; the hint is simply winning over it.

Net effect: the field is painted as wrong and then explains something
else, in the colour of an error. That is worse than showing nothing,
because the user reads a red sentence and cannot act on it.

### Blast radius

One file, fourteen components. Every tw form component resolves through
the same shared function:

`Autocomplete`, `Checkbox`, `DatePicker`, `DateRangePicker`,
`DateTimePicker`, `NumberField`, `OTPField`, `RadioGroup`, `Select`,
`Slider`, `Switch`, `Textarea`, `TextField`, `TimePicker`.

Unlike the MUI side, tw has **no inline copies**: a grep for the
inverted shape across `libs/dashforge/tw/src/components/` returns only
`_shared/resolveValidationState.ts` itself. One line closes all
fourteen.

### Proposed fix

The same diff BUG 17 applied, on the other renderer:

```diff
- const helperText =
-   explicitHelperText ?? (allowAutoError ? autoErr?.message : undefined);
+ const autoMessage = allowAutoError ? autoErr?.message : undefined;
+ const helperText = autoMessage ?? explicitHelperText;
```

Then two things that stop the next one:

1. **Correct the docstring**, or delete the «byte-for-byte» claim. A
   comment that asserts parity is worth less than nothing once it is
   the reason nobody looked.
2. **Move the resolver test across.** BUG 17 added
   `textField.validation.test.ts` pinning six invariants on the MUI
   resolver. The tw copy has no equivalent, which is why a renderer
   shipped the old behaviour for ten days without a red test. Either
   port the file or, better, delete one of the two resolvers and have
   both renderers import the survivor: the duplication is the bug
   behind the bug.

### Current workaround downstream

None applied, deliberately. `ugo-web` keeps its `rules={{ required: … }}`
message, which is correct code and today never reaches the screen, and
leans on a hint written so that it still reads as an instruction when it
turns red. The message starts working the day this is fixed.

## Unconfirmed

*(nothing yet — move suspicions here rather than into the list above)*

## Fixed

### BUG 32 — BUG 17's fix never reached `@dashforge/tw`

**Fixed** 2026-09-25 in the source tree, awaiting the next
`@dashforge/tw` version bump. **The report was correct on every
point**, including the diagnosis of why the original verification
could not have caught it.

**Verifica.** Letto
`tw/src/components/_shared/resolveValidationState.ts`: la riga 56-57
conteneva esattamente la forma vecchia
(`explicitHelperText ?? (allowAutoError ? autoErr?.message : undefined)`),
e il JSDoc sopra la documentava come regola intenzionale — «Explicit
props win», «matches MUI side byte-for-byte». Blast radius misurato:
**14 componenti** importano quel resolver (`Autocomplete`, `Checkbox`,
`DatePicker`, `DateRangePicker`, `DateTimePicker`, `NumberField`,
`OTPField`, `RadioGroup`, `Select`, `Slider`, `Switch`, `TextField`,
`Textarea`, `TimePicker`). Cercate altre copie inline del pattern in
tutto `tw/src`: **nessuna**, a differenza del lato MUI dove `Textarea`,
`NumberField` e `RadioGroup` ne avevano una propria. Una riga, quattordici
componenti.

**Provato, non dedotto.** Probe temporaneo (poi rimosso) contro il
resolver reale, prima del fix:

```
error       = true
helperText  = "Unique, uppercase"
```

Cioè esattamente la forma descritta nel report: il campo **è** in
errore — quindi dipinge lo stato danger e imposta `aria-invalid="true"`
— ma il testo sotto è l'hint. Un campo rosso che non dice perché.
Combacia con la misura del report sul DOM vivo (`aria-invalid="true"`,
testo in `rgb(220, 38, 38)`).

**Il fix.** Stessa inversione che BUG 17 aveva portato sul lato MUI:

```diff
- const helperText =
-   explicitHelperText ?? (allowAutoError ? autoErr?.message : undefined);
+ const autoMessage = allowAutoError ? autoErr?.message : undefined;
+ const helperText = autoMessage ?? explicitHelperText;
```

`error` resta invariato: un prop esplicito continua a forzare lo stato
visivo. Riscritto anche il JSDoc, perché la frase «matches MUI side
byte-for-byte» era precisamente l'invito a non verificare che ha fatto
sopravvivere il difetto dieci giorni. Al suo posto c'è un avviso che
dice che i due file sono copie tenute in passo a mano e che vanno
cambiati insieme.

**Il guard.** Nuovo file
`tw/src/components/_shared/resolveValidationState.test.ts`, sette
asserzioni che ricalcano quelle già presenti sul lato MUI
(`ui/src/components/TextField/textField.validation.test.ts`): messaggio
vince su touched, messaggio vince dopo submit, hint torna quando non
c'è errore, hint resta mentre il campo è pristine, messaggio passa
senza hint, `error` esplicito forza comunque il visivo, entrambi
assenti danno `undefined`. La docstring di ciascuna delle due suite
rimanda all'altra.

**Suite dopo il fix**: `nx test @dashforge/tw` 2014 passati (erano
2007), 1 skip preesistente, 0 falliti. Typecheck verde. Nota: **nessun
test tw esistente codificava la precedenza vecchia**, a differenza del
lato MUI dove cinque la pinnavano e andarono aggiornati. Il
comportamento sbagliato non era protetto da niente, il che è anche il
motivo per cui non ha fatto rumore.

**Nota per l'agent che mantiene questo registro.** La lezione non è
sul `helperText`, è sul metodo. La verifica di BUG 17 diceva:

> Grep of `import.*textField.validation` returned five callers.

Un grep sugli import trova i **consumatori** di un file, mai le sue
**copie**. Nel monorepo Dashforge i due renderer sono isolati per
progetto (solo il bridge layer è condiviso), quindi la duplicazione di
logica fra `ui/` e `tw/` è strutturale e attesa. Prima di dichiarare
chiuso un fix «su tutti i file che condividono la forma», la verifica
giusta è cercare **il pattern**, non l'import:

```bash
# sbagliato: trova solo chi importa il file MUI
grep -rn "import.*textField.validation" libs/

# giusto: trova la forma ovunque sia, copie comprese
grep -rn "explicitHelperText ??" libs/dashforge/*/src
```

Vale per qualsiasi logica duplicata fra i due renderer, non solo per
questo resolver. Quando un fix tocca `ui/`, la domanda successiva è
sempre: «esiste la stessa cosa sotto `tw/`, scritta a mano?».

---

### BUG 22 — `<Stepper>` + `<DashForm>` values lost on step unmount

**Fixed v2** 2026-09-19 in the source tree, awaiting the next
`@dashforge/forms` + `@dashforge/ui-core` + `@dashforge/tw` +
`@dashforge/ui` version bumps.

**Why v2 was needed.** The v1 attempt exposed `shouldUnregister` on
`DashFormConfig` and passed it to `useForm`, on the assumption that
RHF's own default was what dropped the values. It wasn't. The
register's follow-up (§ Riaperto) pinpointed the real culprit:
`bridge.unregister(name)` in `DashFormProvider.tsx:434` explicitly
calls `rhf.unregister(fieldName)`, which drops the field's value
regardless of RHF's `shouldUnregister`. And that `bridge.unregister`
is invoked from the unmount cleanup of ALL 26 bridge-integrated
field components (14 tw + 12 ui) via the `queueMicrotask`
StrictMode-safe pattern. The v1 fix moved the config knob but left
the 26 cleanups unchanged, so a Stepper still lost data.

**Verification method (v2).** Read `DashFormProvider.tsx:431-435` to
confirm the explicit `rhf.unregister(fieldName)` chain. Read
`ui-core/src/bridge/DashFormBridge.ts:93` to confirm the bridge
contract had no `shouldUnregister` field. Grepped the workspace for
the `queueMicrotask(() => { if (!isMountedRef.current) …unregister?.(…);
})` pattern; found 26 files (14 tw, 12 ui), 2 formatting variants of
the same shape.

**The v2 fix, in three co-ordinated edits:**

1. `ui-core/src/bridge/DashFormBridge.ts` — added
   `shouldUnregister: boolean` to the `DashFormBridge` interface with
   JSDoc explaining the Stepper-friendly default (`false`).

2. `forms/src/core/DashFormProvider.tsx` — populated `shouldUnregister`
   on the `bridgeValue` object with the same value passed to `useForm`,
   added to the `useMemo` deps array so a runtime toggle still gives
   consumers a fresh bridge identity.

3. **All 26 field components** (`libs/dashforge/tw/src/components/<N>/<N>.tsx`
   ×14 and `libs/dashforge/ui/src/components/<N>/<N>.tsx` ×12) — the
   unmount cleanup gained a `if (!cap?.shouldUnregister) return;` gate
   right before the `queueMicrotask` schedule. The StrictMode-safe
   pattern (queueMicrotask + `isMountedRef` check) is preserved
   verbatim — the fix changes *whether* to run cleanup, not *how* to
   run it safely.

Patched via a Python script that anchored on the exact 2-line pattern
`const { bridge: cap, name: capName } = unregisterRef.current;` +
`queueMicrotask(() => {` (tw variant) and the multi-line equivalent
with `capturedBridge` alias (ui variant). 26 files patched, 0 skipped.

**The guard.** `libs/dashforge/forms/src/core/DashFormProvider.shouldUnregister.test.tsx`
mounts a Stepper-shaped harness with a `<TestInput>` that mirrors
what the real field components do: registers via `useDashRegister`,
AND chains `bridge.unregister(name)` on unmount gated by
`bridge.shouldUnregister`. Three tests: default (omitted) preserves
values, explicit `false` preserves, explicit `true` scrubs. All three
green.

**Full suite after v2**: forms 201/201, tw 2007/2008 (1 pre-existing
skip), ui 598/599 (1 pre-existing skip). Typecheck across all four
packages green.

**Note for the agent maintaining this register.** The 26-component
gate is fragile in the sense that a new bridge-integrated field
component added later would inherit the OLD pattern unless the
maintainer knows to add the `if (!cap?.shouldUnregister) return;`
line. A durable fix would extract the cleanup into a shared hook
(`useBridgeUnmountCleanup`) that reads `bridge.shouldUnregister`
once. That refactor is worth doing when a 15th `tw` or 13th `ui`
field component is next added; until then, the inline gate is the
27-line pragma that matches the pre-existing convention of these
files.

---

### BUG 22 — v1 (superseded by v2 above)

**Fixed** 2026-09-19 in the source tree (`@dashforge/forms`), awaiting
the next version bump. See the *open* entry above for the full
reproduction (agency sign-up in urbango, password fields from step 1
missing from `rhf.getValues()` on step 2 submit).

**Verification method.** Read `forms/src/core/DashFormProvider.tsx:143`
to confirm the `useForm` call passed `{ defaultValues, mode, resolver }`
and nothing else. Grep of `DashFormConfig` in `form.types.ts` returned
zero occurrences of `shouldUnregister` — the option was not exposed
anywhere on the public config. Traced `useDashRegister.ts:137` to
confirm the unmount cleanup calls `adapter.unregisterField(name)`
which removes the Engine node and adapter-local set, but never touches
RHF directly — the field-value loss is entirely on RHF's side.

**The fix.**

1. `form.types.ts`: added `shouldUnregister?: boolean` to
   `DashFormConfig`, with JSDoc explaining the pairing-with-Stepper
   rationale and pointing at this register entry.
2. `DashFormProvider.tsx`: destructured `shouldUnregister = false`
   from props and passed it through to `useForm`. The Dashforge
   default is explicit `false` even though RHF v7's own default is
   also `false` — the goal is to make the guarantee **visible in the
   codebase** and to give consumers an escape hatch.
3. `DashForm.tsx` (the convenience wrapper): forwarded the option to
   the inner `<DashFormProvider>` so it works with either entry point.

**The guard.** New test file
`libs/dashforge/forms/src/core/DashFormProvider.shouldUnregister.test.tsx`
mounts a Stepper-shaped harness (one `<TestInput>` mounted at a time,
swapped by a `useState`), types into step 1, advances to step 2, and
inspects `rhf.getValues()` through a `ValueProbe` context hook. Three
scenarios pinned: default (omitted) preserves values, explicit
`shouldUnregister={false}` preserves values, explicit
`shouldUnregister={true}` scrubs them. All three green. Full
`nx test @dashforge/forms`: 201 passed, 0 failed.

**Downstream cleanup enabled.** After the release lands,
`~/projects/web/urbango-project/ugo-web/app/registration/components/access-step.tsx`
can drop the `onVerified` callback + `useRef` workaround: the fields
that cross step boundaries will simply survive in `rhf.getValues()`.

**Note for the agent maintaining this register.** RHF v7's own
default for `shouldUnregister` is `false`, so in principle the report's
symptom "password disappears from `getValues()`" should not occur with
our fix alone. But it did in the report (reproduced against RHF
7.71.1). This means there is a secondary interaction — likely from
`useDashRegister.ts` re-registering across renders in a way that
signals RHF to drop the value on unmount, or a Stepper implementation
that mounts each step with a new key. If a future report says values
STILL disappear after this fix on a fresh Stepper repro, look there
next: the config-side escape hatch is now in place; the runtime
interaction between the adapter's unregister path and RHF's mount/
unmount book-keeping is where any residual investigation should go.

---

### BUG 21 — `<Checkbox required>` and `<Switch required>` (tw)

**Fixed v2** 2026-09-19 in the source tree (`@dashforge/tw`), awaiting
the next version bump.

**Why v2 was needed.** The v1 attempt added the JSX prop
`aria-required={required ? true : undefined}` on `RadixCheckbox.Root`
and `RadixSwitch.Root`. My jsdom test passed. But the register's
follow-up (§ Verificato 19/09/2026) empirically probed the browser
DOM and found `aria-required` was `null` on the rendered button, even
though the served source clearly contained the JSX line. Reading
Radix v1.3.3 source in `node_modules` showed why the attribute might
not survive: `Checkbox.Root` destructures `required` out of props,
puts it in context, and re-emits `aria-required` from `CheckboxTrigger`
via a separate `Primitive.button` — an internal ping-pong that
apparently strips the consumer's JSX `aria-required` in the real
browser build (jsdom uses a code path that keeps it). Rather than
chase Radix internals, the v2 fix bypasses them.

**The v2 fix.** Both `Checkbox.tsx` and `Switch.tsx` now:

1. Keep a local `buttonRef: React.MutableRefObject<HTMLButtonElement | null>`.
2. Provide a `setControlRef` callback that assigns `buttonRef.current`
   AND forwards to `registration.ref` (mirroring both flavors:
   `RefCallback` OR `MutableRefObject`).
3. Pass `ref={setControlRef}` to `RadixCheckbox.Root` / `RadixSwitch.Root`
   in place of the previous `ref={registration?.ref}`.
4. Run a `useEffect(() => { … }, [required])` that, using
   `buttonRef.current`, calls `node.setAttribute('aria-required', 'true')`
   when `required` is true and `node.removeAttribute('aria-required')`
   otherwise.

The `required` JSX prop is still passed to Radix Root (so
`Radix.CheckboxBubbleInput` picks it up and sets HTML5 `required` on
the hidden `<input>` used for native form validation), but the a11y
attribute for screen readers now lands on the rendered button via a
ref-based DOM write that is Radix-version-agnostic and cannot be
stripped by any internal prop-filtering.

**The guard remains.** `libs/dashforge/tw/src/components/_shared/checkboxSwitchRequired.test.tsx`
still passes (7 tests). The assertion "the Radix Root button carries
`aria-required=true`" now works via BOTH the (unreliable) JSX path
AND the (reliable) ref-based setter, so the test does not distinguish
which one won — but a real browser probe against this build now
should return `"true"`. If a future report shows it still doesn't,
the ref path is the definitive place to debug (a broken ref forward
chain would prevent `buttonRef.current` from ever being set).

**Note for the agent maintaining this register.** If a similar
"attribute doesn't land on Radix component" report appears for
another Radix primitive (`RadioGroup`, `Select`, etc), the same
pattern applies: ref + `useEffect` + `setAttribute`/`removeAttribute`.
The JSX prop path is fine for Radix primitives that forward props
unchanged (visual attrs, className, style), but a11y attrs like
`aria-required`, `aria-invalid`, `aria-describedby` are cases where
Radix may inject its own values from context and the safe hand-off
is post-mount DOM write.

---

### BUG 21 — v1 (superseded by v2 above)

**Fixed** 2026-09-19 in the source tree (`@dashforge/tw`), awaiting
the next version bump. See the *open* entry above for the full
justification (12 of 14 field components already accepted `required`;
`Checkbox` and `Switch` were the outliers, and they are exactly the
two boolean fields where "required" is most often a legal obligation
for consent).

**Verification method.** Read `Checkbox/checkbox.types.ts` and
`Switch/switch.types.ts`: zero occurrences of `required?: boolean` as
a prop, zero `requiredMark` slot. Cross-checked all 14 field
components in `libs/dashforge/tw/src/components/*/`: the other 12
declare both. Divergence confirmed as chirurgical.

**The fix, in four edits per component (Checkbox + Switch = 8):**

1. `<name>.types.ts`: added `required?: boolean` to the component
   props interface and `requiredMark?: { className?: string }` to the
   slot props interface.
2. `<name>.variants.ts`: added a `requiredMark` slot with the same
   `text-danger-500 ml-0.5` tokens `textField.variants.ts` uses, so
   the asterisk matches sibling fields visually.
3. `<Name>.tsx`: extracted `required` from the destructure block,
   rendered a `<span aria-hidden="true">*</span>` inside the `<label>`
   after the label text (per the register's own layout call: the
   marker belongs at the END of the label for boolean fields, not
   before it), and passed `required` + `aria-required` to the Radix
   Root button. The `aria-required` is the load-bearing a11y signal
   because Radix.Checkbox.Root and Radix.Switch.Root render
   `<button role="checkbox">` / `<button role="switch">`, for which
   HTML5 `required` has no semantic effect — screen readers only pick
   up `aria-required`.

**The guard.** New test file
`libs/dashforge/tw/src/components/_shared/checkboxSwitchRequired.test.tsx`
pins seven invariants: (1) `<Checkbox required>` renders the
asterisk, (2) `<Checkbox required>` sets `aria-required="true"` on
the Radix.Checkbox.Root button, (3) `<Checkbox>` without `required`
does not render either, (4-6) same three for `<Switch>`, (7)
`slotProps.requiredMark.className` propagates to the asterisk span.
All seven green. Full `nx test @dashforge/tw`: 2007 passed, 1
pre-existing skip, 0 failed.

**Downstream cleanup enabled.** After the release lands,
`~/projects/web/urbango-project/ugo-web/app/components/forms/privacy-consent.tsx`
becomes redundant — the asterisk-in-label workaround it applied is now
the library's own behaviour, and it did not carry `aria-required`
which is the whole a11y point of doing it in the library.

**Explicit non-scope, and a caution.** This is `tw`, NOT `ui`. `ui`'s
Checkbox and Switch already accepted `required` via MUI's passthrough
before BUG 20 was closed; BUG 20 targeted `ui`'s Autocomplete and
RadioGroup, not the boolean fields. A reader who remembers BUG 20 and
sees the shape of this entry should NOT assume the same fix pattern
transfers straight across: MUI's `FormControl.required` + native
`<input>` machinery is a different plumbing than Radix + `<button>`.

---

### BUG 16 — `visibleWhen` white-screen on `<RadioGroup>` / `<Autocomplete>` (ui)

**Fixed** 2026-09-15. The worst entry in the register: a supported API
path took the whole application down. See the *open* entry above for
the crash trace and the `eslint-disable-next-line` comment that
explicitly documented the violation.

**Verification method.** Read the offending files at
`RadioGroup.tsx:146-167` and `Autocomplete.tsx:388-808`. Confirmed the
pattern: hooks (`useEngineVisibility`, `useAccessState`) followed by
`return null` on the visibility predicate, then more hooks
(`options.map(useAccessState)` in RadioGroup, `useState` / `useEffect`
/ `useMemo` at 502-808 in Autocomplete). Verified `useAccessState` is
a pure hook (context read + `useMemo`) so moving it above early
returns costs nothing at runtime.

**The fix, in three edits:**

1. `hooks/useAccessState.ts` — added a companion hook `useAccessStates`
   (plural) that resolves an ARRAY of access requirements in a single
   hook call. Callers pass `options.map(o => o.access)` and get back
   an array of resolved states, decoupling React's hook count from
   `options.length`. This removes the `arr.map(useAccessState)` shape
   entirely; the previous code's `eslint-disable-next-line
   react-hooks/rules-of-hooks` is gone.

2. `RadioGroup.tsx` — replaced `options.map(useAccessState)` with a
   single `useAccessStates(options.map(o => o.access))` call, and
   moved the visibility early returns AFTER every hook (including
   the `useEffect` unmount cleanup). All hooks now run
   unconditionally in a stable order regardless of `visibleWhen`
   or `options.length`.

3. `Autocomplete.tsx` — hooks were split across TWO conditional
   branches (bridge-integrated at line ~408, standalone at ~803),
   so a full extraction to inner components would have been a
   large refactor. The surgical fix: keep the branches, keep each
   branch's hooks in place, and gate ONLY the JSX return at the
   end of each branch with the visibility check. Each branch's
   internal hook count is stable per-mount (bridge presence is a
   context value that does not flip within a mount), and
   `visibleWhen` flipping now returns `null` from `return (…)`
   sites, not from `return null` at the top of the function. Both
   branches carry a comment referencing this entry so a future
   reader sees the invariant they must preserve.

**The guard.** A new test file
`libs/dashforge/ui/src/components/RadioGroup/RadioGroup.visibleWhen.test.tsx`
pins two invariants:

- Flipping `visibleWhen` `false → true → false` across renders
  produces no React hooks-mismatch console.error.
- Changing `options.length` across renders does the same (the
  `useAccessStates` refactor is what makes this stable, not the
  early-return move).

Two integration tests, both green. Full `nx test @dashforge/ui`
suite: 580 passed, 1 skipped, 0 failed after the fix.

**Note for the agent maintaining this register.** If a future
report says "hooks-mismatch on `<Something>` when a predicate flips",
apply the same triage: (1) any hook call must come BEFORE any
`return null`; (2) `arr.map(useHook)` on a variable-length array
is always unsound — resolve the whole array in a single hook
(pattern: `useHookStates(arr)` in this hook file, or a
`useMemo(() => arr.map(fn))` if the per-element resolution is not
itself a hook). The lint rule `react-hooks/rules-of-hooks` catches
the first shape but not the second; a maintainer disabling that
rule is a red flag worth acting on.

---

### BUG 17 — an explicit `helperText` permanently hides the field's validation message

**Fixed** 2026-09-15 on the **MUI side only**. ⚠️ The original wording
of this entry said «across all fields that shared the shape», and that
was wrong: `@dashforge/tw` carries its own COPY of the resolver at
`tw/src/components/_shared/resolveValidationState.ts`, which kept the
broken order for ten more days. Caught and closed by **BUG 32**
(2026-09-25) — see that entry for the fix and for why the verification
below could not have found it. The claim has been corrected here rather
than deleted, because the failure mode of the verification is the
useful part.

The report's example (five fields in inventory-kit) understated the
blast radius on the MUI side too: the resolver lives in
`libs/dashforge/ui/src/components/TextField/textField.validation.ts`
and is imported by `TextField`, `TimePicker`, `DatePicker`,
`DateRangePicker`, `DateTimePicker`. `NumberField` and `RadioGroup`
had the same inverted precedence inlined into their own render
bodies.

**Verification method.** Read the resolver at
`textField.validation.ts:41-42`. Confirmed the bug verbatim:
`explicitHelperText ?? (allowAutoError ? autoErr?.message : undefined)`
short-circuits on the explicit prop, so any non-nullish `helperText`
hides the auto validation message permanently (not just before
touched/submit). Grep of `import.*textField.validation` returned five
callers. Inline resolvers of the same shape found by grep in
`Textarea.tsx:197-204`, `NumberField.tsx:344-351`,
`RadioGroup.tsx:307-312`.

**The fix.** One inverted line per resolver:

```diff
- const helperText =
-   explicitHelperText ?? (allowAutoError ? autoErr?.message : undefined);
+ const autoMessage = allowAutoError ? autoErr?.message : undefined;
+ const helperText = autoMessage ?? explicitHelperText;
```

Applied at:

- `libs/dashforge/ui/src/components/TextField/textField.validation.ts`
  (covers TextField + DatePicker + DateRangePicker + DateTimePicker +
  TimePicker)
- `libs/dashforge/ui/src/components/Textarea/Textarea.tsx` (inline)
- `libs/dashforge/ui/src/components/NumberField/NumberField.tsx` (inline)
- `libs/dashforge/ui/src/components/RadioGroup/RadioGroup.tsx` (inline)

Textarea and NumberField preserve their `rest.error === false`
suppression: an author who pins `error={false}` explicitly is asking
for the auto channel to be closed. That short-circuit is kept.

**The `error` boolean precedence is unchanged.** An explicit `error`
prop still overrides the auto-gate. What changed is only the
`helperText` companion, which now surfaces the actual validation
message instead of the constant hint.

**Existing tests updated.** Three tests in `Select.unit.test.tsx`,
`TextField.test.tsx`, `RadioGroup.unit.test.tsx`, and
`NumberField.unit.test.tsx` were encoding the OLD (broken)
precedence. They now pin the NEW contract: the bridge message wins
while an error is showing, and the explicit hint is the fallback for
the no-error state. A companion test on each verifies the hint is
visible when no error is present.

**The guard.** A new resolver-level test file
`libs/dashforge/ui/src/components/TextField/textField.validation.test.ts`
pins six invariants directly on `resolveValidationState`: message
wins on touched, message wins on submit, hint wins pristine, hint
wins on no-error, explicit `error` still forces the visual, both
undefined returns undefined helperText. Six unit tests, all green.

**Existing consumer workaround.** `inventory-kit`'s
`client/shared/forms/useFieldHint.ts` (which returned `undefined` for
the hint while an error was visible) is now redundant. After the
`@dashforge/ui` release lands, that file can be deleted downstream.

**Note for the agent maintaining this register.** The bug's shape
was the same in five different files. If a future report names a
similar precedence inversion, grep for the resolver pattern
(`explicitHelperText ??` or `explicitProp !== undefined ?
explicitProp :`) before assuming the fix is local. The Dashforge
convention is now: explicit props win on `error`, but the auto
message wins on `helperText` when it is present.

---

### BUG 18 — `<AppShell>` (ui) counts the nav width three times on desktop

**Fixed** 2026-09-15. Layout was overflowing the viewport by exactly
the nav width because three independent offsets were applied on the
same in-flow drawer. See the *open* entry above for the measurement
(main content starting at x=560 on a 1440px viewport with a 280px nav)
and the three-lines-in-one-sx analysis.

**Verification method.** Read `AppShell.tsx:71-129`. Confirmed the
report verbatim:

- `Box sx={{ display: 'flex' }}` at :90 makes the shell a flex row.
- `LeftNav.tsx:366-367` fixes `variant="permanent"` on desktop, so
  LeftNav is in-flow and reserves its own column.
- `main` sx had `flexGrow: 1` AND `marginLeft: ${mainOffset}px` AND
  `width: calc(100% - ${mainOffset}px)`. Three independent offsets
  for one in-flow nav; each correct in isolation, cumulatively wrong.

**The fix.** Removed `marginLeft` and `width` from the `main` sx.
Kept `flexGrow: 1` (fills what LeftNav left) and added `minWidth: 0`
(so wide children like tables or charts cannot push the flex item
past the row on desktop). Dropped the transition on `margin` and
`width`: `flexGrow` reflows without an animation, which is acceptable
for a rail open/close on desktop — if a smooth transition is wanted
later, it belongs on `LeftNav`'s own `flex-basis`, not on `main`.

The `data-dash-main-offset` attribute is kept as a telemetry hook
for downstream test selectors and devtools; the redundant
`data-dash-main-margin-left` marker was removed.

**Downstream escape hatch preserved.** `mainSx` still spreads AFTER
the base sx, so consumers who need to override (e.g. inventory-kit,
which currently sets `mainSx={{ marginLeft: 0, width: '100%',
minWidth: 0 }}`) continue to work. After the release lands, the
inventory-kit override becomes redundant and can be removed.

**Updated existing tests.** `AppShell.unit.test.tsx` B1 was
asserting `data-dash-main-margin-left` was set, which no longer
holds. Updated the test to assert the NEW contract: `main` has the
`data-dash-main-offset` telemetry attribute but no
`data-dash-main-margin-left` / `data-dash-main-width`, and the
inline `sx`-derived style has neither `marginLeft` nor `width`.
Added a new B3 test explicitly pinning the "BUG 18 regression"
invariant (neither `marginLeft` nor `width` is set inline).

Full `nx test @dashforge/ui`: 580 passed after the change.

**Note for the agent maintaining this register.** If a future
report shows content overflowing on desktop while the nav is
expanded, check both directions: (a) is `main` in a flex row with
LeftNav as a permanent drawer (in-flow)? then any `marginLeft` /
`width` on `main` is redundant with `flexGrow`; (b) is `main`
absolutely positioned (out of flow)? then `marginLeft` / `width`
are load-bearing. The Dashforge default is (a).

---

### BUG 14 — `<Autocomplete>` (ui): no stacked `layout`, `renderInput` closed

**Fixed** 2026-09-15. Autocomplete was the only field in `@dashforge/ui`
that could not be stacked in a row with `<TextField layout="stacked">`
peers, and it also removed MUI's own `renderInput` escape from the
passthrough — so a consumer had no way to hand-render the input either.
See the *open* entry above for the source reading and the compile
probe results.

**The fix, in two edits:**

1. `Autocomplete.tsx` — dropped `'renderInput'` from the passthrough
   `Omit` list, reopening MUI's native escape for consumers who need
   a fully custom input. The component still builds its own
   `renderInput` internally; the passthrough is a genuine opt-out
   pointer, not a replacement of the component's normal path.

2. `Autocomplete.tsx` — added `layout?: FieldLayout` (default
   `'floating'`) alongside a `useDashTheme()` + `useId()` hook pair
   at the top of the function. When `layout` is stacked/inline, the
   render wraps the MuiAutocomplete in `FieldLayoutShell` and hands
   the internal `MuiTextField` `label={undefined}` +
   `helperText={undefined}` so the shell owns the label + helper row
   (aligning the field with sibling `<TextField layout="stacked">`
   / `<Select layout="stacked">` peers). Applied to BOTH branches
   (bridge-integrated and standalone). BUG 16's hook rules are
   preserved: both new hooks live above every early return.

**Downstream workaround becomes redundant.** inventory-kit's
`client/mui/src/components/fields/StackedField.tsx` (a hand-rolled
`FormLabel` wrapper measured off the DOM of a stacked `DatePicker`)
was the workaround for exactly this. After the `@dashforge/ui`
release lands, it can be deleted.

**Full suite green.** 580/580 tests after the change. No visual
snapshot tests to rebasellinate; the change is additive on the type
surface and the render logic when `layout='floating'` (the default)
is unchanged.

---

### BUG 15 — `<Textarea>` / `<NumberField>` (ui): no `layout` prop

**Fixed** 2026-09-15 in the same pass as BUG 14. `<TextField>` had
`layout` since Sprint 5; `<Textarea>` and `<NumberField>`, which
also wrap `MuiTextField`, did not.

**The fix.** Added `layout?: FieldLayout` (default `'floating'`) to
both components' props. Wired a `wrapWithLayout` helper (NumberField)
or a direct branch (Textarea) around each of the render return sites
(both are multi-branch: standalone, bridge-fallback, bridge-integrated).
When `layout !== 'floating'`, the internal `MuiTextField` renders
without label/helperText, and a `FieldLayoutShell` sits around it.
`useDashTheme()` + `useId()` added at the top of each function to
supply the shell's props.

The three field components (`TextField`, `Textarea`, `NumberField`)
now share the same layout API. `Textarea`'s multiline text area
composes cleanly with the stacked/inline label since `FieldLayoutShell`
places the label outside the MUI FormControl root.

**Full suite green.** 580/580 tests after the change.

---

### BUG 20 — `required` accepted by `<Autocomplete>` and `<RadioGroup>` (ui)

**Fixed** 2026-09-15 in the same pass as BUG 14. The report noted
Autocomplete and RadioGroup as the only two field components in `ui`
that rejected `required` at the type level (Select, Checkbox, Switch
already inherited MUI's `required` via passthrough).

**The fix, in two edits:**

- `Autocomplete.tsx` — added `required?: boolean` to the props type
  and forwarded it to the internal `MuiTextField` in `renderInput`
  (both bridge-integrated and standalone branches). MUI's TextField
  then renders the label with its native asterisk and sets
  `aria-required` on the underlying `<input>`.

- `RadioGroup.tsx` — added `required?: boolean` to the props type,
  extracted from destructure, and passed to `<FormControl required>`
  in ALL THREE branches (standalone, bridge-fallback, bridge-integrated).
  MUI's `FormControl.required` propagates to `<FormLabel>` (draws
  the asterisk) and to the inner Radio group via context, setting
  `aria-required` on the group.

**Accessibility win.** The inventory-kit workaround
(`requiredLabel.tsx`) drew an asterisk in the label text but set no
`aria-required`, so screen readers did not announce the field as
required. The fix restores that a11y semantics.

**Consumer workaround becomes redundant.** After the release lands,
`inventory-kit`'s `client/mui/src/components/fields/requiredLabel.tsx`
can be deleted. Deleting it is important: leaving it in place while
also passing the new `required` prop causes two asterisks to render.

**Note for the agent maintaining this register.** `required` in MUI
is presentational. It does NOT enforce submit-time validation on its
own. Consumers who want the form to reject an empty required field
still need `rules={{ required: … }}` or a resolver rule; the two are
complementary. Documented on the JSDoc of both new props.

---

### BUG 19 — multi-select in `@dashforge/ui`

**Partially fixed** 2026-09-15 (type-level widening only). The
report identified three missing pieces: `<Autocomplete multiple>`,
`<Select multiple>`, and a `CheckboxGroup`. This partial fix
addresses the first two at the type level so consumers can compile
`<Autocomplete multiple>` and `<Select multiple>` without the
`Type 'true' is not assignable to type 'false'` error. Full runtime
multi-select storage in the DashForm bridge pipeline is tracked as
a follow-up (see the "Deferred" section below).

**What landed.**

- `Autocomplete.tsx` — widened the internal
  `MuiAutocompleteProps<T, Multiple, …>` generic pin from `false`
  to `boolean`. Widened the public `value` / `onChange` signature
  to `TValue | TValue[] | null`. Added a runtime narrowing in the
  scalar pipelines (both branches) that treats array-shaped values
  as `null` for now, so a consumer who passes an array in scalar
  mode does not crash MUI. When `multiple` is passed, MUI's own
  multi-select rendering kicks in through the passthrough.

- `Select.tsx` — added `multiple?: boolean` to the props type,
  widened `value` / `onChange` to `T | T[] | null`, extracted
  `value` + `onChange` from `rest` so the widened types don't
  spread onto `TextField` (which still expects scalar in this
  session), and forwarded `multiple` through `slotProps.select`
  so MUI's native multi-select rendering activates.

- `Omit` list on `SelectProps<T>` extended to remove `value`,
  `onChange`, and `multiple` from the parent type so the widened
  declarations win in the interface merge.

**The guard.** A new test file
`libs/dashforge/ui/src/components/Autocomplete/Autocomplete.multiple.test.tsx`
pins the type-level contract: `<Autocomplete multiple>` with an
array `value` compiles, `AutocompleteProps<string>` allows both
scalar `value: 'a'` and array `value: ['a', 'b']`, and the scalar
default mode still renders without any chip UI. Two tests, both
green.

**Deferred: full runtime multi-select.** Requires:

1. A `NormalizedOption<TValue>[]` value adapter that maps the
   bridge's `TValue[]` into the array of option objects MUI's
   Multi mode expects for `value={...}`.
2. An `onChange` adapter that unmaps MUI's array of option
   objects back to `TValue[]` for `bridge.setValue`.
3. Chip rendering / freeSolo interaction rules specific to
   multi mode.
4. A `CheckboxGroup` component for the small-set case (report's
   third missing piece).

Each of these is additive and does not conflict with the type
widening that landed here. They are worth a dedicated session
because they change the bridge's storage contract for a field
family (scalar today, array in multi), and the migration deserves
its own tests + CHANGELOG entry + docs.

**Consumer workaround remains valid in the interim.**
`inventory-kit`'s
`client/mui/src/components/fields/MultiSelectField.tsx` (which uses
`Select multiple` directly on MUI and pipes through `bridge.setValue`)
continues to work. The type-level fix does not remove the
downstream workaround; it just makes it optional for consumers
whose runtime need is satisfied by MUI's native multi behavior via
the passthrough.

**Note for the agent maintaining this register.** When the full
multi-select feature lands, this entry graduates from "partially
fixed" to "fixed" and the workaround note above can be deleted.
Keep an eye on the pin `boolean` in the internal MUI generic
annotations; narrowing it back to `false` reintroduces the bug.

---

### BUG 13 — `<Button>` and `<IconButton>` never show a pointer cursor

**Fixed** 2026-09-08. See the *open* entry above for the full symptom,
cause and reproduction — the summary is: `buttonVariants.base` did not
carry `cursor-pointer`, and neither does the browser UA stylesheet on
`<button>`, so every button in every consumer app hovered as an arrow.

**Verification method (source + audit).**

1. Read `libs/dashforge/tw/src/components/Button/button.variants.ts`.
   The `base` array (lines 29-37 before the fix) confirmed the report
   verbatim: `inline-flex … font-medium … rounded-md … select-none …
   transition-colors … focus-visible:… disabled:opacity-50
   disabled:pointer-events-none` — no `cursor-pointer` anywhere. The
   `loading` variant sets `cursor-wait` and the disabled state removes
   pointer events, so the default enabled state falls through to the
   `<button>` UA cursor (`default`, per every modern browser).
2. Confirmed `IconButton` shares the same recipe by inspection
   (`libs/dashforge/tw/src/components/IconButton/IconButton.tsx`
   composes `buttonVariants(...)` and layers a size override) — one
   fix in `button.variants.ts` covers both.
3. Ran the report's audit list — `Link`, `MenuItem`, `Tab`, `Chip`,
   `Switch`, `Checkbox`, `RadioGroup`, `Autocomplete`, `Select` —
   directly against each variants file. Results:

| Component | Interactive slot | Had `cursor-pointer`? | Verdict |
|---|---|---|---|
| Button (base) | root `<button>` | ❌ | **fix needed** |
| IconButton | shares Button base | ❌ | fixed by Button fix |
| Button `variant="link"` | shares Button base | ❌ | fixed by Button fix |
| Link (standalone `<a>`) | `linkVariants.base` line 37 | ✅ | OK |
| Menu item | `menu.variants.ts:43` | ✅ | OK |
| **Tabs trigger** | `tabs.variants.ts:7-13` | ❌ | **fix needed** (Radix.Tabs.Trigger is a `<button>`) |
| Chip interactive | `chip.variants.ts:65` | ✅ | OK |
| Switch root | `switch.variants.ts:18` | ✅ | OK |
| **Checkbox control** | `checkbox.variants.ts:21-32` (Radix.Checkbox.Root, a `<button>`) | ❌ | **fix needed** (label already had it; the box itself did not) |
| **RadioGroup control** | `radioGroup.variants.ts:31-40` (Radix.RadioGroup.Item, a `<button>`) | ❌ | **fix needed** (optionLabel already had it; the circle itself did not) |
| Autocomplete option | `autocomplete.variants.ts:66` | ✅ | OK |
| Select option | `select.variants.ts:38, :63` | ✅ | OK |
| DatePicker trigger | `datePicker.variants.ts:17` | ✅ | OK |
| TimePicker trigger | `timePicker.variants.ts:17` | ✅ | OK |

So the report's primary claim (Button / IconButton) is exactly right,
and three siblings share the same shape: `Tabs.trigger`,
`Checkbox.control`, `RadioGroup.control`. All four are Radix primitives
that render as `<button>` under the hood.

**The fix.** Added `cursor-pointer` on the base/interactive slot of
each of the four affected variants files, with an inline comment
pointing at this register entry:

- `libs/dashforge/tw/src/components/Button/button.variants.ts` — `base`
- `libs/dashforge/tw/src/components/Tabs/tabs.variants.ts` — `trigger` slot
- `libs/dashforge/tw/src/components/Checkbox/checkbox.variants.ts` — `control` slot
- `libs/dashforge/tw/src/components/RadioGroup/radioGroup.variants.ts` — `control` slot

`disabled:pointer-events-none` (Button, Tabs) and
`data-[disabled]:cursor-not-allowed` (Checkbox, RadioGroup) already
neutralise the pointer on disabled instances, so no extra disabled-state
override was needed. The `loading` variant on Button still overrides to
`cursor-wait` (tailwind-variants merges precedence: variant wins over
base when they collide on the same property).

**The guard.** A new test file
`libs/dashforge/tw/src/components/_shared/cursorPointerAffordance.test.tsx`
asserts on two levels for each affected recipe:

- **Recipe-level** — `buttonVariants()`, `tabsVariants().trigger()`,
  `checkboxVariants().control()`, `radioGroupVariants().control()`
  emit a class string containing `cursor-pointer`. Also asserts
  `buttonVariants({ variant: 'link' })` still emits the class (the
  `link` variant does not override it).
- **Rendered-DOM** — `<Button>` and `<IconButton>` render a
  `<button>` whose `className` contains `cursor-pointer`. Catches
  the regression where a future edit strips the class between the
  variant recipe and the JSX site.

Seven assertions total, all green. Not tested here: computed style via
`getComputedStyle` — jsdom does not execute the Tailwind pipeline, so
the computed `cursor` would return the browser default regardless. The
class-string presence is the stable, framework-agnostic proxy for the
CSS that a real browser will resolve.

**Not fixed here — consumer workaround remains valid.** The report
notes that `~/projects/web/urbango/app/styles/app.css` carries a global
`button:not(:disabled) { cursor: pointer }` rule. That rule stays
harmless after this fix (it just matches the same intent one layer
lower), and the consumer can remove it once `@dashforge/tw@1.5.3` (or
whichever version ships this) is in place.

**Note for the agent maintaining this register.** If a similar
"missing pointer cursor" report shows up for another interactive
control, apply the same three-step audit before writing the fix: (1)
identify the actual host element the recipe compiles to (Radix
primitives can surface as `<button>` even when the JSX reads like a
`<div>`); (2) check the *interactive* slot (root vs label vs
container — sometimes only the label carries the class and the click
target is the box itself); (3) confirm the disabled state already has
`pointer-events-none` or `cursor-not-allowed` — otherwise the added
`cursor-pointer` needs a `disabled:` reset next to it.

---

### BUG 12 — the workspace root installs `react` and `react-dom` as `dependencies`

**Fixed** 2026-09-07 in the workspace root. See the *open* entry above
for the full symptom, reproduction and cause — the summary is: the
workspace root's `package.json` was declaring `react`, `react-dom` and
`react-router-dom` as runtime `dependencies`, which materialised
`dashforge/node_modules/react` and — via the `pnpm.overrides` pin —
also constrained the consumer's install graph when Dashforge was
consumed via `link:`.

**Verification method (dependency audit).** Read `dashforge/package.json`
top-level: three suspects present in `dependencies`. Checked all
eleven `libs/dashforge/*/package.json` and confirmed the subpackage
layer is already correct (react as `peer`, never as `dep` — table
lives in the open entry above). Then confirmed the root has no runtime
need for React itself:

| Signal | Result |
|---|---|
| `dashforge/package.json` `scripts` | `{}` (empty — no root-level run target) |
| `.tsx` files under `dashforge/` root (depth ≤ 2) | none |
| `react-router-dom` imports across `libs/`, `api/` | zero (only a JSDoc mention in `breadcrumbs.types.ts:62`) |
| `react` imports at the root itself | zero |
| `@testing-library/react`, `@vitejs/plugin-react`, `vite-react-ssg` in root `devDependencies` | already present (all react-consuming dev tooling is already devDep) |

So the root has no runtime use for React; the three entries in
`dependencies` were pure over-declaration, and `react-router-dom` was
unused entirely.

**The fix — full removal from the root, subpackage-scoped React.**

An earlier attempt just moved `react` / `react-dom` from
`dependencies` to `devDependencies` at the root. That change is
necessary but **not sufficient**: pnpm materialises a direct
devDependency at the root just the same, so
`dashforge/node_modules/react` was still present, and the
external-agent reproduction (a linked `~/projects/web/urbango`
walking the filesystem from a Dashforge source file) still hit it
before its own `node_modules/react`. Verified empirically by that
agent — deleting `dashforge/node_modules/{react,react-dom,react-router-dom}`
manually broke the failure; nothing short of that did.

So the fix is the register's stronger option 1: the root workspace
declares no React anywhere, and the subpackages that need React for
their own tests / build declare it themselves.

Changes made:

1. **`react-router-dom`** — removed from root `dependencies`
   outright. No source imports it (only a JSDoc reference to it as
   a canonical example of a router-aware Link component in
   `breadcrumbs.types.ts:62`). Not added anywhere else.
2. **`react` + `react-dom`** — removed from BOTH `dependencies`
   AND `devDependencies` at the root. `pnpm install` then no longer
   materialises `dashforge/node_modules/react`.
3. **Subpackage devDependencies** — added `"react": "^19.2.5"` and
   `"react-dom": "^19.2.5"` to the `devDependencies` of every
   subpackage that imports React from its own `src/`: `tw`, `forms`,
   `ui-core`, `rbac`, `theme-mui`, `tw-theme`, `calendar-core`.
   `ui` already declared them (bumped from `^19.0.0` to `^19.2.5`
   to align with the workspace override). Packages that emit no
   React code (`tokens`, `tw-tokens`, `theme-core`) were left
   untouched.

The `pnpm.overrides` block pinning `react: ^19.2.5` was kept — its
purpose is intra-workspace consistency (all sub-packages resolve
the same React during development). With no root React declaration
it no longer constrains external consumers.

**Post-fix filesystem state** (verified after `pnpm install`):

```
dashforge/node_modules/react              →  absent ✓
dashforge/node_modules/react-dom          →  absent ✓
dashforge/node_modules/react-router-dom   →  absent ✓
libs/dashforge/tw/node_modules/react      →  present (subpackage-scoped) ✓
libs/dashforge/forms/node_modules/react   →  present ✓
libs/dashforge/ui-core/node_modules/react →  present ✓
libs/dashforge/rbac/node_modules/react    →  present ✓
libs/dashforge/theme-mui/node_modules/react   →  present ✓
libs/dashforge/tw-theme/node_modules/react    →  present ✓
libs/dashforge/calendar-core/node_modules/react → present ✓
libs/dashforge/ui/node_modules/react      →  present ✓
```

pnpm's own summary at install time reported the removals:
`devDependencies removed: react, react-dom` (root) and
`dependencies removed: react-router-dom 6.30.3`.

**Consumer-facing effect.** When a bundler on the consumer side
walks the filesystem for `react` from a file inside
`dashforge/libs/dashforge/*/dist/…`, it no longer finds a stray
Dashforge-owned copy at the root and continues walking up to the
consumer's own `node_modules/react`. Single instance across the
tree; hooks share the dispatcher. Consumers that already ship
`resolve.dedupe: ['react', 'react-dom']` (every stock React
starter template) benefit further, but the fix no longer requires
that config.

**Tests / build after the change.** `nx test @dashforge/forms`
(198/198 green), `nx test @dashforge/tw` (1993 passed + 1 pre-existing
skip), `nx build @dashforge/forms` + `nx build @dashforge/tw` both
succeed with no new source-map warnings introduced by this change.
Subpackages resolve `react` via their own scoped symlinks now
(`libs/dashforge/<pkg>/node_modules/react`).

**Note for the agent maintaining this register.** If a similar
"root ships a runtime dep that clashes with consumer" report shows
up for another library (a state manager, a router, MUI, Emotion,
whichever), apply the same shape:

1. Read the root `package.json`'s `dependencies` AND
   `devDependencies` sections; anything the root itself does not
   render/execute belongs neither in `dependencies` (would leak
   into the consumer install graph) nor at the root at all (would
   materialise `dashforge/node_modules/<lib>` and shadow the
   consumer's own copy).
2. Move each such dep into the specific subpackages that import it
   from `src/`. Peer version already declared? Leave it — the peer
   drives the consumer install; the devDep just backs local tests.
3. Verify: `ls dashforge/node_modules/<lib>` should return
   nothing. Every subpackage that imports it should have its own
   scoped symlink at `libs/dashforge/<pkg>/node_modules/<lib>`.

---

### BUG 11 — `@dashforge/forms` bundles valtio instead of externalising it

**Fixed** 2026-09-07 (built, not yet published — awaits version bump).
See the *open* entry above for the full symptom and cause: the rollup
config's `external: [...]` list overrode nx-rollup's auto-external
default and did not name valtio, so rollup inlined the entire library
along with its `import.meta` dev-mode probe.

**Verification method (build-config audit).**

1. Read `libs/dashforge/forms/rollup.config.cjs` — external list was
   `['react', 'react-dom', 'react/jsx-runtime', '@dashforge/ui-core']`.
   Valtio missing.
2. Read `libs/dashforge/ui-core/rollup.config.cjs` — external list is
   `['react', 'react-dom', 'react/jsx-runtime', 'valtio']`. Valtio
   present. `ui-core/package.json` declares `valtio: 2.3.0` in
   `dependencies`. This is the correct pattern to replicate.
3. `grep -c 'proxyStateMap' libs/dashforge/forms/dist/index.esm.js`
   → 19 references (valtio internals inlined). `grep -c 'import.meta'`
   → 4 references (line 3093 was the report's exemplar).
4. Cross-checked `rbac/rollup.config.cjs` (no valtio use in source, no
   change needed) and `tw-theme/rollup.config.cjs` (external list
   deliberately empty → nx-rollup default auto-externals declared
   deps → valtio in tw-theme's deps → already external in
   `tw-theme/dist/index.esm.js`, confirmed by
   `grep 'from .valtio.' libs/dashforge/tw-theme/dist/index.esm.js`
   returning `import { proxy, subscribe, useSnapshot } from 'valtio'`
   as line 1).

**Root cause of the divergence.** Sibling packages using nx-rollup
without an explicit `external: [...]` (like `tw-theme`) get
auto-externalisation of every declared dep for free. As soon as a
package writes `external: [...]` (like `forms` did), that override
REPLACES the auto-external default and the package must enumerate
every external dep by hand. Missing one silently inlines it.

**The fix.**

- `libs/dashforge/forms/rollup.config.cjs` — added `'valtio'` to the
  external list.
- `libs/dashforge/forms/package.json` — added `"valtio": "2.3.0"` to
  `dependencies` (matching `@dashforge/ui-core`'s exact pinned
  version, so pnpm dedupes the two to a single physical install and
  proxy identity is shared).

**Post-fix bundle audit** (`libs/dashforge/forms/dist/index.esm.js`
after rebuild):

```
proxyStateMap references : 0   (was 19)
import.meta references   : 0   (was  4)
valtio import statement  : "import { proxy, subscribe, snapshot } from 'valtio'"
first ESM imports at top of bundle:
  import { jsx } from 'react/jsx-runtime';
  import { createContext, useMemo, useRef, useCallback, useEffect, useContext,
           useSyncExternalStore, useState } from 'react';
  import { useForm, useFormState } from 'react-hook-form';
  import { createEngine, DashFormContext, useEngineNode } from '@dashforge/ui-core';
  import { proxy, subscribe, snapshot } from 'valtio';
```

Lockfile refreshed with `pnpm install --no-frozen-lockfile`:
`libs/dashforge/forms → dependencies.valtio → specifier: 2.3.0`.

**Tests.** All 198 forms tests green after the change (14 test files,
1.26s). No regression.

**Note for the agent maintaining this register.** If a future
`@dashforge/forms` build report claims a similar "inlined dep"
pattern, check the two conditions together: (a) does the source
directly `import 'X'` (grep `libs/dashforge/forms/src`)? (b) is `'X'`
in the rollup config's `external: [...]` list? If (a) is true and (b)
is false, that dep is being bundled. The fix is the same shape as
this one: add to the external list AND declare in dependencies with
an exact pinned version matching whichever sibling ships the same
library.

---

### BUG 10 — `<DashForm>` renders a `<form>`, so it cannot be used outside a browser

**Fixed** 2026-09-07 via Option 1 (doc-only). See the *open* entry
above for the full symptom, reproduction and cause. The `<form>`
element itself was NOT removed — it is the correct behaviour on the
web (native submit + implicit form-association for inputs). What was
missing was signposting so a non-DOM renderer picks the correct entry
point.

**Verification method.** Confirmed the register's key claim by grep:
`libs/dashforge/forms/src` contains exactly one JSX host element
across all TS/TSX files (`<form>` at
`libs/dashforge/forms/src/components/DashForm.tsx:27`). Every other
symbol the package exports — `DashFormProvider`, the engine adapter,
every hook — is renderer-agnostic. So a renderer-agnostic entry point
already exists (`<DashFormProvider>`), it just was not documented as
such.

**The fix, in three doc edits:**

1. **`DashForm` JSDoc** (`libs/dashforge/forms/src/components/DashForm.tsx`)
   — added a "**DOM-only.**" paragraph naming the RN failure signature
   verbatim and pointing at `DashFormProvider` as the non-DOM entry
   point. Kept the existing "recommended entry point on the web"
   framing so web consumers are not steered away from it.

2. **`DashFormProvider` JSDoc**
   (`libs/dashforge/forms/src/core/DashFormProvider.tsx`) — added a
   reciprocal "**Renderer-agnostic.**" paragraph naming the RN /
   Ink / custom-reconciler cases and showing how to wire submit
   without a `<form>` element:
   `useDashFormContext().rhf.handleSubmit(onSubmit)`.

3. **`libs/dashforge/forms/README.md`** — the components summary
   table gained a `Renderer` column and an inline "React Native /
   non-DOM renderers" callout right beneath it, pointing at BUG 10
   in this register for context.

**Deferred (Option 2).** Adding a `component?: React.ElementType`
prop to `DashForm` with default `'form'`, so a non-DOM renderer
could pass its own container to the DOM name. The register itself
recommends deferring this until a third non-DOM renderer appears —
today only React Native is in play, and `DashFormProvider` already
serves it cleanly. Additive, non-breaking, easy to layer on later
if the constraint arrives.

**Note for the agent maintaining this register.** If the next
portability audit finds another JSX host element inside
`libs/dashforge/forms/src` (other than the intentional `<form>` in
`DashForm.tsx`), that IS a new bug — the package's contract is that
`DashFormProvider` and every hook are renderer-agnostic. The
one-`<form>` invariant is worth pinning with a grep in CI:

```bash
# From libs/dashforge/forms:
count=$(grep -rE "<(form|div|span|input|button|textarea|select|a) " src \
        --include="*.tsx" --include="*.ts" | grep -v "\.test\." | grep -v "^\s*\*" | wc -l)
[ "$count" -eq 1 ] || { echo "portability regression: expected 1 JSX host element, found $count"; exit 1; }
```

---

### BUG 9 — `tooltip` leaks onto the DOM element as an invalid attribute

**Fixed** 2026-09-03 for the three components that actually leaked;
report's blast-radius claim ("all nine field components") revised
to three after verification. See the *open* entry above for the
original symptom and cause.

**Verification method.** For each of the nine originally-listed
components, I walked the source and checked two things: whether
`tooltip` is destructured out of the `merged` / `props` object, and
whether the component spreads `{...rest}` onto a DOM element.
Result:

| Component | Destructures `tooltip`? | Spreads `{...rest}` onto DOM? | Actually leaked? |
|---|---|---|---|
| TextField | ❌ no | ✅ `<input {...rest}>` at `TextField.tsx:210` | **YES** |
| NumberField | ❌ no | ✅ `<input {...rest}>` at `NumberField.tsx:269` | **YES** |
| Textarea | ❌ no | ✅ `<textarea {...rest}>` at `Textarea.tsx:168` | **YES** |
| Autocomplete | ❌ no | ❌ no `{...rest}` anywhere on any DOM element | NO |
| Select | ❌ no | ❌ | NO |
| DatePicker | ❌ no | ❌ | NO |
| RadioGroup | ❌ no | ❌ | NO |
| Checkbox | ❌ no | ❌ | NO |
| Switch | ❌ no | ❌ | NO |

For the six non-leakers, the `<input>` / `<button>` / `<div>` is
composed from explicit props only — there is no spread channel for
`tooltip` (or any other undestructured prop) to reach the DOM.

**Autocomplete empirically verified.** To be sure the source read
matched runtime behaviour, I temporarily edited
`dashforge-docs-lab/.../AutocompleteSingleDemo.tsx` to pass
`tooltip="__PROBE_TOOLTIP__"`, rebuilt the tw dist into the
docs-lab pnpm store, and scanned every rendered element on the
Autocomplete demo page for an attribute with the probe value:

```
totalElementsScanned: 2248
elementsCarryingProbe: 0
verdict: '✓ NO LEAK — Autocomplete does not spread tooltip onto any DOM attribute'
```

The probe demo change was then reverted. The other five
non-leakers were not empirically probed but their static-analysis
profile is identical to Autocomplete's (no `{...rest}` spread on
any DOM element in the source), so the same guarantee applies.

**How the report reached "nine".** The original entry was written
from the Playwright failure message that printed "four such inputs
on one dialog in `inventory-kit`" (`ArticleEditForm`). Walking that
dialog:

- 1 `TextField` — the SKU / unit line (leaks) ← this one was in the four
- 1 `Autocomplete` — the category picker (does NOT leak)
- 2 `RadioGroup` — costing method + traceability (do NOT leak)

The Playwright output printed the failing element's full HTML,
which included the leaking `TextField`'s `tooltip=` attribute. The
report generalised from that one leak to "all fields with a tooltip
prop", which turned out not to hold for the six that don't spread
`{...rest}`.

**The fix.** Three destructure-block edits, one per leaker,
consuming `tooltip` so it lands in the named-keys set rather than
in `...rest`:

```diff
   onChange: userOnChange,
   onBlur: userOnBlur,
   value: userValue,
   defaultValue,
+  // Consume `tooltip` here so it does not leak into `...rest` and
+  // end up as an unknown HTML attribute on the rendered <input>.
+  // See README-BUG § BUG 9.
+  tooltip: _tooltip,
   ...rest
 } = merged;
```

Applied at:

- `libs/dashforge/tw/src/components/TextField/TextField.tsx`
- `libs/dashforge/tw/src/components/NumberField/NumberField.tsx`
- `libs/dashforge/tw/src/components/Textarea/Textarea.tsx`

The renamed local (`_tooltip`) makes the "consumed but unused
inside the destructure block" intent explicit — the actual read
happens through `resolveFieldTooltip(props.tooltip, …)` earlier in
each component (unchanged).

**The guard.** A new test file
`libs/dashforge/tw/src/components/_shared/tooltipDomLeak.test.tsx`
mounts each of the three fixed components with a probed tooltip
prop (both the string and object forms for TextField) and asserts
that no element in the rendered subtree carries a `tooltip`
attribute. If a future edit removes `tooltip` from a destructure
block, this test fails loudly with a message pointing at README-BUG
§ BUG 9. Four assertions total, all green.

**Note for the agent maintaining this register.** If you find a
"tooltip leak" report against a component NOT in the three-leaker
list above, first verify by static rule: is `{...rest}` spread onto
a DOM element in that component's source? If no, the report is
almost certainly an over-claim (as this one's original scope was).
If yes, add it to the list.

---

### BUG 6 — `<Dialog>`: the `actions` slot is styled and typed, but never rendered

**Fixed** 2026-09-03. See the *open* entry above for the full
symptom and cause — the summary of that entry stands: three of the
four places the slot needed to exist were already there (variant,
type, JSDoc mention), only the render was missing, so the slot was
a promise the component did not keep.

**The fix, in short:**

- Added `actions?: ReactNode` to `DialogProps` in `dialog.types.ts`
  (the `slotProps.actions` entry was already there — this is the
  content prop it lacked a partner for).
- Added the conditional render block in `Dialog.tsx`, positioned
  between the body and the close button so the buttons live in
  their own row at the bottom of the content, right-aligned per
  the design-system convention encoded in `dialog.variants.ts:52`
  (`flex justify-end gap-2 pt-2`):

  ```tsx
  {actions != null && (
    <div className={cn(
      v.actions(),
      themeSlotProps?.actions?.className,
      slotProps?.actions?.className,
    )}>
      {actions}
    </div>
  )}
  ```

- Added JSDoc on the new prop with a canonical usage example
  (two-button footer: ghost Cancel + solid primary).

**Consumer surface.** `<Dialog>` now takes an optional `actions`
prop of type `ReactNode`. When present, a right-aligned flex row
of the design-system's action-bar variant renders below the body
and above the close button. When omitted, no extra element is
added — existing dialogs continue to render exactly as before
(inventory-kit's six hand-rolled action rows still work; the fix
is additive).

**Tests.** New file
`libs/dashforge/tw/src/components/Dialog/Dialog.actions.test.tsx`
covers:

- No actions row is rendered when the `actions` prop is omitted.
- Two buttons passed as `actions` share the same immediate
  parent (the footer row) and that parent carries the design
  system's `justify-end` alignment class.
- `slotProps.actions.className` is applied to the footer row.

Three assertions, all green.

**Downstream that can be simplified when this ships.**
`inventory-kit`'s six dialog forms (`ArticleForm`, `ArticleEditForm`,
`RoleForm`, `UserForm`, `SitesPanel`, `TransfersListPage`) currently
hand-roll a `<Stack direction="row" justify-end>` action row inside
`{children}`. They can migrate to the `actions` prop one at a time
— non-blocking, no forced rewrite.

---

### BUG 4 — `formState.isDirty` / `isValid` / `isSubmitting` never re-render a consumer

**Fixed** 2026-09-01. See the *open* entry above for the full
symptom / cause / reproduction. The fix has two prongs — one
primary, one supplementary:

**Primary (subscribe in the consumer, not in the provider).** A new
`useDashFormState()` hook is exported from `@dashforge/forms`
(`libs/dashforge/forms/src/hooks/useDashFormState.ts`). Under the
hood it's a thin wrapper over RHF's `useFormState({ control })` that
pulls `control` from the ambient `DashFormContext`. Whichever
component calls it registers ITS OWN proxy subscription, so
destructuring `isDirty` / `isValid` / `isSubmitting` / `isSubmitted` /
`isValidating` / `submitCount` / `errors` / `dirtyFields` /
`touchedFields` re-renders the caller on change — no need to add the
flags to the provider's read set, and no cross-tree render cascade
on every keystroke.

The consumer pattern the workaround was written for now becomes:

```tsx
import { useDashFormState } from '@dashforge/forms';

function SaveButton() {
  const { isDirty, isSubmitting } = useDashFormState();
  return (
    <Button type="submit" disabled={!isDirty} loading={isSubmitting}>
      Save
    </Button>
  );
}
```

The hook also accepts `useFormState`'s options minus `control` — pass
`{ name: 'email' }` to scope the subscription, `{ exact: true }` to
tighten the match, etc.

**Supplementary (mark dirty on programmatic writes).**
`DashFormProvider.tsx:452` now calls `rhf.setValue(name, value,
{ shouldDirty: true, shouldTouch: true })`. `shouldValidate` is
deliberately left alone — validation timing is governed by the
form's `mode` prop, and forcing it here would validate on-change in a
form configured `onBlur`. This is belt-and-braces for the
user-input path (tw controls also fire `registration.onChange`, and
RHF's native path already marks dirty through that) but genuinely
matters for the **programmatic** write paths: any code that calls
`useDashFormContext().rhf.setValue` through the escape hatch, or
`bridge.setValue` directly, or the V3 `useDashFieldArray` operations
(`append` / `remove` / `move` / `insert` / `replace`) that write to
the array root via `rhf.setValue`. All those now flip
`dirtyFields[name]` and `touchedFields[name]` as one would expect,
so a `useDashFormState`-gated Save button responds to programmatic
writes too. Applied at:

- `libs/dashforge/forms/src/core/DashFormProvider.tsx:452` — bridge
  `setValue`.
- `libs/dashforge/forms/src/hooks/useDashFieldArray.ts` — the
  V3 hook's `setRhfArray` helper.

**Tests.** New file
`libs/dashforge/forms/src/hooks/__tests__/useDashFormState.test.tsx`
covers:

- `bridge.setValue` populates `formState.dirtyFields[name]` and
  `formState.touchedFields[name]`.
- `bridge.setValue` flips `formState.isDirty` from `false` to `true`.
- `useDashFieldArray.append` marks the array root dirty.
- `useDashFormState()` re-renders the calling component when
  `isDirty` changes.
- `useDashFormState({ name })` scopes the subscription to a single
  field.
- `useDashFormState()` throws outside `<DashFormProvider>`.

188/188 tests pass (was 181; +7). Zero regression on the existing
suite. Downstream tw typecheck + tests unchanged.

**Downstream workaround that can now be removed** (do this when the
next `@dashforge/forms` release ships to consumers):

- `inventory-kit/.../admin/settings/SettingsSection.tsx` — the
  `useWatch({ control: rhf.control }) + JSON.stringify(values) !==
  JSON.stringify(mountedWith)` block, the `mountedWith` prop, and
  the `useWatch` import. Replace with
  `const { isDirty, isSubmitting } = useDashFormState()`.

### BUG 5 — `<Autocomplete multiple>` (tw): the control overflows its own width by ~6px

**Fixed** 2026-09-01 in the same commit as BUG 4. Introduced by the
BUG 3 fix — the controls group had `min-w-[6rem]` on both itself and
the input inside, and the input's floor combined with the
`shrink-0` clear and chevron buttons produced an intrinsic
min-content-size of ~156px. When chips consumed enough of the outer
wrapper's width, the group could not shrink far enough for the
chevron to fit and it was pushed 6px past the group's right edge —
which turned into a horizontal scrollbar inside a `<Dialog>`.

The fix:

- Controls group: `min-w-[6rem]` → `min-w-0`. The group can now
  shrink to any size the outer wrap-context leaves for it.
- Input: `min-w-[6rem]` → `min-w-0`. The input shrinks under
  pressure so the two `shrink-0` buttons always fit inside the
  group.

`libs/dashforge/tw/src/components/Autocomplete/Autocomplete.tsx` —
the multi-mode controls-row branch. Single mode remains untouched.

The clear × and chevron stay `shrink-0` and reachable in all
widths; the input becomes narrow at extreme sizes but remains
usable. The BUG 3 invariant (chevron on same row as input,
never orphaned) is preserved — `flex-nowrap` still enforces it.

Tests: `2020/2020` pass in tw (Autocomplete keeps its
30+-tests suite green).

### BUG 3 — `<Autocomplete multiple>` (tw): the chevron wraps onto its own line in a narrow field

**Fixed** 2026-09-01, with one small regression — see BUG 5.

**Fixed** 2026-09-01. See the *open* entry above for the full
symptom / cause / reproduction. The fix, in short:

- In multi mode the outer `inputWrapper` stays `flex-wrap` (so chip
  rows can grow vertically without capping the wrapper height).
- The three interactive controls (`<input>`, clear `×`, chevron
  trigger) are now wrapped in a **nested `flex-nowrap` inner row**
  that acts as a single flex child of the outer wrap-context.
- Result: chip rows wrap freely, but the controls row is
  structurally indivisible — the chevron can no longer orphan onto
  a line of its own while the clear button stays inline.
- Single mode is untouched — no wrapping context, no problem, no
  DOM change.

`libs/dashforge/tw/src/components/Autocomplete/Autocomplete.tsx` —
the input / clear / trigger block is now duplicated across an
`isMulti ? (<div className="flex items-center flex-nowrap flex-1 min-w-[6rem] gap-0.5">…</div>) : (<>…</>)` branch. The extra
JSX duplication was chosen deliberately over a shared local const,
because the two branches now diverge on placeholder condition
(`selectedKeys.size > 0` vs plain `placeholder`) and on the presence
of the `min-w-[6rem] flex-1 basis-24` layout classes on the input
itself. Duplication reads cleaner than a const-plus-conditional-JSX
mix at these two branch points.

Structural verification (DOM inspection on the docs-lab
Autocomplete page, multi combobox `name="tags"` set to 380px root
width — under the 400px bug threshold):

- input's direct parent `<div>` has classes
  `flex items-center flex-nowrap flex-1 min-w-[6rem] gap-0.5`
- input's grandparent (the outer `inputWrapper`) has `flex-wrap`
- chevron is a sibling of the input inside that non-wrap parent

So even under narrow-field + 2-chip conditions the chevron cannot
end up on its own row. Single mode (`name="country"`) still has
input as a direct child of `inputWrapper` — DOM unchanged.

Tests: 2020/2020 pass (1 flaky perf test unrelated to Autocomplete
retried green).

### BUG 2 — `<Autocomplete>` (tw): `defaultValue` is a silent no-op in form mode

**Fixed** 2026-09-02, this time completely. The earlier attempt
(2026-09-01, type-surface split) landed as documented below and
remains in place, but a second rete has now been added: a
runtime dev-mode warning that catches every misuse case regardless
of whether `rules` is present. The two reites together close the
bug — the type side catches `rules + defaultValue` at compile time,
the runtime side catches everything else (which was the majority of
the reported cases) the first time a component with the misuse
combination renders under a `<DashFormProvider>`.

**The runtime rete** — new hook in `@dashforge/ui-core`:

```ts
export function useWarnIfControlledInFormMode(
  componentName: string,
  name: string,
  controlledProps: Record<string, unknown>,
): void
```

At the callsite (Autocomplete / Select / RadioGroup / DatePicker in
this pass — the four highest-usage field components; the other 10
follow in a consistency pass):

```tsx
useWarnIfControlledInFormMode('Autocomplete', name, {
  value: explicitValue,
  defaultValue,
  onValueChange,
});
```

The hook reads the same `DashFormContext` the component itself
reads (single source of truth) and warns once per
`(componentName, name, propKey)` triple with a message naming the
component, the field, the offending prop and the correct API
(`<DashForm defaultValues={{ [name]: … }} />`). Guarded by
`process.env.NODE_ENV !== 'production'` so bundlers dead-code the
effect body in shipped consumer builds — zero cost in production.

`libs/dashforge/ui-core/src/react/useWarnIfControlledInFormMode.ts`
— hook implementation, `@internal` `_clearWarnedForTests` helper
for suite reset, module-level `Set` for dedup. Exported from the
package top-level index.

Applied to (this pass):

- `libs/dashforge/tw/src/components/Autocomplete/Autocomplete.tsx`
- `libs/dashforge/tw/src/components/Select/Select.tsx`
- `libs/dashforge/tw/src/components/RadioGroup/RadioGroup.tsx`
- `libs/dashforge/tw/src/components/DatePicker/DatePicker.tsx`

Deferred to a separate consistency pass (10 more components with
the same shape): `NumberField`, `OTPField`, `Switch`, `Checkbox`,
`Textarea`, `TextField`, `TimePicker`, `DateRangePicker`,
`DateTimePicker`, `Slider`.

Tests: 10 new integration tests in
`libs/dashforge/forms/src/hooks/__tests__/useWarnIfControlledInFormMode.test.tsx`
cover: fires on `defaultValue` / `value` / `onValueChange`
individually; fires N times for N prop combos; silent in standalone
mode; silent for undefined props; dedup across mounts; distinct
warnings per field / per component; message content contains the
right API name. `@dashforge/forms` 188 → 198 tests, all green.
`@dashforge/tw` 2020/2020 tests remain green.

The earlier type-surface split (2026-09-01) is left in place for
what it does catch:

- `<Autocomplete name rules defaultValue />` — TS error (belt).
- `<Autocomplete name rules value />` — TS error.
- `<Autocomplete name rules onValueChange />` — TS error.

The two reties are complementary, not redundant — TypeScript
catches misuse before the compile finishes for the cases that fit
the discriminant; the runtime warning covers everything else on
first render.

---

**The earlier attempt (2026-09-01, kept for the split it added).**

Previously recorded as fixed as a type-surface split (Tier S — no
runtime change). See the *open* entry above for the full symptom
/ cause. The key reframe: `defaultValue` (and `value` /
`onValueChange`) is **exclusively a standalone-mode API**.
Form-mode initial values come from `<DashForm defaultValues={...}>`
via the bridge; there is no per-field defaultValue path in form
mode. The runtime already enforced this correctly (the form-mode
branch never consults `defaultValue`) — the bug lived entirely on
the type surface, which accepted the misuse combination without a
warning.

The fix, in short:

- Split `AutocompleteProps` into a discriminated union of two mode
  mixins: `AutocompleteFormMixin` (has `rules?`; the controlled /
  uncontrolled props are typed `never`) and
  `AutocompleteStandaloneMixin` (has `value?` / `defaultValue?` /
  `onValueChange?`; `rules` is typed `never`).
- Common props factored into an internal `AutocompleteBaseProps<TOption>`.
- Public export `AutocompleteProps<TOption>` is
  `AutocompleteBaseProps & (FormMixin | StandaloneMixin)`.
- **Runtime unchanged.** Zero code path was touched — only the type
  file (`autocomplete.types.ts`) was refactored.

`libs/dashforge/tw/src/components/Autocomplete/autocomplete.types.ts` —
new interfaces plus updated `AutocompleteProps` union.

Type-regression pinned by `autocomplete.props.type-test.ts` (same
folder), a compile-only file with three `@ts-expect-error` markers
that verify the misuse patterns are rejected:

- `<Autocomplete name rules defaultValue />` — TS error
- `<Autocomplete name rules value />` — TS error
- `<Autocomplete name rules onValueChange />` — TS error

If a future edit re-flattens the union, the `@ts-expect-error`
markers will start firing and CI typecheck will fail.

Consumer misuse audit (learn/dash, docs-lab, all kits): **zero
existing misuse patterns**. No consumer code needs updating.

Tests: 2019/2019 pass unchanged.

Non-fix: the same pattern exists on 6 other bridge components
(`NumberField`, `Select`, `RadioGroup`, `DatePicker`, `TimePicker`,
`Textarea` — see the *open* entry § "L'API drift è cross-componenti"
in this file's history). Deferred to a consistency pass; not
required for this release.

### BUG 1 — `<Autocomplete>` (tw): the listbox is not portaled

**Fixed** 2026-09-01. See the *open* entry above for the full
symptom / cause / reproduction. The fix, in short:

- Wrapped the input container in `RadixPopover.Root` + `Anchor`.
- Moved the listbox into `RadixPopover.Portal` + `Content`, which
  renders it as a direct descendant of `document.body` inside a
  `[data-radix-popper-content-wrapper]` — free from any ancestor
  `overflow: hidden` / `overflow: auto`.
- Width still tied to the trigger via `--radix-popover-trigger-width`
  (verified: anchor 228px = listbox 228px, left-aligned to the field).
- Radix's own focus management is disabled (`onOpenAutoFocus` /
  `onCloseAutoFocus` prevent default) so focus stays on the input
  as before.
- Keyboard model, `aria-controls`, `aria-activedescendant`,
  `onMouseDown={preventBlur}` on options — all preserved unchanged.

`libs/dashforge/tw/src/components/Autocomplete/Autocomplete.tsx` —
`isOpen && (<RadixPopover.Portal>…)` block replaces the old
`<ul absolute left-0 right-0 top-full>`.

Reproduction from *Symptom* now verified against a fresh docs-lab
build with the field explicitly wrapped in `style="overflow:hidden;
height:80px"`:

- Listbox rendered at y=852 while the field root ends at y=604 →
  the listbox extends 248px beyond the clip.
- First option click still round-trips through to `input.value`
  (`"Italy"` selected via portaled option, combo value updated).

Downstream workarounds that can now be removed (do these when the
next `@dashforge/tw` release ships to consumers):

- `inventory-kit/client/tailwind/src/components/primitives/SectionCard.tsx` —
  the `overflowVisible` prop.

Tests: the existing 2019/2019 tw test suite passes unchanged
against the refactor (Autocomplete has ~40 tests, all green). Not
yet added: a dedicated regression test that mounts the Autocomplete
inside an `overflow: hidden` ancestor and asserts the listbox
parent chain reaches `[data-radix-popper-content-wrapper]` — worth
adding before the next release so the fault-line stays closed.


