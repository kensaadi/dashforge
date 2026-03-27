import { Stack, Button, Typography, Box, Alert } from '@mui/material';
import { Autocomplete, Select } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';
import type { ReactionDefinition } from '@dashforge/forms';
import { ExampleSection } from './ExampleSection';
import { CATEGORIES, fetchSubcategories } from './mockDataSources';
import { useState } from 'react';

interface RuntimeOptionsForm {
  category: string;
  subcategory: string;
}

export function RuntimeOptionsExample() {
  const [submittedData, setSubmittedData] = useState<RuntimeOptionsForm | null>(
    null
  );

  // Define reaction to fetch subcategories when category changes
  const reactions: ReactionDefinition[] = [
    {
      id: 'fetch-subcategories',
      watch: ['category'],
      when: (ctx) => Boolean(ctx.getValue('category')),
      run: async (ctx) => {
        const requestId = ctx.beginAsync('fetch-subcategories');

        // Set loading state
        ctx.setRuntime('subcategory', {
          status: 'loading',
          error: null,
          data: null,
        });

        const category = ctx.getValue<string>('category');
        const subcategories = await fetchSubcategories(category);

        // Update runtime data with fetched options
        if (ctx.isLatest('fetch-subcategories', requestId)) {
          ctx.setRuntime('subcategory', {
            status: 'ready',
            error: null,
            data: { options: subcategories },
          });
        }
      },
    },
  ];

  return (
    <ExampleSection
      title="Example 5: Runtime Options (Reactive V2)"
      description="Demonstrates runtime-driven options using optionsFromFieldData. The Autocomplete is disabled during loading."
    >
      <Alert severity="info" sx={{ mb: 2 }}>
        Select a category to trigger an async fetch. The subcategory
        Autocomplete will show a loading state (disabled) while fetching, then
        populate with options. This demonstrates real runtime behavior, not fake
        local state.
      </Alert>

      <DashForm<RuntimeOptionsForm>
        defaultValues={{
          category: '',
          subcategory: '',
        }}
        reactions={reactions}
        onSubmit={(data) => {
          setSubmittedData(data);
        }}
      >
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Select
            name="category"
            label="Category"
            options={CATEGORIES}
            helperText="Select to load subcategories"
          />
          <Autocomplete<string, string>
            name="subcategory"
            label="Subcategory"
            options={[]} // Static fallback (empty)
            optionsFromFieldData // Load options from runtime data
            helperText="Options loaded from runtime data"
          />
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </Stack>
      </DashForm>

      {submittedData && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            Submitted Data:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ mt: 1 }}>
            {JSON.stringify(submittedData, null, 2)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Notice: Subcategory options were loaded dynamically based on
            category selection.
          </Typography>
        </Box>
      )}
    </ExampleSection>
  );
}
