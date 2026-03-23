import { Stack } from '@mui/material';
import { Select } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';
import type { ReactionDefinition } from '@dashforge/forms';
import { ExampleSection } from './ExampleSection';
import { fetchProvinces, fetchCities } from './mockDataSources';

interface CountryProvinceCityForm {
  country: string;
  province: string;
  city: string;
}

export function CountryProvinceCityExample() {
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

        ctx.setRuntime('province', {
          status: 'loading',
          error: null,
          data: null,
        });

        try {
          const options = await fetchProvinces(country);

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
    {
      id: 'fetch-cities',
      watch: ['province'],
      when: (ctx) => Boolean(ctx.getValue('province')),
      run: async (ctx) => {
        const province = ctx.getValue<string>('province');
        const requestId = ctx.beginAsync('fetch-cities');

        ctx.setRuntime('city', {
          status: 'loading',
          error: null,
          data: null,
        });

        try {
          const options = await fetchCities(province);

          if (ctx.isLatest('fetch-cities', requestId)) {
            ctx.setRuntime('city', {
              status: 'ready',
              error: null,
              data: { options },
            });
          }
        } catch (error) {
          if (ctx.isLatest('fetch-cities', requestId)) {
            ctx.setRuntime('city', {
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
      title="Example 2: Country → Province → City"
      description="Verifies chained reactions with multiple runtime-driven selects."
    >
      <DashForm<CountryProvinceCityForm>
        defaultValues={{ country: '', province: '', city: '' }}
        reactions={reactions}
      >
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <Select name="country" label="Country" options={countries} />
          <Select name="province" label="Province/State" optionsFromFieldData />
          <Select name="city" label="City" optionsFromFieldData />
        </Stack>
      </DashForm>
    </ExampleSection>
  );
}
