import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DashForm } from '@dashforge/forms';
import { Textarea, Select } from '@dashforge/ui';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * TextareaReactiveDemo - Demonstrates reactive visibility with textareas
 * Shows how textareas can conditionally appear based on other field values
 */
export function TextareaReactiveDemo() {
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
        defaultValues={{
          contactReason: '',
          message: '',
          issueDescription: '',
        }}
      >
        <Stack spacing={2.5}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.90)' : 'rgba(15,23,42,0.90)',
              mb: 0.5,
            }}
          >
            Contact Us
          </Typography>

          <Select
            name="contactReason"
            label="Reason for contact"
            fullWidth
            options={[
              { label: 'General inquiry', value: 'general' },
              { label: 'Report an issue', value: 'issue' },
              { label: 'Feature request', value: 'feature' },
            ]}
          />

          <Textarea
            name="message"
            label="Message"
            placeholder="Your message..."
          />

          {/* Issue description only appears when reporting an issue */}
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
        </Stack>
      </DashForm>
    </Box>
  );
}
