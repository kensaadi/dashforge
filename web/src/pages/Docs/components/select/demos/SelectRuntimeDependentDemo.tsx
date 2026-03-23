import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DashForm } from '@dashforge/forms';
import { Select } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

interface City {
  cityId: string;
  cityName: string;
  countryCode: string;
}

// Mock data
const MOCK_CITIES: City[] = [
  { cityId: 'nyc', cityName: 'New York', countryCode: 'us' },
  { cityId: 'la', cityName: 'Los Angeles', countryCode: 'us' },
  { cityId: 'chi', cityName: 'Chicago', countryCode: 'us' },
  { cityId: 'tor', cityName: 'Toronto', countryCode: 'ca' },
  { cityId: 'van', cityName: 'Vancouver', countryCode: 'ca' },
  { cityId: 'mtl', cityName: 'Montreal', countryCode: 'ca' },
  { cityId: 'lon', cityName: 'London', countryCode: 'uk' },
  { cityId: 'man', cityName: 'Manchester', countryCode: 'uk' },
  { cityId: 'edi', cityName: 'Edinburgh', countryCode: 'uk' },
];

/**
 * SelectRuntimeDependentDemo - Live demo of dependent dropdowns with runtime options
 * Demonstrates Reactive V2 capabilities: async loading, dependent fields, unresolved values
 */
export function SelectRuntimeDependentDemo() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(248,250,252,0.60)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(15,23,42,0.08)',
      }}
    >
      <DashForm
        defaultValues={{ country: '', city: '' }}
        reactions={[
          {
            id: 'load-cities',
            watch: ['country'],
            when: (ctx) => ctx.getValue('country') !== '',
            run: async (ctx) => {
              const country = ctx.getValue<string>('country');

              // Set loading state
              ctx.setRuntime('city', {
                status: 'loading',
                data: null,
              });

              // Simulate API call delay
              await new Promise((resolve) => setTimeout(resolve, 800));

              // Filter cities by selected country
              const cities = MOCK_CITIES.filter(
                (c) => c.countryCode === country
              );

              // Update runtime with loaded options
              ctx.setRuntime('city', {
                status: 'ready',
                data: { options: cities },
              });
            },
          },
        ]}
      >
        <Stack spacing={2.5}>
          <Select
            name="country"
            label="Country"
            fullWidth
            options={[
              { value: 'us', label: 'United States' },
              { value: 'ca', label: 'Canada' },
              { value: 'uk', label: 'United Kingdom' },
            ]}
          />

          <Select
            name="city"
            label="City"
            fullWidth
            optionsFromFieldData="city"
            getOptionValue={(opt: City) => opt.cityId}
            getOptionLabel={(opt: City) => opt.cityName}
            visibleWhen={(engine) => {
              return engine.getNode('country')?.value !== '';
            }}
          />

          <Typography
            variant="caption"
            sx={{
              fontSize: 13,
              lineHeight: 1.6,
              color: isDark
                ? 'rgba(255,255,255,0.60)'
                : 'rgba(15,23,42,0.60)',
              fontStyle: 'italic',
            }}
          >
            <strong>Try it:</strong> Select a country and watch the city field
            appear with loading state, then display cities for that country. If
            you switch countries after selecting a city, the display clears but
            the form value remains unchanged (no automatic reset).
          </Typography>
        </Stack>
      </DashForm>
    </Box>
  );
}
