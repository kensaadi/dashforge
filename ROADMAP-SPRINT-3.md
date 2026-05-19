# Sprint 3 — Roadmap

> Drafted 2026-05-18, immediately after closing Sprint 2 (which
> shipped `@dashforge/tw 0.3.0-beta` to npm + GitHub Release with
> proper descriptive title, refactored `publish-prepared.mjs` to
> eliminate the Sprint 1 OTP pain, validated end-to-end in the `dash`
> consumer app, and closed two WCAG gaps — AppShell focus trap +
> `prefers-reduced-motion`).

**Tema dello sprint.** La lib è in `0.3.0-beta` con 24 component
stabili, bridge solido, end-to-end validata in `dash`, bundle e
render-perf entro budget. Il vero blocker per l'adozione dei prossimi
3 mesi **non è "più component"**, **non è "più veloce"**, **non è "switch
guide MUI↔TW"** (scartata: nessun customer reale switcha tra
ecosystem, è una user story ipotetica). Il vero blocker è la
**documentazione di secondo livello** + parity audit interno + un
batch di Tier-4 component nice-to-have.

**Release goal.** `@dashforge/tw 0.4.0-beta` (minor bump per i 5 nuovi
component Tier-4 + nuovo `useDialog` hook + `DialogProvider`).

**Stima.** ~30h spalmate su una settimana (2026-05-19 → 2026-05-25).

---

## Contesto architetturale (correzione post-Sprint 2)

I due ecosystem **non coesistono** nella stessa app consumer. Una
product app sceglie MUI (`@dashforge/ui`) **oppure** Tailwind
(`@dashforge/tw`), mai entrambi insieme. Il **bridge layer**
(`@dashforge/forms` + `@dashforge/rbac` + `@dashforge/ui-core`) è la
portabilità della **business logic** — non del rendering.

Conseguenze sul piano:

- **Switch story scartata**. Niente migration guide MUI→TW, niente
  codemod jscodeshift, niente counter-pattern callout "do NOT mix".
  Doc-debt per un'utenza che non esiste.
- **Parity audit (P1) resta**, ma con motivazione interna riformulata:
  serve a Dashforge come product company (due kit MUI + TW da
  mantenere paritari), non ai customer per switchare.
- **Coexistence pattern** è limitato al **docs lab** stesso, che è
  showcase per definizione (renderizza entrambi side-by-side).

---

## Decisione di design risolta in pre-sprint: `sx` vs `slotProps`

Discussione chiusa: **keep both, no refactor**. La lib mantiene
entrambi i prop perché coprono ruoli ortogonali e non sovrapposti:

- **`sx?: string`** — escape hatch root-level, su 15+ component.
  Stringa di utility Tailwind appesa dopo le classi variant. Conflict
  resolution garantita via `tailwind-merge` (testata in
  `Button.test.tsx`: *"sx overrides a conflicting variant class via
  tailwind-merge"*). Sostituisce `className`, che è intenzionalmente
  omesso (`Omit<…, 'className'>`) per forzare l'override path
  canonico.
- **`slotProps?: { … }`** — escape hatch per-slot, su 16 component
  multi-slot. Tipizzato per-slot, ogni slot accetta `{ className? }`
  (con `children?` per `prefix`/`suffix` di TextField).

Decision tree:

| Voglio… | Uso |
|---|---|
| Modificare il wrapper esterno | `sx` |
| Modificare un sotto-elemento (label, helperText, input, …) | `slotProps.<slot>.className` |
| Iniettare contenuto in `prefix` / `suffix` di TextField | `slotProps.prefix.children` |

Niente refactor di rename. La decisione si traduce in **doc** (P2).

---

## P1 — MUI ↔ TW component parity audit 🆕 (~6h)

Diff sistematico tra `@dashforge/ui` (MUI) e `@dashforge/tw` (TW) per
i component bridge-integrated. Per ognuno verificare:

1. **Signature parity** — ogni prop pubblica accettata da entrambi?
2. **Behavior parity** — stesso bridge contract (`onChange` vs bridge
   `setValue`), stesso RBAC integration, stesso default value handling?
3. **Variant axis parity** — `size` / `variant` / `color` valori
   accettati dalle due lib coincidono al call-site level?

Componenti in scope:

| Component | Stato lib `@dashforge/ui` | Stato lib `@dashforge/tw` |
|---|---|---|
| Button | ✓ | ✓ |
| TextField | ✓ | ✓ |
| Checkbox | ✓ | ✓ |
| Switch | ✓ | ✓ |
| RadioGroup | ✓ | ✓ |
| Textarea | ✓ | ✓ |
| NumberField | ✓ | ✓ |
| OTPField | ✓ | ✓ |
| Autocomplete | ✓ | ✓ |
| DateTimePicker | ✓ | ✓ |

**Output.** Nuovo file `libs/dashforge/tw/PARITY.md` (stessa shape di
`A11Y.md` di Sprint 2) con tabella per-componente:

| Componente | Signature | Behavior | Variant axis | Delta documentate |
|---|---|---|---|---|
| Button | ✓ / ⚠ / ✗ | ✓ / ⚠ / ✗ | ✓ / ⚠ / ✗ | descrizione delta + motivazione |

Le delta intentional (es. TW non espone `variant="standard"` di MUI
perché design choice esplicita) vanno documentate. Le delta non
intentional diventano follow-up issue (file in Sprint 4 o earlier
fix se trivial).

**Motivazione (revised, post-Sprint 2):**

- ✗ NON serve per "customer migration" — è una use case che non
  esiste.
- ✓ **Internal consistency**: previene drift silenzioso tra le due
  lib. Un refactor su `@dashforge/ui` che non landa su
  `@dashforge/tw` diventa invisibile senza l'audit.
- ✓ **Bridge contract validation**: verifica che lo stesso
  `@dashforge/forms` schema funzioni davvero identico su entrambe.
- ✓ **Foundation per Sprint 5 starter kits**: due kit
  parallel-maintainable richiedono component paritari al call-site
  level.

---

## P2 — Customization escape hatch playbook 🆕 (~5h)

Sostituisce la "switch guide" di Sprint 3 P2 originale (scartata).

Nuova doc page in `dashforge-docs-lab`:
**`/docs/guides/customization.mdx`**.

Risolve i due wall che un adopter colpisce nelle prime due settimane:

1. *"Come modifico lo stile del component X senza riscriverlo?"*
2. *"Come estendo i token / la palette del mio brand senza forkare
   `@dashforge/tw-theme`?"*

### Struttura della pagina

**§1 — Why two override paths? (~150 words)** — apre con il rationale
del design `sx` + `slotProps`. Spiega esplicitamente:
- Perché `sx` invece di `className` (semantica `tailwind-merge`
  garantita, signaling chiaro "escape hatch")
- Perché `slotProps` invece di descendant CSS selectors (typing,
  explicit per-slot surface, no fragile selector chain)

Un dev TW-native trova subito la risposta a "perché non `className`?".

**§2 — `sx` vs `slotProps` decision tree + 4 esempi canone:**

```tsx
// 1. Margine / shadow sul wrapper esterno → sx
<Button variant="solid" sx="ml-4 shadow-xl">Save</Button>

// 2. Stile su un sotto-elemento → slotProps
<TextField
  name="email"
  helperText="We never share your email"
  slotProps={{ helperText: { className: 'italic text-sky-600' } }}
/>

// 3. Conflict resolution garantita (regola TESTATA)
// variant="solid" + color="primary" → bg-primary-500
// sx="bg-red-500" → tailwind-merge → bg-red-500 vince
<Button variant="solid" color="primary" sx="bg-red-500">
  Danger override
</Button>

// 4. sx + slotProps insieme (ortogonali)
<TextField
  name="amount"
  label="Importo"
  sx="max-w-xs"
  slotProps={{
    label: { className: 'uppercase tracking-wide' },
    input: { className: 'tabular-nums' },
    prefix: { children: '€' },
    suffix: { children: 'EUR' },
  }}
/>
```

Più tabella per-slot dei top-5 component più stylable: TextField,
Button, Autocomplete, Switch, LeftNav.

**§3 — Extending the preset.** Pattern
`extendPreset({ colors: { brand: { … } } })` per:
- Brand color del cliente (senza forkare `@dashforge/tw-theme`)
- Override spacing scale custom
- Custom font stack
- Aggiungere un'intent color nuovo (es. `info`) e farla riconoscere
  dalle variant API

**§4 — Building custom components on top of the bridge.**
Mini-tutorial: "voglio un `PhoneInput` che usa il bridge ma
renderizza la mia UI". Mostra:
1. Registrare il field via `useDashFormField`
2. Hook-into RBAC via `useAccessState`
3. Ereditare variant API via `tv()` + `tailwind-merge`
4. Esportare types con shape consistente (`<MyComponentProps>`
   pattern)

### Pre-doc check (~30min, blocking)

Prima di scrivere la doc, audit della **consistency dello shape di
`slotProps` cross-component**. Esempio: il `root` slot è esposto
ovunque come `slotProps.root.className`? O qualche component diverge?
Se ci sono divergenze, sanate prima della doc (così la doc non
fotografa una superfice incoerente). Le delta intentional vanno
documentate esplicitamente in tabella nella §2.

---

## P3 — Tier-4 components 🆕 (~14h)

5 component nuovi che chiudono il gap con la MUI side. Tutti Radix
UI primitives, tutti con unit test + docs lab MDX page + augmentation
slotProps. Tutti rispettano la `motion-reduce:` policy di Sprint 2.

| Component | Stima | Primitive | Note |
|---|---|---|---|
| **Modal / Dialog** | ~4h | `@radix-ui/react-dialog` | Imperative `useDialog()` provider — stesso pattern di `ConfirmDialog` di Sprint 1. Tre size (`sm` / `md` / `lg`) + asChild trigger. |
| **Tabs** | ~3h | `@radix-ui/react-tabs` | Variant `underline` (default) + `pill`. Orientation horizontal / vertical. |
| **Tooltip** | ~2h | `@radix-ui/react-tooltip` | Placement props standard (top / right / bottom / left). Delay open/close configurabile. |
| **Popover** | ~2h | `@radix-ui/react-popover` | Spesso primitive per altri component consumer-level. |
| **Accordion** | ~3h | `@radix-ui/react-accordion` | `type="single"` + `type="multiple"`. Collapsible toggle. |

**Total surface dopo Sprint 3.** 24 → **29 component** + nuovo
`useDialog` hook + `DialogProvider`.

### Test gate (per ogni Tier-4 component)

- Unit test su tutte le variant axis (almeno una assertion per ogni
  combinazione `variant × size` per i component che le hanno)
- A11Y baseline: ruoli ARIA corretti, focus order, keyboard nav
- `motion-reduce:` policy applicata su qualsiasi transizione visibile
- Docs lab MDX page con almeno 3 demo (default, variant, edge case)

---

## P4 — Performance baseline (measurement only) 🆕 (~3h)

Pre-1.0 commitment: avere numeri stabili da citare in README + docs.
**Solo misura**, niente ottimizzazione prematura.

### Output

- Run `vite-bundle-visualizer` su `dist/index.esm.js`
- Misure da fissare:
  - Full-import gzipped size (post-Tier-4)
  - Tree-shaken sizes per subset rappresentativi:
    - Solo `Button`
    - Form bundle (`TextField` + `Checkbox` + `RadioGroup` + `Switch` +
      `Textarea` + `NumberField`)
    - Layout bundle (`Box` + `Stack` + `Grid` + `Container` +
      `AppShell` + `LeftNav` + `TopBar` + `Breadcrumbs`)
    - Foundation completo
    - Full lib (29 component dopo Tier-4)
- Render perf via React Profiler — mount + update per pagine
  rappresentative (riprende il setup di Sprint 2 P1 in `dash`
  `/test-foundation`)

### Nuovo file `libs/dashforge/tw/PERFORMANCE.md`

Tabelle pubblicate, citate da README. Stessa shape di `A11Y.md` /
`PARITY.md`.

### Budget regression policy

Ogni futuro PR che aumenta il bundle gzipped > 5% richiede
justification esplicita nel CHANGELOG. Soglia testata in CI in
Sprint 4+ (out of scope per Sprint 3).

---

## P5 — Release `@dashforge/tw@0.4.0-beta` 🆕 (~2h)

Bump **minor** per i 5 nuovi exports + nuovo `useDialog` hook +
`DialogProvider`.

### Steps (canonical)

1. `node scripts/prepare-release.mjs --package=@dashforge/tw --version=0.4.0-beta`
2. Fill in `libs/dashforge/tw/CHANGELOG.md` con sezioni:
   - **Added**: 5 component Tier-4 + `useDialog` + `DialogProvider` +
     `PARITY.md` + `PERFORMANCE.md` + customization guide
   - **Internal**: parity audit, performance baseline
3. Fill in `dashforge-docs-lab/.../releases/0.4.0-beta.mdx` (proper
   release notes, NON stub — pattern da memoria
   `feedback_github_release_pattern.md`)
4. `git commit` — review diff
5. `node scripts/publish-prepared.mjs --package=@dashforge/tw --confirm`
6. `git push origin "@dashforge/tw@0.4.0-beta"`
7. **GitHub Release** (pattern da memoria, ora con template stampato
   automaticamente da `publish-prepared.mjs`):
   - Title: `@dashforge/tw 0.4.0-beta — Tier-4 components (Dialog/Tabs/Tooltip/Popover/Accordion) + customization playbook + MUI↔TW parity audit`
   - `--prerelease` flag obbligatorio
   - Body = sezione `[0.4.0-beta]` estratta da
     `libs/dashforge/tw/CHANGELOG.md` via il `awk` recipe in
     `RELEASING.md`

### Release & versioning

| Axis | Pre-`0.4.0` | Post-`0.4.0` |
|---|---|---|
| Public API surface | 24 components + Foundation + bridge hooks | **+5 components (Dialog/Tabs/Tooltip/Popover/Accordion) + `useDialog` hook + `DialogProvider`** |
| Peer deps | `react ^18 \|\| ^19`, `tw-theme workspace`, `tw-tokens workspace` | unchanged |
| Bridge deps | `forms` / `rbac` / `ui-core` `workspace:*` | unchanged |
| New runtime deps | — | `@radix-ui/react-dialog` `@radix-ui/react-tabs` `@radix-ui/react-tooltip` `@radix-ui/react-popover` `@radix-ui/react-accordion` |
| Migration | — | Drop-in. Nessun cambio richiesto sugli usage esistenti. La customization guide è additive (nuova pagina docs, non rompe nulla). |
| Bundle size delta | ~272 KB gzipped (post-0.3.0) | proiezione ~310 KB gzipped (+38 KB / +14%) — entro budget per 5 component Radix-backed |
| Breaking changes | — | **Zero**. La discussione `sx` vs `className` si è chiusa con "keep both, document only" — nessun rename. |

---

## Cosa NON faccio in Sprint 3 (e perché)

- **Switch guide MUI↔TW** — scartata. Use case non esistente, doc-debt
  per un'utenza ipotetica. La memoria fissa che non torno indietro
  sulla decisione (cfr. discussione pre-sprint).
- **Codemod jscodeshift** — superfluo, niente switch da supportare.
- **Counter-pattern callout "do NOT mix MUI + TW"** — implicito dal
  fatto che sono due pacchetti separati con due Provider diversi.
- **Rename `sx` → `className`** — decisione chiusa: i due prop hanno
  ruoli ortogonali, naming attuale comunica correttamente la
  semantica `tailwind-merge`. Documentazione, non refactor.
- **Tier-5 components (DataGrid, Table, Pagination, Skeleton)** —
  Sprint 4.
- **Starter kit repos** (MUI starter + TW starter, separati) —
  Sprint 5. Prerequisito: parity audit di Sprint 3 P1.
- **Performance hardening** (tree-shaking optimization, side-effect-free
  re-exports, granular entry points) — solo dopo che P4 ha misurato
  i bottleneck reali. Non si ottimizza alla cieca.
- **Final A11Y audit con tooling automatico** (axe / lighthouse CI) —
  Sprint 6, parte della `1.0.0-rc.1` preparation.
- **Marketing / positioning pages** ("Why Dashforge vs plain MUI vs
  shadcn") — sessione marketing separata, non tecnica (cfr. memoria
  `marketing_playbook.md`).

---

## Sprint 4-6 ladder (overview, dettaglio quando arriviamo)

| Sprint | Release | Tema |
|---|---|---|
| **Sprint 4** | `@dashforge/tw@0.5.0-beta` | Tier-5: DataGrid + Table + Pagination + Skeleton. Closing parity con MUI's grid story. |
| **Sprint 5** | `@dashforge/tw@0.6.0-beta` + starter kits v1 | Due nuovi repos `dashforge-starter-mui` + `dashforge-starter-tw` (**separati**, NON un repo unico con entrambi). Auth + RBAC + form CRUD + dashboard layout. Business model: kits paid + lib free. |
| **Sprint 6** | `@dashforge/tw@1.0.0-rc.1` → `1.0.0` | Final A11Y audit (axe / lighthouse), bundle size lockdown, breaking change window (rinominazioni / deprecazioni residue), beta freeze 4 settimane, poi cut `1.0.0`. Pubblicazione coordinata su docs lab + LinkedIn (cfr. marketing playbook). |

---

## Quality gate per chiudere Sprint 3

1. ✅ `PARITY.md` esiste, tutti i 10 componenti bridge-integrated
   tabulati, delta intentional documentate
2. ✅ `customization.mdx` pubblicato sul docs lab, 4 esempi canone +
   decision tree + extension preset + bridge custom field tutorial
3. ✅ 5 Tier-4 component shippano: test verdi, MDX page, slotProps
   augmentation
4. ✅ `PERFORMANCE.md` esiste, bundle + render perf documentati
5. ✅ `@dashforge/tw@0.4.0-beta` su npm + GitHub Release con titolo
   descrittivo e `--prerelease` flag (pattern da memoria)
6. ✅ End-to-end smoke test in `dash` consumer: tutti i nuovi
   component mountano e funzionano (replica della Sprint 2 P1 pass
   sui soli component nuovi)

Se uno qualsiasi di questi gate fallisce, lo sprint non chiude — si
fa slippage del singolo P-item, non del release in toto.
