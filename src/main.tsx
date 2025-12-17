import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './firebase'; // Initialize Firebase (app + analytics)
import { applyTheme } from './utils/settings';

// Force blue theme immediately on app initialization
applyTheme('blue');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
