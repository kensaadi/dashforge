import { Stack } from '@mui/material';
import { Select } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';
import type { ReactionDefinition } from '@dashforge/forms';
import { ExampleSection } from './ExampleSection';
import { fetchProvinces } from './mockDataSources';

interface CountryProvinceForm {
  country: string;
  province: string;
}

export function CountryProvinceExample() {
  const countries = [
    { value: 'usa', label: 'United States' },
    { value: 'canada', label: 'Canada' },
    { value: 'mexico', label: 'Mexico' },
  ];

  const reactions: ReactionDefinition[] = [
    {
      id: 'fetch-provinces',
      watch: ['country'],
      when: (ctx) => Boolean(ctx.getValue('country')),
      run: async (ctx) => {
        const country = ctx.getValue<string>('country');
        const requestId = ctx.beginAsync('fetch-provinces');

        // Set loading state
        ctx.setRuntime('province', {
          status: 'loading',
          error: null,
          data: null,
        });

        try {
          const options = await fetchProvinces(country);

          // Only update if still latest request
          if (ctx.isLatest('fetch-provinces', requestId)) {
            ctx.setRuntime('province', {
              status: 'ready',
              error: null,
              data: { options },
            });
          }
        } catch (error) {
          if (ctx.isLatest('fetch-provinces', requestId)) {
            ctx.setRuntime('province', {
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
      title="Example 1: Country → Province"
      description="Verifies Select runtime options loading and reaction execution on field change."
    >
      <DashForm<CountryProvinceForm>
        defaultValues={{ country: '', province: '' }}
        reactions={reactions}
      >
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Select name="country" label="Country" options={countries} />
          <Select name="province" label="Province/State" optionsFromFieldData />
        </Stack>
      </DashForm>
    </ExampleSection>
  );
}
