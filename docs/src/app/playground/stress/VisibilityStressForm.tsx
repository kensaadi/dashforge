import { useRef } from 'react';
import { TextField } from '@dashforge/ui';
import { DashForm } from '@dashforge/forms';

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
export function VisibilityStressForm() {
  const renders = useRef(0);
  renders.current++;

  console.log('VisibilityStressForm renders:', renders.current);

  return (
    <DashForm defaultValues={{ controller: '', dependent: '', test: {} }}>
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
              Type in "Controller" field (5+ chars to show dependent fields)
            </li>
            <li>Type "SHOW" in "Dependent 0" to reveal nested fields</li>
            <li>Verify only affected fields re-render</li>
            <li>Test validation: blur required field, type invalid email</li>
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
          <h3>Validation Test Fields</h3>
          <TextField
            name="test.required"
            label="Required Field"
            fullWidth
            style={{ marginBottom: '8px' }}
            rules={{ required: 'This field is required' }}
          />
          <TextField
            name="test.email"
            label="Email Field"
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
            label="Min Length Field (min 5 chars)"
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
    </DashForm>
  );
}
