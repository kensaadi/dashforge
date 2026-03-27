import { StrictMode } from 'react';
import { DashforgeThemeProvider } from '@dashforge/theme-mui';
import { ConfirmDialogProvider } from '@dashforge/ui';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <DashforgeThemeProvider>
      <ConfirmDialogProvider>
        <App />
      </ConfirmDialogProvider>
    </DashforgeThemeProvider>
  </StrictMode>
);
