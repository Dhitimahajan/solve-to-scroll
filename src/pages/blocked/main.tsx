import React from 'react';
import ReactDOM from 'react-dom/client';
import { BlockedApp } from './BlockedApp';
import '../../styles/tokens.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BlockedApp />
  </React.StrictMode>
);
