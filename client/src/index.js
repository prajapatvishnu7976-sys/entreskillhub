// ============================================
// EntreSkillHub - Application Entry Point
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './styles/globals.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'toast-custom',
                style: {
                  background: '#1e293b',
                  color: '#f1f5f9',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
                success: {
                  iconTheme: { primary: '#22c55e', secondary: '#fff' },
                  style: {
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                  style: {
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

reportWebVitals();