# Sprint 2 — Roadmap

> Drafted 2026-05-17, immediately after closing Sprint 1 (which shipped
> `@dashforge/tw 0.2.1-beta` to npm, full live-preview catalog in the
> docs site, two-stage release tooling, and the A11Y audit).

**Tema dello sprint.** Validare in produzione su un consumer reale
(`~/projects/web/learn/dash`) l'intero catalog `0.2.1-beta`, poi
chiudere il debt visuale + a11y di seconda passata scoperto durante
Sprint 1.

**Release goal.** `@dashforge/tw 0.2.2-beta` (drop-in patch) per il
grosso del lavoro; eventuale `0.3.0-beta` solo se TextField
prefix/suffix lo shippiamo (è nuovo public API → minor bump).

---

## P1 — Test end-to-end in `dash` di tutti i 24 componenti `@dashforge/tw` 🆕

Priorità assoluta: PRIMA di shippare qualsiasi altra cosa, validiamo
che il catalog reggi in un app consumer reale (non solo nei demo del
docs lab). È il blocco "smoke test produzione" che fa da quality gate
per tutto il resto dello sprint.

| Item | Scope | Stima |
|---|---|---|
| Mount tutti i 24 componenti in `~/projects/web/learn/dash` (Foundation 8 + Tier-1 4 + Tier-2/3 12) in una route dedicata `/dash/tw-smoke` o simili | consumer | M |
| Wire `DashforgeTailwindProvider` + `tailwind.config.dashforgePreset()` se non già fatto | consumer infra | S |
| **Check per ogni componente** ↓ | consumer | M |
| Documenta gap emersi in `libs/dashforge/tw/CONSUMER-VALIDATION.md` (per-componente: OK / issue / note) | dashforge docs | S |
| Cattura visual snapshots (anche solo screenshot manuali) per regression catch nei prossimi release | consumer | S |

### Check per componente

Per ognuno dei 24 componenti, verificare:

1. **Render OK** — niente layout broken, niente console error, niente warning sospetti.
2. **Interactions** — click / type / toggle / select funzionano end-to-end.
3. **Theme flip** — dark/light switch via `setMode()` aggiorna il componente in lockstep.
4. **RHF wiring** — se form-mode, `<DashForm>` registra il field e il valore viene serializzato in `onSubmit`.
5. **RBAC predicate** — se applicabile, `access` con `denied:hide` / `denied:disable` / `denied:readonly` si comporta come documentato.
6. **Focus visible** — ring appare con Tab, scompare con click.
7. **Keyboard nav** — Enter/Space/Arrow keys dove applicabile (RadioGroup, Autocomplete, etc.).

**Output atteso.** Report formale "tutti i 24 componenti shippano
correttamente in un app consumer reale" + lista issue residue
scoperte (che diventano P2-P5 candidate aggiuntive).

---

## P2 — Doc preview regressions (user-flagged 2026-05-17)

Bundle in `0.2.2-beta`. ~1 commit per fix in lib + 1 in docs-lab.

| Item | Scope | Stima | Note |
|---|---|---|---|
| **Autocomplete: dropdown icon va a capo su multi-select** | lib (variants) | XS | Flex-wrap sul trigger row → caret cade sotto i chips. Fix: `flex-nowrap` + `shrink-0` sull'icona, `min-w-0` sul wrapper chips. |
| **Autocomplete: preview shell troppo piccola, menu a tendina invisibile** | docs-lab (TwComponentPreview) | XS | `min-height: 120px` nel preview frame è basso per dropdown → menu si apre fuori e viene clippato. Fix: alza min-height a 320px per Autocomplete (per-id override) o globale a ~240px. Valuta anche `overflow: visible` sul frame. |
| **LeftNav: rimuovi underline dai link** | lib (variants) | XS | Probabile preflight scoped che lascia text-decoration default sui `<a>`. Fix: `no-underline` sul `itemLink` slot. |
| **TopBar: rimuovi underline** | lib (variants) | XS | Stessa cosa per i link dentro start/center/end (Breadcrumbs nested incluse?). Verifica se è il TopBar stesso o le Breadcrumbs. Fix: `no-underline` o reset locale. |

---

## P3 — A11y seconda passata (da `libs/dashforge/tw/A11Y.md` known limitations)

| Item | Scope | Stima | WCAG |
|---|---|---|---|
| **AppShell mobile drawer: focus trap** | lib | S | 2.4.3 Focus Order |
| **`prefers-reduced-motion`** su Switch thumb / Snackbar slide / ConfirmDialog fade | lib | S | 2.3.3 Animation from Interactions |
| **Color contrast regression CI** (script che usa `tailwind-merge` + token tints → verifica AA su ogni combo) | tooling | M | 1.4.3 |
| **Lighthouse / axe-core scan automatico** sul docs-lab SSG build → falla in CI se score < target | tooling + ci | M | cross-cutting |

P3.A + P3.B → bundle in `0.2.2-beta` (lib changes).
P3.C + P3.D → slittabili in sprint 3 (tooling-side, indipendente dalla release).

---

## P4 — Lib API gaps (debt scoperto in P3 docs MDX di Sprint 1)

| Item | Scope | Stima | Versionamento |
|---|---|---|---|
| **TextField `slotProps.prefix/suffix`** (documentato in `text-field.mdx` ma NON implementato in 0.2.0-beta) | lib | S | **`0.3.0-beta`** (minor — nuovo public API) |
| **Checkbox indeterminate icon (dash glyph)** — regressione cosmetica: 0.2.1 indeterminate mostra check, dovrebbe mostrare dash | lib | XS | `0.2.2-beta` (patch) |

**Decisione versioning**: o fai TextField slotProps + bumpiamo a
`0.3.0-beta` (minor), oppure lo splittiamo in sprint 3 e teniamo
`0.2.2-beta` puro patch.

---

## P5 — Tooling polish (lezioni dal publish di Sprint 1)

| Item | Scope | Stima |
|---|---|---|
| **`publish-prepared.mjs`: detect `~/.npmrc` bypass-2FA → publish da `cd /tmp` senza `.npmrc` swap** (il workaround è stato la fonte di tutta la confusione OTP del 0.2.1 publish) | release tooling | S |
| **`publish-prepared.mjs`: auto-skip-build se dist mtime > src mtime** | release tooling | XS |
| **`prepare-release.mjs`: multi-package coordinato** (un solo invoke per tw + tw-theme + tw-tokens sincronizzati, quando ce ne sarà bisogno) | release tooling | M (opzionale) |

---

## Sequenza proposta

1. **P1 — test end-to-end in dash** (PRIMA cosa, blocca tutto) — ~1-2 giorni
2. **P2 — fix doc regressions** lib (4 commit XS) → ~mezza giornata
3. **P3.A + P3.B + P4.2** in parallelo → bundle stessa release
4. **Release `@dashforge/tw 0.2.2-beta`** via `prepare-release.mjs` + `publish-prepared.mjs`
5. **P4.1 TextField slotProps** → se shippato, `0.3.0-beta`
6. **P3.C + P3.D** CI suites se rimane tempo
7. **P5** tooling polish nei buchi

## Release plan tentativo

- **Sprint week 1**: `@dashforge/tw 0.2.2-beta` — bundle di P2 + P3.A-B
  + P4.2. Patch level, drop-in compatibile. Token bypass-2FA è già
  configurato in `~/.npmrc` (lezione Sprint 1), quindi publish single-
  command senza OTP.
- **Sprint week 2 (opzionale)**: `@dashforge/tw 0.3.0-beta` — minor
  bump SE P4.1 TextField slotProps prefix/suffix viene shippato.
  Additive, no breaking change.
- **Bridge + MUI side packages** (`forms`, `rbac`, `ui-core`, `ui`,
  `theme-mui`, `theme-core`, `tokens`): **invariati**. Independent
  versioning per architectural plan v2 — nessuna toccata in questo
  sprint, restano a `0.2.3-beta`.

## Quality gates

- **Sprint 2 si chiude solo se**:
  - P1 è verde: 24/24 componenti validati in dash consumer
  - P2 è chiuso: 4 fix doc preview regressions on npm via 0.2.2-beta
  - A11Y.md aggiornato con eventuali nuove limitations scoperte in P1
- **Sprint 2 NON si chiude se**:
  - P1 trova un blocker su un componente "marquee" (Button / TextField
    / Autocomplete) — diventa P0 emergenza patch da shippare prima

## Carryover candidati (Sprint 3+)

Items che non vogliamo perdere ma non hanno priorità per Sprint 2:

- Migration completa di una pagina reale di dash da `@dashforge/ui`
  (MUI) a `@dashforge/tw` (P1 di Sprint 2 è "smoke test catalog", non
  "production migration" — quella è uno step in più dopo)
- `release.config` Nx-native per i 3 TW packages (oggi nx.json
  `release.projects` lista solo i 7 MUI/bridge) — utile se vogliamo
  fare un coordinated bump di tw + tw-theme + tw-tokens
- Performance baseline per i 24 componenti (mount/re-render budget)
  estesa al consumer reale (oggi è solo unit-level)
- StackBlitz template TW: verifica end-to-end del provisioning (oggi
  Sprint 1 ha shippato il launcher + project builder, ma non abbiamo
  cliccato il bottone su un live site né validato che il sandbox
  bootstrappa pulito su prima invocazione)
