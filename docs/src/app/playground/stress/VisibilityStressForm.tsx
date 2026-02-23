import { useRef } from 'react';
import { TextField, Select } from '@dashforge/ui';
import { DashForm, useDashFormContext } from '@dashforge/forms';
import Button from '@mui/material/Button';
import { Grid } from '@mui/material';

/**
 * Visibility Stress Test Form
 *
 * Tests reactive visibility precision with:
 * - 30 total fields
 * - 1 controller field
 * - 5 fields depending on controller via visibleWhen
 * - 5 fields depending on another derived field
 * - 20 unrelated static fields
 *
 * SUCCESS CRITERIA:
 * ✔ Zero full-form re-renders
 * ✔ Zero static field re-renders
 * ✔ Only relevant visible fields update
 * ✔ No infinite loops
 * ✔ No subscription storms
 */

function VisibilityStressFormInner() {
  const renders = useRef(0);
  renders.current++;

  console.log('VisibilityStressForm renders:', renders.current);

  const { rhf } = useDashFormContext();

  const handleSubmit = (data: unknown) => {
    console.log('Form submitted:', data);
    alert('Form valid! Check console for data.');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '600px',
      }}
    >
      <h2>Visibility Stress Test</h2>

      <div
        style={{
          padding: '16px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
        }}
      >
        <h3>Instructions</h3>
        <ol>
          <li>Open browser console to see render logs</li>
          <li>
            <strong>Error Gating Test:</strong> Type in "Required Field" - error
            should NOT show until blur (touched) OR submit
          </li>
          <li>
            <strong>Select Error Gating:</strong> Click on any required Select
            field and blur without selecting - error should show
          </li>
          <li>
            <strong>Submit Test:</strong> Click "Submit" button - all validation
            errors show immediately (even untouched fields)
          </li>
          <li>
            <strong>Select Clear Error:</strong> After submit, select a valid
            option in any Select - error should clear immediately
          </li>
          <li>
            Type in "Controller" field (5+ chars to show dependent fields)
          </li>
          <li>Type "SHOW" in "Dependent 0" to reveal nested fields</li>
          <li>Verify only affected fields re-render</li>
        </ol>
      </div>

      {/* Validation Test Fields */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#ffebee',
          borderRadius: '8px',
        }}
      >
        <h3>Validation Test Fields (Error Gating)</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          Errors show only after field blur (touched) OR form submit
        </p>
        <TextField
          name="test.required"
          label="Required Field (blur or submit to see error)"
          fullWidth
          style={{ marginBottom: '8px' }}
          rules={{ required: 'This field is required' }}
        />
        <TextField
          name="test.email"
          label="Email Field (blur or submit to see error)"
          fullWidth
          style={{ marginBottom: '8px' }}
          rules={{
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
        />
        <TextField
          name="test.minLength"
          label="Min Length Field (min 5 chars, blur to see error)"
          fullWidth
          style={{ marginBottom: '8px' }}
          rules={{
            minLength: {
              value: 5,
              message: 'Must be at least 5 characters',
            },
          }}
        />
        <TextField
          name="test.override"
          label="Override Test (explicit helperText)"
          fullWidth
          helperText="This helper text should always show"
          rules={{ required: 'This should not show' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={rhf.handleSubmit(handleSubmit)}
          style={{ marginTop: '16px' }}
        >
          Submit (triggers error display on all fields)
        </Button>
      </div>

      {/* Select Field Tests */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#e1f5fe',
          borderRadius: '8px',
        }}
      >
        <h3>Select Component Tests (Error Gating)</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          Tests Select field with same error gating as TextField.
          <br />
          <strong>Value registration test:</strong> Select an option - value
          should update immediately in form state.
          <br />
          <strong>Error gating test:</strong> Click Submit button - required
          errors show. Then select any option - error should clear on first
          selection.
        </p>
        <Grid container>
          <Grid size={{ xs: 12 }}>
            <Select
              fullWidth
              name="test.country"
              label="Country (Required)"
              options={[
                { value: 'us', label: 'United States' },
                { value: 'ca', label: 'Canada' },
                { value: 'uk', label: 'United Kingdom' },
                { value: 'de', label: 'Germany' },
              ]}
              style={{ marginBottom: '16px' }}
              rules={{ required: 'Please select a country' }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Select
              fullWidth
              name="test.language"
              label="Language (blur or submit to see error)"
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
              ]}
              style={{ marginBottom: '16px' }}
              rules={{ required: 'Language is required' }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Select
              name="test.role"
              label="Role (Required)"
              options={[
                { value: 'admin', label: 'Administrator' },
                { value: 'user', label: 'User' },
                { value: 'guest', label: 'Guest' },
              ]}
              style={{ marginBottom: '16px' }}
              rules={{ required: 'Role is required' }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Select
              name="test.timezone"
              label="Timezone (explicit helperText override)"
              helperText="This explicit helper text always shows"
              options={[
                { value: 'est', label: 'Eastern Time' },
                { value: 'pst', label: 'Pacific Time' },
                { value: 'cst', label: 'Central Time' },
                { value: 'mst', label: 'Mountain Time' },
              ]}
              style={{ marginBottom: '16px' }}
              rules={{ required: 'Timezone is required' }}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Select
              fullWidth
              name="test.address.state"
              label="State (dot notation test)"
              options={[
                { value: 'ny', label: 'New York' },
                { value: 'ca', label: 'California' },
                { value: 'tx', label: 'Texas' },
                { value: 'fl', label: 'Florida' },
              ]}
              rules={{ required: 'State is required' }}
            />
          </Grid>
        </Grid>
      </div>

      {/* Controller Field */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
        }}
      >
        <h3>Controller Field</h3>
        <TextField
          name="controller"
          label="Controller (type 5+ chars to show dependent fields)"
          fullWidth
        />
      </div>

      {/* 5 fields dependent on controller */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#fff3e0',
          borderRadius: '8px',
        }}
      >
        <h3>Dependent Fields (visible when controller.length &gt; 3)</h3>
        {Array.from({ length: 5 }).map((_, i) => (
          <TextField
            key={`dep-${i}`}
            name={`dependent.group${i}`}
            label={`Dependent ${i}${
              i === 0 ? ' (type "SHOW" to reveal nested)' : ''
            }`}
            fullWidth
            style={{ marginBottom: '8px' }}
            visibleWhen={(engine) => {
              const node = engine.getNode('controller');
              const value = node?.value as string | undefined;
              return (value?.length ?? 0) > 3;
            }}
          />
        ))}
      </div>

      {/* 5 second-level dependent fields */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f3e5f5',
          borderRadius: '8px',
        }}
      >
        <h3>Nested Fields (visible when dependent.group0 === "SHOW")</h3>
        {Array.from({ length: 5 }).map((_, i) => (
          <TextField
            key={`nested-${i}`}
            name={`nested.group${i}`}
            label={`Nested ${i}`}
            fullWidth
            style={{ marginBottom: '8px' }}
            visibleWhen={(engine) => {
              const node = engine.getNode('dependent.group0');
              const value = node?.value as string | undefined;
              return value === 'SHOW';
            }}
          />
        ))}
      </div>

      {/* 20 unrelated fields */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#e8f5e9',
          borderRadius: '8px',
        }}
      >
        <h3>Static Fields (should NEVER re-render on visibility changes)</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <TextField
              key={`static-${i}`}
              name={`static.field${i}`}
              label={`Static ${i}`}
              fullWidth
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function VisibilityStressForm() {
  return (
    <DashForm
      defaultValues={{ controller: '', dependent: '', test: { address: {} } }}
      mode="onChange"
    >
      <VisibilityStressFormInner />
    </DashForm>
  );
}
