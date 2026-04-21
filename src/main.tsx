import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

document.documentElement.setAttribute(
  'data-theme',
  localStorage.getItem('garnish-theme') ?? 'ember'
);
if (localStorage.getItem('garnish-mode') === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
