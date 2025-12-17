import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './firebase'; // Initialize Firebase (app + analytics)
import { applyTheme } from './utils/settings';
import { registerServiceWorker } from './utils/serviceWorker';

// Force blue theme immediately on app initialization
applyTheme('blue');

// Register service worker for caching (only in production)
if (import.meta.env.PROD) {
  registerServiceWorker().catch((error) => {
    console.error('Failed to register service worker:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
