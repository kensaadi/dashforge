import { useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import type { ReactNode } from 'react';
import { useDashTheme } from '@dashforge/theme-core';
import { createMuiThemeFromDashTheme } from '../adapter/createMuiTheme';

type Props = {
  children: ReactNode;
  withCssBaseline?: boolean;
};

export function DashforgeThemeProvider({
  children,
  withCssBaseline = true,
}: Props) {
  const dashTheme = useDashTheme();

  const muiTheme = useMemo(
    () => createMuiThemeFromDashTheme(dashTheme),
    [dashTheme]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      {withCssBaseline && <CssBaseline />}
      {children}
    </ThemeProvider>
  );
}
