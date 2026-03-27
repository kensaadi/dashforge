📐 Dashforge – Task Execution Flow Policy
🎯 Obiettivo

Garantire che ogni implementazione sia:

coerente con l’architettura
sicura (no regressioni)
iterabile
verificabile
riusabile tra sessioni
🔁 1. FLUSSO STANDARD (OBBLIGATORIO)

Ogni lavoro segue SEMPRE questo ordine:

1️⃣ Task Definition

Tu (o io) creiamo un task in:

/dashforge/.opencode/tasks/<task-name>.md

Contiene:

contesto
scope
goal
rules
constraints
output

👉 Deve essere autosufficiente

2️⃣ PLAN (Analysis Mode)

OpenCode:

Plan the implementation only.
Do not write code.

Output salvato in:

/dashforge/.opencode/reports/<task-name>-plan.md
3️⃣ Review del PLAN (OBBLIGATORIO)

Qui interveniamo noi:

validiamo architettura
correggiamo errori concettuali
blocchiamo derive pericolose

👉 Mai saltare questo step

4️⃣ BUILD

Solo dopo approvazione:

Execute the implementation

Output salvato in:

/dashforge/.opencode/reports/<task-name>-build.md
5️⃣ Review del BUILD

Verifichiamo:

coerenza con plan
rispetto policy
qualità codice
edge case

👉 eventuali fix → nuovo mini task

6️⃣ Freeze (commit + push)

Solo dopo review finale:

commit
push su main
considerato “stabile”
🧠 2. PRINCIPI ARCHITETTURALI (NON NEGOZIABILI)

1. Display Layer Responsibility

I componenti:

NON modificano i dati
gestiscono solo il rendering 2. No Reconciliation

Mai:

correggere automaticamente valori
mutare stato senza esplicita azione 3. No Automatic Reset

Mai:

resettare campi automaticamente
“aggiustare” inconsistenze 4. Engine = State, Component = UI
Engine → fornisce stato
Component → decide rendering 5. Controlled Truth
il valore reale è quello del form
la UI può essere “sanitized” ma NON cambia il dato 6. Developer Responsibility

Se i dati sono inconsistenti:
👉 è responsabilità del dev, non del componente

🧩 3. REGOLE DI TASK DESIGN

Ogni task deve essere:

✔ Preciso

Niente ambiguità tipo:

“migliorare”
“ottimizzare”
✔ Scoped

Deve dire chiaramente:

cosa è dentro
cosa è fuori
✔ Vincolato

Sempre includere:

no reconciliation
no reset
no side effects
✔ Ripetibile

Deve funzionare anche:

in nuova sessione
senza memoria precedente
⚠️ 4. ANTI-PATTERN (DA EVITARE)
❌ Saltare il PLAN

Errore più grave.

❌ Mischiare PLAN e BUILD

Deve essere sempre separato.

❌ Allargare scope durante build

Se emerge nuova esigenza:
👉 nuovo task

❌ Copiare pattern senza pensare

Esempio:

Select ≠ Autocomplete
TextField ≠ NumberField
❌ Documentazione dopothought

Docs = parte del prodotto
non accessorio

🧪 5. STRATEGIA DI COMPLESSITÀ
Ordine corretto:
Componenti semplici
Componenti medi
Componenti complessi

Ma con una regola:

👉 se un componente è strategico (Autocomplete)
può essere anticipato, MA con:

PLAN più rigoroso
più review
🧱 6. STRUTTURA FILE STANDARD
Task
/dashforge/.opencode/tasks/<name>.md
Plan
/dashforge/.opencode/reports/<name>-plan.md
Build
/dashforge/.opencode/reports/<name>-build.md
🔁 7. RIPRESA SESSIONE

Sempre possibile usando:

We are resuming from:
<report-file>
🎯 8. CRITERI DI APPROVAZIONE

Un task è “done” solo se:

✔ Plan approvato
✔ Build corretto
✔ Policy rispettata
✔ Docs coerenti
✔ Nessun hack nascosto
✔ Nessuna logica implicita
🧠 9. FILOSOFIA (IMPORTANTE)

Quello che stai costruendo NON è:

👉 un set di componenti

È:

👉 un sistema coerente

Quindi ogni decisione deve essere:

consistente
spiegabile
ripetibile
💬 Sintesi finale

Il tuo flow è:

TASK → PLAN → REVIEW → BUILD → REVIEW → FREEZE

Se lo rispetti:

👉 non deragli mai
👉 non fai refactor inutili
👉 non rompi architettura
