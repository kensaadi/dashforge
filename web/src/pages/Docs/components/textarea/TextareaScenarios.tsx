import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { TextareaFormIntegrationDemo } from './demos/TextareaFormIntegrationDemo';
import { TextareaReactiveDemo } from './demos/TextareaReactiveDemo';

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
 * TextareaScenarios demonstrates Textarea in realistic, interactive form contexts
 * Each scenario includes a live demo users can interact with, followed by code
 */
export function TextareaScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const scenarios: Scenario[] = [
    {
      id: 'react-hook-form-integration',
      title: 'React Hook Form Integration',
      subtitle: 'Try it: Enter feedback and submit the form',
      description:
        'Textarea integrates seamlessly with React Hook Form through DashForm. Components self-register, values sync automatically, and validation works out of the box. Try entering feedback with different lengths to see validation in action (minimum 10 characters required). Submit the form to see the complete state.',
      demo: <TextareaFormIntegrationDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { Textarea } from '@dashforge/ui';

function FeedbackForm() {
  const handleSubmit = (data: FormData) => {
    console.log('Feedback:', data);
  };

  return (
    <DashForm
      defaultValues={{ 
        feedback: '',
        suggestions: '',
        experience: ''
      }}
      onSubmit={handleSubmit}
      mode="onBlur"
    >
      <Textarea
        name="feedback"
        label="Your feedback"
        placeholder="Tell us what you think..."
        rules={{
          required: 'Feedback is required',
          minLength: {
            value: 10,
            message: 'Please provide at least 10 characters'
          }
        }}
      />
      <Textarea
        name="suggestions"
        label="Suggestions for improvement"
        placeholder="What could we do better?"
        minRows={5}
      />
      <Textarea
        name="experience"
        label="Overall experience"
        placeholder="Describe your experience..."
      />
      <button type="submit">Submit Feedback</button>
    </DashForm>
  );
}

// Textarea automatically:
// - Registers with React Hook Form
// - Syncs value from form state
// - Returns string values on submit
// - Shows errors only after touched OR submit
// - Tracks touched state on blur`,
      whyItMatters:
        'Gradual adoption: Drop Textarea into existing form architectures without rewriting state management. Perfect for feedback forms, comment sections, and any multiline text input.',
    },
    {
      id: 'reactive-conditional-visibility',
      title: 'Reactive Conditional Visibility',
      subtitle:
        'Try it: Select "Report an issue" to see description textarea appear',
      description:
        'Textarea supports conditional rendering through the visibleWhen prop. Fields render based on engine state—components query field values and make rendering decisions. Select "Report an issue" from the dropdown to see the description textarea appear instantly without manual state orchestration. This is part of Dashforge Reactive V2 architecture.',
      demo: <TextareaReactiveDemo />,
      code: `import { DashForm } from '@dashforge/forms';
import { Textarea, Select } from '@dashforge/ui';

function ContactForm() {
  return (
    <DashForm 
      defaultValues={{ 
        contactReason: '',
        message: '',
        issueDescription: ''
      }}
    >
      <Select
        name="contactReason"
        label="Reason for contact"
        options={[
          { label: 'General inquiry', value: 'general' },
          { label: 'Report an issue', value: 'issue' },
          { label: 'Feature request', value: 'feature' }
        ]}
      />

      <Textarea
        name="message"
        label="Message"
        placeholder="Your message..."
      />

      {/* Issue description: renders only when reporting an issue */}
      <Textarea
        name="issueDescription"
        label="Issue description"
        placeholder="Describe the issue in detail..."
        minRows={5}
        visibleWhen={(engine) => {
          const reason = engine.getNode('contactReason')?.value;
          return reason === 'issue';
        }}
      />
    </DashForm>
  );
}

// The Engine API provides:
// - getNode(name): Access any field's state
// - Component re-renders on dependency changes
// - Component makes rendering decision (engine provides state)`,
      whyItMatters:
        'Build adaptive forms where textarea visibility responds to user selections. The component handles conditional rendering—you define the predicate. Perfect for dynamic forms and context-dependent fields.',
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
        Textarea works in real form contexts, not just isolated demos. Try these
        live scenarios to experience DashForm integration and reactive
        visibility—both fully implemented and production-ready.
      </Typography>

      <Stack spacing={5}>
        {scenarios.map((scenario) => (
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
