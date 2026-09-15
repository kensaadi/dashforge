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

## Unconfirmed

*(nothing yet — move suspicions here rather than into the list above)*

## Fixed

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


