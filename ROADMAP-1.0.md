# Roadmap verso `1.0.0`

> **Punto di partenza:** `0.3.0-beta` docs-lab (preparato il 2026-05-14 —
> VersionBadge + sezione Releases navigabile + StackBlitz "open in
> sandbox" sulle demo + esempi live Zod/FieldArray) e `0.2.1-beta`
> dei pacchetti (bug-fix release: `DashForm` resolver passthrough +
> `DashFormProvider` SSR-safe `useForm()`); precedente `0.2.0-beta` del
> 2026-05-14 con public-API freeze su `DashFormBridge`, rimozione dei 4
> field deprecated, `@internal` markers, primo `MIGRATION.md`;
> `0.1.9-alpha` con test coverage + docs polish; `0.1.8-alpha` con
> packaging completion; `0.1.7-alpha` con MUI v9 slotProps migration;
> `0.1.6-alpha` con CR fixes #1/#2/#3, per-field subscriptions,
> auto-reset policy, DateTimePicker time-mode fix).
>
> **Obiettivo:** raggiungere `1.0.0` con API pubblica congelata, debito tecnico
> pagato, CI che blocca le regressioni e documentazione versionata.
>
> **Repo coinvolti:**
> - `~/projects/web/dashforge` (le 7 librerie `@dashforge/*`)
> - `~/projects/web/dashforge-docs-lab` (app pubblica di documentazione)
> - `~/projects/web/learn/dash` (consumer di riferimento per smoke test)
>
> **Vincolo:** monoutente sul consumer (`learn/dash`). Le voci sono pesate
> tenendo conto che non c'è una community esterna da supportare oggi, ma la
> docs-lab è esposta pubblicamente quindi va trattata con cura editoriale.

---

## 🔴 MUST — blockers per 1.0 (no skip)

### Codice / fix tecnici

- [x] **MUI v9 deprecation cleanup** — ✅ chiuso in **`0.1.7-alpha`** (2026-05-11).
  - `InputProps` → `slotProps.input`
  - `inputProps` → `slotProps.htmlInput`
  - `inputRef` → `slotProps.htmlInput.ref` (TextField family) /
    `slotProps.input.ref` (SwitchBase family)
  - `InputLabelProps` → `slotProps.inputLabel`

  Peer dep `@mui/material` bumpato da `^7.0.0` a `^9.0.0` in `@dashforge/ui` e
  `@dashforge/theme-mui`. Console del consumer ora pulita (0 deprecation
  warning). Vedi `CHANGELOG.md` sezione `[0.1.7-alpha]` per il dettaglio.

- [x] **Stringa stantia in `Autocomplete` `warnUnresolvedValue`** — ✅
  chiuso in `0.1.8-alpha` (2026-05-13). Messaggio corretto in
  `Autocomplete.tsx` e `Select.tsx`: ora cita correttamente
  l'auto-reset introdotto in `0.1.6-alpha`.

- [x] **Typecheck pulito sui test files (Opzione A + B applicate)** —
  parzialmente chiuso. In `0.1.9-alpha` (Opzione A: non-null assertion
  + guards). In `0.1.10-internal` (Opzione B: DOM lib in
  `tsconfig.spec.json` + annotazioni esplicite `ReactionWhenContext` /
  `ReactionRunContext` / `HarnessTrigger` in `reactionIntegration.test.tsx`).
  Risultato: forms typecheck 43 → 20 errori; ui typecheck 86 → 40
  (gli ultimi 20+40 sono TS6305 "composite/dist mismatch" tra rollup
  `dist/src/*.d.ts` e `tsconfig.lib.json` `rootDir: src` — Cat 3
  deferred a una release di rollup/composite cleanup separata; non
  blocca build/test/release).

### API freeze

- [x] **Audit del `DashFormBridge` interface** — ✅ chiuso in
  `0.2.0-beta` (2026-05-14, in staged). 9 metodi promossi da `?:`
  optional a required (`register`, `unregister`, `getValue`, `setValue`,
  `getError`, `isTouched`, `isDirty`, `submitCount`, `subscribeField`).
  I 4 field `@deprecated` (`errorVersion`, `touchedVersion`,
  `dirtyVersion`, `valuesVersion`) rimossi dall'interfaccia E dalla
  produzione lato `DashFormProvider`. La tier runtime
  (`getFieldRuntime` / `setFieldRuntime` / `subscribeFieldRuntime`) e
  `debug` restano opzionali per consentire bridge alternativi. Vedi
  `MIGRATION.md` sezione `0.1.9-alpha → 0.2.0-beta`.

- [x] **Public surface audit** — ✅ chiuso in `0.2.0-beta` (2026-05-14,
  in staged). `@internal` markers JSDoc applicati sui candidati:
  - `@dashforge/forms`: `FormEngineAdapter`, `IFormEngineAdapter`,
    `FormEngineAdapterOptions`, `createRuntimeStore`,
    `DEFAULT_FIELD_RUNTIME`, `RuntimeStore`, `createReactionRegistry`,
    `ReactionRegistry`.
  - `@dashforge/ui-core`: `DependencyTracker`, `RuleEvaluator`,
    `DependencyGraph`, `DependencyTrackerConfig`,
    `RuleEvaluatorConfig`, `EvaluationStats`, l'intera API store
    low-level (`createStore`, `resetStore`, depth helpers, `Store`,
    `StoreConfig`, `StoreMetadata`), `createMockRHFResult` (test-only).

  I simboli restano esportati per backward compat — il marker informa
  che possono spostarsi su subpaths (es. `@dashforge/ui-core/internal`)
  in `0.3.0-beta` o `1.0.0`.

- [x] **Risolvere conflitti naming** — ✅ chiuso in `0.1.9-alpha`
  (2026-05-13) con JSDoc "decision tree" identica su
  `useDashFieldMeta` / `useDashFieldNode` / `useDashRegister` + `@see`
  cross-references. Riconfermato in `0.2.0-beta` (i 3 hook restano i
  3 hook canonici, ciascuno con responsabilità ben definita).

### Test coverage

- [x] **Aggiungere unit test per `bridge.unregister`** — ✅ chiuso in
  `0.1.9-alpha` (2026-05-13). 5 nuovi test in
  `forms/src/core/DashFormProvider.unregister.test.tsx` coprono: API
  esposta, mount registra engine node, `unregister(name)` diretto
  rimuove engine node + RHF value, real-unmount via deferred-microtask
  cleanup pattern, mount → unmount → remount senza stale state.

- [x] **Aggiungere unit test per il `lastValidIsoRef` di DateTimePicker** —
  ✅ chiuso in `0.1.9-alpha` (2026-05-13). 3 nuovi test in
  `ui/src/components/DateTimePicker/DateTimePicker.unit.test.tsx`:
  fallback preserva la data quando bridge ritorna `''`, ref resta
  all'ultimo ISO non-vuoto tra cicli di editing, senza ISO precedente
  il fallback degrada graziosamente a "today".

- [x] **OTPField in browser smoke** — ✅ chiuso nella preparazione di
  `0.1.9-alpha` (2026-05-13). Aggiunto Step 9 nel `TestForm.tsx` del
  testbed consumer con `<OTPField name="otp" length={6} mode="numeric">`,
  `rules={{ required, minLength: 6 }}` e `onComplete` callback.
  Validati: fill (bridge cattura "123456"), required validation
  (`"Code is required"` quando vuoto), submit bloccato in stato invalid.

- [x] **`useDashFieldArray` browser smoke** — ✅ chiuso nella fase di
  preparazione di `0.1.9-alpha` (2026-05-13). Aggiunto Step 8 (`SkillsListField`)
  in `~/projects/web/learn/dash/src/pages/TestForm.tsx` come testbed
  permanente. Validati: append / remove / move / edit (text + radio dentro
  array) / validation array-level (`rules={{ required }}` su
  `skills.N.name`) / submit payload pulito / stable id `field.id` per
  React key (no remount tra rerender). 26 unit test esistenti +
  consumer smoke = feature production-grade per i casi standard.

---

## 🟡 SHOULD — fortemente raccomandato per 1.0

### Documentazione

- [x] **README per ciascuno dei 7 package** — ✅ chiuso in `0.2.0-beta`
  (2026-05-14, in staged). I 7 README esistevano già; in 0.2.0-beta
  sono stati enhanced con: (a) sezione "Documentation" che linka
  package CHANGELOG, top-level CHANGELOG, MIGRATION.md e roadmap; (b)
  peer-dep range corretti (theme-mui e ui ora citano `@mui/material@^9.0.0`
  invece dello stantio `^7.0.0`); (c) `ui/README.md` riscritto per
  usare i nomi reali esportati (`TextField`/`Select`/`Checkbox` invece
  dei fake `DashTextField`/`DashSelect`/`DashButton` del boilerplate);
  (d) range `@dashforge/* @^0.2.0-beta`.

- [x] **CHANGELOG.md per ogni package** — ✅ chiuso in `0.1.8-alpha`
  (2026-05-13). Tutti e 7 i pacchetti hanno un CHANGELOG.md root +
  copia rollup nella dist tarball. In `0.2.0-beta` ogni CHANGELOG ha
  ricevuto la sua sezione `[0.2.0-beta]` con dettagli scope (`forms`,
  `ui`, `ui-core` ricchi; gli altri 4 versione bump only).

- [x] **Migration guide `MIGRATION.md` al top-level** — ✅ chiuso in
  `0.2.0-beta` (2026-05-14, in staged). Primo file `MIGRATION.md` al
  root del repo con la prima sezione `0.1.9-alpha → 0.2.0-beta`:
  contract diff table, pattern migrations (version-string →
  per-field; double-`?.` → single-`?.`; mock bridge pattern), spiega
  cosa significa `@internal` in questa release, ed elenca cosa NON
  cambia. Linkato da tutti e 7 i README.

- [ ] ~~**API reference auto-generata** (TypeDoc)~~ — **SPOSTATO A NICE.**
  Cos'è: TypeDoc legge il TypeScript dei sorgenti ed emette
  automaticamente un sito HTML con la doc tipata (interfaces, props,
  function signatures). Pattern usato da MUI per la sezione "API" di ogni
  componente (es. `mui.com/material-ui/api/text-field/`). Per
  dashforge, le demo MDX della docs-lab coprono già il caso "human
  readable" → TypeDoc sarebbe utile ma ridondante per single-user.
  Vedi sezione NICE.

- [ ] **Performance docs (interactive benchmark)** — la "fewer renders than
  plain RHF" è la promessa core di Dashforge. Oggi NON documentata
  empiricamente. Proposta concreta:
  - Una pagina `/performance` su `dashforge-docs-lab` con un benchmark
    **interattivo embedded**
  - Form con N campi (configurable), contatori di render per ciascun campo
    via `React.Profiler`
  - Toggle "Use Dashforge / Use plain RHF" → si vede live la differenza
  - Numeri concreti in tabella: "10 keystroke sul campo X → render
    rilevati per campo, Dashforge vs RHF puro"
  - Il codice del benchmark è esso stesso aprilabile in CodeSandbox
    (riusa il pattern delle altre demo)

  Valore: strumento di marketing tecnico tangibile. Dimostra la USP del
  progetto. Riusabile per blog post / talk / showcase.
  Effort: 6-8 ore (codice benchmark + UI + interpretazione risultati).

- [ ] **Gestione documentazione per versione su `dashforge-docs-lab`** —
  l'app docs vive in un repo separato (`~/projects/web/dashforge-docs-lab`)
  e oggi documenta "lo stato corrente" senza alcuna nozione di versione.
  Per la 1.0 vogliamo che i lettori possano:
  - Capire **quando** una feature/fix è stata introdotta
  - Navigare la cronologia delle modifiche come una "storia" del progetto
  - Sapere cosa è cambiato rispetto alla versione che usano (migrazione)

  **Approccio ibrido raccomandato** (somma di tre layer):

  1. **Inline annotations sui componenti** — accanto alla doc di una prop o
     di un comportamento aggiunto/modificato, badge tipo
     `Added in 0.1.6-alpha` / `Changed in 0.1.7-alpha`. Stile MUI
     (`/since/added/changed` decorators). Vantaggio: zero context-switch per
     chi cerca "questo widget cosa fa adesso e quando è apparso".
     Implementazione: un componente `<VersionBadge since="0.1.6-alpha" />`
     riusabile, plus convenzioni MDX (es. ":::info[since 0.1.7]" callouts).

  2. **Sezione "Releases" cronologica globale** — una pagina di alto livello
     (`/releases` o `/changelog`) che funge da story time del progetto:
     pesca dal `CHANGELOG.md` top-level del repo `dashforge`, lo formatta
     in MDX, ogni versione è una sub-pagina con sezioni
     Added/Changed/Fixed/Migration. Ottimo per chi viene da una versione
     vecchia e vuole un colpo d'occhio complessivo.

  3. **Migration guides dedicate** — al momento niente (0.1.6→0.1.7 è
     stato 100% backwards-compatible) ma serviranno a partire dalla
     `0.2.0-beta` (public-API freeze + bridge non-optional). Pagine
     dedicate, separate dal changelog, con esempi before/after.

  **Source of truth:** il `CHANGELOG.md` del repo `dashforge` resta
  l'autorità unica. La docs-lab lo importa o lo proietta (anche
  manualmente, finché il volume è gestibile) — niente changelog
  duplicato/divergente.

  File da creare/toccare in `dashforge-docs-lab`:
  - `src/components/VersionBadge.tsx` — componente badge riusabile
  - `src/docs/content/releases/` — nuova sezione changelog navigabile
  - Aggiornamento delle MDX dei singoli componenti per inserire i badge
    sulle feature versionate
  - Routing + navigation per la nuova sezione "Releases"

  Effort stimato: 4-6 ore (componente VersionBadge + struttura cronologia +
  prima passata di annotazioni). Da fare prima di pubblicare la docs come
  "official" del progetto.

- [ ] **Link "Open in CodeSandbox" sulle demo di `dashforge-docs-lab`** — ogni
  demo componente (es. `src/docs/demos/autocomplete/*`) deve avere un
  pulsante "Try in CodeSandbox" (o StackBlitz come alternativa) che apre la
  demo live in un sandbox editabile, con i pacchetti `@dashforge/*`
  installati da npm registry.

  **Cosa abilita questo:**
  - L'utente prova un componente in 5 secondi **senza setup locale** (no
    clone, no install, no MUI peer setup)
  - I bug report diventano riproducibili: invece di "ho un problema con
    Autocomplete", l'utente fork-a il sandbox della doc e lo modifica fino
    a riprodurre il bug, poi linka la fork nell'issue
  - "Live code editing" sulla doc: l'utente può sperimentare modificando le
    props direttamente nel sandbox embedded

  **Pre-requisito che abbiamo GIÀ sbloccato** (release 0.1.7-alpha): il
  dist-tag `latest` punta a una versione installabile. CodeSandbox può
  fare `npm install @dashforge/ui` senza specificare tag/versione e
  ottiene la 0.1.7-alpha automaticamente.

  **Approccio implementativo (2 opzioni):**

  1. **CodeSandbox Define API** (`https://codesandbox.io/api/v1/sandboxes/define`)
     — POST con un payload JSON che descrive `package.json` + i file della
     demo + `main` entry. Restituisce un URL. Più "vendor-locked" su
     CodeSandbox ma è il flusso standard.

  2. **StackBlitz SDK** (`@stackblitz/sdk`) — `StackBlitz.openProject({...})`
     dal codice JS della docs. Funziona anche embedded. Più moderno e
     "WebContainer-based" (gira anche offline nel browser).

  Decisione consigliata: **StackBlitz** per i seguenti motivi:
  - WebContainer è più veloce a partire (no boot di una VM remota)
  - Funziona anche con peer deps complesse come `@mui/material@^9`
  - Embed inline nella doc è più pulito (`<iframe>` ufficiale)

  **Componente da creare:** un `<TryInSandboxButton demo="autocomplete" />`
  riusabile che apre lo specifico sandbox di una demo. La mappa
  `demo → files[]` può essere generata build-time da `src/docs/demos/*`.

  **File da creare/toccare in `dashforge-docs-lab`:**
  - `src/components/TryInSandboxButton.tsx` — button + integration SDK
  - `src/utils/sandbox-payload.ts` — builder che da una cartella `demos/X`
    produce il payload `{files, deps, openFile}` per StackBlitz/CodeSandbox
  - Aggiornamento delle MDX dei singoli componenti per inserire il button

  Effort stimato: 3-5 ore (SDK integration + utility builder + prima
  passata su 3-4 demo come prova). Una volta che il pattern funziona,
  estensione alle altre demo è ~10 min ciascuna.

### Esempi

> **Politica esempi:** niente nuove app dentro il monorepo `dashforge`
> (il monorepo va già snellito — vedi la voce "Eliminare progetto `web`").
> Gli esempi vivono su **CodeSandbox/StackBlitz** (embedded nelle demo
> della docs-lab) e su **starter-kit dedicati** (repo o template
> scaricabili). Questo riduce la superficie da mantenere e allinea gli
> esempi alla versione npm pubblicata.

- [ ] **Esempio Zod resolver in docs-lab** — la `DashFormProvider` accetta
  resolver da `0.1.5-alpha`, ma non c'è un esempio funzionante in doc.
  Aggiungere un sample completo su `dashforge-docs-lab/src/docs/demos/`
  con form realistico + schema Zod + behavior di validazione live.
  Diventa anche un sandbox aprilabile via il button "Try in CodeSandbox"
  (cfr. voce sulla integrazione StackBlitz/CodeSandbox).

- [ ] **Esempio `useDashFieldArray` in docs-lab** — stesso approccio: una
  demo "todo list dinamica" (add/remove/move) su
  `dashforge-docs-lab/src/docs/demos/`, sandbox-able via il button.
  Mostra che la feature esiste e come si usa.

- [x] ~~**Pulire `~/projects/web/learn/dash` come `examples/basic-form` nel
  monorepo**~~ — **SCARTATO.** Decisione strategica: niente nuove app nel
  monorepo. `learn/dash` resta come testbed personale separato. Gli esempi
  vanno tutti su CodeSandbox/StackBlitz embedded nella docs-lab.

### Starter-kit (priorità strategica)

- [ ] **Investire sugli starter-kit scaricabili** — alternativa agli "examples
  in monorepo": template di app completi (es. "dashforge + Vite + Zod",
  "dashforge + Next.js", "dashforge + Tanstack Query") che un utente può
  scaricare/clonare in un colpo solo e che valgono come prima esperienza
  completa con la libreria. Già esiste una struttura
  `dashforge-docs-lab/dist/starter-kits/` da consolidare/estendere.

  Razionale (parole tue): "se non li faccio non incassero mai" — gli
  starter-kit hanno potenziale di ritorno indiretto nel tempo (lead,
  visibilità, eventuali sponsorship/templates premium) ma richiedono
  investimento upfront per essere creati e mantenuti coerenti con le
  release dashforge.

  Effort stimato (per starter-kit): 4-8 ore ciascuno (setup app + scelta
  pattern + README + verifica end-to-end). Inizio consigliato: 1 starter-kit
  "showcase" che dimostra tutte le feature core (form bridge, RBAC, theme,
  reactions). Espandere a 2-3 quando la 1.0 sarà pubblicata.

### Cleanup monorepo

- [ ] **Eliminare progetto `web` (vecchio docs)** — il monorepo dashforge
  ha un'app `web` legacy (vecchia doc, pre-docs-lab). È superflua e ingombra.
  Comando target:
  ```bash
  pnpm nx generate @nx/workspace:remove web --forceRemove
  ```
  Verificare che nessun import/dipendenza del workspace ci punti ancora,
  poi confermare. Riduce confusione + abbassa il tempo di
  `pnpm install` / `nx graph`.

### CI / Release

- [ ] **GitHub Actions** (o equivalente) che girino **automaticamente** su ogni
  push:
  - `nx affected -t test`
  - `nx affected -t typecheck`
  - `nx affected -t build`
  - `nx affected -t lint`

  **Costo:** **GRATIS** per repo pubblici (kensaadi/dashforge è pubblico → 0 €).
  Solo i repo privati hanno il limite di 2000 min/mese gratis. Verificabile
  con `gh repo view kensaadi/dashforge --json visibility`.

  Oggi gira tutto manualmente — un test rotto può sfuggire (la 0.1.7-alpha
  aveva 19 test rotti dopo il bump MUI v9, scoperti solo perché ho
  rilanciato i test localmente prima del publish; senza quello sarebbe
  finita rotta su npm).

- [ ] ~~**Pre-commit hook** (husky/lefthook)~~ — **SCARTATO.** Con la CI
  GitHub Actions in place, il pre-commit aggiunge solo ~5-15 secondi di
  attesa per commit senza beneficio incrementale (CI gira comunque sui
  push). Inoltre fastidioso per commit "wip" intermedi.

- [ ] **Versioning automatizzato** via `nx release` con conventional commits.
  Oggi `nx.json` ha `"conventionalCommits": false` — accenderlo per 1.0 così i
  bump sono tracciabili dal log.

- [ ] **Verifica `tsbuildinfo` e `.html` di coverage NON in git** — `git
  status` mostra circa 20 file `.html` di coverage modificati. Vanno in
  `.gitignore`.

### Stabilità

- [ ] ~~**Stress test concurrent / Suspense**~~ — **SPOSTATO A NICE.**
  Verificare che il bridge regga sotto React 19 `useTransition` /
  `Suspense`. Non urgente: il consumer di riferimento è una Vite SPA
  senza Suspense espliciti. Vedi NICE.

- [ ] ~~**SSR smoke test**~~ — **SPOSTATO A NICE.** Verifica che
  `DashFormProvider` non esploda dentro `renderToString()` (es. Next.js).
  Non rilevante finché il consumer è Vite client-side. Vedi NICE.

- [ ] **Strict bundle size budget** per ogni package — **ALTA PRIORITÀ
  con MUI v9.** MUI da solo è ~300+ KB e un singolo import sbagliato
  (`import * as MUI from '@mui/material'` invece di
  `import TextField from '@mui/material/TextField'`) trascina dentro
  TUTTO il bundle MUI. Senza un budget, te ne accorgi solo quando il
  consumer si lamenta "la mia app pesa 5MB".

  Stato attuale: `@dashforge/ui` = 384 KB ESM uncompressed.
  Setup: `pnpm add -D size-limit @size-limit/preset-app` + file
  `.size-limit.json`:
  ```json
  [
    { "path": "libs/dashforge/ui/dist/index.esm.js", "limit": "400 KB" },
    { "path": "libs/dashforge/forms/dist/index.esm.js", "limit": "250 KB" }
  ]
  ```
  A ogni build, lo strumento verifica e fallisce il job CI se supera.
  Effort: ~1 ora.

---

## 🟢 NICE — utile ma non bloccante

- [ ] ~~**Storybook per i componenti UI**~~ — **SCARTATO**. Stessa scelta di
  MUI (mui.com non usa Storybook): la `dashforge-docs-lab` con le demo MDX
  + i link CodeSandbox/StackBlitz coprono già showcase, interactive props
  e fork-and-modify. Storybook sarebbe lavoro duplicato e tooling overhead
  senza valore aggiunto reale per il caso single-user.

- [ ] **API reference auto-generata (TypeDoc)** — emette automaticamente
  un sito HTML con la doc tipata di interfaces/props/function signatures
  dai sorgenti TypeScript (stile MUI `mui.com/material-ui/api/...`).
  Ridondante con le demo MDX della docs-lab per single-user; utile se in
  futuro vuoi pubblicare la doc API in formato "professional reference".
  Effort: 4-6 ore + scrittura JSDoc nei sorgenti.

- [ ] **Visual regression test** — Playwright snapshots sui sample della
  `dashforge-docs-lab` (non sui componenti isolati, visto che non c'è
  Storybook). Catturare la home + le pagine demo come baseline e
  diffare ad ogni PR. Soluzione open-source = Playwright nativo; soluzione
  hosted = Argos CI o Percy.

- [ ] **Stress test concurrent / Suspense** — verificare che il bridge regga
  sotto React 19 `useTransition` / `Suspense`. Pertinente solo se in futuro
  il consumer adotterà Suspense per data loading. Per Vite SPA attuale, non
  urgente.

- [ ] **SSR smoke test** — verifica che `DashFormProvider` non esploda dentro
  `renderToString()` (es. Next.js). Pertinente solo se in futuro Dashforge
  verrà usato in app SSR. Effort: ~1.5 ore quando servirà.

- [ ] **A11y audit** — `axe-core` automation o manual con screen reader.
  Specifico per i componenti basati su MUI dovrebbero essere a posto, ma RBAC
  `disabled`/`readonly`/`hidden` può creare confusione (es. gli annunci agli
  screen reader cambiano ruolo).

- [ ] **i18n** dei messaggi di errore Dashforge-emitted (oggi solo inglese
  hardcoded — `"Email is required"`, warning vari). Pattern: `i18nKey` su ogni
  rule.

- [ ] **Esempio Yup** + esempio **Joi** resolver, se vuoi posizionarti come
  "schema-agnostic".

- [ ] **TypeScript `strict` audit** — verificare che tutti i `any`, `as
  unknown`, `// @ts-ignore` nel codice siano legittimi e documentati (oggi ce
  ne sono parecchi, soprattutto nel core).

- [ ] **Engine docs** — `@dashforge/ui-core` ha un `Engine`, `RuleEvaluator`,
  `DependencyTracker`: sono concetti centrali ma totalmente non documentati al
  momento. Per la 1.0 vanno spiegati.

- [ ] **Pacchetto `@dashforge/devtools`** opzionale — un visualizzatore
  in-browser dello stato del bridge / engine / runtime store. Utile per debug.

---

## 📋 Versioning roadmap proposta

| Versione         | Contenuto principale                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| `0.1.6-alpha`    | ✅ rilasciata (CR fixes + per-field subs + auto-reset)                    |
| `0.1.7-alpha`    | ✅ MUI v9 slotProps migration (peer dep ^9.0.0, console pulita)           |
| `0.1.8-alpha`    | ✅ packaging completion (CHANGELOG.md nei tarball) + stringa stantia Autocomplete corretta |
| `0.1.9-alpha`    | ✅ rilasciata (bridge.unregister test + lastValidIsoRef test + OTPField smoke + JSDoc decision tree + Opzione A typecheck cleanup) |
| `0.2.0-beta`     | ✅ rilasciata (DashFormBridge interface freeze: 9 metodi required + 4 deprecated removed; `@internal` markers su FormEngineAdapter / RuntimeStore / ReactionRegistry / DependencyTracker / RuleEvaluator / store helpers; semplificazione `bridge.method?.()` → `bridge.method()` su 14 file; MIGRATION.md primo file al top-level; 7× README enhanced) |
| `0.2.1-beta`     | ✅ preparata in staged (bug-fix release: `DashForm` resolver passthrough fix + `DashFormProvider` SSR-safe `useForm()` incondizionato; +4 regression test in `DashForm.test.tsx`; entrambi i bug emersi costruendo le demo live della docs-lab) |
| `0.3.0-beta`     | ✅ preparata in staged — docs-lab versionata (`VersionBadge` component + sezione "Releases" navigabile con 6 pagine MDX dalla 0.1.6 alla 0.2.1 + StackBlitz "open in sandbox" sulle demo `ComponentPreview` + esempi live Zod resolver e `useDashFieldArray`; bump deps docs-lab a 0.2.1-beta; build SSG verde, 42 pagine) |
| `0.4.0-rc`       | GitHub Actions CI + bundle budget + cleanup monorepo (rimuovi `web`)      |
| `0.5.0-rc`       | performance benchmark interattivo nella docs-lab                          |
| **`1.0.0`**      | 🎉 release stabile                                                        |
| post-1.0         | starter-kit ufficiali, TypeDoc, visual regression, a11y audit, i18n       |

Niente salti diretti da alpha a 1.0. Ogni passaggio è un'occasione per
validare un sottoinsieme del contratto.

---

## 🧮 Suggerimento pragmatico (focus 1.0 single-user)

Visto che sei l'unico consumer e che la priorità strategica è **"1.0 stabile
+ buona doc + starter-kit"** (parole tue), il piano è già snellito:

**Cosa fa parte di "1.0":**
1. **MUST chiusi tutti** (bridge interface freeze, public API audit,
   naming, test mancanti, typecheck pulito) — ~10-15 ore
2. **CI automatica GitHub Actions** (gratis su repo pubblico) — blocca
   regressioni come quella che avevamo intercettato con i 19 test rotti
   in 0.1.7-alpha → ~3-4 ore
3. **Bundle budget** (critico con MUI v9) — ~1 ora
4. **Doc versionata + CodeSandbox links sulle demo** — la "buona doc" che
   hai citato → ~7-11 ore (su `dashforge-docs-lab`)
5. **README + CHANGELOG per i 7 package + MIGRATION.md** — il minimo
   editoriale → ~5 ore
6. **Cleanup monorepo** (rimuovi `web` legacy) → ~1 ora
7. **Performance docs interattive** (la USP del progetto) → 6-8 ore

**Cosa NON fa parte di "1.0":**
- Storybook (scartato — la docs-lab fa già il suo lavoro)
- Pre-commit hook (scartato — CI è sufficiente)
- TypeDoc / API reference auto-generata (NICE)
- SSR / Concurrent test (NICE)
- a11y audit, i18n, visual regression (NICE)
- Esempi in monorepo (decisione tua: niente nuove app, solo
  CodeSandbox + starter-kit separati)

**Cosa investire DOPO 1.0** (priorità strategica tua):
- **Starter-kit** scaricabili (potenziale ritorno indiretto nel tempo —
  parole tue: "se non li faccio non incassero mai")

**Effort totale verso 1.0:** ~35-45 ore di lavoro effettivo = **5-7 fine
settimana** a cadenza part-time, oppure ~1.5 settimane full-time.

---

_Documento creato il 2026-05-10 a chiusura del ciclo `0.1.6-alpha`.
Aggiornato il 2026-05-11 (post 0.1.7-alpha + revisione strategica:
no app in monorepo, focus starter-kit, esclusi Storybook/pre-commit)._
