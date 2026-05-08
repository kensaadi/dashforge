import { useMemo, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import type { ReactNode } from 'react';
import { useDashTheme, setTheme } from '@dashforge/theme-core';
import type { DashforgeTheme } from '@dashforge/tokens';
import { createMuiThemeFromDashTheme } from '../adapter/createMuiTheme';

type Props = {
  children: ReactNode;
  withCssBaseline?: boolean;
  theme?: DashforgeTheme
};

export function DashforgeThemeProvider({
  children,
  withCssBaseline = true,
  theme: themeProp
}: Props) {

  useEffect(() => {
    if (themeProp) {
      setTheme(themeProp)
    }
  }, [themeProp])

  const dashTheme = useDashTheme();
  const resolvedTheme = themeProp ?? dashTheme;

  const muiTheme = useMemo(
    () => createMuiThemeFromDashTheme(resolvedTheme),
    [resolvedTheme]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      {withCssBaseline && <CssBaseline />}
      {children}
    </ThemeProvider>
  );
}
