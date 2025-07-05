// src/components/MapView/MapViewComponent.jsx
import { Box, Text, VStack, Spinner } from '@chakra-ui/react'; // Removed Flex, Badge, IconButton as they are now in AtmInfoWindowCard
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import AtmInfoWindowCard from './AtmInfoWindowCard'; // Import the new InfoWindow card component

// Gunakan API Key Google Maps dari environment variables Anda
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Lokasi default (Bandung)
const DEFAULT_CENTER = { lat: -6.9200, lng: 107.6114 };

// Tambahkan prop getTierColor dari MapViewPage
const MapViewComponent = ({ atmLocations = [], userLocation = null, getTierColor }) => {
  const mapRef = useRef(null); // Ref untuk elemen div tempat peta akan dirender
  const mapInstanceRef = useRef(null); // Ref untuk instance peta Google Maps
  const markersRef = useRef([]); // Ref untuk menyimpan semua marker Google Maps
  const overlayRef = useRef(null); // Ref untuk instance CustomOverlay

  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [openAtmId, setOpenAtmId] = useState(null); // State untuk melacak ATM yang InfoWindow-nya terbuka
  const [infoWindowPixelPosition, setInfoWindowPixelPosition] = useState(null); // Posisi piksel InfoWindow kustom

  // Helper untuk mendapatkan warna teks badge (untuk badge kuning agar teksnya gelap)
  // Dipindahkan ke sini karena digunakan sebagai prop untuk AtmInfoWindowCard
  const getBadgeTextColor = useCallback((color) => {
    if (color === 'yellow') return '#2D3748'; // gray.800
    return '#FFFFFF'; // white
  }, []);

  // --- Memuat Google Maps API secara dinamis (jika belum dimuat) ---
  useEffect(() => {
    // Debugging: Log the API key being used when the effect runs
    const currentApiKey = GOOGLE_MAPS_API_KEY; // Capture the value at this moment
    ("Loading Google Maps API with key (inside useEffect):", currentApiKey);

    window.initMap = () => {
      setIsGoogleMapsLoaded(true);
      ('Google Maps API berhasil dimuat.');
    };

    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      ('Google Maps API sudah tersedia.');
      return;
    }

    if (!document.getElementById('google-maps-script')) {
      // Pastikan currentApiKey memiliki nilai sebelum membuat script
      if (!currentApiKey) {
        console.error("GOOGLE_MAPS_API_KEY is undefined. Cannot load Google Maps API script.");
        return; // Jangan coba memuat script jika kunci API tidak ada
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      // Construct the full URL with the API key
      const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${currentApiKey}&callback=initMap&libraries=places`;
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      ('Menambahkan script Google Maps API dengan URL:', scriptUrl); // Log the exact URL being used

      // Add an event listener to the script to check for load errors (optional but good for debugging)
      script.onerror = (e) => {
        console.error("Failed to load Google Maps script:", e);
      };
    }

    return () => {
      delete window.initMap;
      // Optional: Remove the script tag on unmount if it was added by this component
      // This prevents multiple script tags if the component re-renders rapidly
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
          existingScript.remove();
      }
    };
  }, [GOOGLE_MAPS_API_KEY]); // Keep GOOGLE_MAPS_API_KEY as dependency to re-run if key changes


  // --- Definisi CustomOverlay (dipindahkan ke dalam komponen) ---
  // Ini harus didefinisikan setelah window.google.maps tersedia.
  const CustomOverlay = useMemo(() => {
    if (!isGoogleMapsLoaded || !window.google.maps) return null; // Hanya definisikan jika API sudah dimuat

    // Definisi CustomOverlay
    class InternalCustomOverlay extends window.google.maps.OverlayView {
      constructor(map) {
        super();
        this.map = map;
        this.projectionReady = false;
        this.setMap(map);
      }

      onAdd() {
        this.projectionReady = true;
        ('CustomOverlay: onAdd - projection ready.');
      }

      draw() { /* No op */ }

      onRemove() {
        this.projectionReady = false;
        ('CustomOverlay: onRemove.');
      }

      getMapCanvasProjection() {
        return this.getProjection();
      }
    }
    return InternalCustomOverlay;
  }, [isGoogleMapsLoaded]);


  // --- Inisialisasi Peta Google Maps dan CustomOverlay ---
  useEffect(() => {
    // Only proceed if Google Maps API is loaded, mapRef.current is a valid DOM element,
    // and mapInstanceRef.current has not been initialized yet.
    if (!isGoogleMapsLoaded || !mapRef.current || mapInstanceRef.current) {
      // Debugging: Log why map initialization is skipped
      if (!isGoogleMapsLoaded) ('Map init skipped: Google Maps not loaded yet.');
      if (!mapRef.current) ('Map init skipped: mapRef.current is null or not mounted.', mapRef.current);
      if (mapInstanceRef.current) ('Map init skipped: Map already initialized (mapInstanceRef.current exists).');
      return;
    }

    ('Menginisialisasi peta Google Maps...');
    ('mapRef.current element:', mapRef.current); // Debugging: Check the DOM element

    // Ensure mapRef.current is a valid HTML element before attempting to initialize the map
    if (!(mapRef.current instanceof HTMLElement)) {
        console.error("mapRef.current is not a valid HTML element. Cannot initialize map.");
        return;
    }

    const map = new window.google.maps.Map(
      mapRef.current,
      {
        center: userLocation || DEFAULT_CENTER,
        zoom: userLocation ? 14 : 12,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
      }
    );
    mapInstanceRef.current = map;

    // Initialize CustomOverlay and attach it to the map
    if (CustomOverlay && !overlayRef.current) { // Ensure CustomOverlay is defined
      overlayRef.current = new CustomOverlay(map);
    } else if (overlayRef.current) {
      overlayRef.current.setMap(map);
    }

    ('Peta Google Maps berhasil diinisialisasi.');

    // Cleanup function for this effect
    return () => {
      if (mapInstanceRef.current) {
        // Remove CustomOverlay when component unmounts or map re-initializes
        if (overlayRef.current) {
          overlayRef.current.setMap(null); // Calls onRemove on CustomOverlay
          overlayRef.current = null;
        }
        mapInstanceRef.current = null;
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        ('Peta Google Maps telah di-cleanup.');
      }
    };
  }, [isGoogleMapsLoaded, userLocation, CustomOverlay]); // Depend on CustomOverlay to re-run if it becomes available


  // Helper to convert LatLng to pixel coordinates relative to the map container
  const getPixelPosition = useCallback((latLng) => {
    // Ensure overlay is ready and its projection is available
    if (!overlayRef.current || !overlayRef.current.projectionReady) {
            return null;
    }
    const mapCanvasProjection = overlayRef.current.getMapCanvasProjection();
    // fromLatLngToContainerPixel provides coordinates relative to the map div
    const point = mapCanvasProjection.fromLatLngToContainerPixel(latLng);
    return { x: point.x, y: point.y };
  }, []); // No specific dependencies here as projection logic is internal to overlayRef.current


  // Effect to update custom InfoWindow pixel position when map moves/zooms
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapInstanceRef.current || !openAtmId) {
      setInfoWindowPixelPosition(null);
      return;
    }

    const selectedAtm = atmLocations.find(atm => atm.id === openAtmId);
    if (!selectedAtm) {
      setInfoWindowPixelPosition(null);
      return;
    }

    const updatePosition = () => {
      // Use latitude and longitude directly from the ATM object
      const latLng = new window.google.maps.LatLng(selectedAtm.latitude, selectedAtm.longitude);
      const pixelPos = getPixelPosition(latLng);
      if (pixelPos) {
        setInfoWindowPixelPosition(pixelPos);
      }
    };

    // Call updatePosition immediately and add listeners for map changes
    if (mapInstanceRef.current) {
      updatePosition(); // Initial position update
      const idleListener = mapInstanceRef.current.addListener('idle', updatePosition);
      const zoomListener = mapInstanceRef.current.addListener('zoom_changed', updatePosition);
      const centerListener = mapInstanceRef.current.addListener('center_changed', updatePosition);

      // Cleanup listeners
      return () => {
        window.google.maps.event.removeListener(idleListener);
        window.google.maps.event.removeListener(zoomListener);
        window.google.maps.event.removeListener(centerListener);
      };
    }
  }, [openAtmId, isGoogleMapsLoaded, atmLocations, getPixelPosition]);


  // --- Update Markers when 'atmLocations' change ---
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapInstanceRef.current || !getTierColor) {
      // ("Skipping marker update:", { isGoogleMapsLoaded, mapInstanceRef: mapInstanceRef.current, getTierColor }); // More debugging
      return;
    }

    // Clear all existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Close custom InfoWindow if markers are cleared
    setOpenAtmId(null);
    setInfoWindowPixelPosition(null);

    const bounds = new window.google.maps.LatLngBounds();

    if (atmLocations.length > 0) {
      atmLocations.forEach(atm => {
        // Use latitude and longitude directly from the ATM object
        const position = { lat: atm.latitude, lng: atm.longitude };

        // Determine pin color based on tier using the getTierColor prop
        const tierColorName = getTierColor(atm.tier); // e.g., 'blue', 'green', etc.
        const chakraColorMap = {
            'blue': '#4299E1',
            'green': '#48BB78',
            'yellow': '#ECC94B',
            'red': '#E53E3E',
            'gray': '#A0AEC0'
        };
        const markerColor = chakraColorMap[tierColorName] || '#A0AEC0'; // Fallback to gray

        // Function to define the SVG path for the pin symbol
        const pinSymbol = (color) => {
          return {
            path: 'M 0,0 C -2,-20 -10,-9 -10,-22 A 10,10 0 1,1 10,-22 C 10,-9 2,-20 0,0 z',
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#000',
            strokeWeight: 0.5,
            scale: 1.5,
            anchor: new window.google.maps.Point(0, 22)
          };
        };

        const marker = new window.google.maps.Marker({
          position: position,
          map: mapInstanceRef.current,
          title: atm.name,
          icon: pinSymbol(markerColor),
        });

        // Add click listener for the marker
        marker.addListener('click', () => {
          setOpenAtmId(atm.id); // Set the ATM for which the InfoWindow will open
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      });

      mapInstanceRef.current.fitBounds(bounds);

      // If only one ATM, zoom in closer
      if (atmLocations.length === 1) {
        mapInstanceRef.current.setZoom(14);
      }

    } else if (userLocation) {
      // If no ATMs but user location is available, center on user
      mapInstanceRef.current.setCenter(userLocation);
      mapInstanceRef.current.setZoom(14);
    } else {
      // If no ATMs and no user location, center on default location
      mapInstanceRef.current.setCenter(DEFAULT_CENTER);
      mapInstanceRef.current.setZoom(12);
    }

  }, [atmLocations, isGoogleMapsLoaded, userLocation, getTierColor]); // getTierColor added to dependencies


  // --- Move map to user location when first obtained ---
  useEffect(() => {
    if (userLocation && isGoogleMapsLoaded && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(userLocation);
      mapInstanceRef.current.setZoom(14);
    }
  }, [userLocation, isGoogleMapsLoaded]);

  // Get the ATM for which the InfoWindow is currently open
  const currentAtmForInfoWindow = openAtmId ? atmLocations.find(atm => atm.id === openAtmId) : null;

  return (
    <Box
      ref={mapRef}
      w="full"
      h="full"
      position="relative"
      bg="gray.100"
      borderRadius="lg"
      overflow="hidden"
      // Display spinner while map is loading
      display={isGoogleMapsLoaded ? 'block' : 'flex'}
      justifyContent="center"
      alignItems="center"
    >
      {!isGoogleMapsLoaded && (
        <VStack>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">Memuat Peta...</Text>
          <Text fontSize="sm" color="gray.400">Pastikan koneksi internet stabil dan izinkan lokasi.</Text>
          {GOOGLE_MAPS_API_KEY === undefined && (
            <Text fontSize="xs" color="red.500" mt={2}>
              Error: Google Maps API Key tidak ditemukan. Pastikan 'VITE_GOOGLE_MAPS_API_KEY' diatur di file .env Anda.
            </Text>
          )}
           {/* Add a more specific error message if the key value itself is empty/invalid after being read */}
          {GOOGLE_MAPS_API_KEY !== undefined && GOOGLE_MAPS_API_KEY.trim() === '' && (
            <Text fontSize="xs" color="red.500" mt={2}>
              Warning: Google Maps API Key is empty. Please provide a valid key in your .env file.
            </Text>
          )}
        </VStack>
      )}

      {/* Custom InfoWindow: Render AtmInfoWindowCard component */}
      {currentAtmForInfoWindow && infoWindowPixelPosition && (
        <Box
          position="absolute"
          zIndex="10"
          // Using calculated pixel position
          style={{
            left: `${infoWindowPixelPosition.x}px`,
            top: `${infoWindowPixelPosition.y}px`,
            transform: 'translate(-50%, -100%)', // Shift InfoWindow to be above the pin
          }}
        >
          <AtmInfoWindowCard
            atm={currentAtmForInfoWindow}
            onClose={() => setOpenAtmId(null)}
            getTierColor={getTierColor}
            getBadgeTextColor={getBadgeTextColor}
          />
        </Box>
      )}
    </Box>
  );
};

export default MapViewComponent;
