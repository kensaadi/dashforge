import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import {
  DocsHeroSection,
  DocsSection,
  DocsDivider,
  DocsApiTable,
  DocsRelatedSection,
  DocsCalloutBox,
  type ApiPropDefinition,
} from '../components/shared';
import { DocsCodeBlock } from '../components/shared/CodeBlock';

/**
 * Form System API Reference
 * Complete API documentation for form system
 */
export function FormSystemApi() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const dashFormProps: ApiPropDefinition[] = [
    {
      name: 'reactions',
      type: 'ReactionDefinition[]',
      defaultValue: '[]',
      description: 'Array of reaction definitions for dynamic behavior',
    },
    {
      name: 'resolver',
      type: 'Resolver<FormValues>',
      defaultValue: '-',
      description: 'Optional schema-based validation resolver (Zod, Yup, Joi, etc.)',
    },
    {
      name: 'onSubmit',
      type: '(data: FormValues) => void | Promise<void>',
      defaultValue: 'required',
      description: 'Form submission handler',
    },
    {
      name: 'defaultValues',
      type: 'Partial<FormValues>',
      defaultValue: '-',
      description: 'Initial form values',
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      defaultValue: 'required',
      description: 'Form fields and content',
    },
  ];

  const reactionProps: ApiPropDefinition[] = [
    {
      name: 'id',
      type: 'string',
      defaultValue: 'required',
      description: 'Unique identifier',
    },
    {
      name: 'watch',
      type: 'string[]',
      defaultValue: 'required',
      description: 'Field names to watch',
    },
    {
      name: 'when',
      type: '(ctx: WhenContext) => boolean',
      defaultValue: '-',
      description: 'Optional condition',
    },
    {
      name: 'run',
      type: '(ctx: RunContext) => void | Promise<void>',
      defaultValue: 'required',
      description: 'Effect to execute',
    },
  ];

  const runContextProps: ApiPropDefinition[] = [
    {
      name: 'getValue<T>(name)',
      type: '(name: string) => T',
      defaultValue: '-',
      description: 'Read field value',
    },
    {
      name: 'setValue(name, value)',
      type: '(name: string, value: unknown) => void',
      defaultValue: '-',
      description: 'Update field value',
    },
    {
      name: 'getRuntime<TData>(name)',
      type: '(name: string) => FieldRuntimeState<TData>',
      defaultValue: '-',
      description: 'Read runtime state',
    },
    {
      name: 'setRuntime<TData>(name, patch)',
      type: '(name: string, patch: Partial<FieldRuntimeState<TData>>) => void',
      defaultValue: '-',
      description: 'Update runtime state',
    },
    {
      name: 'beginAsync(key)',
      type: '(key: string) => number',
      defaultValue: '-',
      description: 'Start async operation',
    },
    {
      name: 'isLatest(key, id)',
      type: '(key: string, requestId: number) => boolean',
      defaultValue: '-',
      description: 'Check if response is valid',
    },
  ];

  const runtimeStateProps: ApiPropDefinition[] = [
    {
      name: 'status',
      type: "'idle' | 'loading' | 'ready' | 'error'",
      defaultValue: "'idle'",
      description: 'Current operation status',
    },
    {
      name: 'data',
      type: 'TData | null',
      defaultValue: 'null',
      description: 'Runtime data (e.g., options)',
    },
    {
      name: 'error',
      type: 'string | null',
      defaultValue: 'null',
      description: 'Error message if status is error',
    },
  ];

  const validationComparisonProps: ApiPropDefinition[] = [
    {
      name: 'Field Rules',
      type: 'rules prop',
      defaultValue: '-',
      description: 'Simple field-level validation (required, min, max, pattern)',
    },
    {
      name: 'Resolver',
      type: 'resolver prop',
      defaultValue: '-',
      description: 'Schema-based validation with type safety and reusable schemas',
    },
    {
      name: 'Reactions',
      type: 'reactions array',
      defaultValue: '-',
      description: 'Dynamic cross-field validation triggered by value changes',
    },
  ];

  const zodExampleCode = `import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashForm, TextField, NumberField } from '@dashforge/ui';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormValues = z.infer<typeof schema>;

function RegistrationForm() {
  const handleSubmit = (data: FormValues) => {
    console.log('Valid data:', data);
  };

  return (
    <DashForm
      resolver={zodResolver(schema)}
      defaultValues={{ email: '', age: 0, password: '' }}
      onSubmit={handleSubmit}
    >
      <TextField name="email" label="Email" />
      <NumberField name="age" label="Age" />
      <TextField name="password" label="Password" type="password" />
    </DashForm>
  );
}`;

  const yupExampleCode = `import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DashForm, TextField } from '@dashforge/ui';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password too short').required('Required'),
});

function LoginForm() {
  return (
    <DashForm
      resolver={yupResolver(schema)}
      defaultValues={{ email: '', password: '' }}
      onSubmit={(data) => console.log(data)}
    >
      <TextField name="email" label="Email" />
      <TextField name="password" label="Password" type="password" />
    </DashForm>
  );
}`;

  return (
    <Stack spacing={8}>
      <DocsHeroSection
        title="API Reference"
        description="Complete reference for Form System APIs."
        themeColor="purple"
      />

      <DocsSection
        id="dashform"
        title="DashForm"
        description="Main form provider component"
      >
        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            The DashForm component wraps your form and provides the reactive
            engine, reactions, and runtime store.
          </Typography>

          <DocsCodeBlock
            code={`import { DashForm } from '@dashforge/ui';

<DashForm
  reactions={reactions}
  defaultValues={{ country: 'United States' }}
  onSubmit={(data) => console.log(data)}
>
  {/* form fields */}
</DashForm>`}
            language="tsx"
          />

          <DocsApiTable props={dashFormProps} />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="schema-based-validation"
        title="Schema-Based Validation (Resolver)"
        description="Using validation schemas with Zod, Yup, or other resolvers"
      >
        <Stack spacing={3}>
          <DocsCalloutBox
            type="info"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Architectural note:</strong> Dashforge does NOT bundle
                or provide validation logic. The resolver is a pure pass-through
                to React Hook Form. Users must install and configure their own
                validation library such as Zod, Yup, Joi, Valibot, or ArkType.
              </Typography>
            }
          />

          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            The resolver prop accepts a React Hook Form resolver function.
            Resolvers translate validation schemas into error objects. This
            enables schema-based validation instead of field-level rules.
          </Typography>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: isDark ? '#a78bfa' : '#7c3aed',
                mb: 1.5,
              }}
            >
              Field Rules vs Resolver
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: 15,
                lineHeight: 1.7,
                color: isDark
                  ? 'rgba(255,255,255,0.70)'
                  : 'rgba(15,23,42,0.70)',
                mb: 2,
              }}
            >
              Use <code>rules</code> for simple field-level validation. Use{' '}
              <code>resolver</code> for schema-based validation.
            </Typography>

            <DocsApiTable props={validationComparisonProps} />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: isDark ? '#a78bfa' : '#7c3aed',
                mb: 1.5,
              }}
            >
              With Zod
            </Typography>

            <DocsCodeBlock code={`npm install zod @hookform/resolvers`} language="bash" />

            <DocsCodeBlock code={zodExampleCode} language="tsx" />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: isDark ? '#a78bfa' : '#7c3aed',
                mb: 1.5,
              }}
            >
              With Yup
            </Typography>

            <DocsCodeBlock code={`npm install yup @hookform/resolvers`} language="bash" />

            <DocsCodeBlock code={yupExampleCode} language="tsx" />
          </Box>

          <DocsCalloutBox
            type="success"
            message={
              <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
                <strong>Validation flow:</strong> When a resolver is provided,
                it becomes the primary validation source. Errors still flow
                through bridge.getError() and display automatically in Dashforge
                UI components. Error gating, touch tracking, and all other
                features work normally.
              </Typography>
            }
          />

          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: isDark ? '#a78bfa' : '#7c3aed',
                mb: 1.5,
              }}
            >
              When to Use Resolver
            </Typography>

            <Box
              component="ul"
              sx={{
                pl: 3,
                '& li': {
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                  mb: 1,
                },
              }}
            >
              <li>✅ Validation schema is reused across forms</li>
              <li>✅ Validation logic is complex (cross-field, conditional)</li>
              <li>✅ Type safety with schema inference is required</li>
              <li>✅ Team already uses Zod/Yup</li>
            </Box>

            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: isDark ? '#a78bfa' : '#7c3aed',
                mb: 1.5,
                mt: 2,
              }}
            >
              When to Use Field Rules
            </Typography>

            <Box
              component="ul"
              sx={{
                pl: 3,
                '& li': {
                  fontSize: 15,
                  lineHeight: 1.8,
                  color: isDark
                    ? 'rgba(255,255,255,0.70)'
                    : 'rgba(15,23,42,0.70)',
                  mb: 1,
                },
              }}
            >
              <li>✅ Validation is simple (required, min, max, pattern)</li>
              <li>✅ Each field has independent validation</li>
              <li>✅ No schema library is needed</li>
            </Box>
          </Box>
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="reaction-definition"
        title="ReactionDefinition"
        description="Reaction configuration object"
      >
        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Reactions are defined as objects with these properties:
          </Typography>

          <DocsApiTable props={reactionProps} />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="run-context"
        title="RunContext"
        description="Context object passed to reaction run function"
      >
        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            The run context provides methods for reading/writing form state:
          </Typography>

          <DocsApiTable props={runContextProps} />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="field-runtime-state"
        title="FieldRuntimeState"
        description="Runtime metadata structure"
      >
        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Runtime state stores async metadata separate from form values:
          </Typography>

          <DocsCodeBlock
            code={`interface FieldRuntimeState<TData = unknown> {
  status: 'idle' | 'loading' | 'ready' | 'error';
  data: TData | null;
  error: string | null;
}`}
            language="tsx"
          />

          <DocsApiTable props={runtimeStateProps} />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="visible-when"
        title="visibleWhen"
        description="Conditional visibility prop"
      >
        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            All form components accept a visibleWhen prop for conditional
            rendering:
          </Typography>

          <DocsCodeBlock
            code={`visibleWhen?: (engine: Engine) => boolean

// Example
<TextField
  name="companyName"
  label="Company Name"
  visibleWhen={(engine) => 
    engine.getNode('accountType')?.value === 'business'
  }
/>`}
            language="tsx"
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      <DocsSection
        id="options-from-field-data"
        title="optionsFromFieldData"
        description="Dynamic options prop"
      >
        <Stack spacing={3}>
          <Typography
            variant="body1"
            sx={{
              fontSize: 16,
              lineHeight: 1.7,
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
            }}
          >
            Select and Autocomplete components can load options from runtime
            state:
          </Typography>

          <DocsCodeBlock
            code={`<Select
  name="state"
  label="State"
  optionsFromFieldData
/>

// Runtime state structure expected:
{
  status: 'ready',
  data: {
    options: ['California', 'Texas', 'New York']
  }
}`}
            language="tsx"
          />
        </Stack>
      </DocsSection>

      <DocsDivider />

      {/* Related Topics */}
      <DocsRelatedSection
        links={[
          {
            label: 'Overview',
            path: '/docs/form-system/overview',
            description: 'Understanding the Form System',
          },
          {
            label: 'Reactions',
            path: '/docs/form-system/reactions',
            description: 'Deep dive into reactions',
          },
          {
            label: 'Patterns',
            path: '/docs/form-system/patterns',
            description: 'Best practices for complex forms',
          },
          {
            label: 'Troubleshooting',
            path: '/docs/guides/troubleshooting',
            description: 'Common issues and solutions',
          },
        ]}
      />
    </Stack>
  );
}
