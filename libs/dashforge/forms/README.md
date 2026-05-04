# @dashforge/forms

Type-safe form bridge for react-hook-form with Dashforge UI components.

## Installation

```bash
npm install @dashforge/forms @dashforge/ui-core
npm install react-hook-form react
```

## Peer Dependencies

- `react@^18.0.0 || ^19.0.0`
- `@dashforge/ui-core@^0.1.0-alpha`

## Usage

### Basic Setup

```typescript
import { DashFormProvider, useDashForm } from '@dashforge/forms';
import { useForm } from 'react-hook-form';

function MyForm() {
  const form = useForm();
  const bridge = useDashForm(form);

  return (
    <DashFormProvider bridge={bridge}>
      {/* Form components automatically connect to react-hook-form */}
    </DashFormProvider>
  );
}
```

### Schema-Based Validation (Resolver)

Dashforge forms support React Hook Form's resolver pattern for schema-based validation. This allows you to use validation libraries like Zod, Yup, Joi, etc.

**Note:** Validation libraries are NOT bundled with Dashforge. Install them separately as needed.

#### With Zod

```bash
npm install zod @hookform/resolvers
```

```typescript
import { DashFormProvider } from '@dashforge/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define your schema
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18 years old'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

type UserFormValues = z.infer<typeof userSchema>;

function UserForm() {
  return (
    <DashFormProvider<UserFormValues>
      resolver={zodResolver(userSchema)}
      defaultValues={{ email: '', age: 0, username: '' }}
    >
      {/* Form fields will be validated against the schema */}
    </DashFormProvider>
  );
}
```

#### With Yup

```bash
npm install yup @hookform/resolvers
```

```typescript
import { DashFormProvider } from '@dashforge/forms';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  age: yup.number().min(18).required(),
}).required();

function MyForm() {
  return (
    <DashFormProvider
      resolver={yupResolver(schema)}
      defaultValues={{ email: '', age: 0 }}
    >
      {/* Form content */}
    </DashFormProvider>
  );
}
```

#### Validation Behavior

- When a `resolver` is provided, it becomes the **primary validation source**
- Field-level validation rules (via `register()` options) may still be defined, but the resolver takes precedence per React Hook Form's validation flow
- Validation errors from the resolver are accessible via `bridge.getError(fieldName)`
- All existing Dashforge features (error gating, touch tracking, reactions) work seamlessly with resolvers

## Features

- **Type-safe bridge** between react-hook-form and Dashforge components
- **Automatic registration** and validation
- **Schema-based validation** via resolver pass-through (Zod, Yup, Joi, etc.)
- **Error state management** with Form Closure v1 rules
- **Touch tracking** for MUI and native components
- **Zero unsafe casts** in public API

## Core Exports

- `DashFormProvider` - Context provider for form bridge
- `useDashForm` - Hook to create form bridge
- `DashFormBridge` - Bridge interface
- `FieldRegistration` - Registration contract

## TypeScript Support

Full TypeScript type definitions with strict mode compatibility.

## License

MIT
