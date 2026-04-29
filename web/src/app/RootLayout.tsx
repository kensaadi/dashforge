import { Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { DashforgeThemeProvider } from '@dashforge/theme-mui';
import { ConfirmDialogProvider, SnackbarProvider } from '@dashforge/ui';

export function RootLayout() {
  return (
    <HelmetProvider>
      <DashforgeThemeProvider>
        <SnackbarProvider>
          <ConfirmDialogProvider>
            <Outlet />
          </ConfirmDialogProvider>
        </SnackbarProvider>
      </DashforgeThemeProvider>
    </HelmetProvider>
  );
}
