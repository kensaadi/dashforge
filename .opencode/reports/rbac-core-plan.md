# RBAC Core V1 — Architectural Plan

**Status**: Planning Phase  
**Scope**: Core Layer Only  
**Target**: libs/dashforge/rbac/core  
**Date**: 2026-04-04  
**Policy Reference**: .opencode/policies/rbac-v1.md

---

## 1. File Structure

```
libs/dashforge/rbac/
└── core/
    ├── index.ts                    # Public API surface
    ├── types.ts                    # All core types
    ├── rbac-engine.ts              # Main RBAC evaluation engine
    ├── permission-evaluator.ts     # Permission matching logic
    ├── role-resolver.ts            # Role inheritance resolution
    ├── condition-evaluator.ts      # Condition execution logic
    └── errors.ts                   # Error classes
```

### File Responsibilities

#### `index.ts`

- Re-exports public API
- Single entry point for core layer
- No implementation code

#### `types.ts`

- All TypeScript interfaces/types
- No runtime code
- Must be framework-agnostic
- Explicit, no index signatures

#### `rbac-engine.ts`

- Main orchestration logic
- Implements `RbacEngine` class
- Coordinates role resolution, permission evaluation, condition checking
- Entry point: `can()` method

#### `permission-evaluator.ts`

- Permission matching algorithm
- Wildcard matching (`*` only)
- Action/resource comparison
- Effect resolution (allow/deny precedence)

#### `role-resolver.ts`

- Role inheritance resolution
- Circular dependency detection
- Recursive role expansion
- Returns flattened permission set

#### `condition-evaluator.ts`

- Executes condition functions
- Manages evaluation context
- Handles condition errors safely
- Returns boolean only

#### `errors.ts`

- `RbacError` (base)
- `CircularRoleError`
- `InvalidPermissionError`
- `ConditionEvaluationError`

---

## 2. Public API Design

### 2.1 Core Types

```typescript
// Subject (actor requesting access)
interface Subject {
  id: string;
  roles: string[];
  attributes?: Record<string, unknown>;
}

// Permission Definition
type PermissionEffect = 'allow' | 'deny';

interface Permission {
  action: string; // e.g., "read", "write", "*"
  resource: string; // e.g., "booking", "user", "*"
  effect?: PermissionEffect; // default: "allow"
  condition?: ConditionFunction;
}

// Condition Function
interface ConditionContext {
  subject: Subject;
  resourceData?: unknown;
  environment?: Record<string, unknown>;
}

type ConditionFunction = (context: ConditionContext) => boolean;

// Role Definition
interface Role {
  name: string;
  permissions: Permission[];
  inherits?: string[]; // other role names
}

// Policy (complete RBAC configuration)
interface RbacPolicy {
  roles: Role[];
}

// Access Request
interface AccessRequest {
  action: string;
  resource: string;
  resourceData?: unknown;
  environment?: Record<string, unknown>;
}

// Access Decision
interface AccessDecision {
  granted: boolean;
  reason?: string; // for debugging/logging
}
```

### 2.2 Engine API

```typescript
class RbacEngine {
  constructor(policy: RbacPolicy);

  // Primary evaluation method
  can(subject: Subject, request: AccessRequest): boolean;

  // Detailed evaluation (returns decision + reason)
  evaluate(subject: Subject, request: AccessRequest): AccessDecision;

  // Utility: get all permissions for a subject (after resolution)
  getEffectivePermissions(subject: Subject): Permission[];

  // Utility: validate policy (throws if circular roles detected)
  validatePolicy(): void;
}
```

### 2.3 Factory Function

```typescript
function createRbacEngine(policy: RbacPolicy): RbacEngine;
```

### 2.4 Utility Exports

```typescript
// For testing/debugging
function isWildcard(value: string): boolean;
function matchesPattern(value: string, pattern: string): boolean;
```

---

## 3. Evaluation Algorithm

### 3.1 High-Level Flow

```
Input: Subject + AccessRequest
  ↓
Step 1: Resolve subject roles (with inheritance)
  ↓
Step 2: Collect all permissions from resolved roles
  ↓
Step 3: Filter permissions matching action + resource
  ↓
Step 4: Evaluate conditions for matched permissions
  ↓
Step 5: Apply precedence rules (deny > allow)
  ↓
Output: boolean (granted or denied)
```

### 3.2 Detailed Steps

#### Step 1: Role Resolution

1. Start with `subject.roles[]`
2. For each role:
   - Look up role definition in policy
   - If role has `inherits`, recursively resolve those roles
   - Track visited roles to detect cycles
   - Throw `CircularRoleError` if cycle detected
3. Return flattened list of unique role names

**Algorithm:**

```
function resolveRoles(roleNames, policy, visited = new Set()):
  result = []
  for roleName in roleNames:
    if roleName in visited:
      throw CircularRoleError
    visited.add(roleName)

    role = policy.roles.find(r => r.name === roleName)
    if not role:
      continue  // silently skip unknown roles (fail-safe)

    result.push(roleName)

    if role.inherits:
      inherited = resolveRoles(role.inherits, policy, visited)
      result.push(...inherited)

    visited.delete(roleName)  // backtrack for other branches

  return unique(result)
```

#### Step 2: Permission Collection

1. Take resolved role names
2. For each role name:
   - Find role definition
   - Collect all `permissions[]`
3. Return flat array of all permissions (may contain duplicates)

**Algorithm:**

```
function collectPermissions(resolvedRoles, policy):
  permissions = []
  for roleName in resolvedRoles:
    role = policy.roles.find(r => r.name === roleName)
    if role:
      permissions.push(...role.permissions)
  return permissions
```

#### Step 3: Permission Matching

1. For each permission:
   - Check if `permission.action` matches `request.action`
     - Exact match OR
     - Permission action is `*` OR
     - Request action is `*`
   - Check if `permission.resource` matches `request.resource`
     - Exact match OR
     - Permission resource is `*` OR
     - Request resource is `*`
2. Keep only matched permissions

**Algorithm:**

```
function matchPermissions(permissions, request):
  matched = []
  for permission in permissions:
    actionMatch = (
      permission.action === request.action ||
      permission.action === '*' ||
      request.action === '*'
    )
    resourceMatch = (
      permission.resource === request.resource ||
      permission.resource === '*' ||
      request.resource === '*'
    )
    if actionMatch AND resourceMatch:
      matched.push(permission)
  return matched
```

#### Step 4: Condition Evaluation

1. For each matched permission:
   - If no condition → keep as-is
   - If has condition:
     - Build context: `{ subject, resourceData, environment }`
     - Execute condition function
     - If condition throws → treat as false (fail-safe)
     - If condition returns non-boolean → treat as false
     - If condition returns true → keep permission
     - If condition returns false → discard permission
2. Return permissions that passed conditions

**Algorithm:**

```
function evaluateConditions(permissions, subject, request):
  passed = []
  for permission in permissions:
    if not permission.condition:
      passed.push(permission)
      continue

    try:
      context = {
        subject,
        resourceData: request.resourceData,
        environment: request.environment
      }
      result = permission.condition(context)
      if result === true:
        passed.push(permission)
    catch error:
      // Fail-safe: condition error = deny
      continue

  return passed
```

#### Step 5: Apply Precedence

1. Check if any permission has `effect: 'deny'`
   - If yes → return `false` (deny wins)
2. Check if any permission has `effect: 'allow'` OR no effect (default allow)
   - If yes → return `true`
3. Otherwise → return `false` (default deny)

**Algorithm:**

```
function applyPrecedence(permissions):
  hasDeny = permissions.some(p => p.effect === 'deny')
  if hasDeny:
    return false

  hasAllow = permissions.some(p => !p.effect || p.effect === 'allow')
  if hasAllow:
    return true

  return false
```

### 3.3 Complete Evaluation Function

```
function can(subject, request, policy):
  // Step 1: Resolve roles
  resolvedRoles = resolveRoles(subject.roles, policy)

  // Step 2: Collect permissions
  allPermissions = collectPermissions(resolvedRoles, policy)

  // Step 3: Match permissions
  matchedPermissions = matchPermissions(allPermissions, request)

  // Step 4: Evaluate conditions
  validPermissions = evaluateConditions(matchedPermissions, subject, request)

  // Step 5: Apply precedence
  granted = applyPrecedence(validPermissions)

  return granted
```

---

## 4. Data Flow Diagram

```
Subject { id, roles[], attributes }
         |
         v
    [Role Resolver]
         |
         | resolvedRoles: string[]
         v
  [Permission Collector]
         |
         | allPermissions: Permission[]
         v
  [Permission Matcher] <--- AccessRequest { action, resource }
         |
         | matchedPermissions: Permission[]
         v
  [Condition Evaluator] <--- resourceData, environment
         |
         | validPermissions: Permission[]
         v
  [Precedence Resolver]
         |
         v
    boolean (granted)
```

---

## 5. Matching Rules

### 5.1 Action Matching

| Permission Action | Request Action | Match? |
| ----------------- | -------------- | ------ |
| `"read"`          | `"read"`       | ✅ Yes |
| `"read"`          | `"write"`      | ❌ No  |
| `"*"`             | `"read"`       | ✅ Yes |
| `"*"`             | `"write"`      | ✅ Yes |
| `"read"`          | `"*"`          | ✅ Yes |

### 5.2 Resource Matching

| Permission Resource | Request Resource | Match? |
| ------------------- | ---------------- | ------ |
| `"booking"`         | `"booking"`      | ✅ Yes |
| `"booking"`         | `"user"`         | ❌ No  |
| `"*"`               | `"booking"`      | ✅ Yes |
| `"*"`               | `"user"`         | ✅ Yes |
| `"booking"`         | `"*"`            | ✅ Yes |

### 5.3 Wildcard Semantics

- `*` means "match anything"
- Only full wildcard supported in V1
- No partial wildcards (e.g., `"user.*"`, `"*.read"`)
- Wildcard in request vs permission are treated symmetrically

---

## 6. Inheritance Resolution Strategy

### 6.1 Traversal Order

- Depth-first resolution
- Left-to-right priority (first role in `inherits[]` resolved first)
- Duplicates removed after full traversal

### 6.2 Circular Dependency Detection

**Strategy**: Visited Set (Stack-based)

- Maintain a `Set<string>` during recursion
- Add role to set before descending
- Remove role from set after processing (backtracking)
- If role already in set → cycle detected → throw

**Example:**

```
Role A inherits [B]
Role B inherits [C]
Role C inherits [A]

Traversal:
1. Visit A (visited: {A})
2. Visit B (visited: {A, B})
3. Visit C (visited: {A, B, C})
4. Visit A again → A in visited → THROW CircularRoleError
```

### 6.3 Unknown Role Handling

- If a role name doesn't exist in policy → skip silently
- Rationale: fail-safe behavior (deny by default)
- No warnings in V1 (could be added in V2)

---

## 7. Condition Evaluation Strategy

### 7.1 Context Construction

Build context object:

```typescript
{
  subject: Subject,
  resourceData: request.resourceData,
  environment: request.environment
}
```

### 7.2 Execution Safety

- Wrap condition call in try-catch
- If throws → treat as `false` (fail-safe)
- If returns non-boolean → treat as `false`
- Log errors internally (but don't expose to caller in V1)

### 7.3 Determinism Requirement

- Conditions must be pure functions
- No async allowed
- No external state mutation
- Must return boolean

### 7.4 Performance Consideration

- No memoization in V1
- Conditions executed on every evaluation
- Caller responsibility to optimize repeated calls

---

## 8. Error Handling Strategy

### 8.1 Error Classes

**`RbacError`** (base class)

- All RBAC errors extend this
- Contains `message` and `code`

**`CircularRoleError`** extends `RbacError`

- Thrown when circular role inheritance detected
- Contains: `roles` (cycle path)

**`InvalidPermissionError`** extends `RbacError`

- Thrown for malformed permissions (invalid action/resource)
- Contains: `permission` object

**`ConditionEvaluationError`** extends `RbacError`

- Thrown when condition evaluation fails critically
- Contains: `originalError`, `permission`

### 8.2 Error Handling Rules

| Error Scenario                | Behavior                                                |
| ----------------------------- | ------------------------------------------------------- |
| Circular role inheritance     | Throw `CircularRoleError`                               |
| Unknown role                  | Skip silently, continue                                 |
| Condition throws              | Fail-safe: treat as deny                                |
| Condition returns non-boolean | Fail-safe: treat as deny                                |
| Malformed permission          | Throw `InvalidPermissionError` during policy validation |
| Null/undefined subject        | Throw `RbacError`                                       |
| Null/undefined request        | Throw `RbacError`                                       |

### 8.3 Validation Strategy

**Policy Validation** (on engine creation):

- Check all roles for circular inheritance
- Check all permissions have valid action/resource
- Throw immediately if invalid

**Runtime Validation** (on evaluation):

- Validate subject is not null
- Validate request is not null
- Validate action/resource are strings

---

## 9. Performance Considerations

### 9.1 Optimization Points

**Role Resolution Caching** (V1: NOT IMPLEMENTED)

- Could cache resolved roles per subject
- Tradeoff: stale cache if policy changes
- Decision: Skip in V1 for simplicity

**Permission Matching** (V1: Linear Scan)

- No indexing in V1
- Loop through all permissions
- Expected load: <1000 permissions per subject

**Condition Evaluation** (V1: No Memoization)

- Conditions executed fresh every time
- User can memoize externally if needed

### 9.2 Allocation Strategy

- Minimize object creation during evaluation
- Reuse arrays where possible
- Avoid deep cloning unless necessary

### 9.3 Expected Performance

- Single evaluation: <1ms for typical policy
- 1000 evaluations/sec: reasonable target
- No guarantees for pathological cases (e.g., 100-level inheritance)

---

## 10. Edge Cases Handling

### 10.1 Empty Subject Roles

- Subject with `roles: []`
- Result: no permissions → default deny
- Behavior: expected and safe

### 10.2 Empty Policy

- Policy with `roles: []`
- All subjects denied
- Behavior: expected and safe

### 10.3 Wildcard Conflicts

- Permission 1: `{ action: "*", resource: "booking", effect: "allow" }`
- Permission 2: `{ action: "delete", resource: "booking", effect: "deny" }`
- Request: `{ action: "delete", resource: "booking" }`
- Result: DENY (deny precedence)

### 10.4 Multiple Roles with Same Permission

- Subject has roles: `["admin", "manager"]`
- Both define: `{ action: "read", resource: "booking" }`
- Result: duplicates in collection, but precedence logic handles it

### 10.5 Condition with Missing Context

- Condition expects `resourceData.ownerId`
- Request has no `resourceData`
- Result: condition likely throws or returns false → deny

### 10.6 Subject with Unknown Role

- Subject has `roles: ["guest", "unknown"]`
- Policy has only `"guest"` role
- Result: "unknown" skipped, "guest" permissions used

---

## 11. What is NOT Included in V1

### 11.1 Features Explicitly Excluded

- Partial wildcard matching (e.g., `user.*`, `*.read`)
- Async condition evaluation
- Attribute-based access control (ABAC) beyond basic conditions
- Multi-tenant role isolation
- Role hierarchy visualization
- Permission builder UI
- Database persistence layer
- Policy versioning
- Audit logging (beyond basic reason string)
- External policy engines (OPA, Cedar, etc.)
- Dynamic role assignment (subject roles assumed static per request)
- Permission delegation/impersonation
- Time-based permissions (e.g., "allow only between 9am-5pm")
- Rate limiting per permission
- Permission analytics/reporting

### 11.2 Type System Limitations

- No branded types for action/resource strings
- No compile-time permission checking
- No automatic permission generation from routes/components

### 11.3 Performance Features Not Included

- Permission indexing
- Role resolution caching
- Condition memoization
- Policy compilation/optimization

---

## 12. Future Extension Points

### 12.1 Logical Extension Points

**Partial Wildcards** (V2 candidate)

- Extend matching logic to support `user.*`, `*.read`
- Requires pattern parsing and segment matching

**Policy Composition** (V2 candidate)

- Merge multiple policies
- Useful for multi-tenant scenarios

**Async Conditions** (V2 candidate)

- Change condition signature to return `Promise<boolean>`
- Requires async evaluation pipeline

**Attribute-Based Conditions** (V2 candidate)

- Richer context passing
- Standardized attribute resolution

**Caching Layer** (V2 candidate)

- Add optional caching to `RbacEngine`
- Cache resolved roles, effective permissions

### 12.2 Architecture Preservation

All V2 features must:

- Preserve backward compatibility with V1 API
- Not break existing policies
- Maintain deterministic behavior where possible
- Keep core layer framework-agnostic

---

## 13. Implementation Checklist

Before implementation begins:

- [ ] Review this plan with stakeholders
- [ ] Confirm type signatures are sufficient
- [ ] Confirm evaluation algorithm covers all cases
- [ ] Confirm error handling is fail-safe
- [ ] Prepare test cases for all edge cases
- [ ] Prepare test policy examples (simple, inheritance, conditions, deny)

During implementation:

- [ ] Implement types.ts first
- [ ] Implement errors.ts second
- [ ] Implement role-resolver.ts with circular detection tests
- [ ] Implement permission-evaluator.ts with matching tests
- [ ] Implement condition-evaluator.ts with safety tests
- [ ] Implement rbac-engine.ts orchestration
- [ ] Write integration tests for complete evaluation
- [ ] Validate against all edge cases
- [ ] Run typecheck: 0 errors
- [ ] Run tests: 0 skipped, all pass
- [ ] Document public API

---

## 14. Test Coverage Requirements

### 14.1 Unit Tests Required

**role-resolver.ts**

- Flat role list (no inheritance)
- Single-level inheritance
- Multi-level inheritance
- Circular dependency detection (direct)
- Circular dependency detection (indirect, 3+ roles)
- Unknown role handling
- Empty role list

**permission-evaluator.ts**

- Exact action match
- Exact resource match
- Action wildcard (`*`)
- Resource wildcard (`*`)
- No match cases
- Multiple matched permissions

**condition-evaluator.ts**

- Condition returns true
- Condition returns false
- Condition throws error
- Condition returns non-boolean
- Permission without condition

**rbac-engine.ts**

- Allow precedence
- Deny precedence
- Deny overrides allow
- Multiple roles, combined permissions
- Empty policy
- Empty subject roles
- Complete evaluation flow with conditions

### 14.2 Integration Tests Required

- Complex policy with inheritance, conditions, deny rules
- Real-world scenario: admin vs user vs guest
- Performance: 1000 evaluations

---

## 15. Summary

### 15.1 Core Principles

1. **Deterministic**: Same input always produces same output
2. **Fail-safe**: Unknown roles, failed conditions → deny
3. **Explicit**: Deny always overrides allow
4. **Simple**: No magic, no hidden behavior
5. **Pure**: No side effects, no async

### 15.2 Key Decisions

- **Synchronous only**: No async in V1
- **Full wildcard only**: No partial patterns
- **Deny precedence**: Always explicit
- **Circular detection**: Throw immediately
- **Unknown roles**: Skip silently

### 15.3 Non-Goals

- Not a domain model
- Not a UI framework
- Not a persistence layer
- Not a policy editor

### 15.4 Success Criteria

- Can evaluate subject + request → boolean in <1ms
- Handles 100-role policies without stack overflow
- Detects circular roles immediately
- Type-safe public API
- Zero dependencies
- Framework-agnostic

---

**END OF PLAN**

---

**Next Steps:**

1. Review this plan
2. Get approval
3. Begin TDD implementation:
   - Write tests first for each module
   - Implement to pass tests
   - Typecheck after each module
4. Follow UI Component Policy for testing discipline

**Estimated Implementation Time:** 2-4 hours (core only, no React/Dashforge layers)
