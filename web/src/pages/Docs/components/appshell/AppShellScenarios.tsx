import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { DocsPreviewBlock } from '../DocsPreviewBlock';

/**
 * Scenarios section for AppShell
 * Shows real-world integration patterns
 */
export function AppShellScenarios() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const scenarios = [
    {
      title: 'Router Integration',
      description: 'Integrate AppShell with React Router',
      component: (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.05)',
            border: isDark
              ? '1px solid rgba(34,197,94,0.15)'
              : '1px solid rgba(34,197,94,0.12)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: 13,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Example pattern below
          </Typography>
        </Box>
      ),
      code: `import { Link } from 'react-router-dom';

<AppShell
  items={navItems}
  renderLink={(item, children) => (
    <Link to={item.key}>{children}</Link>
  )}
  isActive={(item) => location.pathname === item.key}
>
  <Outlet />
</AppShell>`,
    },
    {
      title: 'Controlled Navigation State',
      description: 'Control drawer state externally',
      component: (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
            border: isDark
              ? '1px solid rgba(139,92,246,0.15)'
              : '1px solid rgba(139,92,246,0.12)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: 13,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Example pattern below
          </Typography>
        </Box>
      ),
      code: `const [navOpen, setNavOpen] = useState(true);

<AppShell
  items={navItems}
  navOpen={navOpen}
  onNavOpenChange={setNavOpen}
>
  <Content />
</AppShell>`,
    },
    {
      title: 'Custom TopBar Slots',
      description: 'Add custom content to TopBar',
      component: (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
            border: isDark
              ? '1px solid rgba(59,130,246,0.15)'
              : '1px solid rgba(59,130,246,0.12)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: 13,
              color: isDark ? 'rgba(255,255,255,0.70)' : 'rgba(15,23,42,0.70)',
            }}
          >
            Example pattern below
          </Typography>
        </Box>
      ),
      code: `<AppShell
  items={navItems}
  topBarLeft={<Typography variant="h6">My App</Typography>}
  topBarCenter={<SearchBar />}
  topBarRight={
    <>
      <NotificationButton />
      <UserMenu />
    </>
  }
>
  <Content />
</AppShell>`,
    },
  ];

  return (
    <Stack spacing={3}>
      {scenarios.map((scenario) => (
        <Box key={scenario.title}>
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
                {scenario.title}
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
                {scenario.description}
              </Typography>
            </Box>
            <DocsPreviewBlock code={scenario.code} badge="Pattern">
              {scenario.component}
            </DocsPreviewBlock>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
