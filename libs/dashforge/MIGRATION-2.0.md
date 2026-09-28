# Migrating to Dashforge 2.0.0

Every `@dashforge/*` package moves to `2.0.0` on 2026-09-28. This is the
first release where one version number covers the whole set.

Most applications will need **one change** (the install), and only feel the
rest if they typed a ref, hand-built a theme object, or relied on the
window scrolling in `<AppShell>`. Each section below states who is
affected before it states what to do.

---

## 1. Upgrade every package in the same step

**Who is affected: everyone.**

Internal dependencies are declared with `workspace:*`, which pnpm rewrites
at pack time to the **exact** sibling version. So `@dashforge/tw@2.0.0`
requires `@dashforge/ui-core@2.0.0`, not `^2.0.0`. A mixed install will
not resolve, and if it somehow did you would be running two copies of the
form engine, which means two React contexts and every field silently
falling back to standalone mode.

```bash
pnpm add @dashforge/tw@2 @dashforge/tw-theme@2 @dashforge/tw-tokens@2 \
         @dashforge/forms@2 @dashforge/ui-core@2 @dashforge/rbac@2 \
         @dashforge/calendar-core@2
```

MUI side:

```bash
pnpm add @dashforge/ui@2 @dashforge/theme-mui@2 @dashforge/theme-core@2 \
         @dashforge/tokens@2 @dashforge/forms@2 @dashforge/ui-core@2 \
         @dashforge/rbac@2 @dashforge/calendar-core@2
```

If your lockfile resists, delete `node_modules` and the lockfile entries
for `@dashforge/*` and install again.

---

## 2. Hand-built themes need two new fields

**Who is affected: you built a `TWTheme` field by field.** If you spread a
shipped theme, skip this.

```ts
// before, and still fine
const theme = { ...defaultTWThemeLight, color: { ...defaultTWThemeLight.color, primary: myBrand } };

// before, no longer compiles
const theme: TWTheme = {
  color: { primary, secondary, success, warning, danger, info, neutral },
  fontSize: { xs, sm, base, lg, xl, '2xl': x2 },
  // ...
};

// after
const theme: TWTheme = {
  color: {
    primary, secondary, success, warning, danger, info, neutral,
    inverse: defaultTWThemeLight.color.inverse,   // new, required
  },
  fontSize: {
    '2xs': '0.625rem',                            // new, required
    xs, sm, base, lg, xl, '2xl': x2,
  },
  // ...
};
```

**`inverse` is for content on a surface that is dark whatever the theme
does**: a dark hero, an ink footer, an inverted panel. It is the same
object in the light and dark themes on purpose. **Do not give it a dark
variant.** Content on an always-dark surface that follows the theme flips
to unreadable in exactly one of the two, which is the whole failure this
role exists to prevent.

---

## 3. Reaction types lost a generic parameter

**Who is affected: you wrote `ReactionDefinition<MyForm>` or any of its
three siblings.**

```ts
// before
const reactions: ReactionDefinition<MyForm>[] = [ /* ... */ ];
const registry = createReactionRegistry<MyForm>({ /* ... */ });

// after
const reactions: ReactionDefinition[] = [ /* ... */ ];
const registry = createReactionRegistry({ /* ... */ });
```

**Delete the type argument. Nothing else changes, because nothing was
being checked.** The parameter was accepted and then discarded:
`ReactionRunContext<TFieldValues>` ignored it, `ReactionDefinition` only
handed it down to that, and the registry threaded it further. `watch` is
`string[]` and `getValue` takes a `string`, so this compiled and the
reaction silently never fired:

```ts
const r: ReactionDefinition<{ country: string }> = {
  id: 'fill-region',
  watch: ['contry'],                      // typo, accepted
  run: (ctx) => ctx.getValue('citty'),    // typo, accepted
};
```

It still compiles, and it always did. What changed is that the type no
longer implies otherwise. Field names remain strings by design; typed
paths are tracked as a separate feature.

---

## 4. Two ref types changed

**Who is affected: you annotated a ref for `<Select>` or `<Slider>`.**

```tsx
// before
const selectRef = useRef<HTMLButtonElement>(null);
const sliderRef = useRef<HTMLSpanElement>(null);

// after
const selectRef = useRef<HTMLDivElement>(null);
const sliderRef = useRef<HTMLDivElement>(null);
```

`<Select>`'s trigger became a `div role="combobox"` because
`<Select multiple>` nested a `<button>` inside the trigger button. That is
invalid HTML, and worse, `role="button"` makes its descendants
presentational, so the delete control existed for a mouse and not for a
screen reader.

**`<Slider>`'s ref is worth a second look even if you never typed it: it
never arrived at all.** The component was wrapped in `forwardRef`, named
the parameter, and never attached it, so `ref.current` stayed `null`
forever with no type error and no warning. If you worked around that with
a wrapper div and a query, you can delete the workaround.

---

## 5. `<AppShell>` changes which element scrolls

**Who is affected: everyone using `<AppShell>`.** This is the one to look
at in a browser rather than in a diff.

The root carried `min-h-screen`, which made `main`'s scroller dead code:
the window scrolled instead, and the header, nav and footer scrolled away
with it. The new default is the shell most applications want.

```tsx
// after, and the new default: root is h-dvh, main scrolls, chrome stays put
<AppShell header={...} nav={...} />

// the previous behaviour, if you want the whole page to scroll
<AppShell layout="page" header={...} nav={...} />
```

---

## 6. Markup changes that can break selectors and tests

**Who is affected: you query by tag name, or snapshot the DOM.**

| | before | after | why |
|---|---|---|---|
| `<Chip>` clickable root | `<button>` | `<div role="button">` | a clickable and deletable chip nested a button in a button |
| `<Select>` trigger | `<button>` | `<div role="combobox">` | same family |
| `<Divider orientation="vertical">` | `w-full` | sized by `self-stretch` | it spanned the container, squeezing its siblings in a row |
| `<TopBar>` `start` slot | `shrink-0` | shrinks | it carried `min-w-0` and `shrink-0` together, which cancel, so a long brand pushed `center` and `end` out of the bar |

If you select these by role rather than by tag, nothing changes:
`getByRole('button')` and `getByRole('combobox')` work exactly as before.

---

## 7. Two visual changes you did not ask for

**Who is affected: you compare screenshots.**

- **`<Chip variant="outline" color="neutral">`'s border moved from
  `neutral-300` to `neutral-500`.** It measured 1.42:1 in light and 1.91:1
  in dark against the surfaces it sits on, where WCAG 1.4.11 asks for 3:1,
  and an outline chip IS its border. It was also the only colour row at
  `-300` while the other six already sat at `-500`.

- **`<Stack divider>` now supplies the orientation you did not choose.** A
  `<Divider>` defaults to horizontal, which is `h-0 w-full`: inside a row
  that is nothing to see plus a claim on the whole width, so the items
  were squeezed rather than separated. A Stack knows its own axis. An
  explicit `orientation` still wins, and a divider that is not ours is
  passed through untouched.

---

## What you can delete after upgrading

Workarounds that 2.0.0 makes unnecessary:

- a wrapper element and a DOM query standing in for `<Slider>`'s ref
- `overflow` or `height` overrides fighting `<AppShell>`'s scroll
- `sx="w-auto"` or a wrapper constraining a vertical `<Divider>` in a row
- a hand-rolled span standing in for a draggable `<Chip>` in a palette
- a hand-rolled brand block in `<TopBar>`'s `start` slot, now `<TopBarBrand>`
- `aria-pressed` set by hand on a toggle `<Button>`, now `pressed`

---

## Compatibility

| | requirement |
|---|---|
| React | `^18.0.0 \|\| ^19.0.0` |
| Tailwind CSS (tw stack) | `>=3.4.1` |
| MUI (`@dashforge/ui`) | `@mui/material@^9.0.0` |
| Emotion (MUI stack) | `@emotion/react@^11`, `@emotion/styled@^11` |
| `@dashforge/rn` | **not part of this release**, versioned separately |

The two stacks are isolated by design and share only the bridge layer
(`@dashforge/forms`, `@dashforge/ui-core`, `@dashforge/rbac`). You do not
need the MUI packages to use the Tailwind ones, or the reverse.

---

## If something is wrong

Every defect closed in this release is written up in
[README-BUG.md](./README-BUG.md), with what was measured rather than a
verdict. If the behaviour you are seeing is described there, the entry
will tell you which commit closed it and how it was verified.
