"use client"

import { useState, useRef, useEffect, useMemo } from "react" // Tambahkan useEffect
import {
    Box,
    Flex,
    Text,
    Button,
    Input,
    InputGroup,
    InputRightElement,
    Card,
    CardBody,
    Badge,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Grid,
    GridItem,
    VStack,
    HStack,
    Icon,
    Center,
    Spinner,
    List,
    ListItem,
    Portal,
    useToast, // Tambahkan useToast
} from "@chakra-ui/react"
import {
    FaMapMarkerAlt,
    FaBuilding,
    FaGraduationCap,
    FaShoppingCart,
    FaCar,
    FaUniversity,
    FaHotel,
    FaUtensils,
    FaShoppingBag,
    FaStethoscope,
    FaChevronLeft,
    FaChevronRight,
    FaCheckCircle,
    FaExclamationCircle,
    FaTimesCircle,
} from "react-icons/fa"
import { useAuth } from '../../contexts/AuthContext';
// --- KONSTANTA API URL dan API Key ---
const ANALYZE_RELOCATION_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const Maps_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const LocationAnalysis = () => {
    // Chakra UI Toast Hook
    const toast = useToast();

    // State untuk alur aplikasi
    const [activeTab, setActiveTab] = useState(0);

    // State untuk input dan hasil geocoding
    const [locationInput, setLocationInput] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [isLocationValid, setIsLocationValid] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    // New states for place autocomplete
    const [predictions, setPredictions] = useState([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const [selectedPlaceName, setSelectedPlaceName] = useState("");
    const inputRef = useRef(null);

    // Ref untuk instance Google Maps Services
    const autocompleteService = useRef(null);
    const placesService = useRef(null);
    // const mapRef = useRef(null); // Ref untuk div peta (removed because unused)

    // State untuk biaya sewa
    const [rentCostInput, setRentCostInput] = useState("");

    // State untuk hasil analisis API
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State untuk paginasi
    const [kcpAtmPage, setKcpAtmPage] = useState(1);
    const [atmBankLainPage, setAtmBankLainPage] = useState(1);
    const [lokasiUmumPage, setLokasiUmumPage] = useState(1);
    const itemsPerPage = 5;

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
    // Dummy data untuk biaya perkiraan
    const estimatedCosts = {
        sewaMesin: 5000000,
        sewaTempat: 20000000,
        listrik: 1500000,
        isiUlang: 500000,
    };

    // Fungsi untuk mendapatkan ikon berdasarkan kategori
    const getCategoryIcon = (category) => {
        switch (category?.toLowerCase()) {
            case "hotel":
                return FaHotel;
            case "restaurant":
                return FaUtensils;
            case "sekolah":
            case "school":
                return FaGraduationCap;
            case "supermarket":
                return FaShoppingCart;
            case "pasar":
            case "market":
                // FaCar tidak cocok untuk pasar, mungkin ganti? Atau biarkan jika maksudnya aksesibilitas.
                return FaCar;
            case "universitas":
            case "university":
                return FaUniversity;
            case "fintech":
                return FaShoppingBag;
            case "perjanjian": // Ini kategori apa ya?
                return FaCheckCircle;
            case "rumah sakit":
            case "hospital":
                return FaStethoscope;
            case "mall":
                return FaBuilding;
            default:
                return FaMapMarkerAlt;
        }
    };

    // useEffect untuk memuat Google Maps API
    useEffect(() => {
        let dummyDiv = null; // Declare dummyDiv outside, so it can be accessed in cleanup
        const loadGoogleMapsAPI = () => {
            // Periksa apakah API sudah dimuat
            if (window.google && window.google.maps && window.google.maps.places) {
                console.log("Google Maps API already loaded.");
                // Inisialisasi layanan jika belum
                if (!autocompleteService.current) {
                    autocompleteService.current = new window.google.maps.places.AutocompleteService();
                    console.log("AutocompleteService initialized.");
                }
                if (!placesService.current) {
                    // PlacesService membutuhkan div DOM, meskipun dummy.
                    const dummyDiv = document.createElement('div');
                    document.body.appendChild(dummyDiv); // Penting: harus ada di DOM
                    placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
                    console.log("PlacesService initialized.");
                }
                setMapLoaded(true); // Set mapLoaded ke true jika API sudah ada
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
                // Inisialisasi layanan setelah script dimuat
                autocompleteService.current = new window.google.maps.places.AutocompleteService();
                // PlacesService membutuhkan div DOM, meskipun dummy.
                const dummyDiv = document.createElement('div');
                document.body.appendChild(dummyDiv);
                placesService.current = new window.google.maps.places.PlacesService(dummyDiv);
                console.log("Google Maps services initialized after script load.");
                setMapLoaded(true); // Set mapLoaded ke true setelah API dimuat
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
                setMapLoaded(false); // Set mapLoaded ke false jika gagal
            };
            document.head.appendChild(script);
        };

        loadGoogleMapsAPI();

        // Cleanup: remove the dummyDiv when component unmounts
       return () => {
            if (dummyDiv && dummyDiv.parentNode) { // Directly remove dummyDiv if it exists
                dummyDiv.parentNode.removeChild(dummyDiv);
                console.log("Dummy div removed from DOM.");
            }
        };

    }, [toast]); // Tambahkan toast sebagai dependency

    // Fungsi untuk mendapatkan prediksi tempat menggunakan Google AutocompleteService
    const fetchPlacePredictions = (input) => {
        if (!autocompleteService.current || !input) {
            setPredictions([]);
            return;
        }

        autocompleteService.current.getPlacePredictions(
            { input: input, language: 'id' },
            (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setPredictions(predictions);
                } else {
                    console.error("Error fetching place predictions:", status);
                    setPredictions([]);
                }
            }
        );
    };

    // Fungsi untuk mendapatkan detail tempat menggunakan Google PlacesService
    const getPlaceDetails = (placeId) => {
        if (!placesService.current || !placeId) {
            setError("Layanan PlacesService tidak tersedia atau Place ID hilang.");
            setIsLocationValid(false);
            setMapLoaded(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        placesService.current.getDetails(
            { placeId: placeId, fields: ['geometry', 'formatted_address', 'name'] },
            (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                    const { lat, lng } = place.geometry.location;
                    setLatitude(lat()); // Gunakan lat() dan lng() karena ini objek LatLng
                    setLongitude(lng());
                    setLocationInput(place.formatted_address);
                    setSelectedPlaceName(place.name || place.formatted_address);
                    setIsLocationValid(true);
                    setMapLoaded(true);
                    setShowPredictions(false);
                } else {
                    console.error("Error getting place details:", status);
                    setError("Gagal mendapatkan detail lokasi yang dipilih.");
                    setIsLocationValid(false);
                    setMapLoaded(false);
                }
                setIsLoading(false);
            }
        );
    };

    const handleLocationInputChange = (e) => {
        const value = e.target.value;
        setLocationInput(value);
        if (value.length > 2) {
            fetchPlacePredictions(value);
            setShowPredictions(true);
            setIsLocationValid(false);
            setLatitude(null);
            setLongitude(null);
            // setMapLoaded(false); // Jangan set ke false di sini, hanya jika validasi gagal
            setSelectedPlaceName("");
        } else {
            setPredictions([]);
            setShowPredictions(false);
            setIsLocationValid(false);
            setLatitude(null);
            setLongitude(null);
            // setMapLoaded(false);
            setSelectedPlaceName("");
        }
    };

    const handleSelectPrediction = (prediction) => {
        // Ketika prediksi dipilih, atur input field ke deskripsi lengkap,
        // tetapi simpan nama utama untuk tampilan di bawah input.
        setLocationInput(prediction.description);
        setSelectedPlaceName(prediction.structured_formatting.main_text);
        getPlaceDetails(prediction.place_id);
    };

    const handleClearLocation = () => {
        setLocationInput("");
        setLatitude(null);
        setLongitude(null);
        setIsLocationValid(false);
        // setMapLoaded(false); // Jangan reset ini
        setPredictions([]);
        setShowPredictions(false);
        setError(null);
        setSelectedPlaceName("");
    };

    // Fungsi untuk memanggil API analyze-relocation
    const handleAnalyze = async () => {
        if (latitude === null || longitude === null) {
            setError("Silakan masukkan lokasi yang valid terlebih dahulu.");
            return;
        }
        if (!rentCostInput || isNaN(parseFloat(rentCostInput))) {
            setError("Silakan masukkan biaya sewa yang valid.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const payload = {
                latitude: latitude,
                longitude: longitude,
                rent_cost: parseFloat(rentCostInput),
            };

            const response = await fetch(`${ANALYZE_RELOCATION_API_URL}analyze-relocation`, {
              method: "POST",
              headers: commonHeaders,
              body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Gagal menganalisis relokasi.");
            }

            const data = await response.json();
            setAnalysisResult(data.data);
            setActiveTab(5);
        } catch (err) {
            console.error("Analysis error:", err);
            setError(err.message || "Gagal melakukan analisis. Silakan coba lagi nanti.");
        } finally {
            setIsLoading(false);
        }
    };

    // Komponen Helper untuk menampilkan item lokasi
    const LocationItem = ({ location, icon: IconComponent = FaBuilding }) => {
        let name = location.name;
        let address = location.address || location.formatted_address;

        return (
            <Card mb={4}>
                <CardBody>
                    <Flex align="center" gap={4}>
                        <Center w="48px" h="48px" bg="pink.100" borderRadius="full">
                            <Icon as={IconComponent} color="pink.600" boxSize={6} />
                        </Center>
                        <Box flex="1">
                            <Text fontWeight="semibold" fontSize="md">
                                {name}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                                {address}
                            </Text>
                        </Box>
                        <Box textAlign="right">
                            <Text color="green.500" fontWeight="semibold">
                                {location.distance ? `${location.distance.toFixed(2)} km` : "N/A"}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                                Distance
                            </Text>
                        </Box>
                    </Flex>
                </CardBody>
            </Card>
        );
    };

    // Logika paginasi
    const paginate = (data, page) => {
        if (!data) return [];
        const startIndex = (page - 1) * itemsPerPage;
        return data.slice(startIndex, startIndex + itemsPerPage);
    };

    const getTotalPages = (data) => {
        if (!data) return 0;
        return Math.ceil(data.length / itemsPerPage);
    };

    // Data yang akan ditampilkan berdasarkan paginasi
    const paginatedKcpAtm = paginate(analysisResult?.nearest_branches, kcpAtmPage);
    const paginatedAtmBankLain = paginate(analysisResult?.nearest_atms, atmBankLainPage);
    const paginatedLokasiUmum = paginate(analysisResult?.public_places, lokasiUmumPage);


    // Transformasi analysis_scores untuk tampilan (jika tidak ada data, tampilkan placeholder)
    const transformedAnalysisScores = analysisResult?.analysis_scores || [
        {
            icon: "👥",
            title: "Customer closeness score",
            score: 0,
            prediction: "No data",
            colorScheme: "gray",
        },
        {
            icon: "📊",
            title: "Demographic score",
            score: 0,
            prediction: "No data",
            colorScheme: "gray",
        },
        {
            icon: "🚗",
            title: "Accessibility score",
            score: 0,
            prediction: "No data",
            colorScheme: "gray",
        },
        {
            icon: "⚔️",
            title: "Competitiveness score",
            score: 0,
            prediction: "No data",
            colorScheme: "gray",
        },
        {
            icon: "🏢",
            title: "KCP closeness score",
            score: 0,
            prediction: "No data",
            colorScheme: "gray",
        },
    ];

    return (
        <Box maxW="6xl" mx="auto" p={6} minH="100vh">
            <Card w="full">
                <CardBody p={0}>
                    <Tabs index={activeTab} onChange={setActiveTab} isLazy>
                        <TabList borderBottom="1px" borderColor="gray.200">
                            <Tab _selected={{ borderBottom: "2px", borderColor: "blue.600", color: "blue.600" }}>Location</Tab>
                            <Tab _selected={{ borderBottom: "2px", borderColor: "blue.600", color: "blue.600" }} isDisabled={!isLocationValid}>Rent Cost</Tab>
                            <Tab _selected={{ borderBottom: "2px", borderColor: "blue.600", color: "blue.600" }} isDisabled={!analysisResult}>KCP / ATM BJB</Tab>
                            <Tab _selected={{ borderBottom: "2px", borderColor: "blue.600", color: "blue.600" }} isDisabled={!analysisResult}>ATM Bank lain</Tab>
                            <Tab _selected={{ borderBottom: "2px", borderColor: "blue.600", color: "blue.600" }} isDisabled={!analysisResult}>Lokasi Umum</Tab>
                            <Tab _selected={{ borderBottom: "2px", borderColor: "blue.600", color: "blue.600" }} isDisabled={!analysisResult}>Hasil Analisa</Tab>
                        </TabList>

                        <TabPanels>
                            {/* --- TAB LOCATION --- */}
                            <TabPanel p={6}>
                                <VStack spacing={6} align="stretch">
                                    <Box position="relative">
                                        <Text fontSize="lg" fontWeight="semibold" mb={4}>
                                            Input Location
                                        </Text>
                                        <InputGroup>
                                            <Input
                                                ref={inputRef}
                                                placeholder="Hotel Kimaya Braga, Nenjian, Jl Sumur Bandung"
                                                value={locationInput}
                                                onChange={handleLocationInputChange}
                                                onFocus={() => predictions.length > 0 && setShowPredictions(true)}
                                                // onBlur={() => setTimeout(() => setShowPredictions(false), 200)} // Delay hiding to allow click
                                            />
                                            <InputRightElement width="4.5rem">
                                                {isLoading && activeTab === 0 ? <Spinner size="sm" /> :
                                                    isLocationValid ? <Icon as={FaCheckCircle} color="green.500" /> :
                                                        locationInput && !isLocationValid && !isLoading ? (
                                                            <Icon as={FaTimesCircle} color="gray.500" cursor="pointer" onClick={handleClearLocation} />
                                                        ) :
                                                            error && activeTab === 0 ? <Icon as={FaExclamationCircle} color="red.500" /> : null
                                                }
                                            </InputRightElement>
                                        </InputGroup>
                                        {error && activeTab === 0 && <Text color="red.500" fontSize="sm" mt={2}>{error}</Text>}

                                        {showPredictions && predictions.length > 0 && (
                                            <Portal>
                                                <Box
                                                    position="absolute"
                                                    top={inputRef.current ? inputRef.current.offsetHeight + inputRef.current.offsetTop : 0}
                                                    left={inputRef.current ? inputRef.current.offsetLeft : 0}
                                                    width={inputRef.current ? inputRef.current.offsetWidth : '100%'}
                                                    zIndex={10}
                                                    bg="white"
                                                    boxShadow="md"
                                                    borderRadius="md"
                                                    mt={2}
                                                >
                                                    <List spacing={0}>
                                                        {predictions.map((prediction) => (
                                                            <ListItem
                                                                key={prediction.place_id}
                                                                p={3}
                                                                _hover={{ bg: "gray.100", cursor: "pointer" }}
                                                                onClick={() => handleSelectPrediction(prediction)}
                                                            >
                                                                <Text fontWeight="semibold">{prediction.structured_formatting.main_text}</Text>
                                                                <Text fontSize="sm" color="gray.600">{prediction.structured_formatting.secondary_text}</Text>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Box>
                                            </Portal>
                                        )}
                                    </Box>

                                    {selectedPlaceName && (
                                        <Box>
                                            <Text fontSize="md" fontWeight="medium">Lokasi terpilih:</Text>
                                            <Text fontSize="lg" fontWeight="bold" color="blue.700">{selectedPlaceName}</Text>
                                            {latitude && longitude && (
                                                <Text fontSize="sm" color="gray.500">
                                                    Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
                                                </Text>
                                            )}
                                        </Box>
                                    )}

                                    <Box>
                                        <Text fontSize="lg" fontWeight="semibold" mb={4}>
                                            Map View
                                        </Text>
                                        <Box w="full" h="320px" bg="gray.200" borderRadius="lg" overflow="hidden" position="relative" display="flex" alignItems="center" justifyContent="center">
                                            {mapLoaded && latitude && longitude ? (
                                                // Gunakan Google Maps Embed API atau Static Maps API yang benar
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    loading="lazy"
                                                    allowFullScreen
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    // Contoh penggunaan Google Maps Embed API untuk menampilkan lokasi
                                                    // Ini akan menampilkan peta interaktif.
                                                     src={`https://www.google.com/maps/embed/v1/place?key=${Maps_API_KEY}&q=${latitude},${longitude}`}
                                                    // Atau jika ingin statis:
                                                    // src={`https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&markers=color:red%7Clabel:A%7C${latitude},${longitude}&key=${Maps_API_KEY}`}
                                                ></iframe>
                                            ) : (
                                                <Text color="gray.500">
                                                    {error ? <VStack><Icon as={FaExclamationCircle} boxSize={8} /><Text>{error}</Text></VStack> : "Masukkan lokasi untuk melihat peta."}
                                                </Text>
                                            )}
                                        </Box>
                                    </Box>

                                    <Flex justify="flex-end">
                                        <Button
                                            colorScheme="blue"
                                            onClick={() => {
                                                if (isLocationValid) {
                                                    setActiveTab(1);
                                                    setError(null);
                                                } else {
                                                    setError("Silakan pilih lokasi yang valid dari rekomendasi.");
                                                }
                                            }}
                                            isDisabled={!isLocationValid || isLoading}
                                        >
                                            Next
                                        </Button>
                                    </Flex>
                                </VStack>
                            </TabPanel>

                            {/* --- TAB RENT COST --- */}
                            <TabPanel p={6}>
                                <VStack spacing={6} align="stretch">
                                    <Text fontSize="lg" fontWeight="semibold">
                                        Perkiraan Biaya
                                    </Text>

                                    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                                        <GridItem>
                                            <VStack align="start" spacing={2}>
                                                <Text color="blue.600" fontWeight="medium">
                                                    Biaya Sewa Mesin
                                                </Text>
                                                <Text fontSize="2xl" fontWeight="bold">
                                                    Rp. {estimatedCosts.sewaMesin.toLocaleString("id-ID")}
                                                </Text>
                                            </VStack>
                                        </GridItem>
                                        <GridItem>
                                            <VStack align="start" spacing={2}>
                                                <Text color="blue.600" fontWeight="medium">
                                                    Biaya Sewa Tempat
                                                </Text>
                                                <Input
                                                    type="number"
                                                    placeholder="Masukkan biaya sewa (contoh: 20000000)"
                                                    value={rentCostInput}
                                                    onChange={(e) => setRentCostInput(e.target.value)}
                                                    fontSize="2xl"
                                                    fontWeight="bold"
                                                />
                                            </VStack>
                                        </GridItem>
                                        <GridItem>
                                            <VStack align="start" spacing={2}>
                                                <Text color="blue.600" fontWeight="medium">
                                                    Biaya Listrik
                                                </Text>
                                                <Text fontSize="2xl" fontWeight="bold">
                                                    Rp. {estimatedCosts.listrik.toLocaleString("id-ID")}
                                                </Text>
                                            </VStack>
                                        </GridItem>
                                        <GridItem>
                                            <VStack align="start" spacing={2}>
                                                <Text color="blue.600" fontWeight="medium">
                                                    Biaya Isi ulang
                                                </Text>
                                                <Text fontSize="2xl" fontWeight="bold">
                                                    Rp. {estimatedCosts.isiUlang.toLocaleString("id-ID")}
                                                </Text>
                                            </VStack>
                                        </GridItem>
                                    </Grid>
                                    {error && activeTab === 1 && <Text color="red.500" fontSize="sm" mt={2}>{error}</Text>}

                                    <Flex justify="flex-end">
                                        <Button
                                            colorScheme="blue"
                                            onClick={handleAnalyze}
                                            isDisabled={isLoading || !rentCostInput || !latitude || !longitude}
                                        >
                                            {isLoading ? <Spinner size="sm" mr={2} /> : "Analisis"}
                                        </Button>
                                    </Flex>
                                </VStack>
                            </TabPanel>

                            {/* --- TAB KCP / ATM BJB --- */}
                            <TabPanel p={6}>
                                <VStack spacing={6} align="stretch">
                                    <Text fontSize="lg" fontWeight="semibold">
                                        {analysisResult?.nearest_branches?.length || 0} KCP / ATM BJB Ditemukan
                                    </Text>

                                    <Box>
                                        {paginatedKcpAtm.length > 0 ? (
                                            paginatedKcpAtm.map((location, index) => (
                                                <LocationItem key={location.id || `kcp-${index}`} location={location} icon={FaBuilding} />
                                            ))
                                        ) : (
                                            <Text textAlign="center" color="gray.500">Tidak ada KCP / ATM BJB ditemukan.</Text>
                                        )}
                                    </Box>

                                    {getTotalPages(analysisResult?.nearest_branches) > 1 && (
                                        <Center mt={6}>
                                            <HStack spacing={2}>
                                                <Button variant="ghost" size="sm" leftIcon={<FaChevronLeft />} onClick={() => setKcpAtmPage(prev => Math.max(1, prev - 1))} isDisabled={kcpAtmPage === 1}>
                                                    Previous
                                                </Button>
                                                {[...Array(getTotalPages(analysisResult?.nearest_branches))].map((_, i) => (
                                                    <Button
                                                        key={i + 1}
                                                        colorScheme={kcpAtmPage === i + 1 ? "blue" : "gray"}
                                                        size="sm"
                                                        onClick={() => setKcpAtmPage(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </Button>
                                                ))}
                                                <Button variant="ghost" size="sm" rightIcon={<FaChevronRight />} onClick={() => setKcpAtmPage(prev => Math.min(getTotalPages(analysisResult?.nearest_branches), prev + 1))} isDisabled={kcpAtmPage === getTotalPages(analysisResult?.nearest_branches)}>
                                                    Next
                                                </Button>
                                            </HStack>
                                        </Center>
                                    )}
                                </VStack>
                            </TabPanel>

                            {/* --- TAB ATM BANK LAIN --- */}
                            <TabPanel p={6}>
                                <VStack spacing={6} align="stretch">
                                    <Text fontSize="lg" fontWeight="semibold">
                                        {analysisResult?.nearest_atms?.length || 0} ATM Bank Lain Ditemukan
                                    </Text>

                                    <Box>
                                        {paginatedAtmBankLain.length > 0 ? (
                                            paginatedAtmBankLain.map((location, index) => (
                                                <LocationItem key={location.id || `atm-${index}`} location={location} icon={FaBuilding} />
                                            ))
                                        ) : (
                                            <Text textAlign="center" color="gray.500">Tidak ada ATM Bank lain ditemukan.</Text>
                                        )}
                                    </Box>

                                    {getTotalPages(analysisResult?.nearest_atms) > 1 && (
                                        <Center mt={6}>
                                            <HStack spacing={2}>
                                                <Button variant="ghost" size="sm" leftIcon={<FaChevronLeft />} onClick={() => setAtmBankLainPage(prev => Math.max(1, prev - 1))} isDisabled={atmBankLainPage === 1}>
                                                    Previous
                                                </Button>
                                                {[...Array(getTotalPages(analysisResult?.nearest_atms))].map((_, i) => (
                                                    <Button
                                                        key={i + 1}
                                                        colorScheme={atmBankLainPage === i + 1 ? "blue" : "gray"}
                                                        size="sm"
                                                        onClick={() => setAtmBankLainPage(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </Button>
                                                ))}
                                                <Button variant="ghost" size="sm" rightIcon={<FaChevronRight />} onClick={() => setAtmBankLainPage(prev => Math.min(getTotalPages(analysisResult?.nearest_atms), prev + 1))} isDisabled={atmBankLainPage === getTotalPages(analysisResult?.nearest_atms)}>
                                                    Next
                                                </Button>
                                            </HStack>
                                        </Center>
                                    )}
                                </VStack>
                            </TabPanel>

                            {/* --- TAB LOKASI UMUM --- */}
                            <TabPanel p={6}>
                                <VStack spacing={6} align="stretch">
                                    <Text fontSize="lg" fontWeight="semibold">
                                        {analysisResult?.public_places?.length || 0} Lokasi Umum Ditemukan
                                    </Text>

                                    <Box>
                                        {paginatedLokasiUmum.length > 0 ? (
                                            paginatedLokasiUmum.map((location, index) => (
                                                <LocationItem key={location.id || `public-${index}`} location={location} icon={getCategoryIcon(location.category)} />
                                            ))
                                        ) : (
                                            <Text textAlign="center" color="gray.500">Tidak ada lokasi umum ditemukan.</Text>
                                        )}
                                    </Box>

                                    {getTotalPages(analysisResult?.public_places) > 1 && (
                                        <Center mt={6}>
                                            <HStack spacing={2}>
                                                <Button variant="ghost" size="sm" leftIcon={<FaChevronLeft />} onClick={() => setLokasiUmumPage(prev => Math.max(1, prev - 1))} isDisabled={lokasiUmumPage === 1}>
                                                    Previous
                                                </Button>
                                                {[...Array(getTotalPages(analysisResult?.public_places))].map((_, i) => (
                                                    <Button
                                                        key={i + 1}
                                                        colorScheme={lokasiUmumPage === i + 1 ? "blue" : "gray"}
                                                        size="sm"
                                                        onClick={() => setLokasiUmumPage(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </Button>
                                                ))}
                                                <Button variant="ghost" size="sm" rightIcon={<FaChevronRight />} onClick={() => setLokasiUmumPage(prev => Math.min(getTotalPages(analysisResult?.public_places), prev + 1))} isDisabled={lokasiUmumPage === getTotalPages(analysisResult?.public_places)}>
                                                    Next
                                                </Button>
                                            </HStack>
                                        </Center>
                                    )}
                                </VStack>
                            </TabPanel>

                            {/* --- TAB HASIL ANALISA --- */}
                            <TabPanel p={6}>
                                <VStack spacing={6} align="stretch">
                                    <Text fontSize="lg" fontWeight="semibold">
                                        Skor Analisis Lokasi
                                    </Text>
                                    <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={4}>
                                        {transformedAnalysisScores.map((score, index) => (
                                            <Card key={index} boxShadow="md">
                                                <CardBody>
                                                    <HStack mb={2}>
                                                        <Text fontSize="xl">{score.icon}</Text>
                                                        <Text fontWeight="semibold" fontSize="lg">{score.title}</Text>
                                                    </HStack>
                                                    <Text fontSize="4xl" fontWeight="bold" color={`${score.colorScheme}.600`}>
                                                        {score.score.toFixed(1)} <Text as="span" fontSize="md" color="gray.500">/ 10</Text>
                                                    </Text>
                                                    <Badge colorScheme={score.colorScheme} mt={2} px={2} py={1} borderRadius="md">
                                                        {score.prediction}
                                                    </Badge>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </Grid>

                                    <Box>
                                        <Text fontSize="lg" fontWeight="semibold" mt={6} mb={4}>
                                            Ringkasan Estimasi Biaya
                                        </Text>
                                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                                            <Card>
                                                <CardBody>
                                                    <HStack justify="space-between">
                                                        <Text fontWeight="medium">Sewa Mesin:</Text>
                                                        <Text fontWeight="bold">Rp. {estimatedCosts.sewaMesin.toLocaleString("id-ID")}</Text>
                                                    </HStack>
                                                </CardBody>
                                            </Card>
                                            <Card>
                                                <CardBody>
                                                    <HStack justify="space-between">
                                                        <Text fontWeight="medium">Sewa Tempat (Input):</Text>
                                                        <Text fontWeight="bold">Rp. {parseFloat(rentCostInput || 0).toLocaleString("id-ID")}</Text>
                                                    </HStack>
                                                </CardBody>
                                            </Card>
                                            <Card>
                                                <CardBody>
                                                    <HStack justify="space-between">
                                                        <Text fontWeight="medium">Listrik:</Text>
                                                        <Text fontWeight="bold">Rp. {estimatedCosts.listrik.toLocaleString("id-ID")}</Text>
                                                    </HStack>
                                                </CardBody>
                                            </Card>
                                            <Card>
                                                <CardBody>
                                                    <HStack justify="space-between">
                                                        <Text fontWeight="medium">Isi Ulang:</Text>
                                                        <Text fontWeight="bold">Rp. {estimatedCosts.isiUlang.toLocaleString("id-ID")}</Text>
                                                    </HStack>
                                                </CardBody>
                                            </Card>
                                        </Grid>
                                        <Text fontSize="xl" fontWeight="bold" mt={4} textAlign="right">
                                            Total Estimasi Biaya: Rp. {(estimatedCosts.sewaMesin + parseFloat(rentCostInput || 0) + estimatedCosts.listrik + estimatedCosts.isiUlang).toLocaleString("id-ID")}
                                        </Text>
                                    </Box>
                                </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </CardBody>
            </Card>
        </Box>
    );
};

export default LocationAnalysis;