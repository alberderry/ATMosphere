// src/components/InteractiveMapCard.jsx

import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  HStack,
  Spinner,
  VStack,
  Flex, // Added for InfoWindow layout
  IconButton, // Added for InfoWindow close button
  Badge, // Added for InfoWindow badge
} from "@chakra-ui/react"
import { useEffect, useRef, useState, useCallback } from "react"
import { CloseIcon } from "@chakra-ui/icons"; // Import CloseIcon

const Maps_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const InteractiveMapCard = ({
  cardBg,
  selectedLocation,
  mapRef,
  markerRef,
  mapContainerRef,
  updateSelectedLocationFromMap,
  nearbyBJBBranches,
  nearbyOtherBanks,
  nearbyCommonPlaces,
}) => {
  const [googleMapsApiLoaded, setGoogleMapsApiLoaded] = useState(false);
  const trafficLayerRef = useRef(null); // Mengubah kembali dari heatmapLayerRef ke trafficLayerRef
  const nearbyMarkersRef = useRef([]);
  const [openInfoWindowData, setOpenInfoWindowData] = useState(null); // State for custom InfoWindow data

  // Custom OverlayView for pixel projection (needed for custom info window positioning)
  // Ini adalah cara untuk mendapatkan koordinat piksel dari LatLng pada peta Google Maps
  class CustomProjectionOverlay extends window.google.maps.OverlayView {
    constructor(map) {
      super();
      this.setMap(map);
    }
    onAdd() { /* No op */ } // Dipanggil saat overlay ditambahkan ke peta
    draw() { /* No op */ } // Dipanggil saat overlay perlu digambar ulang
    onRemove() { /* No op */ } // Dipanggil saat overlay dilepas dari peta
    getProjection() {
      // Mengembalikan objek proyeksi peta, yang dapat mengonversi koordinat geografis ke piksel layar
      return this.getMap().getProjection();
    }
  }
  const projectionOverlayRef = useRef(null); // Ref untuk instance CustomProjectionOverlay

  // Helper untuk mendapatkan koordinat piksel dari LatLng
  const getPixelPosition = useCallback((latLng) => {
    if (!projectionOverlayRef.current || !projectionOverlayRef.current.getProjection()) {
      return null;
    }
    // fromLatLngToDivPixel memberikan koordinat piksel relatif terhadap sudut kiri atas DIV peta
    const point = projectionOverlayRef.current.getProjection().fromLatLngToDivPixel(latLng);
    return { x: point.x, y: point.y };
  }, []);

  // --- Memuat Google Maps API tanpa library 'visualization' (tidak diperlukan untuk TrafficLayer) ---
  useEffect(() => {
    // Callback function yang akan dipanggil setelah script Google Maps dimuat
    window.initInteractiveMap = () => {
      setGoogleMapsApiLoaded(true);
      console.log('Google Maps API berhasil dimuat.');
    };

    // Periksa jika Google Maps API sudah dimuat di window
    if (window.google && window.google.maps) { // Tidak perlu window.google.maps.visualization
      setGoogleMapsApiLoaded(true);
      console.log('Google Maps API sudah tersedia.');
      return;
    }

    // Jika belum dimuat, tambahkan script ke head dokumen HTML
    if (!document.getElementById('google-maps-interactive-script')) {
      const script = document.createElement('script');
      script.id = 'google-maps-interactive-script';
      // Sertakan library 'places' (untuk pencarian lokasi)
      // TrafficLayer tidak memerlukan library khusus selain API Maps dasar
      script.src = `https://maps.googleapis.com/maps/api/js?key=${Maps_API_KEY}&libraries=places&callback=initInteractiveMap`;
      script.async = true; // Muat secara asynchronous
      script.defer = true; // Tunda eksekusi sampai parsing HTML selesai
      document.head.appendChild(script);
      console.log('Menambahkan script Google Maps API...');
    }

    // Fungsi cleanup saat komponen di-unmount
    return () => {
      delete window.initInteractiveMap; // Hapus callback global
    };
  }, []);

  // Fungsi untuk membuat simbol pin kustom dengan warna berbeda
  const createPinSymbol = useCallback((colorHex, scale = 1.5, path = 'M 0,0 C -2,-20 -10,-9 -10,-22 A 10,10 0 1,1 10,-22 C 10,-9 2,-20 0,0 z') => {
    return {
      path: path, // Bentuk pin
      fillColor: colorHex, // Warna isi pin
      fillOpacity: 1, // Opasitas isi pin
      strokeColor: '#000', // Warna garis tepi pin
      strokeWeight: 0.5, // Ketebalan garis tepi pin
      scale: scale, // Ukuran pin
      anchor: new window.google.maps.Point(0, 22) // Titik jangkar pin (ujung bawah)
    };
  }, []);

  // Inisialisasi dan kelola peta Google Maps, Traffic Layer, dan Marker Lokasi Terdekat
  useEffect(() => {
    if (googleMapsApiLoaded && mapContainerRef.current) {
      const defaultLocation = { lat: -6.9175, lng: 107.6191 }; // Lokasi default: Bandung

      // Tentukan pusat peta awal
      const initialCenter = selectedLocation ?
        { lat: selectedLocation.lat, lng: selectedLocation.lng } :
        defaultLocation;

      // Inisialisasi peta jika belum ada instance peta
      if (!mapRef.current) {
        mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 15,
          mapTypeControl: false, // Sembunyikan kontrol tipe peta
          streetViewControl: false, // Sembunyikan kontrol Street View
          fullscreenControl: false, // Sembunyikan kontrol fullscreen
        });

        // Inisialisasi CustomProjectionOverlay untuk membantu mendapatkan koordinat piksel
        projectionOverlayRef.current = new CustomProjectionOverlay(mapRef.current);

        // Inisialisasi marker untuk lokasi target utama
        markerRef.current = new window.google.maps.Marker({
          position: initialCenter,
          map: mapRef.current,
          draggable: true, // Marker bisa digeser
          title: "Lokasi Target",
          icon: createPinSymbol("#1A365D", 2.0, window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW) // Bentuk panah, lebih besar, biru tua
        });

        // Event listener saat marker lokasi target digeser
        markerRef.current.addListener("dragend", () => {
          const newLat = markerRef.current.getPosition().lat();
          const newLng = markerRef.current.getPosition().lng();
          updateSelectedLocationFromMap(newLat, newLng);
        });

        // Event listener saat peta diklik
        mapRef.current.addListener("click", (e) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          markerRef.current.setPosition({ lat: newLat, lng: newLng });
          updateSelectedLocationFromMap(newLat, newLng);
          setOpenInfoWindowData(null); // Tutup info window kustom saat peta diklik
        });

        // --- Inisialisasi Traffic Layer ---
        trafficLayerRef.current = new window.google.maps.TrafficLayer();
        trafficLayerRef.current.setMap(mapRef.current); // Atur peta untuk Traffic Layer

      } else {
        // Jika peta sudah ada, perbarui posisi tengah dan marker lokasi target utama
        mapRef.current.setCenter(initialCenter);
        markerRef.current.setPosition(initialCenter);
        // Pastikan gaya marker utama konsisten
        markerRef.current.setIcon(createPinSymbol("#1A365D", 2.0, window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW));
        // Pastikan Traffic Layer tetap aktif jika peta sudah ada
        if (trafficLayerRef.current) {
          trafficLayerRef.current.setMap(mapRef.current);
        }
      }

      // --- Hapus Heatmap Layer jika ada (dari versi sebelumnya) ---
      // (Tidak ada lagi di kode ini karena telah dihapus dari script src)
      // Namun, jika Anda sebelumnya mengaktifkannya secara terpisah, pastikan untuk menghapusnya:
      // if (heatmapLayerRef.current) {
      //   heatmapLayerRef.current.setMap(null);
      //   heatmapLayerRef.current = null;
      // }

      // --- Tambahkan Marker untuk Lokasi Terdekat ---
      // Hapus semua marker yang ada sebelumnya sebelum menambahkan yang baru
      nearbyMarkersRef.current.forEach(marker => marker.setMap(null));
      nearbyMarkersRef.current = [];
      setOpenInfoWindowData(null); // Tutup info window saat marker dihapus

      const bounds = new window.google.maps.LatLngBounds();
      if (selectedLocation) {
        bounds.extend(new window.google.maps.LatLng(selectedLocation.lat, selectedLocation.lng));
      }

      // Fungsi helper untuk menambahkan marker dan listener-nya
      const addNearbyMarker = (place, type, color) => {
        const marker = new window.google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map: mapRef.current,
          title: `${type}: ${place.name}`,
          icon: createPinSymbol(color),
        });

        // Simpan data relevan dengan marker agar dapat ditampilkan di info window
        marker.customData = { ...place, typeDisplay: type, color };

        // Tambahkan event listener untuk klik marker
        marker.addListener('click', () => {
          setOpenInfoWindowData(marker.customData); // Set data untuk info window
        });
        nearbyMarkersRef.current.push(marker); // Tambahkan marker ke ref
        bounds.extend(marker.getPosition()); // Perluas batas peta
      };

      // Marker untuk KCP BJB Terdekat (warna biru)
      if (nearbyBJBBranches && nearbyBJBBranches.length > 0) {
        nearbyBJBBranches.forEach(branch => addNearbyMarker(branch, 'KCP BJB', '#4299E1')); // Chakra blue.500
      }

      // Marker untuk Lokasi Umum Terdekat (warna hijau)
      if (nearbyCommonPlaces) {
        Object.values(nearbyCommonPlaces).forEach(categoryPlaces => {
          categoryPlaces.forEach(place => {
            if (place.lat && place.lng) {
              addNearbyMarker(place, 'Lokasi Umum', '#38A169'); // Chakra green.500
            }
          });
        });
      }

      // Marker untuk ATM Lain Terdekat (warna merah)
      if (nearbyOtherBanks && nearbyOtherBanks.length > 0) {
        nearbyOtherBanks.forEach(atm => addNearbyMarker(atm, 'ATM Lain', '#E53E3E')); // Chakra red.500
      }

      // Sesuaikan zoom dan pusat peta agar semua marker terlihat
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds); // Sesuaikan batas peta
        const zoom = mapRef.current.getZoom();
        if (zoom > 16) { // Cegah zoom berlebihan jika marker sangat berdekatan
            mapRef.current.setZoom(16);
        }
      } else if (selectedLocation) {
        // Jika tidak ada marker terdekat, fokuskan peta pada lokasi target
        mapRef.current.setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
        mapRef.current.setZoom(15);
      }
    }

    // Fungsi cleanup saat komponen di-unmount atau dependensi berubah
    return () => {
      if (trafficLayerRef.current) { // Pastikan menghapus traffic layer
        trafficLayerRef.current.setMap(null);
        trafficLayerRef.current = null;
      }
      if (nearbyMarkersRef.current) {
        nearbyMarkersRef.current.forEach(marker => marker.setMap(null));
        nearbyMarkersRef.current = [];
      }
      if (projectionOverlayRef.current) {
        projectionOverlayRef.current.setMap(null);
        projectionOverlayRef.current = null;
      }
      setOpenInfoWindowData(null); // Tutup info window saat cleanup
    };
  }, [googleMapsApiLoaded, selectedLocation, mapContainerRef, mapRef, markerRef, updateSelectedLocationFromMap, nearbyBJBBranches, nearbyOtherBanks, nearbyCommonPlaces, createPinSymbol, getPixelPosition]);


  // Effect untuk memperbarui posisi InfoWindow kustom saat peta bergerak/zoom
  useEffect(() => {
    // Jalankan efek ini hanya jika ada data info window yang harus ditampilkan dan peta sudah dimuat
    if (!openInfoWindowData || !mapRef.current || !projectionOverlayRef.current || !googleMapsApiLoaded) {
      return;
    }

    // Fungsi untuk memperbarui posisi InfoWindow
    const updateInfoWindowPosition = () => {
      // Buat objek LatLng dari data lokasi yang dibuka info window-nya
      const latLng = new window.google.maps.LatLng(openInfoWindowData.lat, openInfoWindowData.lng);
      // Konversi LatLng ke koordinat piksel di layar
      const pixelPosition = getPixelPosition(latLng);

      if (pixelPosition) {
        const infoWindowElement = document.getElementById('custom-info-window');
        if (infoWindowElement) {
          // Sesuaikan posisi piksel elemen info window
          // `pixelPosition.x` adalah tengah horizontal marker
          // `pixelPosition.y - 20` menggeser ke atas 20px dari titik jangkar pin
          infoWindowElement.style.left = `${pixelPosition.x}px`;
          infoWindowElement.style.top = `${pixelPosition.y - 20}px`;
          // `translate(-50%, -100%)` menggeser elemen ke kiri 50% dari lebarnya sendiri
          // dan ke atas 100% dari tingginya sendiri, menempatkan pusat bawah elemen di atas pin
          infoWindowElement.style.transform = 'translate(-50%, -100%)';
        }
      }
    };

    // Panggil fungsi posisi saat inisialisasi
    updateInfoWindowPosition();

    // Tambahkan listener untuk perubahan peta (bounds, zoom, center)
    // agar info window tetap berada di posisi yang benar saat peta digerakkan
    const map = mapRef.current;
    const listeners = [];
    listeners.push(map.addListener('bounds_changed', updateInfoWindowPosition));
    listeners.push(map.addListener('zoom_changed', updateInfoWindowPosition));
    listeners.push(map.addListener('center_changed', updateInfoWindowPosition));

    // Fungsi cleanup untuk menghapus listener saat efek di-render ulang atau komponen di-unmount
    return () => {
      listeners.forEach(listener => window.google.maps.event.removeListener(listener));
    };
  }, [openInfoWindowData, googleMapsApiLoaded, getPixelPosition]); // Dependensi untuk reposisi InfoWindow

  return (
    <Card bg={cardBg} shadow="sm">
      <CardHeader>
        <Heading size="md" color="gray.700">
          Peta Interaktif Lokasi
        </Heading>
        <Text fontSize="sm" color="gray.500" mt={1}>
          Geser pin atau klik pada peta untuk memilih lokasi target. **Peta menampilkan kondisi lalu lintas real-time dan lokasi terdekat.**
        </Text>
        <Text fontSize="sm" color="gray.500" mt={1}>
          Pin: <Badge colorScheme="blue">KCP BJB</Badge>, <Badge colorScheme="green">Lokasi Umum</Badge>, <Badge colorScheme="red">ATM Lain</Badge>. Klik pin untuk detail.
        </Text>
      </CardHeader>
      <CardBody pt={0}>
        <Box
          ref={mapContainerRef} // Ref untuk kontainer peta Google Maps
          borderRadius="lg"
          overflow="hidden"
          border="1px solid"
          borderColor="gray.200"
          height="400px" // Tinggi tetap untuk peta
          width="100%"
          position="relative" // Penting untuk posisi absolut info window
          display={googleMapsApiLoaded ? "block" : "flex"} // Tampilkan/sembunyikan peta saat loading
          alignItems="center"
          justifyContent="center"
        >
          {!googleMapsApiLoaded && ( // Tampilkan spinner saat peta belum dimuat
            <VStack>
              <Spinner size="xl" color="blue.500" />
              <Text>Memuat peta...</Text>
            </VStack>
          )}

          {/* Custom Info Window - Dirender di atas peta */}
          {openInfoWindowData && (
            <Box
              id="custom-info-window" // ID untuk referensi di useEffect
              position="absolute" // Posisi absolut terhadap mapContainerRef
              bg="white"
              borderRadius="lg"
              boxShadow="lg"
              p={3}
              zIndex={100} // Pastikan di atas elemen peta lainnya
              minW="180px" // Lebar minimum info window
              maxW="250px" // Lebar maksimum info window
              pb={0} // Hapus padding bawah untuk jarak yang lebih baik
            >
              <Flex justifyContent="space-between" alignItems="center" mb={1}>
                <Text fontSize="md" fontWeight="bold" noOfLines={1}>
                  {openInfoWindowData.typeDisplay} {/* Tipe lokasi (e.g., KCP BJB) */}
                </Text>
                <IconButton
                  icon={<CloseIcon />}
                  size="xs"
                  variant="ghost"
                  aria-label="Tutup InfoWindow"
                  onClick={() => setOpenInfoWindowData(null)} // Menutup info window
                />
              </Flex>
              <Text fontSize="sm" color="gray.700" mb={1} noOfLines={1}>
                {openInfoWindowData.name} {/* Nama lokasi */}
              </Text>
              <Text fontSize="xs" color="gray.600" noOfLines={2}>
                {openInfoWindowData.address} {/* Alamat lokasi */}
              </Text>
              {openInfoWindowData.distance && ( // Tampilkan jarak jika ada
                <Text fontSize="xs" color="gray.600" mt={1}>
                  Jarak: <Text as="span" fontWeight="semibold">{openInfoWindowData.distance} km</Text>
                </Text>
              )}
              {openInfoWindowData.url && ( // Tampilkan link Google Maps jika ada
                <a href={openInfoWindowData.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#4299E1', display: 'block', marginTop: '8px' }}>
                  Lihat di Google Maps
                </a>
              )}
            </Box>
          )}
        </Box>
        {selectedLocation && (
          <HStack mt={3} spacing={4} fontSize="sm" color="gray.600">
            <Text>
              <strong>Koordinat:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </Text>
          </HStack>
        )}
      </CardBody>
    </Card>
  )
}

export default InteractiveMapCard;
