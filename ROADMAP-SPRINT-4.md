# Sprint 4 — Roadmap (revised 2026-05-19)

> **Revision history**:
> - v1 (2026-05-19, mattina): Tier-5 completo (DataGrid + Table +
>   Pagination + Skeleton) con `@tanstack/react-virtual`.
> - **v2 (2026-05-19, pomeriggio — current)**: Table + DataGrid
>   estratti in Sprint 4.1 separato (sono complessi e somiglianti,
>   meritano sprint dedicato). `@tanstack/react-virtual` scartato:
>   constraint architetturale "no nuove deps esterne". Sprint 4
>   ora include solo Skeleton + Pagination (TW only).

**Tema dello sprint.** Due primitive **pure-UI** (no bridge, no RBAC
sensato) che mancano in `@dashforge/tw` ma sono prerequisito visivo
per la futura DataGrid di Sprint 4.1 e per loading-states / paginated
list ovunque.

**Release goal.** `@dashforge/tw 0.5.0-beta` (minor bump per 2 nuovi
exports, drop-in).

**Stima.** ~6h totali — molto più leggero di Sprint 3 (30h). Si
chiude in una serata o una mezza giornata.

---

## Decisione architetturale fissata: MUI vs TW

| Component | MUI | TW |
|---|---|---|
| **Skeleton** | NOT WRAPPING — `@mui/material/Skeleton` già copre 100% del bisogno (variants `text`/`rectangular`/`circular` + animations `pulse`/`wave`). Wrapparlo in `@dashforge/ui` = wrapper inutile che blocca le evoluzioni MUI. | **CREATE** — non esiste in TW/Radix/Headless. Va costruito da zero. |
| **Pagination** | NOT WRAPPING — `@mui/material/Pagination` è ricco (boundaryCount, siblingCount, variants). Tutto già lì. | **CREATE** — non esiste in TW/Radix/Headless. Va costruito da zero. |

**Regola generale (memory candidate)**: `@dashforge/ui` wrappa MUI
solo quando aggiunge valore Dashforge specifico (bridge integration,
RBAC, validazione, behavior custom). Skeleton + Pagination sono
pure-UI, nessun valore Dashforge da aggiungere — quindi MUI consumer
usa MUI direttamente.

---

## Constraint architetturale: no nuove deps esterne

Confermato esplicitamente dall'utente: oltre alle deps già presenti
(`@radix-ui/react-*`, `tailwind-variants`, `tailwind-merge`, `clsx`,
`react`), **non aggiungiamo nuove runtime deps**.

Conseguenze immediate per Sprint 4:
- Skeleton: zero impatto (è puro CSS + un keyframe).
- Pagination: zero impatto (è puro JSX + logic locale).

Conseguenze rimandate a Sprint 4.1:
- DataGrid virtualizzazione → da decidere (vedi Sprint 4.1 plan).

---

## P1 — Skeleton (~2h)

### Scope

```tsx
import { Skeleton } from '@dashforge/tw';

// Atom forms
<Skeleton variant="text"      width="200px" />
<Skeleton variant="rectangle" width="100%" height="120px" />
<Skeleton variant="circle"    width="40px" />

// Compose to mimic a card shape
<div className="flex gap-3">
  <Skeleton variant="circle" width="48px" />
  <div className="flex flex-col gap-2 flex-1">
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" width="40%" />
  </div>
</div>
```

### Props

- `variant`: `text` (default — single line) | `rectangle` | `circle`
- `width` / `height`: CSS length string (default 100% / `1em` for
  text, 100% / 100px for rectangle, 40px / 40px for circle)
- `animation`: `pulse` (default) | `wave` | `none`
- `sx`: utility string override (root)
- `slotProps.root`: `{ className }` (atomic, no other slots)

### Implementation

- Pure CSS animation (keyframes for `pulse` opacity 1.0 ↔ 0.5,
  keyframes for `wave` background-position translate)
- Tailwind class via `tv()` recipe; the keyframes live in the
  preset (or inline in `@layer utilities`)
- `motion-reduce:` gates **both** animations to `none`
- `aria-hidden="true"` + `role="presentation"` — screen reader
  treats it as visual-only

### Deliverables

- `libs/dashforge/tw/src/components/Skeleton/{Skeleton.tsx, skeleton.types.ts, skeleton.variants.ts, Skeleton.test.tsx}`
- Export in `src/index.ts`
- Sidebar entry: `UI Components → Utilities → Skeleton`
- 1 MDX page in `dashforge-docs-lab` (variant matrix + 2 compose
  examples)

---

## P2 — Pagination (~3h)

### Scope

```tsx
import { Pagination } from '@dashforge/tw';

<Pagination
  page={page}                  // 1-indexed
  pageSize={20}
  totalCount={1437}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[10, 20, 50, 100]}
  variant="default"            // 'default' | 'compact' | 'minimal'
  siblingCount={1}             // pages shown on each side of current
  boundaryCount={1}            // first/last N pages always shown
  showFirstLast                // first/last buttons
/>
```

### Variants

| Variant | Rendering |
|---|---|
| `default` | Page size selector · "Showing X-Y of Z" · Page number buttons · First/Prev/Next/Last · Direct page jump input |
| `compact` | Page number buttons · Prev/Next only |
| `minimal` | "X / Y pages" · Prev/Next only |

### Props

- `page` (required, controlled 1-indexed)
- `pageSize` (required, controlled)
- `totalCount` (required) — total items, NOT total pages (we compute that)
- `onPageChange(page)`
- `onPageSizeChange?(pageSize)` — omit to hide selector
- `pageSizeOptions?` (default `[10, 20, 50, 100]`)
- `siblingCount?` (default 1)
- `boundaryCount?` (default 1)
- `showFirstLast?` (default true)
- `variant` (default `default`)
- `labels?` — i18n strings (default English): `{ first, prev, next, last, page, of, showing, perPage }`
- `disabled?` — disables all interactive bits
- `sx` + `slotProps` (root · pageButton · navButton · pageSizeSelector · summary · jumpInput · activeButton)

### A11Y

- `<nav aria-label="Pagination">` root
- `aria-current="page"` on active button
- `aria-label` on prev/next buttons ("Previous page", "Next page")
- Page size selector is a real `<select>` (uses native a11y)

### Implementation

- Pure controlled component, no internal state besides the optional
  jump-input field (which has its own commit-on-blur micro state)
- Range computation: standard "show first N + last N + siblings
  around current with ellipsis fill" — well-known algorithm,
  ~30 LOC
- No new deps

### Deliverables

- `libs/dashforge/tw/src/components/Pagination/{Pagination.tsx, pagination.types.ts, pagination.variants.ts, Pagination.test.tsx}`
- Export in `src/index.ts`
- Sidebar entry: `UI Components → Utilities → Pagination`
- 1 MDX page with variant matrix + i18n example + integration
  example with a Table (forward reference to Sprint 4.1)

---

## P3 — Release `@dashforge/tw@0.5.0-beta` (~1h)

Bump **minor** per 2 nuovi exports.

### Steps (canonical)

1. `node scripts/prepare-release.mjs --package=@dashforge/tw --version=0.5.0-beta`
2. Fill CHANGELOG + release MDX
3. `git commit` — review diff
4. `node scripts/publish-prepared.mjs --package=@dashforge/tw --confirm`
5. `git push origin "@dashforge/tw@0.5.0-beta"`
6. **GitHub Release** (template stampato dallo script):
   - Title: `@dashforge/tw 0.5.0-beta — Skeleton + Pagination (TW-only primitives, prerequisite for the upcoming DataGrid sprint)`
   - `--prerelease` flag
   - Body = sezione `[0.5.0-beta]` da `libs/dashforge/tw/CHANGELOG.md`

### Release & versioning

| Axis | Pre-`0.5.0` | Post-`0.5.0` |
|---|---|---|
| Public API surface | 29 components | **+2 (Skeleton + Pagination)** + their `*Props` / `*SlotProps` types + `*Variants` recipes |
| Peer deps | `react ^18 \|\| ^19`, `tw-theme workspace`, `tw-tokens workspace` | unchanged |
| Bridge deps | `forms` / `rbac` / `ui-core` `workspace:*` | unchanged |
| New runtime deps | — | **none** (no `@tanstack/react-virtual`, no other libs) |
| Breaking changes | — | Zero |
| Bundle size | 312 KB raw / 68.85 KB gzipped | proiezione **~318 KB raw / ~70 KB gzipped** (+6 KB raw / +1-2 KB gz; ben sotto il 5% threshold) |
| Migration | — | Drop-in |

---

## Quality gate per chiudere Sprint 4

1. ✅ Skeleton ships: 3 variant × 3 animation × tests + MDX
2. ✅ Pagination ships: 3 variant + range computation tested + i18n
   surface + tests + MDX
3. ✅ `@dashforge/tw@0.5.0-beta` su npm + GitHub Release con
   titolo descrittivo e `--prerelease` flag (pattern memory)
4. ✅ Bundle delta < 5% gzipped (NO regression budget issue)

---

# Sprint 4.1 — Table + DataGrid (separato) ✅ APPROVATO

> **Drafted as a sibling to Sprint 4, NOT merged into it.** Reason:
> Table and DataGrid share complexity (typed columns, sort, custom
> cell renderers, RBAC integration), but DataGrid adds enough on
> top (virtualization, selection, filter, pagination integration,
> RBAC per-column) to justify a dedicated sprint. Putting both in
> Sprint 4 was overscope.

**Release target**: `@dashforge/tw@0.6.0-beta`. Stima ~18-20h.

---

## Resolved decisions (post-analisi del Table MUI esistente)

### Origine del Table di partenza

Sorgente: `/Users/mcs/projects/hub-ws/admin/src/components/Table/`

- `Table.tsx` (197 LOC) — wrapper opinionato sopra `@mui/x-data-grid`
  Community con `autoHeight: true` (quindi virtualizzazione di fatto
  disabilitata).
- `types.ts` — `TableColumn<T>` API + `NestedKeyOf<T>` util TS.
- `renderCell.tsx` — 4 cell renderer (`RenderCell`,
  `RenderTwoLineCell`, `RenderChip`, `RenderButton`).
- `cells/RowActions.tsx` — 3-dot menu component (IconButton + Menu).

### Strategia: porto l'API, butto l'implementazione

**Conserviamo** (5 elementi forti dell'API esistente):

| # | Cosa porto | Motivo |
|---|---|---|
| 1 | `TableColumn<T>` shape (field/header/width/flex/sortable/searchable/align/render) | Idiomatica, autocomplete pulito, copre 80% admin |
| 2 | `NestedKeyOf<T>` util TS | TS-fu utile per `field: 'address.city'` autocomplete |
| 3 | `rowActions` slot pattern + `RowActions` 3-dot menu | Pattern UI vincente per liste admin |
| 4 | Cell renderer library (`RenderCell`, `RenderTwoLineCell`, `RenderChip`, `RenderButton`) | Building block riusabili |
| 5 | Client-side search dichiarativa (`searchable: true` per colonna) | Pattern comune ben incapsulato |

**Scartiamo** (12 fragilità identificate):

| # | Cosa butto | Sostituzione |
|---|---|---|
| 1 | `@mui/x-data-grid` dep (~150 KB) | Native `<table>` + Tailwind |
| 2 | `autoHeight: true` trick (~ disabilita virtualizzazione) | Real virtualization sul DataGrid (P3) — Table no virt by design |
| 3 | `T extends { _id: string }` hardcoded | `getRowId?: (row, i) => string` prop, default `(row, i) => String(i)` |
| 4 | Nested-key flattening solo a TYPE level (runtime broken) | Utility `getNestedValue(row, path)` ~15 LOC |
| 5 | Search solo string\|number, no debounce | Hook `useTableSearch` esportato con debounce 200ms + supporto Date/boolean/null |
| 6 | No sticky header | `<th class="sticky top-0">` puro Tailwind |
| 7 | 15+ righe `sx` per combattere MUI X default | Niente (impl da scratch, niente da combattere) |
| 8 | Magic numbers vertical-align (`mt: 1.7` ecc.) | Native flex/grid alignment |
| 9 | No RBAC integration | `access: AccessRequirement` per-column |
| 10 | No row selection | `rowSelection: 'none' \| 'single' \| 'multiple'` |
| 11 | No tests | ~25-30 unit test, copertura su tutte le fragilità sopra |
| 12 | Loading non compone con Skeleton | `loading={true}` triggera Skeleton placeholder rows |

### Decisione sulla port MUI: DEFER

**NO** port `@dashforge/ui/Table` in Sprint 4.1. Motivi:

1. L'admin app già usa il suo Table locale — nessuna migration da risolvere.
2. Aggiungere `@mui/x-data-grid` come dep di `@dashforge/ui` è una decisione pesante che blocca consumer che non la vogliono.
3. Nessuno ha chiesto un `@dashforge/ui/Table` export ufficiale.
4. Aprire 4 componenti (Table TW, DataGrid TW, Table MUI, DataGrid MUI) raddoppia lo stress in Sprint 4.1.

Defer a **Sprint 6 o post-`1.0`** se la base utenti `@dashforge/ui` cresce e chiede esplicitamente un Table export. Sprint 5 starter kit MUI può documentare il pattern locale del consumer.

### Decisione su DataGrid virtualizzazione: A — Homemade

Confermata opzione A: virtualizzazione hand-rolled (~150-200 LOC,
`IntersectionObserver` + `ResizeObserver`, solo verticale, fixed
row height in v1 con `itemSize` prop). Zero nuove deps esterne.

Vantaggi: bundle size minimo, controllo totale, signaling
architetturale forte. Trade-off accettato: manutenzione interna
a vita (vs offload a tanstack/react-virtual).

---

## Scope definitivo Sprint 4.1

| P | Item | Stima | Deliverable |
|---|---|---|---|
| **P1** | **Table TW** — native `<table>` body, no DataGrid backing | ~5h | `libs/dashforge/tw/src/components/Table/` (Table.tsx, table.types.ts, table.variants.ts, Table.test.tsx) + `getNestedValue` util + `useTableSearch` hook |
| **P2** | **Cell renderer library + RowActions** — porting da MUI a TW | ~2h | `libs/dashforge/tw/src/components/Table/cells/` (RenderCell, RenderTwoLineCell, RenderChip, RenderButton, RowActions). RowActions usa il Popover di Sprint 3 + nostro Button. |
| **P3** | **DataGrid TW** — feature MVP (sort, filter, selection, pagination integration, RBAC per-column) | ~10-12h | `libs/dashforge/tw/src/components/DataGrid/` con virtualizzazione homemade in `_internal/useVirtualizer.ts` |
| **P4** | **PARITY.md** update — TW-lead components section | ~1h | Documenta Table + DataGrid TW-only, MUI gap intenzionale fino a Sprint 6+ |
| **P5** | **PERFORMANCE.md** update — DataGrid benchmarks | ~1h | Mount 100/1k/10k rows + scroll FPS + bundle delta vs 0.5.0 |
| **P6** | **Consumer smoke test** in `dash` + **release `@dashforge/tw@0.6.0-beta`** | ~3h | Nuova page `/test-tables` in `dash` (Table 20 righe + DataGrid 10k righe) · npm publish · GH release pattern memory |

**Total: 22-24h** (leggermente sopra il range tentativo precedente,
giustificato dalla decisione approvata di scope completo su Table TW
+ DataGrid TW + cell renderer library).

### Cosa NON faccio in Sprint 4.1

- ❌ `@dashforge/ui/Table` export (defer Sprint 6+ se demand)
- ❌ Column resizing / reordering (Sprint 6+)
- ❌ Cell editing inline (sprint dedicato)
- ❌ Tree data / row grouping / aggregation (post-`1.0`, sono Premium MUI)
- ❌ Export CSV/Excel (post-`1.0`)
- ❌ Server-side data layer (consumer wire la sua API; noi esponiamo solo gli hook)
- ❌ Variable row height (defer a Sprint 4.1-bis se demand)

### Quality gate Sprint 4.1

1. ✅ Table TW: API porting completo (column model + nested keys + search + sort + sticky header + RBAC + selection)
2. ✅ Cell renderer library + RowActions porting completi
3. ✅ DataGrid TW: virtualizzazione testata fino a 10k righe (mount < 50ms, scroll 60fps)
4. ✅ PARITY.md aggiornato con TW-lead components section
5. ✅ PERFORMANCE.md aggiornato con benchmark DataGrid + delta bundle vs 0.5.0
6. ✅ `@dashforge/tw@0.6.0-beta` su npm + GH Release (pattern memory)
7. ✅ Bundle regression motivata se sopra threshold (probabile sopra +5% gz per DataGrid)

---

# Sprint 4.3 — Theme identity audit + design system cleanup

> **Charter (2026-05-19, post-Sprint 4.1 Table smoke test).** During
> the Table smoke test in `dash`, the rendered output revealed
> systemic misuse of `dark:` Tailwind variants against the
> dashforgePreset CSS-variable inversion model. The Table fix
> applied in 4.1 corrects the local instance — Sprint 4.3 fixes the
> issue across the WHOLE component catalog.

## Architectural principle (capitalized as policy)

**The default preset of `@dashforge/tw-theme` IS the Dashforge
visual identity.** Consumer apps consume it as-is and never
override it just to make components look right. If a component
needs an override to be readable, the component (or the preset)
has a bug — fix THERE, not at the consumer.

Conseguenze operative:

1. **`dash` consumer test app non override mai `dashforgePreset()`.**
   Se uno screenshot in `dash` fa schifo, è bug Dashforge — non bug
   consumer.
2. **Pattern canonici del design system** sono autoritativi —
   inventare un nuovo "selected row" o "elevated surface" stile è
   un sintomo di drift. Riusa i pattern esistenti (LeftNav
   `itemActive`, Box variants, Typography `color` axis).
3. **Light + dark mode sono entrambi "first-class"**. Ogni
   component deve renderizzarsi correttamente in entrambi senza
   richiedere override consumer.

## Scope

### P1 — Dashforge inversion mechanism doc (~1h)

Documentare ESPLICITAMENTE come il CSS variable inversion model
funziona in `@dashforge/tw-theme`:

- `bg-neutral-50` (no `dark:` variant) → auto-inverte: `#fafafa`
  in light, `#0a0a0a` in dark (surface semantics preserved)
- `text-neutral-900` (no `dark:` variant) → auto-inverte: dark
  testo in light, light testo in dark
- `bg-primary-100 + text-primary-900` (no `dark:` variant) →
  legge in entrambi i mode (primary palette non inverte)

**Anti-pattern documentato**: `text-neutral-900 dark:text-neutral-100`
applica DOUBLE inversion che breaks dark mode (entrambe le classi
risolvono al colore dark in dark mode tramite il CSS var swap).

Output: nuova sezione `CONTRIBUTING.md` o aggiunta al README di
`@dashforge/tw` "Working with the default preset".

### P2 — Catalog audit (~3h)

Run all 31 components contro il default preset in light + dark mode,
catalogare tutti gli usi di `dark:` su neutral palette. Report
in nuovo file `libs/dashforge/tw/THEME-AUDIT.md`:

| Component | File | Pattern errato | Fix proposto |
|---|---|---|---|
| Typography | typography.variants.ts:65 | `text-neutral-900 dark:text-neutral-100` | `text-neutral-900` |
| Box | box.variants.ts:184 (soft variant) | `bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100` | `bg-neutral-100 text-neutral-900` |
| Box | box.variants.ts:200 (solid variant) | `bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900` | TBD — solid needs primary palette |
| ... | ... | ... | ... |

### P3 — Refactor + visual regression tests (~6h)

- Apply tutte le fix da P2 (sostituzione `dark:` variants → auto-invert)
- Aggiungere script Vite + Playwright (o equivalente lightweight)
  per screenshot automatico ogni component in light + dark mode
- Establish baseline images sotto `libs/dashforge/tw/visual-tests/__baseline__/`
- Run il visual diff in CI (deferito a Sprint 6 per la wire CI completa;
  in Sprint 4.3 si genera la baseline + un comando manuale `pnpm visual:check`)

### P4 — Update CONTRIBUTING.md + lint rule (~2h)

- Eslint custom rule (o stylelint) che flagga `dark:` variants su
  neutral palette → warning con link al doc inversion model
- CONTRIBUTING.md sezione "Theme identity rules" — la principle
  capitalizzata sopra + link al canonical pattern catalog

### P5 — Release `@dashforge/tw@0.7.0-beta` (~1h)

Bump **patch** (fix only, no public API change). GH release con
pattern memory. Titolo: `@dashforge/tw 0.7.0-beta — Theme identity
audit + dark mode contrast fix across catalog`.

Bundle delta atteso: -1 a -3 KB (rimozione di classi `dark:` ridondanti).

## Quality gate Sprint 4.3

1. ✅ Inversion mechanism documentato (CONTRIBUTING.md o README)
2. ✅ THEME-AUDIT.md cataloga tutti i siti
3. ✅ Tutti i `dark:` variants neutral palette rimossi/canonicalized
4. ✅ Screenshot baseline generata per ogni component in entrambi i mode
5. ✅ Eslint rule che warna pattern errati attiva
6. ✅ Visual diff suite passa (manual run, automation in Sprint 6)
7. ✅ Release `0.7.0-beta` con titolo descrittivo + GH release prerelease

## Stima totale Sprint 4.3

**~13h** (più leggero di 4.1/4.2 ma richiede attenzione cross-component).

> Versioning: Sprint 4 = `0.5.0-beta`, Sprint 4.1 = `0.6.0-beta`,
> **Sprint 4.3 = `0.7.0-beta`** (patch su catalog), Sprint 5 ora
> `0.8.0-beta`, Sprint 6 → `1.0.0`. Lo spazio si toglie scalando
> Sprint 5/6 di un altro minor.

---

# Sprint 5-6 ladder (aggiornato post-Sprint 4.3)

| Sprint | Release | Tema |
|---|---|---|
| **Sprint 5** | `@dashforge/tw@0.8.0-beta` + starter kits v1 | Due repos separati `dashforge-starter-mui` + `dashforge-starter-tw`. Auth + RBAC + form CRUD + dashboard layout + DataGrid-based admin views. Sblocca revenue model "kits paid + lib free". |
| **Sprint 6** | `@dashforge/tw@1.0.0-rc.1` → `1.0.0` | Final A11Y audit (axe / lighthouse CI — riusa anche visual diff suite di 4.3), bundle size lockdown, deprecation window, beta freeze 4 settimane, cut `1.0.0`. Show HN coordinato col marketing (cfr. memory `marketing_playbook.md`). |

> Versioning ladder: Sprint 4 = `0.5.0-beta` (✓ shipped), Sprint 4.1 =
> `0.6.0-beta` (in progress), Sprint 4.3 = `0.7.0-beta`, Sprint 5 =
> `0.8.0-beta`, Sprint 6 = `1.0.0-rc.1` → `1.0.0`.
