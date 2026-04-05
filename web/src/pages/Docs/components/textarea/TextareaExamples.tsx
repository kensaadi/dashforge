import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Textarea } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * TextareaExamples displays interactive Textarea examples
 * Each example shows both the rendered component and its code
 */
export function TextareaExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'Basic',
      description: 'Multiline input for descriptions and longer content',
      code: `<Textarea label="Description" name="description" />`,
      component: <Textarea label="Description" name="description" />,
    },
    {
      title: 'With Placeholder',
      description: 'Guide users with placeholder text for feedback or comments',
      code: `<Textarea 
  label="Feedback" 
  name="feedback" 
  placeholder="Share your thoughts..."
/>`,
      component: (
        <Textarea
          label="Feedback"
          name="feedback"
          placeholder="Share your thoughts..."
        />
      ),
    },
    {
      title: 'Custom Rows',
      description: 'Expand height for bios, detailed feedback, or longer text',
      code: `<Textarea 
  label="Bio" 
  name="bio" 
  minRows={5}
/>`,
      component: <Textarea label="Bio" name="bio" minRows={5} />,
    },
    {
      title: 'With Helper Text',
      description: 'Provide context for optional comments or notes',
      code: `<Textarea 
  label="Comments" 
  name="comments"
  helperText="Enter any additional comments (optional)"
/>`,
      component: (
        <Textarea
          label="Comments"
          name="comments"
          helperText="Enter any additional comments (optional)"
        />
      ),
    },
    {
      title: 'Error State',
      description: 'Validation errors for required or length-constrained text',
      code: `<Textarea
  label="Message"
  name="message"
  error
  helperText="Message is required and must be at least 10 characters"
/>`,
      component: (
        <Textarea
          label="Message"
          name="message"
          error
          helperText="Message is required and must be at least 10 characters"
        />
      ),
    },
    {
      title: 'Disabled',
      description: 'Read-only multiline content like terms or policies',
      code: `<Textarea 
  label="Terms & Conditions" 
  name="terms"
  defaultValue="By using this service, you agree to our terms..."
  disabled
/>`,
      component: (
        <Textarea
          label="Terms & Conditions"
          name="terms"
          defaultValue="By using this service, you agree to our terms..."
          disabled
        />
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(2, minmax(0, 1fr))',
        },
        gap: 3,
      }}
    >
      {examples.map((example) => (
        <Box
          key={example.title}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Stack spacing={1.5} sx={{ height: '100%' }}>
            {/* Compact Header */}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.25,
                  lineHeight: 1.3,
                }}
              >
                {example.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: isDark
                    ? 'rgba(255,255,255,0.60)'
                    : 'rgba(15,23,42,0.60)',
                }}
              >
                {example.description}
              </Typography>
            </Box>

            {/* Preview Block with Compact Mode */}
            <DocsPreviewBlock code={example.code} badge="" compact>
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
