import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { PlayerProvider } from './store/PlayerContext';
import { initAuth } from './services/authService';
import { initContentStore, syncContentFromServer } from './services/contentStore';
import './styles/global.css';
import './styles/components.css';
import './styles/a11y.css';
import './styles/responsive.css';
import './styles/navigation.css';

initContentStore();
void initAuth().then(() => syncContentFromServer());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
