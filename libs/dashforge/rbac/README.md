# @dashforge/rbac

Production-grade RBAC (Role-Based Access Control) for Dashforge.

## Status

V1 Core Implementation

## Features

- Deterministic permission evaluation
- Role inheritance with circular dependency detection
- Allow/Deny precedence
- Wildcard support (`*` for action/resource)
- Synchronous condition evaluation
- Framework-agnostic core

## Installation

```bash
npm install @dashforge/rbac
```

## Usage

```typescript
import { createRbacEngine, type RbacPolicy } from '@dashforge/rbac';

const policy: RbacPolicy = {
  roles: [
    {
      name: 'admin',
      permissions: [{ action: '*', resource: '*', effect: 'allow' }],
    },
    {
      name: 'user',
      permissions: [{ action: 'read', resource: 'booking', effect: 'allow' }],
    },
  ],
};

const rbac = createRbacEngine(policy);

const canRead = rbac.can(
  { id: '1', roles: ['user'] },
  { action: 'read', resource: 'booking' }
);
```

## License

MIT
