import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { DashforgeThemeProvider } from '@dashforge/theme-mui';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <BrowserRouter>
      <DashforgeThemeProvider>
        <App />
      </DashforgeThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
