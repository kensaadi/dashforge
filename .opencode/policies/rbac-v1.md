# RBAC V1 — Implementation Policy (Dashforge)

## 1. Objective

Build a **production-grade RBAC V1** system for Dashforge that is:

- deterministic
- minimal but complete
- frontend-ready
- backend-compatible
- integration-first (Dashforge components)

RBAC is a **decision engine**, not a domain model.

---

## 2. Architectural Principles

### 2.1 Separation of Concerns

RBAC must be structured in three logical layers:

1. **core**

   - pure logic
   - no React
   - no UI
   - no framework coupling

2. **react**

   - provider
   - hooks
   - minimal helpers

3. **dashforge**

   - integration with:

     - routing
     - navigation
     - actions
     - components (Button, TextField, etc.)

These layers may initially live in the same library but MUST remain logically separated.

---

### 2.2 Domain vs Engine

RBAC library MUST NOT define:

- roles (admin, manager, etc.)
- resources (user, booking, etc.)
- business rules

RBAC library MUST ONLY:

- evaluate permissions
- enforce access decisions
- provide integration utilities

---

### 2.3 Deterministic Behavior

RBAC evaluation must be:

- synchronous
- predictable
- side-effect free

---

## 3. Core Rules

### 3.1 Permission Model

Each permission is defined as:

- action (string)
- resource (string)
- optional effect (allow | deny)
- optional condition (function)

---

### 3.2 Precedence

The system MUST enforce:

1. explicit **deny** overrides everything
2. then allow
3. otherwise → false

No ambiguity is allowed.

---

### 3.3 Role Inheritance

- roles may inherit from other roles
- inheritance must be resolved recursively
- circular dependencies MUST throw

---

### 3.4 Wildcard Support

V1 supports ONLY:

- `*` for action
- `*` for resource

No partial matching (e.g. `user.*`) in V1.

---

### 3.5 Conditions

Conditions:

- are functions
- receive `{ subject, resourceData, environment }`
- must return boolean
- must NOT be async in V1

---

## 4. React Layer Rules

### 4.1 Required APIs

- `RbacProvider`
- `useRbac()`
- `useCan()`
- `<Can />`

No additional abstraction layers allowed in V1.

---

### 4.2 Hooks Behavior

Hooks must:

- be synchronous
- not trigger unnecessary re-renders
- not depend on external state

---

## 5. Dashforge Integration Rules

### 5.1 Access Behavior

All UI integrations must support:

- `hidden`
- `disabled`
- `readonly`
- `visible`

These states must be resolved centrally (not ad-hoc).

---

### 5.2 Integration Points

RBAC must integrate with:

- Route protection
- Navigation filtering
- Action filtering
- Component access (Button, TextField, etc.)

---

### 5.3 Single Source of Truth

All access decisions must go through:

```ts
rbac.can(...)
```

No inline role checks are allowed anywhere.

---

## 6. Anti-Patterns (STRICTLY FORBIDDEN)

- `allowedRoles` props
- role checks like `user.role === 'admin'`
- async permission evaluation
- hidden logic inside UI components
- duplicated access logic across layers
- mixing RBAC with visibleWhen logic

---

## 7. Scope Control (CRITICAL)

### INCLUDED in V1

- role definitions
- permission evaluation
- inheritance
- allow/deny
- wildcard
- conditions (basic)
- React adapter
- Dashforge integration (core areas)

### EXCLUDED from V1

- visual role editor
- DB persistence layer
- permission builder UI
- ABAC advanced system
- multi-tenant complex logic
- async policies
- external policy engines

---

## 8. Performance Constraints

- no deep recomputation on every render
- minimal allocations
- caching allowed only if deterministic

---

## 9. Testing Requirements

Mandatory test coverage:

- allow / deny logic
- precedence
- inheritance
- circular dependency detection
- wildcard matching
- condition evaluation
- access state resolution
- navigation filtering
- action filtering

---

## 10. Documentation Rules

Documentation must be:

- example-driven
- minimal
- focused on usage, not theory

---

## 11. Final Principle

RBAC is not a feature.

RBAC is a **cross-cutting decision layer** that must:

- remain simple
- remain predictable
- remain consistent across the entire application

---
