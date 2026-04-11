# @dashforge/ui

Comprehensive MUI-based UI component library with form integration and RBAC support.

## Installation

```bash
npm install @dashforge/ui @dashforge/ui-core @dashforge/rbac
npm install @mui/material @emotion/react @emotion/styled
npm install react react-dom
```

## Peer Dependencies

- `react@^18.0.0 || ^19.0.0`
- `react-dom@^18.0.0 || ^19.0.0`
- `@mui/material@^7.0.0`
- `@emotion/react@^11.0.0`
- `@emotion/styled@^11.0.0`
- `@dashforge/ui-core@^0.1.0-alpha`
- `@dashforge/rbac@^0.1.0-alpha`

## Usage

```typescript
import { DashButton, DashTextField, DashSelect } from '@dashforge/ui';

function MyApp() {
  return (
    <div>
      <DashTextField label="Email" name="email" />
      <DashButton variant="primary">Submit</DashButton>
    </div>
  );
}
```

## Features

- **Form-connected components** with DashFormBridge integration
- **RBAC support** for permission-based UI rendering
- **MUI-based** with consistent theming
- **Accessible** and keyboard-navigable
- **Type-safe** with full TypeScript support
- **Tested** with unit and integration tests

## Component Categories

- **Form inputs**: TextField, Select, Checkbox, Radio, Switch
- **Buttons**: Button, IconButton, LoadingButton
- **Layout**: Container, Grid, Stack, Box
- **Feedback**: Alert, Dialog, Snackbar, Progress
- **Data display**: Table, List, Card, Chip

## Form Integration

Components automatically integrate with `@dashforge/forms`:

```typescript
import { DashFormProvider } from '@dashforge/forms';
import { DashTextField } from '@dashforge/ui';

<DashFormProvider bridge={bridge}>
  <DashTextField name="email" label="Email" />
  {/* Automatically registers with react-hook-form */}
</DashFormProvider>;
```

## TypeScript Support

Full TypeScript type definitions with strict mode compatibility.

## License

MIT
