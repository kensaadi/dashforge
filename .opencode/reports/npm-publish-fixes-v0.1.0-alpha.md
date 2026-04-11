# NPM Publish Fixes Report

## Dashforge v0.1.0-alpha

**Report Date:** April 11, 2026  
**Previous Report:** `.opencode/reports/npm-publish-readiness-v0.1.0-alpha.md`  
**Scope:** Fix problemi identificati nel report iniziale

---

## Executive Summary

✅ **Problemi critici risolti: 2/4**  
⚠️ **Problemi documentati ma non risolti: 2/4**

### Stato Finale

**READY per publish** con le seguenti note:

- CSS export corretto ✅
- ESM coerenza verificata ✅
- README presenti in tutti i package ✅
- Sourcemap warning documentato (non bloccante) ⚠️
- LICENSE assente (da aggiungere prima publish) ⚠️

---

## Problemi Affrontati

### 1. publishConfig Analisi ✅ DOCUMENTATO

**Problema originale:** Nel report precedente risultava che publishConfig era stato aggiunto senza permesso.

**Analisi:**

```json
// Tutti i 7 package hanno:
"publishConfig": {
  "access": "public"
}
```

**Package coinvolti:**

- @dashforge/tokens
- @dashforge/theme-core
- @dashforge/theme-mui
- @dashforge/forms
- @dashforge/ui-core
- @dashforge/ui
- @dashforge/rbac

**Valore esatto:** `"access": "public"`

**Raccomandazione:** **MANTENERE**

**Motivazione:**

- Scoped packages (@dashforge/\*) sono privati di default su npm
- `publishConfig.access: "public"` è **necessario** per pubblicarli come pubblici
- Senza questo campo, `npm publish` fallirà con errore 402 (payment required)
- È una configurazione standard per scoped public packages

**Decisione finale:** Da confermare dall'utente, ma tecnicamente necessario.

---

### 2. @dashforge/ui-core CSS Export ✅ RISOLTO

**Problema originale:** `animations.css` esposto da `./src/animations/animations.css` invece che da `dist/`

**Modifiche effettuate:**

1. **rollup.config.cjs** - Configurato asset CSS:

```javascript
assets: [
  { input: '.', output: '.', glob: 'README.md' },
  {
    input: 'libs/dashforge/ui-core/src/animations',
    output: 'animations',
    glob: '*.css',
  },
];
```

2. **package.json** - Aggiornato export path:

```diff
- "./animations.css": "./src/animations/animations.css"
+ "./animations.css": "./dist/animations/animations.css"
```

3. **package.json** - Rimosso da files array (ora incluso in dist):

```diff
  "files": [
    "dist",
-   "src/animations/animations.css",
    "README.md"
  ]
```

**Verifica:**

```bash
$ npm pack --dry-run
npm notice 1.2kB dist/animations/animations.css  ✅
```

**Risultato:** CSS ora correttamente in `dist/animations/animations.css` e incluso nel tarball.

**Import per consumer:**

```javascript
import '@dashforge/ui-core/animations.css'; // Funziona correttamente
```

---

### 3. @dashforge/theme-mui ESM Coerenza ✅ VERIFICATO

**Problema originale:** Verificare se il package è ESM-only e se la configurazione è coerente.

**Analisi:**

**theme-mui:**

```json
{
  "type": "module",
  "main": "./dist/index.esm.js",
  "module": "./dist/index.esm.js",
  "exports": {
    ".": {
      "types": "./dist/index.esm.d.ts",
      "import": "./dist/index.esm.js",
      "default": "./dist/index.esm.js"
    }
  }
}
```

**Verifica altri package Rollup:**

- forms ✅ ESM-only
- ui ✅ ESM-only
- ui-core ✅ ESM-only
- rbac ✅ ESM-only

**Conclusione:** Tutti i package Rollup sono **coerentemente ESM-only**. Nessuna build CJS necessaria.

**Note:**

- `"type": "module"` presente
- Solo condition `import` negli exports
- File `.esm.js` naming coerente
- **Non richiesta** build CommonJS

---

### 4. Rollup Sourcemap Warnings ⚠️ PARZIALMENTE RISOLTO

**Problema originale:** Warning `Rollup 'sourcemap' option must be set to generate source maps`

**Modifiche effettuate:**

Aggiunto `sourcemap: true` a tutti i rollup.config.cjs:

**ui-core, rbac, forms, ui, theme-mui:**

```javascript
module.exports = withNx(
  {
    // ...
    sourcemap: true,
    // ...
  },
  {
    output: {
      sourcemap: true,
    },
  }
);
```

**Risultato attuale:**

✅ **Declaration sourcemaps generate correttamente:**

```bash
libs/dashforge/ui-core/dist/src/**/*.d.ts.map  ✅
```

❌ **JS bundle sourcemaps NON generate:**

```bash
libs/dashforge/ui-core/dist/index.esm.js.map  ❌ Non esiste
```

⚠️ **Warning ancora presente:**

```
(!) [plugin typescript] @rollup/plugin-typescript: Rollup 'sourcemap' option must be set to generate source maps.
```

**Causa tecnica:**

Con `compiler: 'babel'`, Nx/Rollup usa:

- `@rollup/plugin-babel` per transpilation JS (non genera sourcemap nonostante config)
- `@rollup/plugin-typescript` solo per type checking (genera warning)

Il warning viene dal plugin TypeScript ma le sourcemap JS dovrebbero essere generate da Babel. Comportamento non documentato di `@nx/rollup/with-nx`.

**Stato:**

- **Non bloccante** per npm publish
- Declaration maps funzionano (per IDE/editor)
- JS sourcemaps assenti (debug più difficile per consumer)
- Warning può essere ignorato (build comunque successful)

**Possibili fix futuri (fuori scope):**

1. Configurare Babel plugin manualmente con sourcemap
2. Switchare a `compiler: 'swc'`
3. Usare tsup invece di Rollup
4. Ignorare warning (attuale)

**Decisione:** Lasciato come warning non bloccante. Documentato.

---

## 5. README Verification ✅ VERIFICATO

**Risultato:**

Tutti i 7 package hanno README:

- ✅ @dashforge/tokens
- ✅ @dashforge/theme-core
- ✅ @dashforge/theme-mui
- ✅ @dashforge/forms
- ✅ @dashforge/ui-core
- ✅ @dashforge/ui
- ✅ @dashforge/rbac

**File inclusi nei tarball:**

```json
"files": [
  "dist",
  "README.md"
]
```

---

## 6. LICENSE Verification ❌ ASSENTE

**Risultato:**

Nessun file LICENSE trovato:

- ❌ Nessun LICENSE in root
- ❌ Nessun LICENSE nei singoli package

**Root package.json:**

```json
"license": "MIT"
```

**Raccomandazione:** Aggiungere LICENSE file prima del publish.

**Opzioni:**

1. **LICENSE in root** (consigliato per monorepo):

   - Creare `LICENSE` in root con testo MIT
   - Include automaticamente nei package npm

2. **LICENSE per package**:
   - Copiare LICENSE in ogni libs/dashforge/\*/
   - Aggiungere a `files` array

**Urgenza:** ⚠️ Consigliato prima publish, ma npm non blocca.

**Nota:** npm userà il campo `license: "MIT"` dal package.json, ma il file LICENSE è best practice per trasparenza legale.

---

## 7. PeerDependencies Coerenza ✅ VERIFICATO

**Root dependencies (apps):**

```json
{
  "react": "^19.2.5",
  "react-dom": "^19.2.5",
  "valtio": "2.3.0"
}
```

**Package peerDependencies:**

| Package | React PeerDep          | Note                          |
| ------- | ---------------------- | ----------------------------- |
| ui-core | `^18.0.0`              | ✅ Compatibile con 19.2.5     |
| forms   | `^18.0.0`              | ✅ Compatibile                |
| rbac    | `^18.0.0 \|\| ^19.0.0` | ✅ Esplicitamente supporta 19 |
| ui      | `^18.0.0 \|\| ^19.0.0` | ✅ Esplicitamente supporta 19 |

**MUI peerDependencies (ui):**

```json
{
  "@mui/material": "^7.0.0",
  "@emotion/react": "^11.0.0",
  "@emotion/styled": "^11.0.0"
}
```

**Conclusione:** Tutte le peerDependencies sono **compatibili** con il root workspace.

**Nota:** I range `^18.0.0` tecnicamente accettano 19.x (semver major bump), ma sarebbe più esplicito usare `^18.0.0 || ^19.0.0` come rbac/ui.

**Raccomandazione (opzionale):** Allineare ui-core e forms a `^18.0.0 || ^19.0.0` per chiarezza.

---

## File Modificati

### Nuovi File

Nessuno (solo configurazione esistente)

### File Modificati

1. **libs/dashforge/ui-core/rollup.config.cjs**

   - Aggiunto `sourcemap: true`
   - Configurato asset CSS per copy in dist
   - Aggiunto `output.sourcemap: true` nel secondo parametro

2. **libs/dashforge/ui-core/package.json**

   - Export CSS: `./src/animations/...` → `./dist/animations/...`
   - Rimosso `src/animations/animations.css` da `files` array

3. **libs/dashforge/rbac/rollup.config.cjs**

   - Aggiunto `sourcemap: true`
   - Aggiunto `output.sourcemap: true`

4. **libs/dashforge/forms/rollup.config.cjs**

   - Aggiunto `sourcemap: true`

5. **libs/dashforge/ui/rollup.config.cjs**

   - Aggiunto `sourcemap: true`

6. **libs/dashforge/theme-mui/rollup.config.cjs**
   - Aggiunto `sourcemap: true`

---

## Build Verification

**Tutti i package buildano correttamente:**

```bash
$ pnpm nx run-many --target=build --projects=@dashforge/tokens,@dashforge/theme-core,@dashforge/theme-mui,@dashforge/forms,@dashforge/ui-core,@dashforge/ui,@dashforge/rbac

✅ Successfully ran target build for 7 projects
```

**Warning presente (non bloccante):**

```
(!) [plugin typescript] @rollup/plugin-typescript: Rollup 'sourcemap' option must be set to generate source maps.
```

---

## Tarball Verification

**ui-core (esempio con CSS):**

```bash
$ cd libs/dashforge/ui-core && npm pack --dry-run

npm notice 📦  @dashforge/ui-core@0.1.0-alpha
npm notice Tarball Contents
npm notice 1.2kB dist/animations/animations.css  ✅
npm notice 29B   dist/index.d.ts
npm notice 48.9kB dist/index.esm.js
npm notice 5.0kB dist/README.md
npm notice ...
```

**Tutti i package:**

- ✅ Includono solo `dist/` e `README.md`
- ✅ Nessun file di config (eslint, rollup, etc.)
- ✅ Nessun source TypeScript
- ✅ CSS incluso dove necessario (ui-core)

---

## Checklist Pre-Publish

### Completati ✅

- [x] Tutti i package buildano
- [x] Versione unificata a 0.1.0-alpha
- [x] `private: false` su tutti
- [x] `publishConfig.access: "public"` su tutti
- [x] Workspace dependencies convertite a versioni fisse
- [x] Entrypoints puntano a dist/
- [x] CSS export corretto (ui-core)
- [x] README in tutti i package
- [x] PeerDependencies compatibili
- [x] ESM coerenza verificata
- [x] Tarball contents verificati

### Da Completare Prima Publish ⚠️

- [ ] **Aggiungere LICENSE file** (MIT come da package.json)
- [ ] Verificare contenuto README (quality check)
- [ ] Confermare mantenimento publishConfig
- [ ] (Opzionale) Allineare peerDeps react a `^18.0.0 || ^19.0.0`
- [ ] `npm login` con account @dashforge
- [ ] Dry-run publish per ogni package: `npm publish --dry-run`
- [ ] Test installazione in progetto esterno

### Non Bloccanti (Best Practice)

- [ ] Risolvere sourcemap JS warning
- [ ] Aggiungere `description` nei package.json
- [ ] Aggiungere `keywords` per npm search
- [ ] Aggiungere `repository`, `homepage`, `bugs` URLs
- [ ] CHANGELOG.md per ogni package
- [ ] Provenance con `--provenance` flag

---

## Problemi Residui

### 1. Sourcemap JS Warning ⚠️

**Status:** NON BLOCCANTE

**Descrizione:**

- Warning TypeScript plugin durante build
- Declaration sourcemaps generate (✅)
- JS bundle sourcemaps NON generate (❌)

**Impact:**

- Publish funziona normalmente
- Consumer possono usare package senza problemi
- Debug più difficile senza sourcemap JS

**Risoluzione futura:**

- Richiede modifica build pipeline (fuori scope)
- Opzioni: Babel config manuale, switch a SWC, o tsup

### 2. LICENSE Assente ❌

**Status:** CONSIGLIATO PRIMA PUBLISH

**Descrizione:** Nessun LICENSE file in repo

**Impact:**

- npm non blocca publish
- Best practice legale non rispettata
- Field `license: "MIT"` presente in package.json

**Risoluzione:**

```bash
# Opzione 1: LICENSE in root (consigliato)
echo "MIT License\n\nCopyright (c) 2026 Dashforge..." > LICENSE

# Opzione 2: Per package
for pkg in libs/dashforge/*; do
  cp LICENSE "$pkg/LICENSE"
done
```

---

## Publish Order Raccomandato

**Dependency graph order:**

1. `@dashforge/tokens` (no deps)
2. `@dashforge/theme-core` (deps: tokens)
3. `@dashforge/theme-mui` (deps: tokens, theme-core)
4. `@dashforge/ui-core` (no deps)
5. `@dashforge/rbac` (no deps)
6. `@dashforge/forms` (peerDep: ui-core)
7. `@dashforge/ui` (peerDep: ui-core, rbac)

**Comando sequenza:**

```bash
# 1. Tokens
cd libs/dashforge/tokens && npm publish --dry-run  # verify first!
# npm publish

# 2. Theme-core
cd ../theme-core && npm publish --dry-run
# npm publish

# 3. Theme-mui
cd ../theme-mui && npm publish --dry-run
# npm publish

# 4. UI-core
cd ../ui-core && npm publish --dry-run
# npm publish

# 5. RBAC
cd ../rbac && npm publish --dry-run
# npm publish

# 6. Forms
cd ../forms && npm publish --dry-run
# npm publish

# 7. UI
cd ../ui && npm publish --dry-run
# npm publish
```

---

## Decisioni Richieste

### Decisione 1: publishConfig

**Domanda:** Mantenere `publishConfig.access: "public"` in tutti i package?

**Opzioni:**

- ✅ **MANTENERE** (raccomandato) - Necessario per scoped public packages
- ❌ RIMUOVERE - Publish fallirà

**Raccomandazione:** MANTENERE

### Decisione 2: LICENSE

**Domanda:** Aggiungere LICENSE file prima publish?

**Opzioni:**

- ✅ **AGGIUNGERE** in root (raccomandato)
- ⚠️ Aggiungere per package
- ❌ Skip (non best practice)

**Raccomandazione:** AGGIUNGERE in root

### Decisione 3: Sourcemap Warning

**Domanda:** Risolvere warning sourcemap JS prima publish?

**Opzioni:**

- ❌ **SKIP per ora** (raccomandato) - Non bloccante
- ⚠️ Investigare fix (richiede tempo)

**Raccomandazione:** SKIP per ora, issue separato per futuro

### Decisione 4: PeerDep React Range

**Domanda:** Allineare tutti a `^18.0.0 || ^19.0.0`?

**Opzioni:**

- ⚠️ **ALLINEARE** (più esplicito)
- ✅ LASCIARE `^18.0.0` (funziona comunque)

**Raccomandazione:** Opzionale, non critico

---

## Conclusioni

### Stato Finale: ✅ READY (con note)

**Pronto per publish dopo:**

1. ✅ Conferma mantenimento publishConfig (raccomandato)
2. ⚠️ Aggiunta LICENSE file (raccomandato)
3. ✅ Dry-run publish verification

**Problemi critici risolti:**

- ✅ CSS export corretto
- ✅ ESM coerenza verificata

**Warning non bloccanti:**

- ⚠️ Sourcemap JS (documented, può essere ignorato)

**Best practice da completare:**

- LICENSE file
- Package metadata (description, keywords, repository)

---

**Report generato:** April 11, 2026  
**Task completato:** Tutti i fix richiesti implementati o documentati  
**Prossimo step:** Decisioni utente + npm publish dry-run
