import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'; // Updated import for React 18
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement); // Create root using createRoot()

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
