// src/components/MapComponent.jsx
import { Box, Text, VStack, Spinner, Flex, Badge, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons'; // Import CloseIcon
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDrfbSE3kSnRccgRPB6vP9oQEU8LxCEFDA'; // Gunakan API Key Google Maps Anda

// Lokasi default (Bandung)
const DEFAULT_CENTER = { lat: -6.9200, lng: 107.6114 };

const MapComponent = ({ atmLocations = [], getTierColor, activeView, userLocation = null }) => {
  const mapRef = useRef(null); // Ref untuk elemen div tempat peta akan dirender
  const mapInstanceRef = useRef(null); // Ref untuk instance peta Google Maps
  const markersRef = useRef([]); // Ref untuk menyimpan semua marker Google Maps
  const overlayRef = useRef(null); // Ref untuk instance CustomOverlay

  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [openAtmId, setOpenAtmId] = useState(null); // State untuk melacak ATM yang InfoWindow-nya terbuka
  const [infoWindowPixelPosition, setInfoWindowPixelPosition] = useState(null); // Posisi piksel InfoWindow kustom

  // Helper untuk mendapatkan warna teks badge (untuk badge kuning agar teksnya gelap)
  const getBadgeTextColor = (color) => {
    if (color === 'yellow') return '#2D3748'; // gray.800
    return '#FFFFFF'; // white
  };

  // --- Memuat Google Maps API secara dinamis (jika belum dimuat) ---
  useEffect(() => {
    window.initMap = () => {
      setIsGoogleMapsLoaded(true);
      console.log('Google Maps API berhasil dimuat.');
    };

    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      console.log('Google Maps API sudah tersedia.');
      return;
    }

    if (!document.getElementById('google-maps-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      console.log('Menambahkan script Google Maps API...');
    }

    return () => {
      delete window.initMap;
    };
  }, []);

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
        console.log('CustomOverlay: onAdd - projection ready.');
      }

      draw() { /* No op */ }

      onRemove() {
        this.projectionReady = false;
        console.log('CustomOverlay: onRemove.');
      }

      getMapCanvasProjection() {
        return this.getProjection();
      }
    }
    return InternalCustomOverlay;
  }, [isGoogleMapsLoaded]);


  // --- Inisialisasi Peta Google Maps dan CustomOverlay ---
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    console.log('Menginisialisasi peta Google Maps...');

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

    // Inisialisasi CustomOverlay dan pasang ke peta
    if (CustomOverlay && !overlayRef.current) { // Pastikan CustomOverlay terdefinisi
      overlayRef.current = new CustomOverlay(map);
    } else if (overlayRef.current) {
      overlayRef.current.setMap(map);
    }

    console.log('Peta Google Maps berhasil diinisialisasi.');

    return () => {
      if (mapInstanceRef.current) {
        // Hapus CustomOverlay saat komponen unmount atau peta diinisialisasi ulang
        if (overlayRef.current) {
          overlayRef.current.setMap(null); // Panggil onRemove di CustomOverlay
          overlayRef.current = null;
        }
        mapInstanceRef.current = null;
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        console.log('Peta Google Maps telah di-cleanup.');
      }
    };
  }, [isGoogleMapsLoaded, userLocation, CustomOverlay]); // Tambahkan CustomOverlay ke dependensi


  // Helper untuk mengonversi LatLng ke koordinat piksel relatif terhadap kontainer peta
  const getPixelPosition = useCallback((latLng) => {
    // Pastikan overlay sudah siap dan proyeksinya tersedia
    if (!overlayRef.current || !overlayRef.current.projectionReady) {
      console.warn("Overlay projection not ready.");
      return null;
    }
    const mapCanvasProjection = overlayRef.current.getMapCanvasProjection();
    // fromLatLngToContainerPixel memberikan koordinat relatif terhadap div peta
    const point = mapCanvasProjection.fromLatLngToContainerPixel(latLng);
    return { x: point.x, y: point.y };
  }, []);

  // Effect untuk memperbarui posisi piksel InfoWindow kustom saat peta bergerak/zoom
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
      const latLng = new window.google.maps.LatLng(selectedAtm.position.lat, selectedAtm.position.lng);
      const pixelPos = getPixelPosition(latLng);
      if (pixelPos) {
        setInfoWindowPixelPosition(pixelPos);
      }
    };

    // Panggil updatePosition saat ini dan tambahkan listener untuk perubahan peta
    if (mapInstanceRef.current) {
      updatePosition();
      const idleListener = mapInstanceRef.current.addListener('idle', updatePosition);
      const zoomListener = mapInstanceRef.current.addListener('zoom_changed', updatePosition);
      const centerListener = mapInstanceRef.current.addListener('center_changed', updatePosition);

      return () => {
        window.google.maps.event.removeListener(idleListener);
        window.google.maps.event.removeListener(zoomListener);
        window.google.maps.event.removeListener(centerListener);
      };
    }
  }, [openAtmId, isGoogleMapsLoaded, atmLocations, getPixelPosition]);


  // --- Update Marker saat 'atmLocations' atau 'activeView' berubah ---
  useEffect(() => {
    if (!isGoogleMapsLoaded || !mapInstanceRef.current || !getTierColor) {
      return;
    }

    // Hapus semua marker yang ada sebelumnya
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Tutup InfoWindow kustom jika ada marker yang dihapus
    setOpenAtmId(null);
    setInfoWindowPixelPosition(null);

    const bounds = new window.google.maps.LatLngBounds();

    if (atmLocations.length > 0) {
      atmLocations.forEach(atm => {
        const { lat, lng } = atm.position;
        const position = { lat, lng };

        // Tentukan warna pin berdasarkan tier atau fee
        let markerColor = '';
        if (activeView === 'Tier') {
          markerColor = getTierColor(atm.tier);
        } else if (activeView === 'Fee') {
          const feeValue = parseFloat(atm.transactionMetrics.avgFeeValue.replace(/[^0-9.-]+/g,""));
          if (feeValue >= 100000) {
            markerColor = 'blue';
          } else if (feeValue >= 50000) {
            markerColor = 'green';
          } else if (feeValue > 0) {
            markerColor = 'yellow';
          } else {
            markerColor = 'gray';
          }
        }

        const pinSymbol = (color) => {
          const hexColor = {
            'blue': '#2C5282', // Chakra blue.700
            'green': '#38A169', // Chakra green.500
            'yellow': '#D69E2E', // Chakra yellow.500
            'red': '#E53E3E', // Chakra red.500
            'gray': '#A0AEC0' // Chakra gray.500
          }[color] || '#A0AEC0';

          return {
            path: 'M 0,0 C -2,-20 -10,-9 -10,-22 A 10,10 0 1,1 10,-22 C 10,-9 2,-20 0,0 z',
            fillColor: hexColor,
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

        // Tambahkan event listener untuk marker
        marker.addListener('click', () => {
          setOpenAtmId(atm.id); // Set ATM yang InfoWindow-nya akan dibuka
        });

        markersRef.current.push(marker);
        bounds.extend(position);
      });

      mapInstanceRef.current.fitBounds(bounds);

      if (atmLocations.length === 1) {
        mapInstanceRef.current.setZoom(14);
      }

    } else if (userLocation) {
      mapInstanceRef.current.setCenter(userLocation);
      mapInstanceRef.current.setZoom(14);
    } else {
      mapInstanceRef.current.setCenter(DEFAULT_CENTER);
      mapInstanceRef.current.setZoom(12);
    }

  }, [atmLocations, isGoogleMapsLoaded, userLocation, getTierColor, activeView]);

  // --- Pindahkan peta ke lokasi pengguna saat pertama kali didapatkan ---
  useEffect(() => {
    if (userLocation && isGoogleMapsLoaded && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(userLocation);
      mapInstanceRef.current.setZoom(14);
    }
  }, [userLocation, isGoogleMapsLoaded]);

  // Dapatkan ATM yang sedang dibuka InfoWindow-nya
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
      display={isGoogleMapsLoaded ? 'block' : 'flex'}
      justifyContent="center"
      alignItems="center"
    >
      {!isGoogleMapsLoaded && (
        <VStack>
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.500">Memuat Peta...</Text>
          <Text fontSize="sm" color="gray.400">Pastikan koneksi internet stabil dan izinkan lokasi.</Text>
        </VStack>
      )}

      {/* Custom InfoWindow */}
      {currentAtmForInfoWindow && infoWindowPixelPosition && (
        <Box
          position="absolute"
          zIndex="10"
          bg="white"
          borderRadius="lg"
          boxShadow="lg"
          p={0}
          // Menggunakan posisi piksel yang dihitung
          style={{
            left: `${infoWindowPixelPosition.x}px`,
            top: `${infoWindowPixelPosition.y}px`,
            transform: 'translate(-50%, -100%)', // Menggeser InfoWindow agar berada di atas pin
            maxWidth: '280px', // Membatasi lebar agar konten melipat ke bawah
            minWidth: '250px', // Memastikan lebar minimum
            // Tidak ada pengaturan tinggi atau overflow eksplisit di sini
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            p="10px 15px"
            bg="gray.50"
            borderBottom="1px solid"
            borderColor="gray.100"
            borderTopRadius="lg"
          >
            <Text fontSize="sm" fontWeight="bold" color="gray.800">
              {currentAtmForInfoWindow.type} {currentAtmForInfoWindow.name}
            </Text>
            <Badge
              bg={getTierColor(currentAtmForInfoWindow.tier)}
              color={getBadgeTextColor(getTierColor(currentAtmForInfoWindow.tier))}
              borderRadius="full"
              fontSize="xs"
              px={2}
              py={1}
            >
              {currentAtmForInfoWindow.machineCode}
            </Badge>
            <IconButton
              icon={<CloseIcon />}
              size="xs"
              variant="ghost"
              aria-label="Close InfoWindow"
              onClick={() => setOpenAtmId(null)} // Menutup InfoWindow
            />
          </Flex>
          <Box p="15px">
            <Text fontSize="xs" color="gray.700" mb="10px">
              {currentAtmForInfoWindow.address}
            </Text>

            <Flex align="center" mb="10px" pb="10px" borderBottom="1px solid" borderColor="gray.100">
              <Text mr="8px" color="#4299E1">&#x21BB;</Text> {/* Icon for Transaction Metrics */}
              <Text fontSize="sm" fontWeight="bold" color="gray.800">Transaction Metrics</Text>
            </Flex>
            <Text fontSize="xs" color="gray.700" ml="20px" mb="3px">
              <strong>Avg Transaction:</strong> {currentAtmForInfoWindow.transactionMetrics.avgTransaction}
            </Text>

            <Flex align="center" mt="15px" mb="10px" pb="10px" borderBottom="1px solid" borderColor="gray.100">
              <Text mr="8px" color="#4299E1">&#xFE49;</Text> {/* Icon for Fee Structure */}
              <Text fontSize="sm" fontWeight="bold" color="gray.800">Fee Structure</Text>
            </Flex>
            <Text fontSize="xs" color="gray.700" ml="20px" mb="3px">
              <strong>Avg Fee:</strong> {currentAtmForInfoWindow.transactionMetrics.avgFeeValue}
            </Text>

            <Flex align="center" mt="15px" mb="10px" pb="10px" borderBottom="1px solid" borderColor="gray.100">
              <Text mr="8px" color="#4299E1">&#x2302;</Text> {/* Icon for Details */}
              <Text fontSize="sm" fontWeight="bold" color="gray.800">Details</Text>
            </Flex>
            <Text fontSize="xs" color="gray.700" ml="20px" mb="3px">
              <strong>Kantor Induk:</strong> {currentAtmForInfoWindow.details.kantorInduk}
            </Text>
            <Text fontSize="xs" color="gray.700" ml="20px" mb="0">
              <strong>Kanwil:</strong> {currentAtmForInfoWindow.details.kanwil}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MapComponent;
