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

## Features

- **Type-safe bridge** between react-hook-form and Dashforge components
- **Automatic registration** and validation
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
