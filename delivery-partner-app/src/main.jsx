import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { RiderProvider } from './context/RiderContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RiderProvider>
      <App />
    </RiderProvider>
  </React.StrictMode>
);
