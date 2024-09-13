import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { configureChains, mainnet, WagmiConfig, createClient } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { polygon } from '@wagmi/chains';

const { provider, webSocketProvider } = configureChains(
  [mainnet, polygon],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
);
