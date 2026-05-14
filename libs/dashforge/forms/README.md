# @dashforge/forms

Type-safe form bridge for react-hook-form with Dashforge UI components.

## Installation

```bash
npm install @dashforge/forms @dashforge/ui-core
npm install react-hook-form react
```

## Peer Dependencies

- `react@^18.0.0 || ^19.0.0`
- `@dashforge/ui-core@^0.1.8-alpha`

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

### Dynamic Field Arrays

Dashforge provides `useDashFieldArray` for managing dynamic lists of form fields (e.g., multiple addresses, phone numbers, or dynamic configurations).

**V1 Notice:** This is a thin adapter over React Hook Form's `useFieldArray` with Dashforge-style API. It provides **developer experience improvements** (pre-computed field names, stable IDs, type-safe interface) but does **not claim performance benefits** over raw RHF. Performance profiling is planned for a future phase.

```typescript
import { useDashFieldArray } from '@dashforge/forms';

interface Address {
  street: string;
  city: string;
  zipCode: string;
}

function AddressForm() {
  const { fields, append, remove, move } = useDashFieldArray<Address>('addresses');

  return (
    <>
      {fields.map((field) => (
        <div key={field.id}>
          <TextField name={`${field.name}.street`} label="Street" />
          <TextField name={`${field.name}.city`} label="City" />
          <TextField name={`${field.name}.zipCode`} label="Zip Code" />
          <Button onClick={() => remove(field.index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={() => append({ street: '', city: '', zipCode: '' })}>
        Add Address
      </Button>
    </>
  );
}
```

**Key Features:**
- **Pre-computed field names:** `field.name` provides the full path (e.g., `"addresses.0"`) without manual template strings
- **Stable IDs:** `field.id` is stable across operations for React keys
- **Type-safe operations:** `append`, `remove`, `move`, `insert`, `replace` are fully typed
- **Dashforge-owned types:** API designed for future engine-native optimization without breaking changes

**API:**
- `fields`: Array of field items with `{ id, index, name }` metadata
- `append(item)`: Add item to end
- `remove(index)`: Remove item at index
- `move(from, to)`: Reorder items
- `insert(index, item)`: Insert at specific position
- `replace(items)`: Replace entire array

**Important:** This hook must be called inside a `DashFormProvider` context.

## Features

- **Type-safe bridge** between react-hook-form and Dashforge components
- **Automatic registration** and validation
- **Schema-based validation** via resolver pass-through (Zod, Yup, Joi, etc.)
- **Dynamic field arrays** with pre-computed paths and stable IDs
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

## Documentation

- [Package CHANGELOG](./CHANGELOG.md) — release history for this package.
- [Top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md) — cross-package release context.
- [MIGRATION.md](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md) — breaking-change upgrade guides.
- [Roadmap to 1.0](https://github.com/kensaadi/dashforge/blob/main/ROADMAP-1.0.md).

## License

MIT
