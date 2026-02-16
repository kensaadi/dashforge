Ti preparo un Project Context Document per Dashforge, scritto in modo:

✔ leggibile per te

✔ riutilizzabile domani

✔ comprensibile per OpenCode

✔ utile per qualsiasi AI

✔ allineato alla visione strategica

Questo è il punto di ripartenza ufficiale.

🚀 DASHFORGE — PROJECT CONTEXT (V1)
📌 Visione

Dashforge è un framework UI + starter ecosystem costruito sopra MUI, con:

Token system proprietario

Theme runtime reattivo

Theme builder futuro monetizzabile

Component system avanzato

Form system predittivo

Motion come parte del core

Obiettivo:

Vendere prima di 3 mesi.
Costruire base solida per evoluzione futura (Tarya).

🧱 Architettura Monorepo (Nx + PNPM Workspace)

Workspace type:

Nx package-based

PNPM workspace

TypeScript composite

ESM

moduleResolution: bundler

📁 Struttura attuale
apps/
docs/ → futura documentazione ufficiale
web/ → marketing / landing
api/ → backend starter

libs/dashforge/
tokens/ → static theme contract
theme-core/ → Valtio runtime
theme-mui/ → MUI adapter (non ancora implementato)
ui/ → componenti
forms/ → form system (non ancora implementato)

📦 Namespace

Tutte le librerie sono state rinominate correttamente:

@dashforge/tokens
@dashforge/theme-core
@dashforge/theme-mui
@dashforge/ui
@dashforge/forms

PNPM dependency linking usa:

"workspace:\*"

🎨 @dashforge/tokens

Contiene:

DashforgeTheme (contract tipizzato)

defaultLightTheme

Struttura:

src/theme/
types.ts
default-light.ts
index.ts
src/index.ts

Non contiene runtime.
Non contiene stato.
È puro contratto.

⚡ @dashforge/theme-core

Contiene:

Valtio store

API controllate

Hook reattivo

Struttura:

src/store/
theme.store.ts
theme.actions.ts
src/hooks/
useDashTheme.ts
src/index.ts

Scelte architetturali:

Unico proxy Valtio

Mutazione solo tramite API

Nessuna esportazione diretta del proxy

Deep merge per patch parziali

Builder-ready

🧠 Scelte architetturali deliberate
Theme

✔ Oggetto strutturato (non flatten)
✔ Semantic domains
✔ Non legato a MUI
✔ Reattivo
✔ Builder-ready
✔ Versionabile
✔ Serializzabile

State

✔ Valtio
✔ Proxy singolo
✔ API controllate
✔ Granular reactivity naturale

Form System (futuro)

✔ JSX-driven
✔ Field-level dependencies
✔ Non globale
✔ Motion integrato
✔ Predittive animate

Motion

✔ motion/react sarà parte del core
✔ Animazioni non personalizzabili dal builder
✔ Builder modifica solo token
✔ Motion è comportamento, non stile

🧱 Prossimi step tecnici

1️⃣ Verificare build:

pnpm nx build @dashforge/tokens
pnpm nx build @dashforge/theme-core

2️⃣ Implementare @dashforge/theme-mui

Adapter DashforgeTheme → MUI Theme

createMuiThemeFromDashTheme()

3️⃣ Creare ThemeProvider Dashforge

4️⃣ Collegare docs app per test runtime

5️⃣ Iniziare primo componente in @dashforge/ui
(Button o Card)

💰 Strategia commerciale

Fase 1 (gratuita):

UI components

Form system base

Theme runtime

Fase 2 (monetizzazione):

Theme Builder (export token)

Layout system

Widget kit

Starter FE+BE

App starter pack

🧭 Stato attuale

✔ Monorepo creato
✔ Namespace sistemato
✔ Tokens implementati
✔ Theme runtime implementato
✔ Dependency graph corretto
✔ Workspace linking corretto
✔ Nessun errore TypeScript
✔ Architettura coerente

Non ancora fatto:

theme-mui adapter

Provider

UI components

Form engine

Motion integration

Builder

🧠 Decisioni già prese (vincolanti)

Niente flatten token

Niente mutazione diretta theme

MUI è adapter, non core

Motion è core behavior

Builder modificherà solo token

State store = Valtio

Form system non globale

📍 Punto di ripartenza domani

Step logico successivo:

👉 Implementare @dashforge/theme-mui
oppure
👉 Creare il primo componente UI e collegarlo al runtime

Consiglio tecnico:

Prima fare theme-mui adapter.
Poi Provider.
Poi UI.

🧩 Domanda finale per allineamento

Domani vuoi partire da:

A) Theme-MUI adapter
B) ThemeProvider
C) Primo componente UI (Button)
D) Setup Docs + Provider test

Scegli la priorità e domani partiamo chirurgici.

📍 STATO REALE ATTUALE

Hai:

✔ Monorepo Nx package-based

✔ Namespace sistemato (@dashforge/\*)

✔ @dashforge/tokens funzionante

✔ @dashforge/theme-core con Valtio

✔ Proxy unico

✔ API controllate (patchTheme, replaceTheme)

✔ Import workspace risolti

Siamo qui:

Theme runtime pronto.
Non ancora collegato a MUI.
Non ancora collegato a un Provider.
Non ancora testato in app reale.

🎯 CONTINUIAMO DA QUI

Il passo corretto ora NON è creare componenti.

Il passo corretto è:

🔥 Creare @dashforge/theme-mui come adapter ufficiale.

Perché:

I componenti useranno MUI.

MUI ha bisogno di un ThemeProvider.

Dobbiamo mappare DashforgeTheme → MUI Theme.

Se non facciamo questo ora, i componenti nasceranno male.

🧱 OBIETTIVO PROSSIMO STEP

Creare:

@dashforge/theme-mui

Con dentro:

src/
createMuiTheme.ts
DashforgeThemeProvider.tsx
index.ts

🎯 COSA FARÀ theme-mui

1️⃣ Legge useDashTheme() (Valtio snapshot)
2️⃣ Converte DashforgeTheme → MUI Theme
3️⃣ Fornisce <ThemeProvider> MUI
4️⃣ Espone un provider unico <DashforgeProvider>

🧠 ARCHITETTURA CORRETTA

Flow:

DashforgeTheme (tokens)
↓
Valtio runtime (theme-core)
↓
MUI Adapter (theme-mui)
↓
ThemeProvider
↓
UI components

⚡ PRIMA COSA DA FARE ORA

Dobbiamo installare MUI in theme-mui.

Dimmi:

Hai già installato MUI nel progetto?

Se no, facciamo:

pnpm add @mui/material @emotion/react @emotion/styled --filter @dashforge/theme-mui

Conferma se è installato o no.
Poi procediamo con l’adapter.

Domani ripartiamo esattamente da qui, senza perdere contesto.

📍 Punto ufficiale di ripartenza
Stato attuale consolidato

✔ Monorepo Nx (package-based)
✔ Namespace corretto @dashforge/\*
✔ @dashforge/tokens implementato
✔ DashforgeTheme tipizzato
✔ defaultLightTheme pronto
✔ @dashforge/theme-core con Valtio
✔ Proxy unico
✔ API controllate (patchTheme, replaceTheme)
✔ useDashTheme() funzionante
✔ Workspace linking sistemato
✔ Nessun errore TS

🎯 Prossimo step DOMANI

Implementare:

🔥 @dashforge/theme-mui (Adapter ufficiale)

Obiettivo:

Convertire DashforgeTheme → MUI Theme

Creare DashforgeThemeProvider

Collegarlo alla app docs per test runtime

🧱 Domani faremo:

1️⃣ Installazione MUI in @dashforge/theme-mui
2️⃣ Creazione createMuiThemeFromDashTheme()
3️⃣ Creazione <DashforgeThemeProvider>
4️⃣ Test reattività live (patchTheme cambia UI)

🧠 Non faremo ancora:

Componenti UI

Form system

Motion

Builder

Prima chiudiamo l’infrastruttura theme.

🧩 Mental checkpoint

Dashforge non è:

Un template sopra MUI.

Sta diventando:

Un framework con runtime proprietario + adapter MUI.

Questa è una differenza enorme.

Domani ripartiamo chirurgici da:

Creazione adapter MUI

Quando entri scrivi solo:

"Ripartiamo da theme-mui"

e partiamo direttamente operativi.
