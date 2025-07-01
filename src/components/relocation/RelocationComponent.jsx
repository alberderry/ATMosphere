// src/pages/RelocationComponent.jsx (File Utama)

"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  Box,
  Container,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react"
import axios from 'axios';

// Import komponen-komponen yang telah dipisahkan
import RelocationHeader from "./RelocationHeader"
import LocationSearchCard from "./LocationSearchCard"
import InteractiveMapCard from "./InteractiveMapCard"
import NearbyBranchesCard from "./NearbyBranchesCard"
import NearbyCommonPlacesCard from "./NearbyCommonPlacesCard"
import CBAAnalysisResultCards from "./CBAAnalysisResultCards"
import RelocationInstructions from "./RelocationInstructions" // Perhatian: path ini sebelumnya salah ketik 'relocation' menjadi 'relation'
import CostInputCard from "./CostInputCard";
import NearbyOtherBanksCard from "./NearbyOtherBankCards"

// Import fungsi-fungsi utilitas
import { calculateDistance } from "../../utils/relocationUtils"
import { useAuth } from '../../contexts/AuthContext';

const Maps_API_KEY = import.meta.env.VITE_Maps_API_KEY;
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const BACKEND_PROXY_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const mockHistoricalData = [
  { id: 1, location: "Jakarta Pusat", lat: -6.2088, lng: 106.8456, success_rate: 85, roi: 120, customers: 1250, tier: "TIER 1" },
  { id: 2, location: "Bandung", lat: -6.9175, lng: 107.6191, success_rate: 78, roi: 95, customers: 890, tier: "TIER 2" },
  { id: 3, location: "Surabaya", lat: -7.2575, lng: 112.7521, success_rate: 82, roi: 110, customers: 1100, tier: "TIER 1" },
  { id: 4, location: "Medan", lat: 3.5952, lng: 98.6722, success_rate: 65, roi: 75, customers: 650, tier: "TIER 3" },
];

const RelocationComponent = () => {
  const [locationName, setLocationName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ setError] = useState(null);

  const [nearbyBJBBranches, setNearbyBJBBranches] = useState([]);
  const [nearbyOtherBanks, setNearbyOtherBanks] = useState([]);
  const [nearbyCommonPlaces, setNearbyCommonPlaces] = useState({
    schools: [], supermarkets: [], markets: [], universities: [],
    hotels: [], pharmacy: [], housingComplexes: [], restaurants: [], malls: [],
  });

  const toast = useToast();
  const bgColor = useColorModeValue("blue.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  const { getAccessToken } = useAuth();

  const commonHeaders = useMemo(() => {
    const token = getAccessToken();
    console.log("Memoized commonHeaders token:", token ? "Token present" : "Token missing");
    return {
      'Authorization': `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
      'Content-Type': 'application/json',
    };
  }, [getAccessToken]);

  const categorizePublicPlaces = useCallback((places, targetLat, targetLng) => {
    const categorized = {
      schools: [],
      supermarkets: [],
      markets: [],
      universities: [],
      hotels: [],
      pharmacy: [],
      housingComplexes: [],
      restaurants: [],
      malls: [],
    };

    places.forEach(place => {
      if (!place.geometry || !place.geometry.location || typeof place.geometry.location.lat === 'undefined' || typeof place.geometry.location.lng === 'undefined') {
        console.warn('Invalid public place data, skipping:', place);
        return;
      }

      const distance = calculateDistance(targetLat, targetLng, place.geometry.location.lat, place.geometry.location.lng);
      const formattedPlace = {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating || 0,
        distance: distance ? distance.toFixed(1) : 'N/A',
        isOpen: place.opening_hours?.open_now,
        // KOREKSI: Gunakan 'category' sebagai tipe, atau buat array dari itu
        // Jika API Anda hanya mengirim 'category' string tunggal, kita akan gunakan itu.
        // Jika Anda ingin tetap menggunakan 'types' array di getCommonPlaceIcon,
        // kita bisa membuat array dari 'category' jika 'types' tidak ada.
        types: place.types || (place.category ? [place.category] : []), // <-- PRIORITAS PERBAIKAN INI
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        photo: place.photos?.[0]?.photo_reference,
        url: `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat},${place.geometry.location.lng}&query_place_id=${place.place_id}`
      };

      const lowerCaseCategory = place.category ? place.category.toLowerCase() : '';

      // KOREKSI: Sesuaikan logika pengkategorian hanya berdasarkan 'category'
      // Jika API Anda hanya mengembalikan satu 'category' string.
      if (lowerCaseCategory === 'school') {
        categorized.schools.push(formattedPlace);
      } else if (lowerCaseCategory === 'supermarket') {
        categorized.supermarkets.push(formattedPlace);
      } else if (lowerCaseCategory === 'store') {
        categorized.markets.push(formattedPlace);
      } else if (lowerCaseCategory === 'university') {
        categorized.universities.push(formattedPlace);
      } else if (lowerCaseCategory === 'hotel') {
        categorized.hotels.push(formattedPlace);
      } else if (lowerCaseCategory === 'pharmacy') { // Asumsi API mengembalikan 'health'
        categorized.pharmacy.push(formattedPlace);
      } else if (lowerCaseCategory === 'housing_complex') { // Asumsi API mengembalikan 'housing_complex'
        categorized.housingComplexes.push(formattedPlace);
      } else if (lowerCaseCategory === 'restaurant') {
        categorized.restaurants.push(formattedPlace);
      } else if (lowerCaseCategory === 'mall' || lowerCaseCategory === 'shopping_mall') {
        categorized.malls.push(formattedPlace);
      }
      // Tambahkan lebih banyak kategori jika diperlukan sesuai dengan nilai 'category' dari API Anda
    });
    return categorized;
  }, []);


  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log("Google Maps API already loaded.");
        if (!autocompleteService.current) {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
          console.log("AutocompleteService initialized.");
        }
        if (!placesService.current) {
          const dummyDiv = document.createElement('div');
          document.body.appendChild(dummyDiv);
          placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
          console.log("PlacesService initialized.");
        }
        return;
      }

      if (!Maps_API_KEY) {
        console.error("Maps_API_KEY is missing. Google Maps functionality will be limited.");
        toast({
          title: "Peringatan",
          description: "Kunci API Google Maps tidak ditemukan. Peta dan pencarian lokasi mungkin tidak berfungsi.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      console.log("Loading Google Maps API script...");
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${Maps_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps API script loaded successfully.");
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        const dummyDiv = document.createElement('div');
        document.body.appendChild(dummyDiv);
        placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
        console.log("Google Maps services initialized after script load.");
      };
      script.onerror = () => {
        console.error("Failed to load Google Maps API script.");
        toast({
          title: "Error",
          description: "Gagal memuat Google Maps API. Periksa koneksi internet atau kunci API.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();
  }, [toast]);


  const updateSelectedLocationFromMap = useCallback(async (lat, lng) => {
    console.log("updateSelectedLocationFromMap called with:", { lat, lng });
    setAnalysisResult(null);
    setNearbyBJBBranches([]);
    setNearbyOtherBanks([]);
    setNearbyCommonPlaces({
      schools: [], supermarkets: [], markets: [], universities: [],
      hotels: [], pharmacy: [], housingComplexes: [], restaurants: [], malls: []
    });

    try {
      console.log(`Sending reverse-geocode request to ${BACKEND_PROXY_URL}/maps/reverse-geocode`);
      const response = await axios.post(`${BACKEND_PROXY_URL}/maps/reverse-geocode`, { lat, lng }, {
        headers: { "ngrok-skip-browser-warning": "true" }
      });
      const data = response.data;
      console.log("Reverse geocode response:", data);

      const address = data.results[0]?.formatted_address || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
      const name = data.results[0]?.address_components?.find(comp => comp.types.includes('establishment') || comp.types.includes('point_of_interest'))?.long_name || address;

      const newLocation = {
        name: name,
        formatted_address: address,
        lat: lat,
        lng: lng,
        place_id: data.results[0]?.place_id || null,
      };
      setSelectedLocation(newLocation);
      setLocationName(newLocation.formatted_address);

      toast({
        title: "Lokasi Peta Diperbarui",
        description: `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        status: "info",
        duration: 2000,
        isClosable: true,
      });

    } catch (err) {
      console.error("Error reverse geocoding:", err);
      toast({
        title: "Error Reverse Geocoding",
        description: `Gagal mendapatkan nama lokasi dari koordinat: ${err.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setSelectedLocation({
        name: `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        formatted_address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
        lat: lat,
        lng: lng,
        place_id: null,
      });
      setLocationName(`Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  }, [toast]);

  const searchLocations = (query) => {
    console.log("searchLocations called with query:", query);
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!autocompleteService.current) {
      console.warn("Google Maps AutocompleteService not yet loaded. Cannot search locations.");
      toast({
        title: "Peringatan",
        description: "Layanan pencarian lokasi belum siap. Coba lagi sebentar.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsLoadingSuggestions(true);
    autocompleteService.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'id' },
        types: ['establishment', 'geocode'],
      },
      (predictions, status) => {
        setIsLoadingSuggestions(false);
        console.log("Autocomplete predictions status:", status, "predictions:", predictions);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setLocationSuggestions(predictions.slice(0, 5));
          setShowSuggestions(true);
        } else {
          console.error("Error fetching location suggestions:", status);
          setLocationSuggestions([]);
          setShowSuggestions(false);
          toast({
            title: "Error",
            description: `Gagal mengambil saran lokasi: ${status}. Pastikan 'Places API' diaktifkan dan API Key Anda memiliki izin yang benar.`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      },
    );
  };

  const getLocationDetails = async (placeId, description) => {
    console.log("getLocationDetails called for placeId:", placeId, "description:", description);
    setAnalysisResult(null);
    setNearbyBJBBranches([]);
    setNearbyOtherBanks([]);
    setNearbyCommonPlaces({
      schools: [], supermarkets: [], markets: [], universities: [],
      hotels: [], pharmacy: [], housingComplexes: [], restaurants: [], malls: []
    });

    try {
      console.log(`Fetching place details for placeId: ${placeId} from ${BACKEND_PROXY_URL}/maps/place-details/${placeId}`);
      const response = await axios.get(
        `${BACKEND_PROXY_URL}maps/place-details/${placeId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true"
          }
        }
      );
      const data = response.data;
      console.log("Place details response:", data);

      if (data.result && data.result.geometry) {
        const location = {
          name: data.result.name || description,
          formatted_address: data.result.formatted_address,
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
          place_id: placeId,
        };

        setSelectedLocation(location);
        setLocationName(description);
        setShowSuggestions(false);

        toast({
          title: "Lokasi Dipilih",
          description: `${location.name} berhasil dipilih`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        return location;
      } else {
        console.error("Backend response for place details did not contain 'result' or 'geometry':", data);
        throw new Error("No place details found or invalid response from backend.");
      }
    } catch (err) {
      console.error("Error in getLocationDetails:", err);
      toast({
        title: "Error Detail Lokasi",
        description: `Gagal mengambil detail lokasi: ${err.message}. Pastikan backend proxy berjalan dan API Key Google Maps Anda valid di backend.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  };

    const performCBAAnalysis = async (location) => {
    console.log("performCBAAnalysis called with location:", location);
    setIsAnalyzing(true);
    console.log("Log: State isAnalyzing set to true.");
    setAnalysisResult(null);
    console.log("Log: Analysis result cleared."); // Log ini sudah Anda lihat

    // ************ LOGGING EKSTRA UNTUK DEBUGGING ************
    console.log("Log: About to call setError(null)."); // LOG BARU
    // setError(null);
    console.log("Log: setError(null) executed."); // LOG BARU
    // *******************************************************

    setNearbyBJBBranches([]);
    console.log("Log: Nearby BJB branches cleared.");
    setNearbyOtherBanks([]);
    console.log("Log: Nearby other banks cleared.");
    setNearbyCommonPlaces({
      schools: [], supermarkets: [], markets: [], universities: [],
      hotels: [], pharmacy: [], housingComplexes: [], restaurants: [], malls: []
    });
    console.log("Log: Nearby common places cleared.");

    try {
      console.log("Log: Entering try block in performCBAAnalysis.");

      // Periksa validasi dengan lebih detail
      if (!location) {
        console.error("Log: Validation failed: location object is null/undefined.", location);
        throw new Error("Lokasi tidak valid untuk analisis (objek lokasi kosong).");
      }
      if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        console.error(`Log: Validation failed: location.lat or location.lng is not a number. Lat Type: ${typeof location.lat}, Lat Value: ${location.lat}, Lng Type: ${typeof location.lng}, Lng Value: ${location.lng}`);
        throw new Error("Lokasi tidak valid untuk analisis (latitude atau longitude bukan angka).");
      }
      console.log("Log: Location validation passed.");

      console.log(`Log: Attempting to send analyze-relocation request to ${BASE_API_URL}/analyze-relocation`);
      console.log("Log: Request payload:", { latitude: location.lat, longitude: location.lng });
      console.log("Log: Request headers:", commonHeaders);

      const response = await axios.post(
        `${BASE_API_URL}/analyze-relocation`,
        { latitude: location.lat, longitude: location.lng },
        { headers: commonHeaders }
      );

      console.log("Log: Analyze Relocation API Response:", response.data);

      if (response.data && response.data.data) {
        const { nearest_branches, neaerest_competitor_atms, nearest_atms, public_places } = response.data.data;

        // Gabungkan nearest_branches dan nearest_atms ke dalam satu array
        const allBJBBranches = [
          ...(nearest_branches || []),
          ...(nearest_atms || [])
        ];

        const formattedBJBBranches = allBJBBranches.map(branch => ({
          id: branch.id,
          name: branch.name,
          address: branch.address,
          distance: branch.distance ? branch.distance.toFixed(1) : 'N/A',
          lat: branch.latitude,
          lng: branch.longitude,
        }));
        setNearbyBJBBranches(formattedBJBBranches);

        const formattedOtherAtms = neaerest_competitor_atms ? neaerest_competitor_atms.map(atm => ({
          id: atm.id,
          name: atm.name,
          address: atm.address,
          distance: atm.distance ? atm.distance.toFixed(1) : 'N/A',
          lat: atm.geometry?.location?.lat,
          lng: atm.geometry?.location?.lng,
        })) : [];
        setNearbyOtherBanks(formattedOtherAtms);

        const categorizedPlaces = categorizePublicPlaces(public_places || [], location.lat, location.lng);
        setNearbyCommonPlaces(categorizedPlaces);

        const totalNearbyBJBBranches = formattedBJBBranches.length;
        const totalNearbyOtherAtms = formattedOtherAtms.length;
        const totalCommonPlaces = Object.values(categorizedPlaces).reduce((sum, arr) => sum + arr.length, 0);

        const proximityScore = Math.min(totalNearbyBJBBranches * 5 + totalCommonPlaces * 0.5, 50);
        const demographicScore = Math.random() * 25 + 15;
        const competitionScore = Math.max(0, 30 - (totalNearbyOtherAtms * 2));
        const accessibilityScore = Math.random() * 25 + 15;

        const totalScore = proximityScore + demographicScore + competitionScore + accessibilityScore;

        let potential, color, recommendation;

        if (totalScore >= 75) {
          potential = "Berpotensi";
          color = "green";
          recommendation = "Lokasi sangat direkomendasikan untuk relokasi. ROI tinggi dan risiko rendah.";
        } else if (totalScore >= 50) {
          potential = "Perlu Diperhitungkan";
          color = "yellow";
          recommendation = "Lokasi memerlukan analisis lebih mendalam. Potensi sedang dengan beberapa risiko.";
        } else {
          potential = "Rentan";
          color = "red";
          recommendation = "Lokasi tidak direkomendasikan untuk relokasi. Risiko tinggi dan ROI rendah.";
        }

        setAnalysisResult({
          score: totalScore.toFixed(1),
          potential,
          color,
          recommendation,
          estimatedROI: (60 + Math.random() * 60).toFixed(1),
          customerDensity: Math.floor(300 + Math.random() * 1200),
          competitorCount: totalNearbyOtherAtms,
          accessibilityScore: accessibilityScore.toFixed(1),
          proximityScore: proximityScore.toFixed(1),
          demographicScore: demographicScore.toFixed(1),
          competitionScore: competitionScore.toFixed(1),
          branchProximityBonus: totalNearbyBJBBranches * 2,
          otherBankImpact: totalNearbyOtherAtms * -0.5,
          estimatedCost: (500 + Math.random() * 1000).toFixed(0),
          breakEvenMonths: Math.floor(8 + Math.random() * 16),
          location: location,
          nearbyBranchCount: totalNearbyBJBBranches,
          nearbyOtherBanksCount: totalNearbyOtherAtms,
          nearbyCommonPlacesCount: totalCommonPlaces,
        });

      } else {
        console.error("Log: Analyze Relocation API response missing expected 'data' field.", response.data);
        setError("Respons analisis tidak memiliki data yang diharapkan.");
        setAnalysisResult(null);
      }
    } catch (err) {
      console.error("Log: Error caught in performCBAAnalysis try-catch block:", err);
      if (axios.isAxiosError(err)) {
        console.error("Error response data:", err.response?.data);
        console.error("Error response status:", err.response?.status);
        console.error("Error response headers:", err.response?.headers);
        console.error("Error config:", err.config);
      } else {
        console.error('Error message (non-Axios):', err.message);
      }

      const errorMessage = err.response?.data?.message || err.message || "Unknown error";
      setError(`Gagal melakukan analisis relokasi: ${errorMessage}.`);
      setAnalysisResult(null);
      toast({
        title: "Analisis Gagal",
        description: `Terjadi kesalahan saat menganalisis lokasi: ${errorMessage}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
      console.log("Log: performCBAAnalysis finished. isAnalyzing set to false.");
    }
  };

  const handleAnalyze = () => {
    console.log("handleAnalyze called.");
    if (selectedLocation) {
      console.log("Selected location is available:", selectedLocation);
      performCBAAnalysis(selectedLocation);
    } else {
      console.log("No location selected yet.");
      toast({
        title: "Lokasi Belum Dipilih",
        description: "Silakan pilih lokasi terlebih dahulu",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationName(value);
    console.log("Location input changed to:", value);
    if (value.length >= 3) {
      searchLocations(value);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleLocationSelect = async (suggestion) => {
    console.log("Location suggestion selected:", suggestion);
    setAnalysisResult(null);
    setNearbyBJBBranches([]);
    setNearbyOtherBanks([]);
    setNearbyCommonPlaces({
      schools: [], supermarkets: [], markets: [], universities: [],
      hotels: [], pharmacy: [], housingComplexes: [], restaurants: [], malls: []
    });

    const location = await getLocationDetails(suggestion.place_id, suggestion.description);
    if (location) {
      console.log("Successfully got location details:", location);
      // After location is selected, the map will update.
      // Analysis will be triggered when the user clicks the "Analyze" button.
    } else {
      console.error("Failed to get location details for suggestion:", suggestion);
    }
  };


  return (
    <Box bg={bgColor} minH="100vh" p={6}>
      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <RelocationHeader cardBg={cardBg} />

          {/* Location Search Section */}
          <LocationSearchCard
            cardBg={cardBg}
            locationName={locationName}
            handleLocationChange={handleLocationChange}
            isLoadingSuggestions={isLoadingSuggestions}
            showSuggestions={showSuggestions}
            locationSuggestions={locationSuggestions}
            handleLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
            handleAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />

          {/* Input Biaya Relokasi - Kartu Baru */}
          <CostInputCard cardBg={cardBg} />

          {/* Google Maps Interactive Map */}
          {selectedLocation && (
            <InteractiveMapCard
              cardBg={cardBg}
              selectedLocation={selectedLocation}
              mapRef={mapRef}
              markerRef={markerRef}
              mapContainerRef={mapContainerRef}
              updateSelectedLocationFromMap={updateSelectedLocationFromMap}
              nearbyBJBBranches={nearbyBJBBranches}
              nearbyOtherBanks={nearbyOtherBanks}
              nearbyCommonPlaces={nearbyCommonPlaces}
            />
          )}

          {/* Nearby BJB Branches - KCP BJB Terdekat */}
          {selectedLocation && analysisResult && (
            <NearbyBranchesCard
              cardBg={cardBg}
              selectedLocation={selectedLocation}
              isLoadingBranches={isAnalyzing}
              nearbyBJBBranches={nearbyBJBBranches}
            />
          )}

          {/* Nearby Other Banks/ATMs - Bank/ATM Lain Terdekat */}
          {selectedLocation && analysisResult && (
            <NearbyOtherBanksCard
              cardBg={cardBg}
              selectedLocation={selectedLocation}
              isLoadingOtherBanks={isAnalyzing}
              nearbyOtherBanks={nearbyOtherBanks}
              mapsApiKey={Maps_API_KEY}
            />
          )}

          {/* Lokasi Umum Terdekat */}
          {selectedLocation && analysisResult && (
            <NearbyCommonPlacesCard
              cardBg={cardBg}
              selectedLocation={selectedLocation}
              isLoadingCommonPlaces={isAnalyzing}
              nearbyCommonPlaces={nearbyCommonPlaces}
            />
          )}

          {/* CBA Analysis Result */}
          {analysisResult && (
            <CBAAnalysisResultCards
              cardBg={cardBg}
              analysisResult={analysisResult}
              mockHistoricalData={mockHistoricalData}
              nearbyCommonPlacesCount={analysisResult.nearbyCommonPlacesCount}
            />
          )}

          {/* Instructions */}
          {!analysisResult && <RelocationInstructions cardBg={cardBg} />}
        </VStack>
      </Container>
    </Box>
  );
};

export default RelocationComponent;