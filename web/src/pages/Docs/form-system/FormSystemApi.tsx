import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useDashTheme } from '@dashforge/theme-core';
import {
  DocsHeroSection,
  DocsSection,
  DocsDivider,
  DocsApiTable,
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
    </Stack>
  );
}
