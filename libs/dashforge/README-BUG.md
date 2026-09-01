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

**Status:** **fixed** 2026-09-01 as a type-surface split (Tier S). See
*Fixed* section at bottom.

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

**Status:** open. Reproduced 2026-09-01 in `inventory-kit`, against
`tw@1.5.2` + `forms@1.0.0` linked from the monorepo.

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

## Unconfirmed

*(nothing yet — move suspicions here rather than into the list above)*

## Fixed

### BUG 3 — `<Autocomplete multiple>` (tw): the chevron wraps onto its own line in a narrow field

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

**Fixed** 2026-09-01 as a type-surface split (Tier S — no runtime
change). See the *open* entry above for the full symptom / cause. The
key reframe: `defaultValue` (and `value` / `onValueChange`) is
**exclusively a standalone-mode API**. Form-mode initial values come
from `<DashForm defaultValues={...}>` via the bridge; there is no
per-field defaultValue path in form mode. The runtime already
enforced this correctly (the form-mode branch never consults
`defaultValue`) — the bug lived entirely on the type surface, which
accepted the misuse combination without a warning.

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


