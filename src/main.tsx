import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './main.tsx.css';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import 'material-icons/iconfont/filled.css';
import 'material-icons/iconfont/outlined.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
