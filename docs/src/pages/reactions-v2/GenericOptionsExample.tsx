import { Stack, Typography } from '@mui/material';
import { Select } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';
import type { ReactionDefinition } from '@dashforge/forms';
import { ExampleSection } from './ExampleSection';
import { fetchCustomOptions, type CustomOption } from './mockDataSources';

interface GenericOptionsForm {
  category: string;
  customItem: number; // Note: value is number (id)
}

export function GenericOptionsExample() {
  const categories = [
    { value: 'category-a', label: 'Category A' },
    { value: 'category-b', label: 'Category B' },
  ];

  const reactions: ReactionDefinition[] = [
    {
      id: 'fetch-custom-options',
      watch: ['category'],
      when: (ctx) => Boolean(ctx.getValue('category')),
      run: async (ctx) => {
        const category = ctx.getValue<string>('category');
        const requestId = ctx.beginAsync('fetch-custom-options');

        ctx.setRuntime('customItem', {
          status: 'loading',
          error: null,
          data: null,
        });

        try {
          const options = await fetchCustomOptions(category);

          if (ctx.isLatest('fetch-custom-options', requestId)) {
            ctx.setRuntime('customItem', {
              status: 'ready',
              error: null,
              data: { options }, // Array of { id, name, active }
            });
          }
        } catch (error) {
          if (ctx.isLatest('fetch-custom-options', requestId)) {
            ctx.setRuntime('customItem', {
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
              data: null,
            });
          }
        }
      },
    },
  ];

  return (
    <ExampleSection
      title="Example 4: Generic Option Shape with Mappers"
      description="Verifies that runtime options aren't locked to { value, label } shape. Uses custom { id, name, active } shape with mapper functions."
    >
      <DashForm<GenericOptionsForm>
        defaultValues={{ category: '', customItem: 0 }}
        reactions={reactions}
      >
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Select name="category" label="Category" options={categories} />
          <Select<number, CustomOption>
            name="customItem"
            label="Custom Item"
            optionsFromFieldData
            getOptionValue={(opt) => opt.id}
            getOptionLabel={(opt) => opt.name}
            getOptionDisabled={(opt) => !opt.active}
          />

          <Typography variant="caption" color="text.secondary">
            Options use custom shape: {`{ id: number, name: string, active: boolean }`}
          </Typography>
        </Stack>
      </DashForm>
    </ExampleSection>
  );
}
