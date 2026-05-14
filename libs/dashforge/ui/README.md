# @dashforge/ui

Comprehensive MUI-based UI component library with form integration and RBAC support.

## Installation

```bash
pnpm add @dashforge/ui @dashforge/ui-core @dashforge/forms @dashforge/rbac \
        @mui/material @emotion/react @emotion/styled \
        react react-dom react-hook-form
```

## Peer Dependencies

- `react@^18.0.0 || ^19.0.0`
- `react-dom@^18.0.0 || ^19.0.0`
- `@mui/material@^9.0.0` (since `0.1.7-alpha`)
- `@emotion/react@^11.0.0`
- `@emotion/styled@^11.0.0`
- `@dashforge/forms@^0.2.0-beta`
- `@dashforge/rbac@^0.2.0-beta`
- `@dashforge/ui-core@^0.2.0-beta`
- `react-hook-form@^7.71.0`

## Usage

```tsx
import { DashFormProvider } from '@dashforge/forms';
import { TextField, Select, Checkbox } from '@dashforge/ui';

function MyForm() {
  return (
    <DashFormProvider defaultValues={{ email: '', country: '' }}>
      <TextField name="email" label="Email" rules={{ required: 'Email is required' }} />
      <Select
        name="country"
        label="Country"
        options={[
          { value: 'it', label: 'Italy' },
          { value: 'us', label: 'United States' },
        ]}
      />
      <Checkbox name="acceptTerms" label="I accept the terms" />
    </DashFormProvider>
  );
}
```

Components register with `react-hook-form` and the engine through the
`DashFormBridge` automatically: just pass `name`, and they bind themselves.
When rendered outside `DashFormProvider` they fall back to controlled mode
(`value` + `onChange` props).

## What you get

- **TextField, Select, Autocomplete, Textarea, NumberField, OTPField,
  DateTimePicker, Checkbox, Switch, RadioGroup** — form inputs wired to
  the Dashforge bridge with field-level subscriptions (re-render only on
  the field that actually changed).
- **AppShell, LeftNav, TopBar** — layout primitives for back-office UIs.
- **Snackbar, ConfirmDialog** — feedback primitives with imperative API.
- **RBAC integration** — every input accepts an `access` prop that
  evaluates `@dashforge/rbac` permissions and hides / disables / read-only's
  the field accordingly.
- **MUI v9 slotProps** — zero deprecation warnings under React 19 + MUI v9.

## Documentation

- [Package CHANGELOG](./CHANGELOG.md) — release history for `@dashforge/ui`.
- [Top-level CHANGELOG](https://github.com/kensaadi/dashforge/blob/main/CHANGELOG.md) — cross-package release context.
- [MIGRATION.md](https://github.com/kensaadi/dashforge/blob/main/MIGRATION.md) — breaking-change upgrade guides (including `0.1.9-alpha → 0.2.0-beta`).
- [Roadmap to 1.0](https://github.com/kensaadi/dashforge/blob/main/ROADMAP-1.0.md).

## License

MIT
