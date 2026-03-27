# Dashforge Task Flow Policy

## Purpose

This policy defines the mandatory workflow for all tasks executed through OpenCode and ChatGPT collaboration.

The goal is to ensure:

- architectural consistency
- safe iteration without regressions
- clear separation between planning and execution
- reproducibility across sessions
- high-quality, production-ready outcomes

---

## Standard Execution Flow

Every task MUST follow this sequence:

### 1. Task Definition

A task MUST be created in:

/dashforge/.opencode/tasks/<task-name>.md

The task must be:

- self-contained
- explicit about scope
- explicit about constraints
- clear about expected output

---

### 2. PLAN Phase (Analysis Only)

OpenCode must run in PLAN mode:

"Plan the implementation only. Do not write code."

Output must be saved in:

/dashforge/.opencode/reports/<task-name>-plan.md

---

### 3. Plan Review (Mandatory)

The plan MUST be reviewed before any implementation.

The review must:

- validate architectural alignment
- detect incorrect assumptions
- identify hidden risks
- enforce consistency with existing components

Skipping this step is strictly forbidden.

---

### 4. BUILD Phase

Only after plan approval:

"Execute the implementation"

Output must be saved in:

/dashforge/.opencode/reports/<task-name>-build.md

---

### 5. Build Review

The implementation MUST be reviewed to verify:

- alignment with approved plan
- compliance with all policies
- absence of side effects or hidden logic
- correct handling of edge cases

If issues are found:

- create a new focused task
- do NOT patch blindly

---

### 6. Freeze

Only after successful review:

- commit
- push to main

The task is then considered stable.

---

## Architectural Principles (Non-Negotiable)

### 1. Display Layer Responsibility

Components:

- MUST NOT mutate source data
- MUST only control rendering

---

### 2. No Reconciliation

Components MUST NOT:

- auto-correct values
- silently adjust inconsistencies

---

### 3. No Automatic Reset

Components MUST NOT:

- reset values automatically
- clear fields without explicit user or engine action

---

### 4. Engine vs Component Responsibility

- Engine = state provider
- Component = rendering decision

---

### 5. Single Source of Truth

- Form state is the only source of truth
- UI may sanitize display, but MUST NOT mutate data

---

### 6. Developer Responsibility

Invalid or inconsistent data is:

- NOT handled automatically by components
- responsibility of the developer or business logic

---

## Task Design Rules

Every task MUST be:

### Precise

Avoid vague instructions like:

- "improve"
- "optimize"

---

### Scoped

Clearly define:

- what is included
- what is excluded

---

### Constrained

Always include:

- no reconciliation
- no automatic reset
- no hidden side effects

---

### Reusable

Tasks MUST:

- work in a fresh session
- not rely on implicit memory

---

## Anti-Patterns (Forbidden)

### ❌ Skipping PLAN

Never go directly to implementation.

---

### ❌ Mixing PLAN and BUILD

They must remain separate.

---

### ❌ Expanding scope during BUILD

If new requirements appear:
→ create a new task

---

### ❌ Blind pattern reuse

Do NOT assume:

- Select patterns apply to Autocomplete
- TextField patterns apply to all inputs

---

### ❌ Treating documentation as secondary

Docs are part of the product.

---

## Complexity Strategy

Order of execution:

1. Simple components
2. Medium components
3. Complex components

Exception:

- Strategic components (e.g. Autocomplete) may be prioritized
- but require stricter planning and review

---

## File Structure

### Tasks

/dashforge/.opencode/tasks/<name>.md

### Plans

/dashforge/.opencode/reports/<name>-plan.md

### Builds

/dashforge/.opencode/reports/<name>-build.md

---

## Session Resume Protocol

To resume work:

"We are resuming from:
<report-file>"

The system must continue from that state.

---

## Completion Criteria

A task is considered DONE only if:

- plan approved
- build validated
- policies respected
- no hidden logic introduced
- documentation aligned (if in scope)

---

## Philosophy

Dashforge is not a collection of components.

It is a system.

Every task must:

- preserve consistency
- be explainable
- be reproducible
