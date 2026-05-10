# Roadmap verso `1.0.0`

> **Punto di partenza:** `0.1.6-alpha` (publish del 2026-05-10 — CR fixes #1/#2/#3,
> per-field subscriptions, auto-reset policy, DateTimePicker time-mode fix).
>
> **Obiettivo:** raggiungere `1.0.0` con API pubblica congelata, debito tecnico
> pagato e CI che blocca le regressioni.
>
> **Vincolo:** monoutente (`~/projects/web/learn/dash`). Le voci sono pesate
> tenendo conto che non c'è una community esterna da supportare oggi.

---

## 🔴 MUST — blockers per 1.0 (no skip)

### Codice / fix tecnici

- [ ] **MUI v9 deprecation cleanup** — i 4 warning sempre presenti in console:
  - `InputProps` → `slotProps.input`
  - `inputProps` → `slotProps.htmlInput`
  - `inputRef` → `slotProps.input.ref` (o gestito via `register.ref`)
  - `InputLabelProps` → `slotProps.inputLabel`

  File toccati: `TextField`, `Textarea`, `NumberField`, `Select`, `Autocomplete`,
  `DateTimePicker`, `OTPField`. Esplicitamente rimandato durante la 0.1.6 — è un
  debito che va saldato prima del 1.0.

- [ ] **Stringa stantia in `Autocomplete` `warnUnresolvedValue`** — il messaggio
  `"...The form value remains unchanged (no automatic reset)"` ora è bugiardo
  (il reset *avviene*).
  - File: `libs/dashforge/ui/src/components/Autocomplete/Autocomplete.tsx`
    (cerca `unresolved value for field`).
  - Aggiornare anche la stessa funzione in `Select` se replicata.

- [ ] **Typecheck pulito su tutti i 4 progetti** — oggi 20 errori pre-esistenti in:
  - `forms/src/core/DashFormProvider.resolver.test.tsx` (`bridge.register`
    possibly undefined, `HTMLInputElement.value` non risolto)
  - `forms/src/reactions/__tests__/reactionIntegration.test.tsx` (`ctx`,
    `trigger` implicit any)

  Decidere: tipizzare i test, o aggiungere `tsconfig` con `lib: ["dom"]` mancante.

### API freeze

- [ ] **Audit del `DashFormBridge` interface**
  (`libs/dashforge/ui-core/src/bridge/DashFormBridge.ts`):
  decidere quali metodi sono **veramente** opzionali (con `?:`) e quali devono
  diventare obbligatori. Oggi `register?:`, `getValue?:`, `getError?:`,
  `setValue?:`, `isTouched?:`, `isDirty?:`, `submitCount?:`, `subscribeField?:`,
  `unregister?:` sono tutti `?:` — significa che ogni consumer deve fare
  null-check. Per la 1.0 dovrebbero essere `required` (a meno che esista un
  caso d'uso valido per bridge "parziali").

- [ ] **Public surface audit** — ogni `export` da `src/index.ts` dei 7 package
  diventa parte del contratto SemVer in 1.0. Marcare come `@internal` ciò che
  non è destinato all'esterno. Candidate da nascondere:
  - `FormEngineAdapter` (forms) — è davvero pubblico?
  - `createRuntimeStore`, `DEFAULT_FIELD_RUNTIME` (forms)
  - `DependencyTracker`, `RuleEvaluator` (ui-core/core/*)
  - Internals dell'engine

- [ ] **Risolvere conflitti naming** — eventuali API duplicate o ambigue (es.
  `useDashFieldNode` vs `useDashFieldMeta` vs `useDashRegister`: i consumer si
  confondono — chiarire con doc i casi d'uso o consolidare).

### Test coverage

- [ ] **Aggiungere unit test per `bridge.unregister`** — fix #3 è verificato in
  browser e nel test "submit doesn't lose values" ma NON c'è un unit test che
  valida espressamente `engine.getNode(name) === undefined` dopo l'unmount +
  microtask delay. Va in
  `forms/src/core/__tests__/DashFormProvider.unregister.test.tsx`.

- [ ] **Aggiungere unit test per il `lastValidIsoRef` di DateTimePicker** (fix
  della 0.1.6). Coperto indirettamente dal test "preserves base date when
  updating time", manca un test esplicito che esercita il fallback `||` quando
  il bridge ritorna `''`.

- [ ] **OTPField in browser smoke** — è coperto da unit test ma non c'è il
  consumer-side stress (mount, paste OTP, blur). Aggiungere a `TestForm.tsx`.

---

## 🟡 SHOULD — fortemente raccomandato per 1.0

### Documentazione

- [ ] **README per ciascuno dei 7 package** che descriva almeno:
  - cosa fa il pacchetto in 2-3 frasi
  - install + peer deps richieste
  - 1 esempio minimale
  - link al CHANGELOG.md

  Oggi solo `@dashforge/forms` ha un README ricco. Tokens / theme-core /
  theme-mui / ui-core / rbac / ui ne hanno uno generato da Nx (boilerplate),
  vanno scritti.

- [ ] **CHANGELOG.md per ogni package** — solo `forms` ce l'ha. Tokens /
  theme-core / theme-mui / ui-core / rbac / ui ne hanno bisogno (anche corti).

- [ ] **Migration guide** `MIGRATION.md` al top-level — anche se sei l'unico
  utente, ti serve per:
  1. tracciare cosa romperà nelle prossime release
  2. forzarti a pensare al SemVer ogni volta
  3. essere pronto se in futuro condividi le librerie

- [ ] **API reference auto-generata** (TypeDoc o api-extractor su ogni
  package). Pubblicabile su GitHub Pages.

- [ ] **Performance docs** — la "fewer renders than plain RHF" è la promessa
  core. Va misurata e documentata con un benchmark riproducibile (es.
  `examples/perf-bench` con `React.Profiler` che confronta dashforge vs RHF
  puro).

### Esempi

- [ ] **Pulire `~/projects/web/learn/dash` come esempio canonico** — oggi è il
  testbed con `pnpm.overrides` e `file:` paths. Per la 1.0:
  - rimuovere `pnpm.overrides`
  - documentare il `package.json` come "minimal consumer"
  - eventualmente moverlo in `dashforge/examples/basic-form` come esempio nel
    monorepo

- [ ] **Aggiungere esempio Zod resolver** — la `DashFormProvider` accetta
  resolver da 0.1.5, ma non c'è un esempio funzionante in repo che mostri
  integrazione con `@hookform/resolvers/zod`.

- [ ] **Aggiungere esempio `useDashFieldArray`** — feature dichiarata "DX only,
  no perf claims" — almeno un esempio che funziona end-to-end.

### CI / Release

- [ ] **GitHub Actions** (o equivalente) che girino **automaticamente** su ogni
  push:
  - `nx affected -t test`
  - `nx affected -t typecheck`
  - `nx affected -t build`
  - `nx affected -t lint`

  Oggi gira tutto manualmente — un test rotto può sfuggire.

- [ ] **Pre-commit hook** (husky o lefthook) che blocca commit con
  typecheck/test rotti sui file toccati.

- [ ] **Versioning automatizzato** via `nx release` con conventional commits.
  Oggi `nx.json` ha `"conventionalCommits": false` — accenderlo per 1.0 così i
  bump sono tracciabili dal log.

- [ ] **Verifica `tsbuildinfo` e `.html` di coverage NON in git** — `git
  status` mostra circa 20 file `.html` di coverage modificati. Vanno in
  `.gitignore`.

### Stabilità

- [ ] **Stress test concurrent / Suspense** — verificare che il bridge non si
  rompa con React 19 `useTransition` / `Suspense` boundary. Oggi è verificato
  solo in modalità sincrona.

- [ ] **SSR smoke test** — funziona dentro Next.js? Almeno un test che monta
  `DashFormProvider` in un componente server-rendered confermando che non
  esplode al primo render.

- [ ] **Strict bundle size budget** per ogni package (es. via `size-limit`).
  Oggi `@dashforge/ui` è 379 KB ESM uncompressed — è OK se tree-shake bene, ma
  va monitorato.

---

## 🟢 NICE — utile ma non bloccante

- [ ] **Storybook per i componenti UI** — gestione visuale dei 9 componenti +
  RBAC variations. Aiuta sia te sia (quando vorrai) eventuali contributor.

- [ ] **Visual regression test** — Chromatic / Playwright snapshots sui
  componenti.

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
| `0.1.6-alpha`    | ✅ già rilasciata (CR fixes + per-field subs + auto-reset)                |
| `0.1.7-alpha`    | stringa stantia Autocomplete + DateTimePicker docs + cleanup typecheck    |
| `0.1.8-alpha`    | MUI v9 props migration (slotProps)                                        |
| `0.2.0-beta`     | public-API freeze + bridge interface non-optional + README per package    |
| `0.3.0-beta`     | docs site (API + perf + migration) + esempi puliti                        |
| `0.4.0-rc`       | CI green + a11y audit + bundle budget                                     |
| **`1.0.0`**      | 🎉                                                                        |

Niente salti diretti da alpha a 1.0. Ogni passaggio (alpha → beta → rc →
stable) è un'occasione per validare un sottoinsieme del contratto.

---

## 🧮 Suggerimento pragmatico

Visto che sei l'unico consumer, NON serve fare tutto. Il vincolo critico per
1.0 è solo:

> "Posso garantire che la prossima release `1.0.x` non rompa il consumer
> `dash` senza che me ne accorga in CI?"

Le voci che lo sostengono direttamente (e che suggerisco di fare **prima** di
tutto il resto) sono solo 4:

1. **CI automatica** (GitHub Actions) → blocca regressioni
2. **MUI v9 cleanup** → rimuove rumore in console che maschera regressioni vere
3. **Bridge interface non-optional + audit public surface** → contratto stabile
4. **Test browser e2e per il consumer** (Playwright sull'app `dash`) →
   validazione integrale automatica

Tutto il resto (Storybook, i18n, API docs, SSR) è valore aggiunto ma non
strettamente necessario per dichiarare `1.0` nello scenario "single-user".

---

_Documento creato il 2026-05-10 a chiusura del ciclo `0.1.6-alpha`. Aggiornare
ad ogni release o quando si discoprono nuovi must-have._
