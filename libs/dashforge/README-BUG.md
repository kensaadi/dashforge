# Dashforge — Known Bugs

A register of confirmed defects in the shipped libraries, written down
so they survive the session that found them.

**How to use this file.** Each entry is self-contained: symptom, cause
with `file:line`, how it was reproduced, and a proposed fix.

**Closing one is two moves, and the first is easy to get wrong.** The
entry at the top **stays where it is** and gains a `Status:` line, so the
diagnosis stays findable by the symptom that sent you looking. A closure
note then goes in *Fixed* at the bottom, naming the commit that closed it
and what was measured. Do not delete entries: a fixed bug with its
reasoning intact is what stops the same design coming back.

**So the top section is not a list of open defects.** It is every defect
ever confirmed, and roughly forty of them are closed. Read the `Status:`
line before concluding anything. This paragraph used to say "move the
entry to *Fixed*", which the file has never done and should not start
doing, and reading it that way has twice produced a wrong answer to
"how many bugs are open".

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

## BUG 24 — RICLASSIFICATA. Non è un difetto ma una capability assente: `<Button>` (tw) non ha un trattamento per superfici scure, parcheggiata in kensaadi/dashforge#140

Hit 19/09/2026 in `~/projects/web/urbango-project/ugo-web`, putting a
quiet «Dashboard» action into the marketing header.

**Severity:** medium. Nothing crashes and nothing is silent — the text
is simply unreadable, which at least shows. It matters because it makes
the library unusable on exactly the surfaces a marketing site has most
of: dark heroes, ink footers, inverted panels.

**Status:** riclassificata 26/09/2026 e **parcheggiata**, non aperta.
Il sintomo è reale e verificato; la classificazione era sbagliata. Nulla
si comporta male, manca una capability, e chiuderla aggiunge superficie
API pubblica. Spec completa, con piano di release, in
kensaadi/dashforge#140 (Project #6, Dashforge 2.0.0). Le sezioni qui
sotto sono il report originale, conservato; il verdetto è in coda.

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

### ✅ Verifica 26/09/2026 — il sintomo regge, due affermazioni no

Letto dal sorgente, non dal report:

- l'asse `color` ha **cinque** valori (`primary` → `danger`): nessun
  `neutral`, nessun `inverse`, e **nessun asse `surface` in tutto il
  catalogo**, quindi non esiste un pattern da applicare;
- le 15 righe `compoundVariants` di `outline`/`ghost`/`link` fissano
  davvero il foreground al tier `-700`.

Due correzioni:

1. **«Every variant resolves to a fixed foreground» è troppo forte.**
   `solid` porta `text-white` più un proprio background nel variant
   class, quindi funziona già su qualsiasi superficie. Il buco è su tre
   variant su quattro.
2. **«dalle scale neutral o semantiche» è sbagliato.** `neutral` non è
   fra i valori di `color`. Sono solo semantiche.

#### Il claim su `sx`, misurato invece che asserito

Passando le stringhe vere per `twMerge`:

```
sx="text-white"
  -> hover:bg-primary-50 focus-visible:ring-primary-500 text-white

sx="text-white hover:bg-white/10 focus-visible:ring-white"
  -> text-white hover:bg-white/10 focus-visible:ring-white
```

L'override ingenuo, che è quello che un consumer scrive, lascia hover e
ring sulla scala chiara: il failure mode descritto («leggibile a riposo,
sbagliato appena passa il mouse») è esatto. Ma un `sx` completo a tre
proprietà li sostituisce puliti. Quindi non è impossibile oggi: è una
formula da ricordare a ogni call site, la cui forma comune rompe solo
sull'interazione. È un argomento più difendibile di «impossibile», ed è
quello vero.

### ⚠️ La fix proposta qui sopra NON è costruibile come scritta

«compound entries that use the inverse tokens»: **quei token non
esistono.** Il preset definisce sei scale (`neutral`, `primary`,
`secondary`, `success`, `warning`, `danger`) e niente chiamato inverse,
on-dark o contrast.

L'unica inversione nel sistema è la scala `neutral` che scambia 50 e 950
fra light e dark. È **theme-driven, non surface-driven**, ed è il
meccanismo sbagliato qui: un hero scuro è scuro in *entrambi* i temi,
quindi un bottone costruito su `neutral` sarebbe corretto in light e
rotto in dark. `slate` è theme-invariant ed è ciò che il progetto usa
già per le superfici sempre-scure, ma viene dalla palette Tailwind e non
dalle CSS var del preset, quindi non è temizzabile via token Dashforge.

### Un artefatto che il report non nomina

La base del Button ha `focus-visible:ring-offset-2`, e né la base né il
preset impostano un colore per l'offset. Cade sul default di Tailwind
v4, verificato in `tailwindcss@4.3.0/dist/lib.mjs`:

```
"--tw-ring-offset-color","#fff"
```

Su fondo scuro, il focus da tastiera dipinge un **alone bianco** di 2px.
Qualsiasi trattamento inverse deve impostare l'offset o togliersi
l'offset, altrimenti la fix spedisce l'artefatto.

### Dove è finita

kensaadi/dashforge#140, Project #6. Strada scelta: quella
token-corretta, non la scorciatoia hardcoded. Una scala `inverse`
**theme-invariant** in `tw-tokens`, emessa come
`--df-tw-color-inverse-*` dal preset, letta dai compound del Button.
Tre package, tre minor (`tw-tokens` 1.2.0 → 1.3.0, `tw-theme`
1.2.0 → 1.3.0, `tw` 1.7.1 → 1.8.0), tutti additivi.

⚠️ Vincolo di compatibilità che la issue tratta e che vale ripetere:
`tw` 1.8.0 emette classi `text-inverse-*` che leggono CSS var che solo
`tw-theme` 1.3.0 produce. Con `tw-theme` 1.2.0 quelle classi non
risolvono nulla e il bottone resta senza foreground, che è **peggio del
bug che stiamo chiudendo**. Il peer range va alzato a `>=1.3.0` e
l'ordine di publish è tokens, theme, tw. È anche il primo vincolo
cross-package del repo che richiede davvero un `COMPAT.md`, che oggi non
esiste.

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

## BUG 30 — NOT A DEFECT. `<Chip>` (tw) hardcodes `rounded-full`, and the preset never claimed otherwise

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

## BUG 44 — `@dashforge/ui-core` and `@dashforge/rbac` published 2.0.0 without their declarations

**Severity:** high for anyone installing from npm, zero at runtime.

**Status:** fixed in 2.0.1. Reproduced 2026-09-29 against the
published `@dashforge/ui-core@2.0.0` tarball, not inferred from the
source.

### Symptom

What a consumer saw depended entirely on one compiler flag:

| `skipLibCheck` | Result |
|---|---|
| `false` | `TS2307: Cannot find module './src/types'`, once per re-export |
| `true` (the common default) | compiles clean, every symbol degrades to `any` |

The second row is why it went unnoticed for a day. `.d.ts` files never
reach a bundle, so every test suite stayed green, `ugo-web` kept
building and the deployed app kept working. The defect removes the
type safety without touching the behaviour.

### Cause

The `typecheck` target ran, on both packages:

```
tsc --build <tsconfig.lib.json> --emitDeclarationOnly && rm -rf <pkg>/dist/src
```

copied from `@dashforge/forms`, where it is correct: there `outDir` is
`dist`, `tsc` writes the flat tree into the package, and `dist/src` is
a genuinely redundant copy from `@nx/rollup`.

On these two, `tsconfig.lib.json` sets

```
"outDir": "../../../dist/out-tsc/libs/dashforge/<pkg>"
```

because both are `composite` and referenced. `tsc` writes nothing into
`dist/`. What the package publishes is the rollup emission under
`dist/src`, which the one-line `dist/index.d.ts` wrapper re-exports
from. The `rm -rf` deleted the entire payload and left an index
pointing at nothing.

The `_comment` on both targets described the `forms` setup word for
word, which is how the copy was made and why review did not catch it.

### Why nothing caught it

Nothing read the tarball. `nx run-many -t lint typecheck test build`
was green on every project, because dependents inside the monorepo
compile against the project references, which read declarations from
`dist/out-tsc/` where they always exist. The pre-publish audit checked
size and stray files, and the tarball was small and clean: only twenty
files were missing and nobody was counting.

### Fix

`&& rm -rf dist/src` dropped from both `typecheck` targets, and the
`_comment` rewritten to describe the setup these two packages actually
have, with an explicit warning against copying the target elsewhere.

The shipped declarations were verified byte-identical to what `tsc`
emits from each package's own `tsconfig.lib.json`: 29 files for
`ui-core`, 20 for `rbac`, compared one by one, zero differences. So
the package publishes the compiler's output, reached by a different
path, not a second-class copy.

### The guard that was missing

`scripts/verify-tarballs.mjs`, wired into CI after the existing
`nx run-many` step. It packs all eleven packages and, for each, checks
that the declared `types` entry exists, that every specifier it
re-exports resolves, that no test file rode along, that the exported
`VERSION` matches `package.json`, and that a throwaway consumer
compiles against the `.tgz`.

That consumer runs with `skipLibCheck: false`, and that is the load
bearing detail: on the default `true` the broken 2.0.0 compiles clean,
so a probe on default settings would have certified the exact defect
it exists to catch.

On its first full run the guard found two packages nobody had looked
at, `tw-theme` and `tw-tokens`, both exporting `VERSION '0.2.0-beta'`
while publishing 2.0.0.

### Related, same release

- Six packages exported a stale `VERSION` constant. `prepare-release.mjs`
  only rewrote it when it already matched `package.json`, so the first
  drift made itself permanent. It rewrites unconditionally now.
- `@dashforge/calendar-core` was not registered in the release tooling
  at all, so every `prepare-release` run silently skipped it.
- `path.type-test.ts` and `autocomplete.props.type-test.ts` shipped
  inside tarballs: the `exclude` patterns spell it `*.test.ts` with a
  dot and those files use a hyphen.

## Unconfirmed

### FIXED 26/09/2026 — `@dashforge/tw:build` raced `@dashforge/tw:typecheck` over the same `dist/`

Not a library defect, and **not** the same thing as the wall-clock
assertion resolved below. That one is closed; this is a second,
independent cause of an intermittent red on the same task name, and it is
still open.

Caught 26/09/2026 with the failing run's own output, which is what the
note below says to do and what finally worked:

```
[!] (plugin rollup-plugin-nx-delete-output)
    Error: ENOTEMPTY: directory not empty, rmdir
    '…/libs/dashforge/tw/dist/components'
  at deleteOutputDir (@nx/rollup/src/utils/fs.js:14:21)
```

#### Cause, read out of the config

Two targets own the same directory and nothing orders them:

- `typecheck` → `tsc --build tsconfig.lib.json --emitDeclarationOnly`,
  and `tsconfig.lib.json` has `"outDir": "dist"`, so it **writes**
  `libs/dashforge/tw/dist/**`;
- `build` → rollup, whose `@nx/rollup` delete-output plugin **rmdir**s
  the same `dist/`.

`nx run-many` schedules them concurrently, so when tsc is emitting
`dist/components/**/*.d.ts` while the plugin is removing
`dist/components`, the rmdir hits a directory that just got repopulated.
Both artifacts are dated minutes apart in a normal run
(`dist/index.d.ts` and `dist/src/index.d.ts`), which is the same fact
seen from the other side.

The ordering is **deliberately absent**, and `project.json` says why:

> `_comment`: "typecheck excluded from dependsOn: TS bundler resolver
> fails when consuming `@dashforge/forms/dist/index.d.ts` … Re-attach
> `typecheck` once the publishables' dist d.ts wrappers are switched to
> inline `export ...` (out of scope F3)."

So the race is a known consequence of a documented workaround, not an
oversight. It just was never connected to the intermittent red.

#### Frequency

Roughly one run in ten of the full four-target command. Two immediate
re-runs after the failure above were both green, which is exactly why it
looked like flakiness for so long.

#### Options, none applied — this touches the published artifact

1. Re-attach `typecheck` to `build`'s `dependsOn`. Simplest, and the
   `_comment` says it is blocked by the d.ts wrapper shape.
2. Give `typecheck` its own `outDir` so the two never share a directory.
   Needs care: the published package's `types` resolve through `dist/`,
   so moving the emit changes what ships.
3. Drop the delete-output plugin and clean `dist/` in an ordered step.

#### Fix applied — option 4, which the list above missed

`typecheck` now `dependsOn: ["build"]`. The `_comment` on the build target
documents why the REVERSE (build depending on typecheck) is blocked by a TS
resolver issue; nobody had tried this direction. No cycle, and the two can
no longer overlap, so the race is gone **by construction** rather than by
luck. Four consecutive full four-target runs with `--skip-nx-cache`: green.

It also fixed something nobody had noticed. Run separately, the two targets
produce:

```
typecheck  ->  dist/index.d.ts + dist/components/**/*.d.ts     (191 files)
build      ->  dist/index.esm.js + dist/index.d.ts
               + dist/src/components/**/*.d.ts                 (191 files)
```

**Both wrote `dist/index.d.ts`**, at different internal path shapes
(`./components/…` versus `./src/components/…`), and the winner was whoever
finished last. The published types were non-deterministic. With the
ordering, typecheck always lands last and the shipped `index.d.ts` is
always the `./components/…` flavour.

⚠️ What the ordering does NOT fix, and what the mandatory pre-publish pack
check surfaced immediately afterwards: both sets of declarations still
SHIP. `@dashforge/tw` packs **766 files / 4.6 MB**, of which 382 are
`.d.ts` (191 of them redundant) and 382 are `.d.ts.map`, plus
`dist/tsconfig.lib.tsbuildinfo`, a pure build artifact. Against the
standing guideline of under 100 files and under 1 MB for a UI package.
`tw-theme` has the same shape at a smaller scale (11 duplicates + a
tsbuildinfo); `ui`, `forms` and `ui-core` do not duplicate.

That is packaging, not the race, and it is worth closing before an
eleven-package release rather than after.

#### Packaging cleaned 27/09/2026, with two traps taken in the face

Every publishable package now excludes declaration sourcemaps and any
incremental-compile cache:

```json
"files": ["dist", "!dist/**/*.d.ts.map", "!dist/**/*.tsbuildinfo",
          "README.md", "CHANGELOG.md"]
```

| package | files before | after | tarball |
|---|---|---|---|
| `tw` | 766 | **386** | 412K |
| `tw-theme` | 46 | 26 | 23K |
| `ui` | 152 | 81 | 160K |
| the other seven | — | 13-39 | 4-84K |

Zero `.d.ts.map` and zero `tsbuildinfo` across all ten. The maps pointed at
`.ts` sources the packages do not ship, so they were dead weight in every
one of them.

⚠️ **Trap 1: `tsBuildInfoFile` inside `dist` is load-bearing.** Moving it
out looked strictly correct and broke the build silently. The rollup build
wipes `dist`, which invalidates that incremental cache along with the
outputs it describes. Moved out, it survives the wipe, tsc finds a cache
that says everything is current, emits **nothing**, and the package ships
with one declaration file instead of 191. Caught only because the pack
check ran afterwards. Both tsconfigs now carry a comment saying so.

⚠️ **Trap 2: `!dist/src` cannot be used, even though `dist/src` really is
a duplicate on `tw` and `tw-theme`.** The exclusion is only correct when
`typecheck` has run AFTER `build`, because only then do the top-level
declarations exist. `scripts/link-tw-to-dash.sh` runs `nx build` alone, so
at pack time the ONLY declarations present are the ones under `dist/src` —
and the exclusion stripped them. The package installed into `learn/dash`
with **two files** and every import failed to resolve. A `files` whitelist
must not depend on which tasks happened to run.

So the duplication stays for now: `tw` ships 382 declarations where 191
would do. The correct fix is to stop the rollup build emitting them at all,
so a single producer owns `dist`, and that belongs in the rollup config,
not in a pack-time exclusion.

#### Verified

`@dashforge/tw` packed and installed into `learn/dash`: 193 files arrive,
192 declarations, zero maps, and `tsc -b --noEmit` across the whole
consumer reports **zero errors**. The trimmed package resolves.

---

### RESOLVED — one intermittent CI red was a wall-clock assertion

Kept here because the earlier note in this section guessed at it and the
guess was wrong. The cause is now known, from a captured failing run:

```
FAIL src/components/AppShell/AppShell.test.tsx
     > <AppShell> performance > mounts under 30ms with all slots filled
AssertionError: expected 44.66166700000008 to be less than 30
```

Not flaky, and nothing to do with the library. `AppShell.test.tsx`
asserted a **render time** — `expect(t1 - t0).toBeLessThan(30)` — which
measures the machine, not the component. Run alone the mount is inside
30ms; run the way CI runs it, with eleven other projects building
alongside 2000 jsdom tests, it took 44ms.

The earlier suspicion in this slot ("memory pressure", from the one
failure I could not reproduce) was in the right area and named the wrong
mechanism. The lesson that made it findable: **capture the failing run's
own output before doing anything else**. Six clean reruns proved nothing,
because they were not the run that failed.

Also worth knowing, and the reason this was mistaken for a build problem
earlier: when one task fails, nx terminates its siblings, truncating
their stdout mid-line (`✓ @dashf`). A cut-off log is a killed process,
not a failing test. Read `Failed tasks:`, then re-run that one task alone
for untruncated output.

`tw:build` also prints a long run of `ERROR failed to read input source
map: … "useTableSelection.js.map"` from swc, one per file under
`_shared/data/` and `DataGrid/`. Noise, not a cause: the build writes
`dist` and succeeds, and the lines appear in passing runs too. Left
alone.

**Fixed** 26/09/2026 by raising the two bounds tight enough to measure
contention rather than code: `AppShell` 30 -> 200ms, and `TopBar`
20 -> 200ms, which at 20ms was the tightest in the suite and the next one
due to fire. Neither assertion was removed. For context, the suite holds
**18** of these, and the rest sit at 50-800ms:

| bound | count |
|---|---|
| 50ms | 1 |
| 100-250ms | 9 |
| 500-800ms | 5 |

The deterministic version of the same intent already exists next to the
AppShell one — `renders at most 2 times on mount`, which asserts a render
count and cannot be affected by load. That is the pattern to extend.

⚠️ The real fix is structural and was not done: a wall-clock bound does
not belong in a unit test that gates merges. Splitting the `*.perf.test.tsx`
files into their own target, kept out of the CI gate, removes the whole
class. Left for a deliberate pass.

#### Closed 27/09/2026, and the plan above was the wrong one

The gate went red twice more on the same class, from the same cause:

```
FAIL src/components/Autocomplete/Autocomplete.perf.test.tsx
AssertionError: expected 159.81825000000003 to be less than 100
FAIL src/components/LeftNav/LeftNav.perf.test.tsx
AssertionError: expected 117.69637499999999 to be less than 50
```

Two things turned up on the way to fixing it, and both contradict what
this note said to do.

**`vite.config.ts` already carried a mitigation, and it never ran.** The
config excluded `**/*.perf.test.*` when `process.env.CI` was set. Vitest
4.0.18 **ignores `test.exclude`**: with the pattern unconditional and no
CLI filter, a full run still collected all 146 files including the seven
perf ones. So the perf specs have been gating CI all along, and the
comment promising otherwise was reassuring and false. Anyone writing
`test.exclude` in this repo should know it does nothing.

**Taking the files out of the gate would have removed real coverage.**
They are not pure timing specs. Of 39 assertions, 16 are wall-clock and
the rest are deterministic — render counts (`at most 2 times on mount`),
the virtualizer's row count (`< 100` of 10000), callback call counts — and
some sit in the *same* `it` as a timing assertion, so per-file exclusion
could not separate them.

So the split went per-assertion instead. `src/test-utils/perfBudget.ts`
exports `expectWithinBudget(elapsed, budget)`, which scales the budget by
`DF_PERF ? 1 : 4`. All 16 wall-clock assertions call it. The gate keeps
every deterministic guard and tolerates contention; `nx run
@dashforge/tw:test-perf` sets `DF_PERF` and enforces the budgets as
written, on a quiet machine. 4x is the measured worst contention (2.3x)
plus room, not an open door: `perfBudget.test.ts` pins that 401ms against
a 100ms budget still fails.

Verified: `test-perf` green on an idle machine (7 files, 39 tests), and
the full `lint typecheck test build` across all twelve projects green
under the contention that produced the numbers above.

### Sweep 27/09/2026 — what the lint noise was hiding

Run before the 2.0.0 alignment, on the premise that the register being at
zero open bugs did not mean the tree was clean. It was not. None of the
below is a defect in a shipped component except where it says so; kept
here because each one had been invisible for a reason worth remembering.

**197 lint warnings on `@dashforge/tw`, 181 of them suppressions of a rule
that is already off.** Every `*.precedence.test.tsx` carried
`// eslint-disable-next-line @typescript-eslint/no-explicit-any` lines, and
the root config switches that rule off for test files. Removed with
`eslint --fix`. Six more were the `_name` convention for a deliberately
unused binding (`tooltip: _tooltip`, which strips a prop out of `...rest`
per BUG 9), which `no-unused-vars` was not configured to honour; the root
config now sets `argsIgnorePattern` / `varsIgnorePattern` / the caught-error
and destructured-array equivalents to `^_`. Repo-wide the count went from
197+ to 23, and five packages to zero. BUG 39 above is what was buried in
it.

**Four `typecheck` targets had lost their ordering.** `forms`, `theme-mui`,
`tw-theme` and `ui` declare `typecheck` in `project.json` and, in
overriding the inferred `@nx/js` target, dropped its
`dependsOn: ["^typecheck"]`. All four run `tsc --build`, which walks project
references and re-emits a dependency's declarations when they look stale:
`ui:typecheck` writes `forms/dist` while `forms:typecheck` is writing the
same files and the same `.tsbuildinfo`. That is the intermittent red on
`ui:typecheck` that nx labelled flaky. `^typecheck` restored on all four,
and added alongside `build` on `tw`. Note for later: a bare
`options.command` in `project.json` only works because it merges onto an
inferred target — a genuinely new target needs an explicit `executor`, or
Nx drops it without a word.

**A dead adapter stub in `@dashforge/forms`.** `syncValueToRHF` in
`FormEngineAdapter.ts`, marked "Phase 0", was a logging no-op carrying three
TODOs and had zero callers anywhere in the monorepo. Removed along with its
declaration in `form.types.ts`.

**A generic parameter that promised type safety and delivered none.**
`ReactionRunContext<TFieldValues>` never used its parameter;
`ReactionDefinition<TFieldValues>` "used" it only by passing it down to
that, and `ReactionRegistry` / `createReactionRegistry` threaded it further.
So `ReactionDefinition<{ item: string }>` — written that way in eleven call
sites — checked nothing: `watch` is `string[]` and `getValue` takes a
`string`, so a typo in a watched field name compiled. Dropped from all four
types, which aligns them with the sibling `ReactionWhenContext` that never
had it. Typed field paths (`Path<TFieldValues>` / `PathValue`) are a real
feature and belong in Project #6, not in a cleanup. The silence on a
mistyped `watch` entry is deliberate and tested (`reaction watches
non-existent field (no crash)`), not a defect.

**A test that tested nothing.** `rbac`'s `useCan.spec.tsx` case named
"should work with inline request object construction" declared a
`TestComponent` calling `useCan` with a `delete` request, never mounted it,
and asserted `typeof boolean` on an unrelated `read` hook. It now renders
the component, which also answers a question nobody had asked: `user` holds
`delete` on `booking` only under a condition reading
`resourceData.ownerId`, and a caller passing no `resourceData` gets a clean
deny rather than a crash. A second case covers what the name was reaching
for — a fresh request object literal each render, which neither loops nor
goes stale.

**`eslint-plugin-react-hooks` was enabled on five packages that lacked
it** (`forms`, `rbac`, `tw-theme`, `calendar-core`, `theme-core`), on the
expectation that a rules-of-hooks violation was hiding somewhere after
BUG 33 and BUG 34. There was none. Worth recording as a negative result.

**`<SnackbarProvider>` (ui): `startTimer` captured `close` with an empty
dependency array.** Not a present defect — `close` depends only on the
equally stable `clearTimer`, so the identity never changes — but the
auto-dismiss timer would have gone silently stale the day `close` gained a
dependency, acting on the queue of the render that created it. `close` moved
above `startTimer` (a dep array is evaluated during render, so a forward
reference is a TDZ error) and `startTimer` now names it. The hardened
auto-dismiss suite passes unchanged.

**Two `jsx-a11y` warnings on `<Autocomplete>` (ui) were false, and now say
so.** `aria-disabled` on an `<li>` whose `role="option"` arrives through
MUI's `getOptionProps` spread, which a static rule cannot read. Confirmed
against the DOM rather than against MUI's documentation:
`Autocomplete.a11y.test.tsx`, 4 cases — every row carries `role="option"`,
every row exposes `aria-selected`, exactly one is `true`, and a disabled row
reports `aria-disabled="true"`. Suppressed on the line the rule reports
(the opening tag, not the attribute) with that test named in the comment.
Making the role literal instead was tried and rejected: it just moved the
complaint to `role-has-required-aria-props` asking for `aria-selected`.

**BUG 31's own entry had gone stale.** It stated that the two API proposals
were deliberately not built. Both were built later in the same pass. The
entry is corrected above.

## BUG 43 — tw controls do not repaint after a write through the `rhf` escape hatch

**Severity:** medium. The form holds the new value and the control
shows the old one, with no error anywhere. Whatever the user reads is
what they believe they are saving.

**Status:** open, reproduced 2026-09-29 against `@dashforge/tw@2.0.0`
and `@dashforge/forms@2.0.0`.

**Tracked as** [kensaadi/dashforge#146](https://github.com/kensaadi/dashforge/issues/146),
in Project #6. The root cause is NOT established: the open question in
the Cause section below is the work that issue is asking for, and the
two directions under Suggested fix should not be implemented before it
is answered. Do not re-diagnose this from scratch; read the issue
first.

### Symptom

A Google Places pick fills several fields at once through the
documented escape hatch, `useDashFormContext().rhf`:

```ts
rhf.setValue('city', data.city, { shouldDirty: true, shouldValidate: true })
rhf.setValue('postcode', data.postcode, { shouldDirty: true })
rhf.setValue('country_code', data.country, { shouldDirty: true })
```

The two `<TextField>`s repaint. The `<Select>` does not.

Measured in the browser, same render, a probe rendered beside the
control:

| | reads |
|---|---|
| `rhf.watch('country_code')` | `IT` |
| what `<Select>` displays | `Svizzera` (`CH`) |

Adding `shouldTouch: true` and `shouldValidate: true` changes nothing.

`<TextField>` escapes the fault because RHF registers it as an
uncontrolled input and writes straight to the DOM node: it never
needed the repaint.

### Cause

`libs/dashforge/tw/src/components/Select/Select.tsx:254`

```ts
const bridgeValue = (bridge.getValue(name) ?? fieldMeta?.value) as …
```

`bridge.getValue` is read during render, so the control repaints only
when something re-renders it. That something is
`useDashFieldMeta(name)` (`Select.tsx:178`), which subscribes through
`bridge.subscribeField`. A field's listeners fire from two places in
`libs/dashforge/forms/src/core/DashFormProvider.tsx`:

- line 223, `adapter.addOnValueSyncListener` — and the adapter only
  broadcasts from `syncFieldValue`, i.e. from **`bridge.setValue`**
  (`FormEngineAdapter.ts:184`), never from a write that went straight
  to RHF;
- lines 318-337, `diffAndNotify` over `errors`, `touchedFields` and
  `dirtyFields`.

So a programmatic write through the escape hatch has no value-sync
path to the field at all.

**What I could not explain from the source, and where a second pair of
eyes is worth more than my guess:** the second path *should* have
covered it. `shouldDirty: true` flips `dirtyFields.country_code` from
`undefined` to `true`, `diffAndNotify` compares with `!==`, and that
ought to call `notifyField('country_code')`. It demonstrably does not
repaint the control. Either the diff is not seeing that key, or the
notification lands before `getSnapshot` would return the new value.
I did not chase it further than the measurement above, and I would
rather say so than name a cause the way BUG 4's first entry did.

### Suggested fix

Give the escape hatch the same broadcast the bridge has: either have
`DashFormProvider` subscribe to RHF's value changes (`rhf.watch`
with a subscription, or `useWatch` on the provider) and call
`notifyField` for the changed path, or document that programmatic
writes must go through `bridge.setValue` and make the escape hatch's
`rhf.setValue` a thin wrapper that notifies.

The second is cheaper but narrows what `rhf` means; `useDashFormContext`
currently presents it as plain RHF.

### Reproduction

`ugo-web`, `/partner/settings`: the partner sits in Lugano (`CH`), pick
"Duomo di Milano" in the Places field. City becomes `Milano`, CAP
`20122`, and the country menu still reads `Svizzera` while the form
holds `IT`.

### It is not only `setValue`, and not only `<Select>`

Found 2026-09-29 in the same session, which is why the title is no
longer about one method and one control.

`ugo-web`, `/partner/profile`, the password form: on a 403 the screen
calls `rhf.setError('current', …)` so the refusal lands on the field
to correct. The error reaches RHF and stays there — logged from inside
the handler, immediately and 400ms later:

```
[probe] now:   current  La password attuale non è giusta.
[probe] 400ms: current  La password attuale non è giusta.
```

The `<TextField>` showed nothing and kept `aria-invalid` unset. The
same control *does* show an error raised by its own `rules`, so the
rendering path is fine; what does not arrive is the notification.

This one deepens the open question above rather than answering it. The
provider diffs `errors` and calls `notifyField` (DashFormProvider.tsx
lines 318-322), so this path looked covered on paper and is not in
practice — exactly as `shouldDirty` looked covered for the Select.
Whatever is wrong is one thing, not two.

`adapter.notifyValueChange(name)` repairs both cases from the consumer
side, which is further evidence that the notification, and not the
state, is what goes missing.

---

## Fixed

### BUG 42 — `<TopBar>`'s `start` slot said `min-w-0` and `shrink-0` in the same breath

**Fixed**, closed by `3aed78d`.

Found while building `<TopBarBrand>` for kensaadi/dashforge#63 gap G, and
found by the browser rather than by the suite, which is the part worth
keeping.

#### The two classes cancel each other

```
start: 'flex items-center gap-2 min-w-0 shrink-0'
```

`min-w-0` exists to let a flex item shrink below its content width, which
is the precondition for `truncate` to do anything. `shrink-0` forbids that
item from shrinking at all. So the `min-w-0` was dead, and whoever wrote it
was reaching for a truncation that could never happen.

The visible consequence is not a brand that overflows. It is a brand that
keeps its full width and **pushes `center` and `end` out of the bar**.
Measured on `learn/dash` with a brand carrying a file-path subtitle:

| bar width | subtitle before | `end` inside before | subtitle after | `end` inside after |
|---|---|---|---|---|
| 492px | 203px | yes | 203px | yes |
| 300px | 203px | yes | 189px | yes |
| 200px | 203px | **no** | **89px** | **yes** |
| 140px | 203px | **no** | **29px** | **yes** |

Before, the subtitle never moves off 203px at any width and the `end` slot
leaves the bar from 200px down. After, it shrinks progressively and the
`end` slot stays inside at every width. Both columns measured on the built
package linked into `learn/dash`, not on the source.

#### Fix

`shrink-0` dropped from the `start` slot. Only the already-broken case
changes: where there is room, a shrinkable item and a non-shrinkable one
lay out identically, which is why all 2249 `@dashforge/tw` tests passed
untouched.

#### How a green test missed it

The `<TopBarBrand>` spec asserted that `min-w-0` was on the root and the
text column and that `truncate` was on both lines. Every one of those was
true while the bar was breaking, because no descendant can shrink inside an
ancestor that refuses to. A class-presence assertion cannot see that, and
jsdom does no layout, so nothing in the suite could have.

What was added is the only part of it jsdom CAN hold: that the `start` slot
does not carry `shrink-0`. The layout proof stays a browser measurement and
lives in the table above.

#### Guard

`tw/src/components/TopBar/TopBarBrand.test.tsx`, 11 cases, one of which
pins the slot contract and says in its own comment why the case above it
was a false green.


### BUG 41 — `<Stack direction="row" divider={<Divider />}>` squeezed its items instead of separating them

**Fixed**, closed by `3aed78d`.

Reported as gap F of kensaadi/dashforge#63: *"Divider doesn't reliably
render between Stack children. Needs reproduction, may be the prop semantics
confusing consumers."* Filed with no repro and with the right guess attached.

#### Reproduced, all four compositions

| | composition | rendered classes | |
|---|---|---|---|
| A | `col` + `divider` prop | `h-0 border-t w-full` | correct |
| B | `row` + `divider={<Divider orientation="vertical"/>}` | `w-0 border-l self-stretch` | correct |
| C | `col` + `<Divider>` as a plain child | `h-0 border-t w-full` | correct |
| D | **`row` + `divider={<Divider />}`** | **`h-0 border-t w-full`** | **the defect** |

#### Why it read as "doesn't reliably render"

The rule was in the DOM the whole time, which is why the report could not
pin it. `<Divider>` defaults to `orientation="horizontal"`, and a horizontal
rule is `h-0 border-t w-full`. Drop that into a `flex-row`:

- `h-0` gives it no height, so along the row's cross axis there is nothing
  to see;
- `w-full` makes it claim the container's entire width as a flex item, so
  the actual items get squeezed into what is left.

You do not get a missing divider. You get a full-width invisible one and a
squashed row, which looks like a layout bug somewhere else entirely.

This is adjacent to BUG 25 and not the same. BUG 25 was the case where you
DID ask for `orientation="vertical"` and still got `w-full`. This is the
case where you never asked, and the default was wrong for the axis.

#### Why the caller should not have to say it

The names work against you: a row is separated by **vertical** rules and a
column by **horizontal** ones. So the prop most likely to be omitted is
exactly the one whose correct value is the counter-intuitive one. And the
Stack already knows its own axis, so nothing is being guessed.

#### Fix

`interleaveDividers` now takes the Stack's `direction` and supplies the
orientation the caller did not choose: `row` / `row-reverse` → `vertical`,
`col` / `col-reverse` → `horizontal`, defaulting to `horizontal` to match
`defaultVariants.direction: 'col'`.

Two guards on the derivation itself:

- **an explicit `orientation` always wins**, including the shape that looks
  wrong. A caller who writes `<Divider orientation="horizontal" />` into a
  row may want exactly that;
- **a divider that is not ours is never touched.** The check reads
  `displayName === 'Divider'` rather than importing the component, so Stack
  keeps no dependency on Divider and the test fails safe. Injecting an
  `orientation` prop into an `<hr>` or a consumer's own node would put an
  unknown attribute on the DOM, which is how `tooltip` shipped onto elements
  in BUG 9.

For a column Stack, the common case, the derived value is the one already
being produced, so the change is a no-op there.

#### Guard

`tw/src/components/Stack/Stack.divider.test.tsx`, 12 cases: the four axes,
the unstated default, an explicit orientation winning, a foreign divider
passing through with no injected attribute, a non-element divider still
interleaving, and the N-1 arithmetic across 0, 1, 2, 3 and 5 children.
Verified: with the derivation disabled, 2 of the 12 fail, and they are the
two row cases.


### BUG 40 — `<Chip variant="outline" color="neutral">` had an edge nobody could see

**Fixed**, closed by `3aed78d`.

Reported as gap E of kensaadi/dashforge#63: *"`<Chip>` `outline` + `neutral`
— low contrast in dark theme, chips become barely visible."* The symptom is
real. Both halves of the diagnosis are wrong, and this is the third report
of this shape, so the measuring came first.

#### Measured against `dashforgePreset()`, on the real surfaces

`#fafafa` light, `#0a0a0a` dark, computed from the neutral scale the preset
actually installs:

| | light | dark | |
|---|---|---|---|
| text, `text-neutral-700` | 9.93:1 | 13.36:1 | passes 4.5:1 twice over |
| border, `border-neutral-300` | **1.42:1** | **1.91:1** | **fails 3:1, both** |

#### The two things the report got backwards

**It blamed the text.** The text is among the strongest in the catalog. And
`neutral` is the one colour row with no `dark:` variant precisely because it
auto-inverts through the preset's CSS vars: adding one would invert twice,
which is the documented anti-pattern.

**It blamed dark mode.** Dark is the *better* of the two, 1.91 against
light's 1.42. The border failed in both themes and failed worse in light,
where nobody had thought to look.

#### Why it is a defect and not a preference

An `outline` chip **is** its border. Take the border out of the reading and
what remains is unstyled text on the page surface, indistinguishable from a
label. That makes the border a UI component boundary, so WCAG 1.4.11 applies
and the floor is 3:1, not the 4.5:1 that would govern text.

| tier | light | dark | |
|---|---|---|---|
| `neutral-300` | 1.42 | 1.91 | shipped; fails both |
| `neutral-400` | 2.42 | 2.53 | still fails both |
| `neutral-500` | **4.54** | **4.18** | passes both |
| `neutral-600` | 7.49 | 7.85 | passes, too heavy for a chip |

Note `neutral-400` fails as well: the one-step fix is not enough here, the
same way it was not enough in BUG 31. Two tiers had to move.

#### The inconsistency that hid it

`neutral` was the only colour row at `-300`. The other six all sit at
`-500`:

```
outline + neutral    border-neutral-300     <- the outlier
outline + primary    border-primary-500
outline + secondary  border-secondary-500
outline + success    border-success-500
outline + warning    border-warning-500
outline + danger     border-danger-500
outline + info       border-info-500
```

So one edit closes a WCAG failure and an inconsistency at the same time, and
the fix is not a new opinion about how chips should look: it is the tier the
component already used everywhere else.

#### Fix

`border-neutral-300` → `border-neutral-500`. The text tier is untouched.

#### Verified in the browser, both themes

On `learn/dash`, `/chip-playground`, read with `getComputedStyle` and
composited against the surface the chip actually sits on. That surface is a
raised card, `rgb(23,23,23)` in dark and `rgb(245,245,245)` in light, not the
page beneath it, which makes it the **worse** case of the two and the one
worth quoting:

| | before | after | floor |
|---|---|---|---|
| border, dark | **1.73:1** | **3.78:1** | 3:1 |
| border, light | 1.42:1 | **4.35:1** | 3:1 |
| text, dark | 12.09:1 | unchanged | 4.5:1 |
| text, light | 9.51:1 | unchanged | 4.5:1 |

The dark margin is the thin one, 3.78 against a floor of 3, because a card
sits a tier above the page. It clears, and it is worth knowing that a chip
on an even lighter raised surface would be the next thing to check.

One measuring note for whoever repeats this: reading `getComputedStyle`
straight after clicking the theme toggle returns values from the middle of
the CSS transition. The first light-mode reading here came back at 1.36:1 for
text that is really 9.51:1. Wait for the transition to settle.

#### Guard

`tw/src/components/Chip/Chip.contrast.test.ts`, 4 cases: the tier, with both
rejected alternatives named and their numbers; the text tier left alone plus
the absence of a `dark:` variant on the neutral row; the border tier equal
across all seven colours; and the solid variant untouched. Verified: with
`neutral-300` restored, 2 of the 4 fail.


### BUG 39 — `<Slider>` (tw) took a forwarded ref and never attached it

**Fixed**, closed by `98656a7`.

`<Slider ref={r} />` left `r.current` at `null` forever. The component is
wrapped in `forwardRef`, names the parameter, and then never uses it:

```tsx
export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  rawProps,
  ref,        // <- the only occurrence of `ref` in the file
) {
  ...
  return <div className={rootClasses} data-testid={testId}>   // no ref
```

No type error, no console warning, nothing at runtime to notice. A caller
measuring the track, scrolling it into view or driving focus from a parent
got a null and had to work around it.

The declared element type was wrong in the same breath: `HTMLSpanElement`
over a root that is a `div`. Anyone who trusted the generic and reached
for a span-only member got `undefined` rather than a type error.

#### How it stayed hidden

It was visible the whole time, as
`@typescript-eslint/no-unused-vars: 'ref' is defined but never used` — one
line inside `197 problems (0 errors, 197 warnings)` on `@dashforge/tw`.
181 of those 197 were **unused `eslint-disable` directives** for
`@typescript-eslint/no-explicit-any` in the `*.precedence.test.tsx` files,
suppressing a rule the root config already switches off for tests. Six
more were the repo's own `_`-prefixed "unused on purpose" convention,
which the rule was not configured to honour. A real dropped variable sat
in that noise.

#### Fix

`ref` attached to the root, and the generic corrected to `HTMLDivElement`
— a breaking type change, which is why it lands in the 2.0.0 major rather
than as a patch.

#### Guards

- `tw/src/components/forwardedRefAttached.test.ts`, 3 cases, catalog-wide:
  every file declaring `forwardRef<…>` and naming a `ref` parameter must
  reference it somewhere else, and where the root is an unambiguous DOM tag
  the declared element type has to match it. A source scan rather than a
  render test because the invariant is the point, not one component's
  markup, and rendering twenty-odd components means knowing each one's
  required props. Verified: with the defect restored the scan names
  `Slider/Slider.tsx` and nothing else, so the other 21 `forwardRef`
  components in the catalog were checked and are clean.
  `<Slot>`-based roots (`Button`, `IconButton`, `Link`) are skipped in the
  tag check: a capitalised element is a polymorphic wrapper whose rendered
  tag is not knowable statically.
- `tw/src/components/Slider/Slider.test.tsx`, 3 added cases: the ref is the
  root element, it is an `HTMLDivElement`, and a callback ref works too.
  Verified: all 3 fail without the fix.


### BUG 37 — `<Drawer>` sat on MUI's z ladder, so a `<Dialog>` opened from inside it rendered BEHIND

**Fixed** 2026-09-27, closed by `98656a7`. **Not reported by a consumer, and not findable by reading one
component.** It came out of a test written to hunt for it.

#### What it was

Every overlay in the catalog sits on Tailwind's `z-50` tier:

```
dialogOverlay 50   dialogContent 50   snackbar 50
tooltip 50         menu 50            popover 50
drawerOverlay 1400 drawerContent 1410      <- MUI's ladder
```

The Drawer alone carried `z-[1400]` / `z-[1410]`, which is MUI's
convention, a different scale entirely. Authored on its own it looks
correct, and every Drawer test passed.

The defect only exists when two overlays meet, which nothing tested:

- a **Dialog raised from inside a Drawer** rendered behind it (50 against
  1410), so the user saw the drawer with an invisible modal holding their
  focus;
- a **Snackbar** confirming an action taken in the drawer was invisible for
  the same reason.

#### Fix

Both Drawer slots move to `z-50`, matching Dialog, which puts its overlay
AND its content on the same tier and lets DOM order settle them. Between
components the one mounted later wins, which is what "opened on top"
means, and it is already how Dialog, Menu, Popover and Tooltip coexist.

#### Guard

`tw/src/components/_shared/layering.test.tsx`, 6 cases. It is the first
test in the catalog that renders a **pair** of overlays rather than one.
Against the pre-fix values **4 of the 6 fail**, including a rendered
Dialog-over-Drawer pair.

The invariant that would have caught it earlier is now also in
`tokenScaleCompliance.test.ts`: no component may leave the 0-50 ladder.

⚠️ One note on the assertion itself. The first version asserted the dialog
was *strictly* above the drawer, which kept failing after the fix, because
the catalog's model is one tier plus DOM order. The test was encoding a
contract the library does not have. It now asserts "not below" at the
recipe level and document order on the rendered pair.

---

### BUG 38 — `<CheckboxGroup>` silently dropped a stored value that had no option

**Fixed** 2026-09-27, same day it was introduced. Found by writing tests
against the component's hostile inputs rather than its happy path.

`nextValues` rebuilt the array from `options` on the CHECK path, to keep the
declared order stable. Anything the form held that was NOT in `options`
therefore had no seat in that rebuild and vanished. The UNCHECK path is a
plain `filter`, so it preserved the same value. Two paths, opposite
behaviour, and the user never touched the value that disappeared.

```
stored ['ghost'] + check 'read'   ->  ['read']        // 'ghost' gone
stored ['ghost','read'] + uncheck ->  ['ghost']       // preserved
```

Reachable whenever the options load async, or reload for a different scope,
while the form already holds a value from the previous set.

Fixed by partitioning: values present in `options` come out in declared
order, values that are not are preserved and placed first, in stored order.
They go in front rather than being interleaved because they have no seat in
the declared order and guessing one would be worse than admitting it.

Two tests now pin **both** paths, so it cannot come back on one side only.

---

### Token-scale compliance across the catalog — 2026-09-27

Not a single defect, a sweep. The audit that produced it started from the
token-first contract and asked what the components actually obey.

**Clean:** all five token groups flow theme → preset → CSS vars with no gaps
(88 colour, 11 spacing, 7 radius, 8 fontSize, 7 shadow). The preset's
`darkMode` selector matches the attribute the provider writes. Component
defaults cover 51 of 54, and the three gaps are all correct — `Accordion`
has no variants at all, `AspectRatio` and `VisuallyHidden` are structural.
Zero hard-coded colours, zero hard-coded shadows.

**Fixed:**

- **18 hard-coded font sizes across 11 components.** `text-[1rem]` was a
  free bypass: `text-base` already meant exactly that. `text-[10px]` and
  `text-[13px]` were genuinely off-scale, so the **scale** was the problem:
  it started at 12px and the catalog could not express its own Avatar
  initials or compact Alert inside it. Added a `2xs` tier at 0.625rem and
  snapped 13px to `xs`. Verified themeable on `learn/dash`: the new tier
  reads 10px by default and 32px when the CSS var is moved, where
  `text-[10px]` could never be reached by any theme.
- **`Accordion`'s `transition-all` was the only movement not gated** on
  `prefers-reduced-motion`. All four `transition-transform` in the catalog
  were already gated.

**Checked and NOT a defect**, recorded so it is not re-opened:

- `dark:bg-neutral-100` appears six times and is always paired with
  `bg-white`. White does not auto-invert, so the `dark:` is required. It is
  not the double-inversion anti-pattern.
- 33 ungated `transition-colors`. Colour is not motion under WCAG 2.3.3.
  The inconsistency with the 14 that are gated is stylistic, and churning
  47 slots to settle it buys nothing.
- `w-[220px]`, `w-[12rem]` and similar on pickers and DataGrid filters are
  component widths, not spacing-scale material.

**Guard:** `tw/src/components/tokenScaleCompliance.test.ts`, 6 catalog-wide
invariants — no hard-coded font size, colour or shadow, the z ladder, and
gated movement. It found **8 font sizes my own manual scan had miscounted**:
I read "6 occurrences" as "6 in Avatar" when they were spread across five
components. A per-file eye misses what a catalog-wide assertion does not.

---

### BUG 31 — `<Calendar>` (tw): a selectable sibling-month day failed WCAG contrast

**Fixed**, closed by `98656a7`.

**Filed as a request, "low, cosmetic". It is a defect.** The report's
observation was right and its framing understated it: the muted cell is an
**active, selectable control**, so its label is subject to WCAG 1.4.3, and
it was failing.

#### Everything the report claimed, verified

Source is exactly as described: `calendar.variants.ts` had
`siblingMonth → text-neutral-400` and `disabled → text-neutral-300
opacity-60`, with no compound reconciling them, and the only
`compoundVariants` entry is the unrelated `selected + today` ring. The
escape-hatch claim holds too: `Calendar.tsx` applies
`themeSlotProps?.day?.className, slotProps?.day?.className` as a flat
string to all 42 cells, with no per-state hook.

The compositing claim holds as well: the disabled cell at `opacity: 0.6`
composites to ~rgb(227), lighter than the sibling month's rgb(163).

#### One correction: that ordering is not an inversion

The entry calls it "the inversion that makes it worse than a plain
collision". Measured against the real surface, the hierarchy is the
conventional one:

| cell | effective | contrast |
|---|---|---|
| current month, selectable | rgb(23,23,23) | 17.18:1 |
| sibling month, selectable | rgb(163,163,163) | 2.42:1 |
| disabled | rgb(227,227,227) | 1.23:1 |

Disabled is the **most** recessive, sibling sits between it and the active
day. That is the ordering you would design. The collision between the two
greys is the weaker argument, and it is not what makes this a defect.

#### What makes it a defect

The cell is **14px at weight 400**, which is normal text, so WCAG 1.4.3
requires **4.5:1**. The sibling-month day is selectable, so it is active
text and the requirement applies:

| theme | surface | sibling contrast | |
|---|---|---|---|
| light | rgb(250,250,250) | **2.42:1** | fails |
| dark | rgb(10,10,10) | **2.53:1** | fails |

The disabled cells are **not** a violation: WCAG exempts the text of
inactive components, and at 1.23:1 they are doing their job. The only
non-conforming cell was the one the report treated as a cosmetic nicety.

#### The obvious one-step fix is the wrong one

`neutral-500` is the first tier that clears 4.5:1 in light. It does not
clear dark:

| tier | light | dark | |
|---|---|---|---|
| `neutral-400` | 2.42 | 2.53 | shipped; fails both |
| `neutral-500` | 4.54 | **4.18** | passes light, **fails dark** |
| `neutral-600` | 7.49 | 7.85 | passes both |

`neutral-500` is the **pivot of the scale**: it stays rgb(115,115,115) in
both themes because the preset inverts around it, so it cannot clear a
near-black surface. Any future adjustment has to be measured in **both**
themes; one number proves nothing here.

#### Fix

`siblingMonth: 'text-neutral-600'`. Still clearly muted against the current
month's 17:1, comfortably above the floor, and it widens the gap from the
disabled treatment from 1.2x to 6x, which closes the readability complaint
the report actually opened with as a side effect.

#### Verified in the browser, both themes

On `learn/dash`, `/test-calendar-tw`, measured with `getComputedStyle` and
composited against the real surface:

| | before | after |
|---|---|---|
| sibling, light | 2.42:1 | **7.49:1** |
| sibling, dark | 2.53:1 | **7.85:1** |
| current month | 17.18 / 18.16 | unchanged |
| disabled | 1.23 / 1.38 | unchanged |

Screenshots taken before and after in both themes. The dark-theme pair is
the stark one: at rgb(82,82,82) on rgb(10,10,10) the trailing days were
close to invisible.

#### Guard

`tw/src/components/Calendar/Calendar.contrast.test.ts`, 4 cases, pinning
the tier and **both rejected alternatives by name** so the reasoning
survives. Verified: with `neutral-400` restored, 1 of the 4 fails. The
other three are the properties that must not regress while fixing this —
sibling stays muted against the current month, disabled stays a distinct
token, and a cell that is both sibling and disabled still reads as
disabled (tailwind-merge resolves it that way, which the test pins).

#### Both API proposals were built after all

This section first recorded them as deliberately out of scope. That was
revised later in the same pass: both are the general fix that the contrast
tier only patches locally, and shipping them inside the same major avoids
opening a second breaking window for them.

1. `showSiblingDays?: boolean` — `calendar.types.ts:123`, default `true`,
   the convention React Day Picker, MUI's `DateCalendar` and the native
   pickers all follow. `false` keeps the 7-column geometry and renders the
   neighbouring cells as empty placeholders.
2. `slotProps.day` now also accepts a function of the day's state —
   `calendar.types.ts:63`, `{ className?: string } | ((state:
   CalendarDayState) => { className?: string } | undefined)`. The old flat
   object still type-checks, so the change is additive.

Guard: `tw/src/components/Calendar/Calendar.slots.test.tsx`, 6 cases,
covering the default, the placeholder geometry, the flat-object form, one
state addressed without touching its neighbours, every flag the recipe is
keyed on, and the selected cell in isolation.

What stays open is the wider asymmetry rather than this component: the same
per-state escape hatch is missing on every other compound in the catalog,
which is on record in BUG 24 and BUG 30 and belongs in Project #6.

---

### BUG 26 — bare `rounded` is hard-coded and ignores the radius tokens

**Fixed**, closed by `98656a7`. **The defect is
real and the diagnosis was right. Two things around it were not: the scope
and the proposed replacement.**

#### Verified against `dashforgePreset()`, not against Tailwind's docs

This is the third report of the form "this class reads no token", and the
previous two started from a wrong premise (BUG 30 closed NOT A DEFECT). So
the preset was read first:

```js
dashforgePreset().theme.extend.borderRadius
// { none, sm, md, lg, xl, 2xl, full }  -> all var(--df-tw-radius-*)
// DEFAULT present? false
```

Two facts settle it. The preset uses `theme.extend`, so it **extends**
rather than replaces, and Tailwind's own keys survive. And it defines **no
`DEFAULT`**. Bare `rounded` maps to `borderRadius.DEFAULT`, so it keeps
Tailwind's hard-coded 0.25rem and is immune to the scale by construction.

Measured on `learn/dash`, squaring every radius token on `<html>` the way
the provider writes them:

| utility | default | tokens at 0 |
|---|---|---|
| `rounded-sm` | 2px | **0px** |
| `rounded-md` | 6px | **0px** |
| `rounded` (bare) | 4px | **4px** |
| the checkbox | 4px | **4px** |

⚠️ First attempt at this proof failed and the failure is worth recording:
overriding the vars in a `:root` stylesheet changed nothing, because
`DashforgeTailwindProvider` writes them as **inline style on `<html>`**, and
inline beats a stylesheet rule. The test only means something when the
override is applied the way the provider applies it.

#### Scope — ten occurrences across eight components, not three

The entry named `Checkbox`, `Slider` and `Skeleton`, and dismissed the rest
of a grep as prop names. That was right for `Avatar`, `Box`, `Image` and
`Video`, where `rounded` is a prop or a union member, and wrong for five
more components where it is a real class:

| site | was | now | why that tier |
|---|---|---|---|
| `Checkbox` control | `rounded` | `rounded-sm` | matches `Select`'s `listItemIndicator`, the catalog's other small square indicator |
| `Skeleton` root | `rounded` | `rounded-sm` | text-line placeholder |
| `Slider` valueLabel | `rounded` | `rounded-md` | a tooltip-like bubble with `shadow-sm`; `Tooltip` is `rounded-md` |
| `DataGrid` ColumnFilters button | `rounded` | `rounded-md` | icon button; `IconButton` reuses `Button`'s variants, which are `rounded-md` |
| `DataGrid` ColumnVisibilityMenu row | `rounded` | `rounded-md` | matches `Menu`'s `item` |
| `Table` icon button | `rounded` | `rounded-md` | as above |
| `DateTimePicker` list item | `rounded` | `rounded-md` | matches `Menu` item and `Select` option |
| `TimePicker` list item | `rounded` | `rounded-md` | as above |
| `Accordion` trigger | `focus-visible:rounded` | `focus-visible:rounded-sm` | focus ring on a text row |
| `Link` | `focus-visible:rounded` | `focus-visible:rounded-sm` | focus ring on an inline anchor |

Each tier was picked from the nearest existing analogue in the catalog
rather than by eye, per the rule that canonical patterns are authoritative.
`rounded-md` is also the catalog's dominant tier (68 uses against 22 for
`sm`).

#### The proposed replacement was not visually neutral

The entry said to use `rounded-sm`, "the same 0.25rem default", and that
"behaviour is identical out of the box". It is not: under this preset
`rounded-sm` is `--df-tw-radius-sm` = **0.125rem = 2px**, half of the bare
`rounded`'s 4px. And `rounded-md` is 6px. **No tier reproduces 4px**, so
every one of these ten sites moves 2px in one direction or the other. That
is the right trade — the point is to follow the theme — but it is a visible
change and should not have been sold as a no-op.

#### The entry's ⚠️ about a lint rule was right; its list was not

It suggested `rounded`, `shadow`, `blur` and `ring` all skip the scale.
Checked one by one against the preset rather than assumed:

- **`shadow`** — the preset **does** define `boxShadow.DEFAULT` as
  `var(--df-tw-shadow-DEFAULT)`, so bare `shadow` **is** token-driven. Three
  uses exist (`Box`, `Slider`, `Switch`) and all three are correct. This is
  the exact asymmetry that makes the bug: `borderRadius` has no DEFAULT,
  `boxShadow` does.
- **`ring`** — zero bare uses.
- **`blur`** — ten hits, every one of them `type: 'blur'`, an event type.
- **`border`** — fifty uses, all correct: bare `border` sets
  `border-width: 1px`, it is not a token-scale lookup.

#### Guard — the lint rule, as a test

`tw/src/components/tokenDrivenRadius.test.ts` scans every non-test source
under `components/` and fails on a bare `rounded` in a class string, naming
the file and line. A per-component assertion would not have helped: the
defect is not any one component, it is that a bare `rounded` can land later
and reintroduce it silently.

Verified by reintroducing one: the scan fails and prints
`Checkbox/checkbox.variants.ts:39  rounded`. It also asserts it scanned more
than 50 files, so a broken path cannot make it vacuously green.

Type-level uses are excluded explicitly and narrowly: `BoxProps['rounded']`,
`case 'rounded':`, `Pick<…, 'rounded'>` and prop declarations.

#### Verified in the browser

On `learn/dash`, the checkbox after the fix:

```
class ......................... rounded-sm
at default tokens ............. 2px      (was 4px)
every radius token at 0px ..... 0px      (was stuck at 4px)
every radius token at 10px .... 10px     (tracks both directions)
```

And a sweep of the whole page with every radius token at zero left **three**
elements still rounded, all `<code class="font-mono">` at 4px from
`learn/dash`'s own `src/index.css:113`. Nothing from the library keeps a
hard-coded corner.

#### Downstream workaround — remove after the bump, not before

`ugo-web/app/components/forms/field-styles.ts` gives `checkboxSlots.control`
an explicit `rounded-none`. It is now redundant, but it is pinned to the
version `ugo-web` installs, so it goes with the bump.

---

### BUG 27 — `<AppShell>` (tw): `min-h-screen` on the root made `main`'s scroller dead code

**Fixed**, closed by `98656a7`. **The report
was correct, and both of its ⚠️ notes were load-bearing.**

#### Verified before touching anything

Measured in Chrome on `learn/dash`, whose whole app is wrapped in
`AppShell`, viewport 768px:

```
root height ................. 2207px      (grew to the content)
main.scrollHeight/client .... 2249 / 2249 -> never overflows
main.scrollTop = 600 ........ stayed 0
window.scrollTo(0, 600) ..... scrollY 600, header top -511
```

So `main: overflow-y-auto` was dead on every page long enough to need it,
exactly as reported. The contradiction was also already written into the
file: the slot docstring called `root` "outer flex column (full viewport)"
and `main` "scrollable content area", which is the layout `min-h-screen`
prevents.

#### Fix — the axis, not the single value

Both shells are legitimate, so `layout` became an axis rather than a value
baked into the slots:

```ts
layout: {
  viewport: { root: 'h-dvh overflow-hidden', nav: 'overflow-y-auto', main: 'overflow-y-auto' },
  page:     { root: 'min-h-screen' },
}
// defaultVariants: layout: 'viewport'
```

`viewport` is the default because it is the layout the component's own
header diagram draws and the one `main: overflow-y-auto` was written for.
`page` keeps the window-scrolls shell for a marketing-style layout, and
deliberately gives `main` **no** overflow: it could never be the scroller in
that mode, and advertising one is how the two ended up contradicting.

Both of the entry's ⚠️ were followed: `h-dvh` and never `h-screen`, and the
nav gets its own `overflow-y-auto` so a fixed rail is not a clipped one.

`AppShellProps extends AppShellVariants`, so the axis reached the public
props with no type change of its own. AppShell's theme defaults expose only
`slotProps`, not variant `defaults`, so `layout` cannot be set theme-wide —
acceptable, since an app shell is a singleton in practice. Noted rather than
changed.

#### The fix was not enough on its own, and that is how BUG 36 was found

After the change the root was correctly 768px and `main` correctly scrolled,
yet **the window still scrolled 800px**. The cause was not AppShell: one
`<input type="checkbox">` far down the page, absolutely positioned by Radix
with no positioned ancestor, was anchoring to the `body` and extending the
document past the clipper. That is BUG 36, fixed alongside because BUG 27's
fix does not deliver its promise on any page containing a checkbox.

#### Verified after, in the browser

```
root ........................ flex flex-col bg-neutral-100 h-dvh overflow-hidden
root height ................. 768   (= viewport, was 2207)
html.scrollHeight ........... 768   (was 1891)
main.scrollTop = 600 ........ 600,  window.scrollY 0
window.scrollTo(0, 800) ..... scrollY 0, root top 0   -> the window cannot scroll
nav <aside> ................. overflow-y auto, stays at top 0 while main scrolls 900
inputs anchored to body ..... 0
```

#### Guard

`tw/src/components/AppShell/AppShell.layout.test.tsx`, 6 cases, **all 6 fail
against the pre-fix recipe**. The first is the invariant the defect broke,
asserted across every mode: a root that grows with the content cannot also
have a child that scrolls internally. AppShell suite: 22 tests, green.

#### Downstream workaround — remove after the bump, not before

`ugo-web/app/theme/dashforge.ts` sets `AppShell.slotProps` to
`root: 'h-dvh overflow-hidden'` and `nav: 'overflow-y-auto'`. That is now
exactly what the default emits, so the override is redundant — but it is
pinned to whatever version `ugo-web` installs, so it goes when the bump
lands.

---

### BUG 36 — Radix's hidden input escapes to the `body`, so a checkbox lengthens the page

**Fixed**, closed by `98656a7`.

Found while verifying BUG 27's fix, **not reported by a consumer**. It was
invisible before: the page scrolled anyway, so nothing pointed at it.

#### Cause

Radix renders a hidden native input for form participation, with inline
styles of its own:

```
position: absolute; pointer-events: none; opacity: 0;
margin: 0px; transform: translateX(-100%); width: 20px; height: 20px;
```

`Checkbox`, `Switch` and `RadioGroup` all had roots with no positioning —
`checkbox.variants.ts` `root: 'inline-flex items-start gap-2'` and the
equivalents. With no positioned ancestor the input anchors to the **body**,
so `overflow: hidden` on any ancestor does not clip it, and it extends the
document's scrollable area down to wherever the field sits.

`overflow: hidden` clipping an absolutely positioned descendant only works
when the clipper is also its containing block. That is the whole bug.

#### Reproduction — measured, and isolated to one element

On `learn/dash` with a checkbox ~1870px down the page, inside an AppShell
that had just been given `h-dvh overflow-hidden`:

```
document.documentElement.scrollHeight ..... 1891   (viewport 768)
window.scrollTo(0, 800) ................... scrollY 800, shell top -800
absolutely positioned inputs .............. 1
  \_ offsetParent ......................... body
  \_ document bottom ...................... 1892   (= the 1891 exactly)
```

Nothing else on the page overflowed: a sweep for elements extending past the
viewport outside a scroller returned **zero**, and hiding `#root` dropped
`scrollHeight` to 768.

Proved by patching it live before touching the source — setting
`position: relative` on that one wrapper in the console:

| | before | after |
|---|---|---|
| `html.scrollHeight` | 1891 | **768** |
| `window.scrollTo(0, 800)` | 800 | **0** |
| input `offsetParent` | `body` | the wrapper |

#### Fix

`relative` on the root of `Checkbox`, `Switch` and `RadioGroup`. None of the
three had any positioning before, and none has an absolutely positioned
descendant of its own, so this is purely additive: it makes the field the
containing block for its own hidden input and changes nothing else. With
`z-index: auto` it does not create a stacking context either.

#### Guard

`tw/src/components/Checkbox/hiddenInputContainment.test.tsx`, 5 cases across
the three components, including one asserting the root is not positioned any
*other* way — `relative` is there to be a containing block, and anything
stronger would change how the field sits in its own layout.

⚠️ Worth a sweep beyond these three: any component wrapping a Radix
primitive that renders a hidden input has the same exposure. These three are
the ones with a bubble input today.

---

### BUG 35 — `<Chip>` (tw): a clickable, deletable chip nested a `<button>` in a `<button>`

**Fixed**, closed by `3aed78d`.

#### Swapping the tag would NOT have been the fix

This is the part worth keeping. The obvious move, copying BUG 23's
resolution and making the clickable root a `<div role="button">`, silences
the HTML error and leaves the real problem standing.

`role="button"` carries ARIA's **presentational children** rule: the
semantics of everything inside a `button` role are stripped for assistive
tech. So a nested control is either invalid markup (`<button>` inside
`<button>`) or invisible to AT (`<button>` inside `role="button"`) —
different spelling, same defect. A fix that only moved the tag would have
turned a loud error into a silent one.

Precedent, read from `@mui/material@9.0.1/Chip/Chip.js` rather than
assumed:

```js
const component = clickable || onDelete ? ButtonBase : 'div';
const moreProps = component === ButtonBase
  ? { component: ComponentProp || 'div', internalNativeButton: false, ... }
  : {};
```

MUI never renders a native button for a chip that is clickable or
deletable, and its delete icon is not a focusable control. The keyboard
path is `isDeleteKeyboardEvent` on the root, which is `Backspace` or
`Delete`, guarded by `event.currentTarget === event.target` so child events
are ignored.

The component had already worked this out. `Chip.tsx`'s clickable branch
carried a no-op `onKeyDown` whose comment read "here for future extension
(e.g. Delete key to fire onDelete when focused)". This fix is that
extension.

#### Fix

Clickable root becomes `<div role="button" tabIndex={isDisabled ? -1 : 0}>`,
re-supplying by hand everything the native element gave away: focusability,
Enter / Space activation with `preventDefault` on Space so the page does not
scroll, `aria-disabled` in place of the native attribute, and the
`currentTarget === target` guard so a focusable slot keeps its own keys.

The delete affordance now has **two shapes**, and the branch decides which
is legal:

| root | delete control | keyboard path |
|---|---|---|
| clickable, `role="button"` | non-focusable `<span aria-hidden>` | Backspace / Delete on the chip |
| static `<span>` | real `<button aria-label>` | Tab to it, Enter |

The static path is **deliberately untouched**. A `<span>` is not a widget,
so a focusable button inside it is valid and is the only keyboard route to
delete. It was never broken, and "fixing" it alongside would have removed a
working affordance.

Both shapes carry `data-chip-delete`, because on the clickable chip the
control is `aria-hidden` with no accessible name and cannot be reached by
role or name queries.

#### Honest limitation, inherited from the pattern

On a clickable chip the delete affordance is not announced at all. A screen
reader hears a button; nothing says Backspace removes it. MUI has the same
gap. The alternative is worse: promising an affordance that presentational
children makes unreachable. Worth revisiting if the catalog ever grows a
convention for this.

#### Verified in the browser, on `learn/dash`

A probe section was added to `src/pages/ChipPlayground.tsx`
(`data-probe="chip-both"`), because **no page in the repo rendered the
broken combination** — the playground had `onDelete` chips and `clickable`
chips, never both on one chip, which is why it shipped.

Markup, measured on the rendered page:

```
root          DIV   role=button   tabindex=0   no <button> inside
delete        SPAN  aria-hidden=true   not focusable   painted
document.querySelectorAll('button button').length          -> 0
document.querySelectorAll('[role="button"] button').length -> 0
```

All three interaction paths driven for real, with the event log on the page
as the witness:

1. mouse click on the chip -> `click: design`, and the chip takes focus;
2. `Backspace` on the focused chip -> `delete: design`, chip removed, 3 -> 2;
3. real DOM click on the × -> `delete: infra` with **no** `click: infra`,
   so `stopPropagation` holds, 2 -> 1.

Console clean, no hydration error.

#### Guard

`tw/src/components/Chip/Chip.nesting.test.tsx`, 6 cases. Against the
pre-fix component **5 fail**. Chip suite: 44 tests across 3 files, green.
Full CI: 12 projects, four targets, green, and **zero** `cannot be a
descendant of` left in the whole suite output — BUG 23 removed the Select
one, this removed the last.

Four existing assertions were updated, and two of them were misnamed rather
than wrong: `renders as <button> when clickable=true` asserted
`getByRole('button')`, which a `div role="button"` satisfies, so the test
kept passing while its name described markup that no longer existed. Both
were renamed to say role. The other two asserted the native `.disabled`
property and now assert `aria-disabled` plus removal from the tab order.

#### No breaking type change

Unlike BUG 23, the public ref type is untouched: `Chip` was already
`forwardRef<HTMLElement, ChipProps>` with a per-branch cast, so the element
change is invisible to consumers at the type level.

---

### BUG 25 — `<Divider orientation="vertical">` (tw) came out `w-full`

**Fixed**, closed by `98656a7`. **The report's
diagnosis was exactly right. Its proposed fix was not, and would have
shipped a worse defect.**

#### The defect

`segment: 'full'` emitted an unconditional `w-full` while the orientation
axis emitted `w-0` for vertical. `tailwind-merge` keeps the later of two
conflicting width utilities, so `w-full` won.

`full` means "span the divider's OWN main axis": the width for a horizontal
rule, the **height** for a vertical one. The axis could not know which, and
the error was written into its own docstring, which said "whether the line
spans full width".

Two things stronger than the entry stated: `Divider.tsx:84` passes
`segment: 'full'` **explicitly** for line-only mode rather than inheriting
the default, so the defect was unconditional on every vertical line-only
divider; and labeled mode (`segment: 'grow'` → `flex-1`) was never affected,
because `flex-1` grows along whichever main axis the parent sets.

#### The proposed fix was broken, and that is the part worth keeping

The entry proposed `{ orientation: 'vertical', segment: 'full' } → 'h-full'`.
Measured in Chrome against `learn/dash`, with inline CSS so Tailwind's JIT
was not involved, in a `flex-row` with a button either side:

| rule | width | height | |
|---|---|---|---|
| `border-l self-stretch w-full` (the defect) | 576.95px | 32px | eats the row |
| `w-0 border-l self-stretch` | 1px | 32px | **correct** |
| `w-0 border-l self-stretch h-full` (proposed) | 1px | **0px** | **invisible** |

`align-self: stretch` applies only while the cross size is `auto`, so a
definite `h-full` **suppresses** the stretch, and the percentage then
resolves to zero against an auto-height flex parent. The proposal would have
traded a full-width bar for a divider nobody can see, which is a quieter
failure than the one it closed.

This is not a style preference. `divider.types.ts:74-84` already promises in
the public JSDoc that the vertical span comes from `self-stretch`, "already
applied on the vertical line segment by default in the TV". The vertical
compound therefore has to emit **nothing**.

#### `w-0` stays, against the entry's ⚠️

The entry suggested dropping it. It does double duty:

- in a `flex-row` parent it is the **main**-axis size, so the visible width
  is exactly the 1px `border-l`;
- in a `flex-col` parent (labeled vertical mode) it is the **cross** size,
  and being definite it stops `self-stretch` from stretching the rule to the
  full width.

Removing it would re-open the same class of bug from the other side.

#### Fix

`segment.full` emptied on the plain axis, moved to `compoundVariants`:

```ts
{ orientation: 'horizontal', segment: 'full', class: 'w-full' },
// vertical: deliberately nothing — `self-stretch` already spans it
```

`w-full` is load-bearing on the horizontal path: a block child does not fill
the width once it is a flex item, which is the toolbar case this came from.

#### The symptom was imprecise, measured both ways

"The bar becomes five rows tall" needs `flex-wrap: wrap` on the consumer's
toolbar. With the defect in place:

- `flex-wrap: nowrap` (the default) → **1 line**, 32px: the divider takes
  the space and squeezes the buttons, without wrapping;
- `flex-wrap: wrap` → **3 distinct lines**, 112px.

Same defect, and the `nowrap` form is quieter than the entry describes.

#### Verified on the real component, not only in unit tests

A probe section was added to `learn/dash` (`src/pages/TestFoundation.tsx`,
`data-probe="nowrap|wrap|stretch"`), the fixed `@dashforge/tw` was linked in
with `scripts/link-tw-to-dash.sh`, and the rendered elements were measured:

| probe | before | after |
|---|---|---|
| nowrap | separator 155.73px wide | **1px** |
| wrap | separator 587px, **3 button lines**, row 186px | **1px**, **1 line**, row 50px |
| stretch (no explicit height) | separator 409.04px | **1px**, height **32px** |

The third row is the one that validates leaving `h-full` out: with no
height given, the rule is still 32px tall, so `self-stretch` is doing the
span on its own. Computed style on the shipped element:

```
border-left: 1px solid rgb(229, 229, 229)   (neutral-200)
border-top/right/bottom-width: 0px
width: 1px      height: 20px      align-self: stretch
```

#### Guard

`tw/src/components/Divider/Divider.orientation.test.tsx`, 5 cases. Run
against the pre-fix file, **3 fail and 2 pass**: the two that pass are the
horizontal path and labeled mode, which were never broken and are there to
stay that way. Divider suite: 48 tests across 3 files, green. Full CI: 12
projects, four targets, green.

jsdom does no layout, so the class contract is what the unit tests pin; the
geometry above is the browser half of the same assertion.

#### Why it shipped

`dashforge-docs-lab` documents Divider with `DividerHorizontalDemo` and
`DividerWithLabelDemo`. **There is no vertical demo anywhere**, and no test
asserted `w-full` on the vertical path, so nothing could have caught it.

⚠️ Worth fixing at the source: `dashforge-docs-lab` currently **cannot be
started** on this machine. It pins `engines.pnpm: 10.7.1` against a global
pnpm of 10.28.2, so `pnpm dev` dies with `ERR_PNPM_UNSUPPORTED_ENGINE`. A
vertical demo belongs there, not only in `learn/dash`.

#### Downstream workaround — NOT yet removed

`ugo-web/app/components/editor/post-editor.tsx` still carries
`sx="w-px h-5 mx-1"`, where the `w-px` exists only to out-specify the
`w-full` this entry removed. It is now redundant, but it is **not harmful**:
`w-px` and the absent `w-full` no longer conflict, so the divider renders at
1px either way.

It cannot be removed yet, and that is the point: this fix lives in the
source tree only. Until a `@dashforge/tw` version ships with it, deleting
`w-px` downstream would restore the full-width bar on whatever version
`ugo-web` actually installs. **Remove it after the bump, not before**, and
pair the removal with the version that carries the fix.

---

### BUG 23 — `<Select multiple>` (tw): a `<button>` nested inside the trigger `<button>`

**Fixed**, closed by `98656a7`. **The report
was correct on every point**, including the parser-rewrite consequence and
the warning to keep `aria-required` on the combobox element.

Resolution: option 1 of the two proposed, the `<div role="combobox"
tabIndex={0}>`. It is the ARIA APG select-only combobox pattern and it
preserves the visual design, which option 2 would have changed.

#### What the native `<button>` was providing, and why none of it was lost

This is the part worth recording, because a switch away from a native
element usually drops something quietly. Each was checked in the source
before the change, not after:

| provided by `<button>` | already covered by |
|---|---|
| Enter / Space activation | `handleTriggerKeyDown` handles both explicitly with `preventDefault`, opening if closed and selecting if open — arrows, Home, End and type-ahead were already there too |
| blocking clicks when disabled | `handleOpenChange` returns early while `effectiveDisabled`, and `open` is fully controlled, so Radix's toggle cannot open it |
| `:disabled` styling | the recipe never used the pseudo-class: disabled is a prop-driven tv variant (`select.variants.ts:124`) |
| focus ring | already `focus-visible:` in the recipe, which works on any element with a tabindex |
| keyboard reachability | replaced by an explicit `tabIndex={effectiveDisabled ? -1 : 0}` |
| `<label for>` association | **this one was NOT covered** — see below |

#### The one real regression, and how it was caught

`<label for>` only binds to a *labelable* element, and a div is not one.
So the fix adds `id` on the label plus `aria-labelledby` on the trigger,
and an `onClick` on the label to restore click-to-focus, which `htmlFor`
had been doing for free.

Worth keeping: the first version of the regression test asserted this with
`getByLabelText('Variant')`, and it **passed before the fix was
complete** — testing-library resolves `for` against any element id,
labelable or not, so it reports a name where a real screen reader gets
nothing. The test now asserts the `aria-labelledby` attribute and
resolves the target element. A query helper agreeing with you is not
evidence that a browser will.

#### Radix injects `type="button"`, and `asChild` lets the child win

`@radix-ui/react-popover` builds its trigger as `Primitive.button` with
`type: "button"` hardcoded (`dist/index.mjs:89`), then spreads the caller's
props over it. Under `asChild` that lands on whatever element you supply,
so the div has to override `type` explicitly or the fix trades a nested
button for an invalid attribute.

Verified both ways: removing the override makes the guard fail, so it is
load-bearing, not defensive. It is written as a spread —
`{...({ type: undefined } as React.HTMLAttributes<HTMLDivElement>)}` —
because `type` is not in `HTMLAttributes<HTMLDivElement>` and TS rejects
the direct JSX spelling (`TS2322`).

#### Two observable changes beyond the element itself

1. **`name={name}` on the trigger is now `data-name={name}`.** `name` is
   not a valid attribute on a div, and the whole point of the fix is valid
   markup. It was already decorative: on a `<button type="button">` it
   never submitted anything. Nothing in the monorepo queries the trigger by
   it, which was checked before changing it.
2. **The public ref type changed** from `React.Ref<HTMLButtonElement>` to
   `React.Ref<HTMLDivElement>` (`Select.tsx` inner signature and the
   exported wrapper). This is a **breaking type change** for any consumer
   holding a `useRef<HTMLButtonElement>`. It has to change, because the old
   type was describing an element the component no longer renders. Belongs
   in the CHANGELOG for the bump, not buried here.

#### Guard

`tw/src/components/Select/Select.nesting.test.tsx`, 8 cases. Four failed
against the unfixed component and four passed — those four are the ones
pinning what the div must not lose (`aria-required`/`aria-invalid`, the
label, chip removal not opening the listbox, no remove buttons while
disabled).

Five existing assertions were retargeted from
`container.querySelector('button[role="combobox"]')` to
`[role="combobox"]`: they were pinning the element's tag, not its
behaviour. One assertion changed meaning rather than selector — `disabled
trigger blocks click open` asserted `(trigger as HTMLButtonElement)
.disabled === true`, which no longer exists, and now asserts
`aria-disabled`. The behavioural half of that test, that the listbox does
not open, was already there and still passes.

Full Select suite: 49 tests across 4 files, green. Whole `tw` suite: 133
files, 2061 tests, green.

#### Checked and NOT affected

Per the rule that cost BUG 17 ten days — grep the pattern, not the
imports — the same `aria-label={`Remove …`}` shape exists in
`tw/src/components/Autocomplete/Autocomplete.tsx:990`. It is **not** the
same bug: Autocomplete puts `role="combobox"` on an `<input>` and its
chips inside `<div>`s, so the remove buttons were always in legal
position.

`<Chip>` **is** the same bug, and is now BUG 35 in the open list above.
`<Select>` has no internal JSX consumers, so nothing inside the library
held a ref to the old element.

---

### BUG 28 — `<Dialog>` and `<Drawer>` (tw) ringed the close button on `:focus`

**Fixed**, closed by `98656a7`. **The report
was correct, including the reading that this was an oversight rather than a
policy.**

Confirmed before changing anything: `focus:ring` appears **exactly twice**
in all of `tw/src`, on the two lines the report named, against **29 files**
using `focus-visible:ring`. Stronger still, the correct form already sits
three lines below one of them, on the Drawer's own `resizeHandle` slot:
`'focus:outline-none focus-visible:bg-primary-500/50'`.

#### Fix, deviating from the proposal on one detail

```
'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
```

on `dialog.variants.ts` → `closeButton` and `drawer.variants.ts` →
`closeButton` (the latter keeping its `focus-visible:ring-offset-1`).

The entry proposed `focus-visible:outline-none`. Kept as plain
`focus:outline-none` instead, because that is the catalog's dominant
spelling — 9 slots use exactly this string — and matching it means the two
lines rejoin an existing pattern rather than introducing a third. Per the
standing rule that existing canonical patterns are authoritative.

`focus:outline-none` untouched on the `content` slots of both components:
that suppresses the UA outline on the panel Radix focuses on open, which is
a different thing and not what was reported.

---

### BUG 33 — `useEngineVisibility` subscribes conditionally, so a `visibleWhen` that appears or disappears kills the field

**Fixed**, closed by `57566d9`.

**Not reported by a consumer.** It surfaced while fixing a red CI: the
pipeline had been failing on `@dashforge/ui-core:lint`, which errored with
`Definition for rule 'react-hooks/exhaustive-deps' was not found` because
`ui-core` had no eslint config of its own and so never registered
`eslint-plugin-react-hooks`. Registering the plugin cleared that error and
immediately reported two real rules-of-hooks violations that had been
sitting in the package unseen. This is one; BUG 34 is the other.

#### Symptom

A field whose `visibleWhen` prop goes from absent to present, or the
reverse, while the field stays mounted takes the whole tree down. The
consumer does **not** get React's readable diagnostic. They get:

```
TypeError: Cannot read properties of undefined (reading 'length')
  at areHookInputsEqual   react-dom-client.development.js:7611:36
  at updateCallback       react-dom-client.development.js:8769:28
  at Object.useCallback   react-dom-client.development.js:26451:16
  at useSnapshot          valtio/esm/react.mjs:23:5
  at useEngineVisibility  ui-core/src/react/useEngineVisibility.ts:70:5
  at TextField            ui/src/components/TextField/TextField.tsx:79:21
```

Every frame but the last two points into `react-dom` and `valtio`. Nothing
in that stack tells the consumer that the prop they just made conditional
is the cause, which is what makes this worse to receive than BUG 16, whose
"Rendered more hooks than during the previous render" at least named the
category.

#### Cause

`useEngineVisibility` called its subscription from inside a branch, below
an early return:

```ts
if (!visibleWhen) {
  return true;                                   // 0 hook calls
}

if (engine) {
  useSnapshot(engine.getState().nodes);          // 1 hook call
  ...
}
```

Both `engine` and `visibleWhen` are ordinary inputs. `engine` is stable per
mount in practice, so it was never the trigger, but `visibleWhen` is a
plain prop, and

```tsx
<TextField name="email" visibleWhen={advanced ? pred : undefined} />
```

is the obvious way to write an optional predicate. That flips the hook
count between renders, and React dereferences a hook slot that does not
exist.

#### Reproduction — verified, not read

`libs/dashforge/ui/src/components/TextField/TextField.visibleWhen.test.tsx`,
two cases, both of which failed against the unfixed hook with the stack
above and pass against the fix:

1. `visibleWhen` flipping `undefined -> () => true -> undefined` from React
   state while the field stays mounted.
2. `visibleWhen` appearing as a predicate that evaluates to `false`, so the
   hook-count change and the unmount land in the same render.

The guard lives on the `ui` side because **`ui-core` has no test target at
all** — its `project.json` declares only `lint` and `typecheck`, and there
is no vitest config in the package. `ui`'s suite already instruments
ui-core sources transitively, so that is where a ui-core hook can be
guarded today. Worth its own entry: a package exporting thirteen hooks with
no test target is how both of these survived.

#### Blast radius

`useEngineVisibility` is imported by **45 source files across both
renderers** — every field component in `ui/` and `tw/`, plus `useGating`.
One hook backs both editions, so one fix covers them; this is the opposite
of the BUG 17 / BUG 32 situation, where the logic was duplicated by hand.

#### Fix

One unconditional call whose *subject* varies, so the set of live
subscriptions stays exactly what the branch produced:

```ts
const NOTHING_TO_WATCH = proxy<Record<string, never>>({});

useSnapshot(
  visibleWhen && engine ? engine.getState().nodes : NOTHING_TO_WATCH
);
```

`NOTHING_TO_WATCH` is created once at module scope and never mutated, so
subscribing to it cannot schedule a re-render. Deliberately *not*
`useSnapshot(engine.getState().nodes)` unconditionally: that would add a
live subscription to the engine for every field that has an engine but no
predicate, which is most of them, and change re-render behaviour across the
library while fixing a hook-order bug. Behaviour is preserved exactly.

The `useSnapshot(...)` return value is discarded here, as it was before.
Whether valtio's access tracking makes that subscription re-render anything
is a separate question and was left alone on purpose.

---

### BUG 34 — `useEngineValues` calls one hook per array entry, so its hook count follows `nodeIds.length`

**Fixed**, closed by `57566d9`.

Found the same way as BUG 33, by registering `eslint-plugin-react-hooks` on
`ui-core`:

```
useEngineValue.ts:82:30  error  React Hook "useEngineValue" cannot be
                                called inside a callback
```

#### Cause — read out of the source, not reproduced

```ts
export function useEngineValues<TValue = unknown>(
  nodeIds: string[]
): (TValue | undefined)[] {
  return nodeIds.map((id) => useEngineValue<TValue>(id));   // line 82
}
```

Literally BUG 16's defect one layer down: React's hook count is tied to an
array length, so adding or removing an id while the component stays mounted
corrupts the hook order.

**Not reproduced, and say so plainly.** There is no test and no caller to
write one against: `useEngineValues` is exported from `src/index.ts` and
documented in the README, and has **zero consumers** anywhere in the
monorepo. The coverage report agrees, marking it `function not covered`. It
is public API that nothing exercises, which is exactly why a defect this
plain lasted. The defect is certain from the source; the claim being held
back is only that no user has hit it.

#### Fix

`useEngineNode` already subscribes to the whole `nodes` map and indexes into
it, so reading N ids off a single snapshot subscribes to precisely what N
`useEngineValue` calls did, at a constant hook count:

```ts
const engine = useEngineContext();
const nodes = useSnapshot(engine.getState().nodes);

return nodeIds.map((id) => (nodes[id] as Node<TValue> | undefined)?.value);
```

One deliberate behaviour change, documented at the call site: this now
throws outside an `EngineProvider` even for an empty `nodeIds`, where the
per-entry version happened to call no hook at all and quietly returned
`[]`. Any caller that relied on that was already broken the moment the
array became non-empty, since `useEngineContext` throws.

#### The gap behind BUG 33 and BUG 34, which is the part worth keeping

`eslint-plugin-react-hooks` is registered in exactly three packages — `tw`,
`ui` and now `ui-core`. These author hooks and do **not** have it:

| package | hooks exported | plugin |
|---|---|---|
| `forms` | 7 | no |
| `rbac` | 3 | no |
| `tw-theme` | 3 | no |
| `calendar-core` | 2 | no |
| `theme-core` | 1 | no |

`forms` is the one that matters: it holds `DashFormProvider` and the
bridge, and BUG 22 already showed how much consumer behaviour hangs off
it. On its first run against `ui-core` the plugin found two real bugs, one
of them in a hook on the render path of every field in the library. That is
a strong prior for what a sweep over the remaining five would turn up.

Deliberately **not** done here, for the reason already written into
`libs/dashforge/tw/eslint.config.mjs` when the plugin was first scoped to
one package: turning it on surfaces pre-existing violations that belong to
their own pass, not to whatever sprint is open. Enabling it on `ui-core`
cost two fixes; enabling it on `forms` should be planned, not stumbled
into.

---

### BUG 32 — BUG 17's fix never reached `@dashforge/tw`

**Fixed** 2026-09-25, closed by `81d0389`. **The report was correct on every
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

**Runtime landed 2026-09-27.** `<Autocomplete multiple>` and
`<Select multiple>` now store and read `TValue[]` through the bridge. The
report's third piece, a `CheckboxGroup` for the small-set case, is still
open and is a new component rather than a fix.

#### What was actually broken, measured

The type widening let `<Select multiple>` COMPILE, and it then died on
render:

```
Error: MUI: The `value` prop must be an array when using the `Select`
       component with `multiple`.
```

Cause: `<Select>` composes from `<TextField select>`, so its value goes
through `createSelectIntegration`, which sanitized anything absent from
`availableValues` down to `''`. An array is never a member of that list, so
a multi select in bridge mode resolved to a string and MUI threw. That is
worse than the pre-widening state, where it merely failed to compile.

`<Autocomplete multiple>` did not throw but did nothing: the array was
narrowed to `null` on the way in, so no chips rendered, and the array MUI
handed back on change fell through a scalar mapper that produced `null`.

#### Fix — a parallel pipeline, not a widened one

`Autocomplete` keeps its scalar path untouched and runs multi alongside it.
The scalar path owns freeSolo, display sanitization and controlled
`inputValue`, none of which applies while MUI renders chips and owns the
filter text, and all of which is where BUG 2, BUG 7 and BUG 8 came from.
Two adapters do the whole translation:

```
toOptionArray   bridge TValue[]      ->  the option objects MUI renders
fromOptionArray MUI's change payload ->  the TValue[] the bridge stores
```

`Select` needed a smaller change: `createSelectIntegration` gained
`isMultiSelectMode`, read from `slotProps.select.multiple`, and the
sanitizer now coerces to an array and filters element-wise in multi mode.

⚠️ One deliberate divergence between the two, documented at the call site:
an entry that matches no option is **kept** by Autocomplete and **dropped**
by Select. Autocomplete builds its own chip and can render an unknown value
cleanly, so hiding it would leave a value in the payload with no way to
remove it. MUI's Select logs an out-of-range warning for every unknown
value, so it filters instead, matching what the scalar path already did.

⚠️ Trap hit while implementing: destructuring `multiple` out of the props
removed it from `...rest`, so it stopped reaching MUI through the
passthrough and the component silently stayed in single mode. It is now
passed explicitly on both branches. Five tests failed on exactly this and
nothing else pointed at it.

#### Guards

`Autocomplete.multiRuntime.test.tsx` (8) and `Select.multiRuntime.test.tsx`
(7). Both suites pin the storage contract in both directions, the
accumulate-don't-replace behaviour, the unresolved-value policy, and — in
every file — that the scalar path still stores a scalar and renders no
chips. Whole `ui` suite: 51 files, 615 tests, green.

#### `CheckboxGroup` — the third piece, landed 2026-09-27

`<Autocomplete multiple>` and `<Select multiple>` cover the long lists;
this is the small-set case, where showing every option beats hiding them
behind a popover. Built on `<RadioGroup>`'s shape on purpose: same bridge
wiring, same RBAC model, same visibility and unregister semantics, so the
family has one shape to learn.

Two behaviours worth knowing, both pinned by tests:

- The field stores `[]` when nothing is checked, never `null` or `''`, so a
  consumer reading the payload can always `.map` over it.
- The payload keeps the **declared option order**, not the click order. An
  order that drifts with the clicking is a nuisance to snapshot and to diff.
- An option gated to `hide` stays VISIBLE while it is checked, and is
  disabled instead. Hiding it would strand a value in the payload the user
  can neither see nor clear. Same rule the option-level RBAC in
  `<RadioGroup>` uses for the selected value.

One wart deliberately not copied: `<RadioGroup>` honours `tooltip` in plain
mode and drops it in bound mode. `<CheckboxGroup>` renders it in both.

13 tests, covering the array contract, validation including BUG 17's
precedence, plain mode, option- and group-level RBAC, and a BUG 16 / BUG 33
guard for `visibleWhen` flipping while mounted. Whole `ui` suite: 52 files,
628 tests, green.

**BUG 19 is now closed in full.**

---

<details>
<summary>The original partial fix, 2026-09-15 (type-level only)</summary>

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

</details>

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

### BUG 7 — `<Autocomplete>` (tw): the listbox was dismissed by the focus that opened it

**Fixed** 2026-09-03, closed by `38e575a`.

A regression from BUG 1's portal fix, and the pair below is the reason
that fix needed two follow-ups rather than one. Moving the listbox into a
portal changed what counts as "outside" for the dismiss handler, and the
input's own focus event started reading as an outside interaction, so the
list opened and closed in the same tick. High severity: the field looked
broken to anybody who typed.

Regression cover lives in `c41504f`.

---

### BUG 8 — `<Autocomplete>` (tw): an option could not be picked with the MOUSE

**Fixed** 2026-09-03, closed by `6a665cd`.

The second regression from the same portal change, and the more
embarrassing of the two because keyboard selection kept working, so the
component passed every test that drove it with keys. A pointerdown on a
portaled option blurred the input before the click landed, and the
dismiss ran first.

The lesson is in the pairing: BUG 7 and BUG 8 are one change producing
two failures on two input methods, and only one of them was covered.

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


