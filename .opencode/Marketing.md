# MARKETING.md — Dashforge

> Incolla questo file all'inizio di qualsiasi chat Claude per avere conversazioni strategiche su positioning, pricing, go-to-market e copywriting senza dover rispiegare il progetto da zero.

---

## 1. Cos'è Dashforge (non tecnico)

Dashforge è un **framework frontend per applicazioni admin e dashboard complesse**, costruito su React.

Non è una UI library. Non è un boilerplate.

È la combinazione di tre layer che normalmente vivono separati e duplicati:

| Layer                        | Cosa fa                                            |
| ---------------------------- | -------------------------------------------------- |
| **UI Components**            | Componenti MUI-based pronti per l'uso enterprise   |
| **Form System dichiarativo** | Engine proprietario per form con logica complessa  |
| **RBAC nativo**              | Permessi integrati a livello di singolo componente |

**In una frase:** Dashforge ti permette di costruire app admin complesse con logica, permessi e UI allineati nello stesso punto — senza duplicare codice, senza `if` sparsi, senza mismatch tra UI e autorizzazioni.

---

## 2. Il problema che risolve

Nella realtà di qualsiasi app admin complessa, succede questo:

```jsx
// Quello che scrivi oggi — sparso ovunque nel codebase
if (user.role === 'admin') {
  return <TextField name="salary" />;
}
if (form.role === 'admin' && user.permissions.includes('manager')) {
  // ...altra logica duplicata
}
```

**Risultato:**

- Logica di permessi duplicata in decine di file
- UI e RBAC mai davvero sincronizzati
- Ogni nuovo ruolo richiede di toccare componenti, middleware, helper
- Complessità che cresce fuori controllo

---

## 3. La soluzione Dashforge

```jsx
// Quello che scrivi con Dashforge — tutto in un posto
<TextField
  name="salary"
  visibleWhen={(form) => form.role === 'admin'}
  permissions={['admin', 'manager']}
/>
```

**Quello che succede automaticamente:**

- ✅ Il campo non viene renderizzato se il ruolo non è autorizzato
- ✅ La logica condizionale è co-located con il componente
- ✅ Niente `if` esterni, niente wrapper, niente duplicazioni
- ✅ UI e permessi sempre in sync per costruzione

---

## 4. Target

### Primario

| Segmento                       | Profilo                                               | Pain point principale                                               |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------- |
| **Dev freelance / consulenti** | Senior dev che costruisce app admin per clienti       | "Ogni progetto ricostruisco la stessa logica di RBAC e form"        |
| **Startup B2B early-stage**    | Team piccolo, backoffice admin da costruire in fretta | "Non ho tempo per architettare permessi complessi dal nulla"        |
| **Agency**                     | Produce app admin custom per clienti enterprise       | "I progetti admin sono sempre più complessi e costosi da mantenere" |

### Secondario

| Segmento           | Profilo                                                 | Pain point principale                                                  |
| ------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Dev enterprise** | Lavora in team medio-grandi, ha vincoli su stack e RBAC | "Il sistema di permessi aziendale è un disastro da integrare nella UI" |

---

## 5. Positioning vs Competitor

### Panoramica

|                       | Refine.dev        | React Admin | shadcn/ui  | MUI X       | **Dashforge**               |
| --------------------- | ----------------- | ----------- | ---------- | ----------- | --------------------------- |
| CRUD                  | ✅ Forte          | ✅ Forte    | ❌ Nessuno | ⚠️ Parziale | ✅ Solido                   |
| RBAC                  | ⚠️ Plugin/manuale | ⚠️ Manuale  | ❌ Nessuno | ❌ Nessuno  | ✅ **Nativo nel rendering** |
| Form engine           | Delegato (RHF)    | Delegato    | Delegato   | Delegato    | ✅ **Engine proprietario**  |
| Logica condizionale   | Imperativa        | Imperativa  | n/a        | n/a         | ✅ **Dichiarativa**         |
| Permessi co-located   | ❌                | ❌          | ❌         | ❌          | ✅                          |
| Complessità nel tempo | Cresce            | Cresce      | Alta (DIY) | Alta (DIY)  | **Controllata**             |

### Positioning statement vs ciascun competitor

**vs Refine.dev / React Admin**

> Refine e React Admin sono ottimi per CRUD. Appena aggiungi RBAC complesso e logica condizionale sui form, il codice esplode. Dashforge risolve esattamente quello che loro delegano.

**vs shadcn/ui**

> shadcn è una UI library eccellente. Dashforge non è una UI library — è un framework con logica, permessi e orchestrazione inclusi. Si usano per scopi diversi (e Dashforge usa MUI, non shadcn).

**vs MUI X**

> MUI X aggiunge componenti avanzati (DataGrid, DatePicker). Non gestisce form logic, non ha RBAC, non ha engine dichiarativo. Dashforge è un layer sopra — o un'alternativa completa per i progetti admin.

---

## 6. Unique Value Proposition

### UVP principale

> **Dashforge unifica UI, logica e permessi in un unico layer dichiarativo.**
> Nessun altro framework React per admin lo fa nativamente.

### UVP per copywriting (varianti)

**Versione breve (headline)**

> "L'unico framework React dove RBAC fa parte del rendering."

**Versione media (subheadline)**

> "Costruisci app admin complesse senza duplicare logica di permessi, senza `if` sparsi, senza mismatch tra UI e autorizzazioni."

**Versione lunga (pitch / landing page)**

> "In qualsiasi app admin reale, gestisci permessi, logica condizionale e UI complessa. Normalmente lo fai con tre strumenti diversi che non si parlano, e finisci con codice duplicato ovunque. Dashforge risolve questo alla radice: ogni componente conosce la sua logica e i suoi permessi. Tutto in un posto. Sempre in sync."

---

## 7. Business Model

- **Libreria core:** open source (MIT o BSL — da definire)
- **Starter kit a pagamento:** one-time, nessuna subscription

| Prodotto         | Prezzo indicativo | Contenuto                                                        |
| ---------------- | ----------------- | ---------------------------------------------------------------- |
| **Auth Starter** | 99 – 199 €        | Auth completa, routing protetto, sessioni                        |
| **Admin + RBAC** | 199 – 499 €       | Tutto Auth + RBAC avanzato, dashboard, componenti admin completi |
| **Add-on**       | TBD               | Moduli aggiuntivi (pagamenti, analytics, advanced tables)        |

**Leva di vendita B2B:** RBAC è la feature che giustifica il prezzo enterprise. È esattamente il problema più costoso da risolvere internamente per startup e agency.

---

## 8. Traction & Credibilità attuale

- ✅ Usato in progetti reali (non solo side project)
- ✅ Nato da problemi concreti su form complessi e RBAC enterprise
- ⚠️ Non ancora un "marketed product" — fase di go-to-market da costruire
- ⚠️ Nessun caso studio pubblico ancora — da raccogliere

**Angolo di comunicazione consigliato:** "Built from the trenches" — un framework che esiste perché il problema era reale, non perché era una buona idea astratta.

---

## 9. Messaggi da evitare

| ❌ Non dire                    | ✅ Di' invece                                                  |
| ------------------------------ | -------------------------------------------------------------- |
| "Una UI library per dashboard" | "Un framework per app admin complesse"                         |
| "Simile a shadcn ma con admin" | "Un layer completo con logica e permessi integrati"            |
| "Alternativa a MUI"            | "Costruito sopra MUI, con form engine e RBAC nativi"           |
| "Facile e veloce"              | "Controllato e consistente anche quando la complessità cresce" |
| "Per tutti i dev React"        | "Per chi costruisce app admin con logica di permessi reale"    |

---

## 10. Come usare questo file

1. **Copia tutto il contenuto** di questo file
2. **Incollalo all'inizio della chat** prima della tua domanda
3. Scrivi semplicemente: _"Leggi il contesto qui sopra. Ora aiutami con [domanda strategica]."_

**Esempi di conversazioni utili:**

- _"Aiutami a scrivere la headline per la landing page"_
- _"Qual è il pricing più efficace per il segmento agency?"_
- _"Come posiziono Dashforge su X/Twitter per raggiungere dev freelance?"_
- _"Scrivi una sequenza email per il lancio del primo starter kit"_
- _"Analizza i competitor e dimmi dove attaccare"_

---

_Ultima revisione: aprile 2026_
