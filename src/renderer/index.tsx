import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { setupBrowserMock } from './mock';
import { setupTauriBridge } from './tauri-bridge';
import './global.css';
import './i18n';

// Setup Tauri bridge if running in Tauri
setupTauriBridge();

// Setup mock layer for browser previews (fallback)
if (typeof window !== 'undefined' && !(window as any).__TAURI_INTERNALS__) {
  setupBrowserMock();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
