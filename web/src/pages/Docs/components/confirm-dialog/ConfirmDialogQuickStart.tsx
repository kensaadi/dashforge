import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsCodeBlock } from '../shared/CodeBlock';

/**
 * Quick Start section for ConfirmDialog
 * Shows minimal setup and basic usage
 */
export function ConfirmDialogQuickStart() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Box
      id="quick-start"
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
        border: isDark
          ? '1px solid rgba(139,92,246,0.20)'
          : '1px solid rgba(139,92,246,0.15)',
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              color: isDark ? '#a78bfa' : '#7c3aed',
            }}
          >
            Quick Start
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.10)',
              border: isDark
                ? '1px solid rgba(34,197,94,0.30)'
                : '1px solid rgba(34,197,94,0.25)',
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: isDark ? '#86efac' : '#16a34a',
              }}
            >
              2 Steps
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
                mb: 1,
              }}
            >
              Step 1: Wrap your app with the provider
            </Typography>
            <DocsCodeBlock
              code={`import { ConfirmDialogProvider } from '@dashforge/ui';

<ConfirmDialogProvider>
  <App />
</ConfirmDialogProvider>`}
              language="tsx"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: isDark
                  ? 'rgba(255,255,255,0.85)'
                  : 'rgba(15,23,42,0.85)',
                mb: 1,
              }}
            >
              Step 2: Use the hook in your components
            </Typography>
            <DocsCodeBlock
              code={`import { useConfirm } from '@dashforge/ui';

const confirm = useConfirm();

const handleDelete = async () => {
  const result = await confirm({
    title: 'Delete User',
    description: 'This action cannot be undone.',
  });

  if (result.status === 'confirmed') {
    await deleteUser();
  }
};`}
              language="tsx"
            />
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
