import React from 'react';
import ReactDOM from 'react-dom/client';
import Landing from './landing/Landing';

// Load the app lazily so the landing page never depends on it (and ships a much smaller bundle).
const App = React.lazy(() => import('./App'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// "/" is the marketing landing page; "/app" is the farmer-facing app.
const isApp = window.location.pathname.replace(/\/+$/, '').startsWith('/app');

root.render(
  <React.StrictMode>
    {isApp ? (
      <React.Suspense fallback={null}>
        <App />
      </React.Suspense>
    ) : (
      <Landing />
    )}
  </React.StrictMode>
);

// Register the offline app-shell service worker (production/HTTPS only — Vite dev server
// serving over HTTP on localhost is still allowed by browsers for testing).
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Non-fatal — app still works fully online without the service worker.
    });
  });
}