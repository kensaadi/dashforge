import { StrictMode } from 'react';
import { DashforgeThemeProvider } from '@dashforge/theme-mui';
import { ConfirmDialogProvider, SnackbarProvider } from '@dashforge/ui';
import { HelmetProvider } from 'react-helmet-async';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <HelmetProvider>
      <DashforgeThemeProvider>
        <SnackbarProvider>
          <ConfirmDialogProvider>
            <App />
          </ConfirmDialogProvider>
        </SnackbarProvider>
      </DashforgeThemeProvider>
    </HelmetProvider>
  </StrictMode>
);
