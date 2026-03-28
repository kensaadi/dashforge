import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';
import { AppShellBasicDemo } from './demos/AppShellBasicDemo';

interface Example {
  title: string;
  description: string;
  code: string;
  component: React.ReactNode;
}

/**
 * Examples section for AppShell
 * Shows common usage patterns with interactive demos
 */
export function AppShellExamples() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const examples: Example[] = [
    {
      title: 'Basic AppShell',
      description: 'Complete application shell with navigation',
      component: <AppShellBasicDemo />,
      code: `<AppShell
  items={navItems}
  topBarLeft={<Logo />}
  topBarRight={<UserMenu />}
>
  <MainContent />
</AppShell>`,
    },
  ];

  return (
    <Stack spacing={3}>
      {examples.map((example) => (
        <Box key={example.title}>
          <Stack spacing={2}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontSize: 16,
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
            <DocsPreviewBlock code={example.code} badge="Live Demo">
              {example.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
