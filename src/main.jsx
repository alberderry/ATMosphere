import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

import { AuthProvider } from './contexts/AuthContext.jsx';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    }
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  }
});

// Fungsi untuk load Google Maps API
const loadGoogleMaps = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return new Promise((resolve) => {
    if (window.google && window.google.maps) {
      resolve(); // Sudah dimuat
      return;
    }

    window.initMap = () => resolve(); // Callback Google Maps

    const existingScript = document.getElementById('google-maps-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
};

// Fungsi main untuk inisialisasi aplikasi
async function main() {
  await loadGoogleMaps();

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ChakraProvider>
    </React.StrictMode>,
  );
}

main();
