import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { SelectFormIntegrationDemo } from './demos/SelectFormIntegrationDemo';
import { SelectConditionalDemo } from './demos/SelectConditionalDemo';
import { SelectRuntimeDependentDemo } from './demos/SelectRuntimeDependentDemo';

interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  demo: React.ReactNode;
  code: string;
  whyItMatters: string;
}

/**
 * SelectScenarios demonstrates Select in realistic, interactive form contexts
 * Each scenario includes a live demo users can interact with, followed by code
 */
export function SelectScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const scenarios: Scenario[] = [
    {
      id: 'react-hook-form-integration',
      title: 'React Hook Form Integration',
      subtitle: 'Try it: Select options and submit the form',
      description:
        'Select integrates seamlessly with React Hook Form through DashForm. Components self-register, errors display automatically, and validation follows familiar RHF patterns. Try submitting without making selections to see validation in action.',
      demo: <SelectFormIntegrationDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { Select } from '@dashforge/ui';

function PreferencesForm() {
  const handleSubmit = (data: FormData) => {
    console.log('Submitted:', data);
  };

  return (
    <DashForm
      defaultValues={{ country: '', language: '' }}
      onSubmit={handleSubmit}
      mode="onBlur"
    >
      <Select
        name="country"
        label="Country"
        rules={{ required: 'Please select a country' }}
        options={[
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
          { value: 'ca', label: 'Canada' },
        ]}
      />
      
      <Select
        name="language"
        label="Language"
        rules={{ required: 'Please select a language' }}
        options={[
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
        ]}
      />
      
      <button type="submit">Submit</button>
    </DashForm>
  );
}

// Select automatically:
// - Registers with React Hook Form
// - Syncs value from form state
// - Displays validation errors when touched
// - Tracks dirty/touched state`,
      whyItMatters:
        'Gradual adoption: Drop Select into existing form architectures without rewriting validation logic or state management.',
    },
    {
      id: 'conditional-field-visibility',
      title: 'Conditional Field Visibility',
      subtitle: 'Try it: Select a shipping method and watch fields appear',
      description:
        'Select supports reactive visibility through the visibleWhen prop. Fields conditionally render based on Select values, enabling dynamic form flows without manual state orchestration. Choose "Express Shipping" to see the delivery date picker appear instantly.',
      demo: <SelectConditionalDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { Select, TextField } from '@dashforge/ui';

function ShippingForm() {
  return (
    <DashForm defaultValues={{ shippingMethod: '', deliveryDate: '' }}>
      <Select
        name="shippingMethod"
        label="Shipping Method"
        options={[
          { value: 'standard', label: 'Standard (5-7 days)' },
          { value: 'express', label: 'Express (2-3 days)' },
          { value: 'overnight', label: 'Overnight' },
        ]}
      />

      {/* Delivery date: visible only for express/overnight */}
      <TextField
        name="deliveryDate"
        label="Preferred Delivery Date"
        type="date"
        rules={{ required: 'Date is required' }}
        visibleWhen={(engine) => {
          const node = engine.getNode('shippingMethod');
          return node?.value === 'express' || node?.value === 'overnight';
        }}
      />

      {/* Special instructions: visible only for overnight */}
      <TextField
        name="specialInstructions"
        label="Special Instructions"
        multiline
        rows={3}
        visibleWhen={(engine) => {
          const node = engine.getNode('shippingMethod');
          return node?.value === 'overnight';
        }}
      />
    </DashForm>
  );
}

// The Engine API provides:
// - getNode(name): Access any field's state
// - Reactive updates: Components re-render on dependency changes
// - Type-safe predicates: Full TypeScript support`,
      whyItMatters:
        'Move beyond static forms: Build adaptive workflows where field visibility responds to Select changes. The component handles reactivity—you define the rules.',
    },
    {
      id: 'runtime-dependent-dropdowns',
      title: 'Runtime-Driven Dependent Dropdowns',
      subtitle: 'Try it: Select a country and watch cities load dynamically',
      description:
        'Select supports dependent dropdowns through runtime options (Reactive V2). When one field changes, reactions can load new options for dependent fields. This example shows country/city selection with async option loading, loading states, and generic option shapes. Notice how changing countries demonstrates unresolved value behavior—the display clears but the form value remains unchanged.',
      demo: <SelectRuntimeDependentDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { Select } from '@dashforge/ui';

interface City {
  cityId: string;
  cityName: string;
  countryCode: string;
}

const MOCK_CITIES: City[] = [
  { cityId: 'nyc', cityName: 'New York', countryCode: 'us' },
  { cityId: 'tor', cityName: 'Toronto', countryCode: 'ca' },
  { cityId: 'lon', cityName: 'London', countryCode: 'uk' },
  // ...more cities
];

function LocationForm() {
  return (
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
              data: null 
            });
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Filter cities by country
            const cities = MOCK_CITIES.filter(
              c => c.countryCode === country
            );
            
            // Update runtime with options
            ctx.setRuntime('city', {
              status: 'ready',
              data: { options: cities }
            });
          }
        }
      ]}
    >
      <Select
        name="country"
        label="Country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'uk', label: 'United Kingdom' },
        ]}
      />

      <Select
        name="city"
        label="City"
        optionsFromFieldData="city"
        getOptionValue={(opt: City) => opt.cityId}
        getOptionLabel={(opt: City) => opt.cityName}
        visibleWhen={(engine) =>
          engine.getNode('country')?.value !== ''
        }
      />
    </DashForm>
  );
}

// Reactive V2 enables:
// - Runtime-driven options via optionsFromFieldData
// - Generic option shapes via mapper functions
// - Loading states automatically handled
// - No automatic value reset (business data responsibility)`,
      whyItMatters:
        'Build complex forms with dependent data loading. The framework handles reactivity, loading states, and data flow—you define the dependencies. Unresolved values (when switching countries) display empty but maintain form integrity.',
    },
  ];

  return (
    <Stack spacing={4}>
      <Typography
        variant="body1"
        sx={{
          fontSize: 15,
          lineHeight: 1.75,
          color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
          maxWidth: 720,
        }}
      >
        Select works in real form contexts, not just isolated demos. Try these
        live scenarios to experience DashForm integration and reactive
        visibility—both fully implemented and production-ready.
      </Typography>

      <Stack spacing={5}>
        {scenarios.map((scenario, index) => (
          <Box key={scenario.id}>
            <Stack spacing={3}>
              {/* Header */}
              <Box>
                <Typography
                  id={scenario.id}
                  variant="h3"
                  sx={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: isDark
                      ? 'rgba(255,255,255,0.95)'
                      : 'rgba(15,23,42,0.95)',
                    mb: 0.5,
                  }}
                >
                  {scenario.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: isDark
                      ? 'rgba(139,92,246,0.85)'
                      : 'rgba(109,40,217,0.90)',
                  }}
                >
                  {scenario.subtitle}
                </Typography>
              </Box>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                }}
              >
                {scenario.description}
              </Typography>

              {/* Live Preview with Collapsible Code */}
              <DocsPreviewBlock code={scenario.code}>
                {scenario.demo}
              </DocsPreviewBlock>

              {/* Why It Matters */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: isDark
                    ? 'rgba(139,92,246,0.08)'
                    : 'rgba(139,92,246,0.05)',
                  border: isDark
                    ? '1px solid rgba(139,92,246,0.20)'
                    : '1px solid rgba(139,92,246,0.15)',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: isDark
                      ? 'rgba(139,92,246,0.90)'
                      : 'rgba(109,40,217,0.95)',
                    mb: 0.5,
                  }}
                >
                  Why it matters
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(15,23,42,0.70)',
                  }}
                >
                  {scenario.whyItMatters}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
