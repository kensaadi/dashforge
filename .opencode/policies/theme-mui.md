# Theme MUI Policy

## Purpose

Define the architectural rules for how Dashforge design tokens are translated into MUI theme configuration and component overrides.

## Core Principle

Dashforge tokens define meaning.  
`theme-mui` translates meaning into MUI.  
Components consume meaning, never hardcoded style.

---

## 1. Source of Truth

All design values must originate from Dashforge tokens.

Examples:

- colors
- semantic intents
- radius
- spacing
- typography
- text colors
- surface colors

Allowed:

- `dash.color.intent.success`
- `dash.color.text.inverse`
- `dash.radius.md`

Forbidden:

- hardcoded semantic colors in MUI overrides
- component-level design values that bypass tokens

---

## 2. theme-mui Role

`theme-mui` is an adapter layer, not a second design system.

Its responsibility is:

- map Dashforge tokens into MUI palette / shape / typography / component overrides
- keep MUI aligned with Dashforge semantics
- provide safe compatibility fallbacks when needed

It must NOT:

- invent a parallel semantic system
- introduce ad-hoc design decisions disconnected from Dashforge tokens

---

## 3. Override Discipline

MUI `root` overrides must remain neutral.

Global root overrides may include:

- borderRadius
- reset-style adjustments
- neutral layout styling
- backgroundImage resets

Global root overrides must NOT:

- force semantic backgrounds
- override variant-specific colors
- collapse semantic variants into one shared color style

Variant-specific styling must live in the matching variant override.

Examples:

- `filledSuccess`
- `filledWarning`
- `filledError`
- `filledInfo`

---

## 4. Semantic Intents

Semantic intents are distinct and must remain distinct.

Examples:

- `primary` = brand / main action
- `info` = informational feedback
- `success` = positive outcome
- `warning` = caution
- `danger` / `error` = destructive or error state

`info` must NOT be treated as identical to `primary`.

---

## 5. Fallback Policy

When introducing a new semantic token in theme-mui integration, evaluate backward compatibility.

If a custom theme may reasonably omit the new token, prefer a safe fallback at adapter/override level.

Example:

```ts
dash.color.intent.info ?? dash.color.intent.primary


Do NOT introduce unnecessary hard breakage if a compatibility fallback is possible.

6. Hardcoded Values

Do not hardcode design values if an equivalent token exists.

Forbidden:

#FFFFFF
raw semantic hex values inside MUI overrides
magic spacing/radius values when token exists

Preferred:

dash.color.text.inverse
dash.color.intent.success
dash.radius.md

Hardcoded values are allowed only when:

there is no semantic token yet
the value is purely technical and not design-facing
the decision is documented
7. Component Consumption Rule

Dashforge components must consume semantic tokens, not visual decisions.

Meaning:

Snackbar consumes success, warning, error, info
Alert consumes semantic intent
components must not choose their own brand colors ad hoc
8. Theme Fix Rule

Any fix touching a shared MUI override must include regression validation for:

the target component
related MUI components using the same override
light mode
dark mode

Example:
A fix in MuiAlert must validate:

Snackbar
Alert
light
dark
9. Type Safety Rule

Utilities in theme-mui should prefer compatibility with MUI core types over artificial strictness that causes friction.

If a utility must choose between:

idealized local generic strictness
real compatibility with MUI ThemeOptions['components']

prefer the solution that keeps the adapter stable and maintainable.

If a looser type is chosen intentionally, document the trade-off in code comments.

10. Documentation Rule

Public docs for theme customization must explain:

tokens as semantic source of truth
adapter role of theme-mui
semantic customization vs simple color tweaking
how token changes affect multiple components consistently

The docs must not present theme customization as “just changing colors”.
It must be presented as defining the visual language of the product.

11. Review Checklist

Before approving a theme-mui change, verify:

no semantic hardcoding added
no root override collapses variants
semantic intent remains distinct
fallback strategy considered
light/dark behavior checked
related components visually validated
no unnecessary breaking change introduced
```
