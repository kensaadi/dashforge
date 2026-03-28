import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useDashTheme } from '@dashforge/theme-core';

/**
 * API Reference section for AppShell
 * Documents AppShell component props
 */
export function AppShellApi() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  const props = [
    {
      name: 'items',
      type: 'LeftNavItem[]',
      required: true,
      description: 'Navigation items for LeftNav',
    },
    {
      name: 'renderLink',
      type: 'RenderLinkFn',
      required: false,
      description: 'Router-agnostic link renderer',
    },
    {
      name: 'isActive',
      type: 'IsActiveFn',
      required: false,
      description: 'Callback to determine if item is active',
    },
    {
      name: 'navOpen',
      type: 'boolean',
      required: false,
      description: 'Controlled drawer open state',
    },
    {
      name: 'defaultNavOpen',
      type: 'boolean',
      required: false,
      description: 'Default drawer open state (default: true)',
    },
    {
      name: 'onNavOpenChange',
      type: '(open: boolean) => void',
      required: false,
      description: 'Callback when drawer state changes',
    },
    {
      name: 'navWidthExpanded',
      type: 'number',
      required: false,
      description: 'Width when expanded (default: 280)',
    },
    {
      name: 'navWidthCollapsed',
      type: 'number',
      required: false,
      description: 'Width when collapsed (default: 64)',
    },
    {
      name: 'breakpoint',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      required: false,
      description: 'Mobile breakpoint (default: lg)',
    },
    {
      name: 'topBarLeft',
      type: 'ReactNode',
      required: false,
      description: 'Left content slot for TopBar',
    },
    {
      name: 'topBarCenter',
      type: 'ReactNode',
      required: false,
      description: 'Center content slot for TopBar',
    },
    {
      name: 'topBarRight',
      type: 'ReactNode',
      required: false,
      description: 'Right content slot for TopBar',
    },
    {
      name: 'topBarPosition',
      type: "AppBarProps['position']",
      required: false,
      description: "TopBar position (default: 'fixed')",
    },
    {
      name: 'leftNavHeader',
      type: 'ReactNode',
      required: false,
      description: 'Header slot for LeftNav',
    },
    {
      name: 'leftNavFooter',
      type: 'ReactNode',
      required: false,
      description: 'Footer slot for LeftNav',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Main content to render',
    },
    {
      name: 'mainSx',
      type: 'SxProps<Theme>',
      required: false,
      description: 'Optional sx props for main container',
    },
  ];

  return (
    <Stack spacing={4}>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.95)',
            mb: 2,
          }}
        >
          AppShell Props
        </Typography>
        <TableContainer
          sx={{
            borderRadius: 1.5,
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
            bgcolor: isDark ? 'rgba(17,24,39,0.40)' : 'rgba(248,250,252,0.90)',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Prop
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Required
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    fontSize: 12,
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : 'rgba(15,23,42,0.80)',
                    bgcolor: isDark
                      ? 'rgba(0,0,0,0.20)'
                      : 'rgba(15,23,42,0.02)',
                  }}
                >
                  Description
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.map((prop) => (
                <TableRow key={prop.name}>
                  <TableCell
                    sx={{
                      fontSize: 13,
                      fontFamily: 'monospace',
                      color: isDark
                        ? 'rgba(255,255,255,0.85)'
                        : 'rgba(15,23,42,0.85)',
                    }}
                  >
                    {prop.name}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: 12,
                      fontFamily: 'monospace',
                      color: isDark
                        ? 'rgba(255,255,255,0.70)'
                        : 'rgba(15,23,42,0.70)',
                    }}
                  >
                    {prop.type}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: 13,
                      color: isDark
                        ? 'rgba(255,255,255,0.70)'
                        : 'rgba(15,23,42,0.70)',
                    }}
                  >
                    {prop.required ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: 13,
                      color: isDark
                        ? 'rgba(255,255,255,0.70)'
                        : 'rgba(15,23,42,0.70)',
                    }}
                  >
                    {prop.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Stack>
  );
}
