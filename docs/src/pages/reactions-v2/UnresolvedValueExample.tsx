import { Stack, Typography } from '@mui/material';
import { Select } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';
import type { ReactionDefinition } from '@dashforge/forms';
import { ExampleSection } from './ExampleSection';

interface UnresolvedValueForm {
  category: string;
  item: string;
}

// Simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function UnresolvedValueExample() {
  const categories = [
    { value: 'cat-a', label: 'Category A' },
    { value: 'cat-b', label: 'Category B' },
  ];

  const reactions: ReactionDefinition[] = [
    {
      id: 'fetch-items',
      watch: ['category'],
      when: (ctx) => Boolean(ctx.getValue('category')),
      run: async (ctx) => {
        const requestId = ctx.beginAsync('fetch-items');

        ctx.setRuntime('item', { status: 'loading', error: null, data: null });

        await delay(300);

        // Intentionally return options that DON'T include the preset value
        const options = [
          { value: 'new-option-1', label: 'New Option 1' },
          { value: 'new-option-2', label: 'New Option 2' },
        ];

        if (ctx.isLatest('fetch-items', requestId)) {
          ctx.setRuntime('item', {
            status: 'ready',
            error: null,
            data: { options },
          });
        }
      },
    },
  ];

  return (
    <ExampleSection
      title="Example 3: Unresolved Value Scenario"
      description="Demonstrates current unresolved value policy: empty UI display, no automatic reset, dev-only warning, no user-facing error message."
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This form starts with a preset item value that does not match the loaded
        options. The Select displays empty (no selection), the form value remains
        unchanged, and a dev-only console warning is emitted (open browser console
        in dev mode to observe).
      </Typography>
      <DashForm<UnresolvedValueForm>
        defaultValues={{
          category: 'cat-a', // Trigger initial reaction
          item: 'old-deleted-item', // This won't match loaded options
        }}
        reactions={reactions}
      >
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Select name="category" label="Category" options={categories} />
          <Select name="item" label="Item" optionsFromFieldData />
        </Stack>
      </DashForm>
    </ExampleSection>
  );
}
