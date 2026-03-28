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
      description: 'A simple multiline textarea with a label',
      code: `<Textarea label="Description" name="description" />`,
      component: <Textarea label="Description" name="description" />,
    },
    {
      title: 'With Placeholder',
      description: 'A textarea with placeholder text to guide input',
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
      description: 'A textarea with custom minimum rows (default is 3)',
      code: `<Textarea 
  label="Bio" 
  name="bio" 
  minRows={5}
/>`,
      component: <Textarea label="Bio" name="bio" minRows={5} />,
    },
    {
      title: 'With Helper Text',
      description: 'A textarea with guidance text below the input',
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
      description: 'A textarea displaying an error with helper text',
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
      description: 'A disabled textarea that cannot be edited',
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
    <Stack spacing={3.5}>
      {examples.map((example) => (
        <Box key={example.title}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: isDark
                    ? 'rgba(255,255,255,0.90)'
                    : 'rgba(15,23,42,0.90)',
                  mb: 0.5,
                }}
              >
                {example.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: 14,
                  color: isDark
                    ? 'rgba(255,255,255,0.65)'
                    : 'rgba(15,23,42,0.65)',
                }}
              >
                {example.description}
              </Typography>
            </Box>

            <DocsPreviewBlock code={example.code} badge="">
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
