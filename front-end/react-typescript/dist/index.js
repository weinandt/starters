import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.js';
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(StrictMode, null,
    React.createElement(App, null)));
