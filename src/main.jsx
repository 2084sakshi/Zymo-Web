import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App.jsx';
import ReactGA from "react-ga4";

ReactGA.initialize("KEY_HERE"); // Replace with your Google Analytics Measurement ID

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <App />
  </StrictMode>
);
