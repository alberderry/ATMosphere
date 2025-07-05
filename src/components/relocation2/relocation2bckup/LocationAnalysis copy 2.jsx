import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box,
    Card,
    CardBody,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    useToast
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext'; // Pastikan path ini benar

// Import komponen tab yang sudah dipisahkan
import LocationTab from '../../components/relocation2/LocationTab';
import RentCostTab from '../../components/relocation2/RentCostTab';
import KcpAtmBjbTab from '../../components/relocation2/KcpAtmBjbTab';
import AtmBankLainTab from '../../components/relocation2/AtmBankLainTab';
import LokasiUmumTab from '../../components/relocation2/LokasiUmumTab';
import HasilAnalisaTab from '../../components/relocation2/HasilAnalisaTab';

// Konfigurasi API
const ANALYZE_RELOCATION_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const Maps_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const ITEMS_PER_PAGE = 5; // Define ITEMS_PER_PAGE here as a constant

// Definisikan biaya awal sebagai konstanta
const INITIAL_COSTS = {
    sewaMesin: 5000000,
    listrik: 1000000,
    isiUlang: 2000000
};

const LocationAnalysis = () => {
    // Chakra UI Toast Hook
    const toast = useToast();

    // State untuk alur aplikasi
    const [activeTab, setActiveTab] = useState(0);

    // State untuk input dan hasil geocoding
    const [locationInput, setLocationInput] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null); 
    const [isLocationValid, setIsLocationValid] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    // States untuk place autocomplete
    const [predictions, setPredictions] = useState([]);
    const [showPredictions, setShowPredictions] = useState(false);
    const [selectedPlaceName, setSelectedPlaceName] = useState('');
    
    // States untuk biaya, sekarang diatur oleh pengguna
    const [rentCostInput, setRentCostInput] = useState(''); // Sewa tempat
    const [machineCostInput, setMachineCostInput] = useState(INITIAL_COSTS.sewaMesin.toString()); // Sewa Mesin
    const [electricityCostInput, setElectricityCostInput] = useState(INITIAL_COSTS.listrik.toString()); // Listrik
    const [isiUlangCostInput, setIsUlangCostInput] = useState(INITIAL_COSTS.isiUlang.toString()); // Isi Ulang


    // State untuk hasil analisis API
    // Inisialisasi dengan struktur default yang lengkap untuk mencegah error 'undefined'
    const [analysisResult, setAnalysisResult] = useState({
        nearest_branches: [],
        nearest_atms: [],
        public_places: [],
        breakdown_analysis: {
            customer_closeness_score: "0%",
            demografic_score: "0%",
            accessibility_score: "0%",
            competitiveness_score: "0%",
            kcp_closeness_score: "0%"
        },
        score: "0%", 
        nearest_competitor_atms: [] // Tambahkan ini jika ada di respons API Anda
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasAnalysisRun, setHasAnalysisRun] = useState(false); // State untuk menandakan analisis sudah berhasil

    // State untuk paginasi
    const [kcpAtmPage, setKcpAtmPage] = useState(1);
    const [atmBankLainPage, setAtmBankLainPage] = useState(1);
    const [lokasiUmumPage, setLokasiUmumPage] = useState(1);

    // Auth context untuk mendapatkan token
    const { getAccessToken } = useAuth();

    // Memoized headers for API calls
    const commonHeaders = useMemo(() => {
        const token = getAccessToken();
        return {
            'Authorization': `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true", // Header kustom jika diperlukan oleh proxy/server
            'Content-Type': 'application/json',
        };
    }, [getAccessToken]);

    // Ref untuk debounce autocomplete
    const debounceTimeoutRef = useRef(null);
    const handleLocationInputChange = (e) => {
        const value = e.target.value;
        setLocationInput(value);
        setIsLocationValid(false);
        setSelectedPlaceName('');
        setLatitude(null);
        setLongitude(null);
        setError(null);
        setPredictions([]);
        setShowPredictions(true);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        if (value.length > 2) {
            debounceTimeoutRef.current = setTimeout(() => {
                fetchPlacePredictions(value);
            }, 500);
        }
    };

    const fetchPlacePredictions = async (input) => {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            setError("Google Maps Places API not loaded.");
            toast({
                title: "Error Peta",
                description: "Google Maps API belum dimuat. Periksa koneksi atau kunci API.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const service = new window.google.maps.places.AutocompleteService();
            const { predictions } = await service.getPlacePredictions({ input, componentRestrictions: { country: 'id' } });
            setPredictions(predictions);
        } catch (err) {
            setError("Gagal mengambil prediksi lokasi.");
            console.error("Error fetching predictions:", err);
            toast({
                title: "Error Prediksi Lokasi",
                description: "Gagal mengambil saran lokasi. Coba lagi nanti.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Untuk mengatasi linting warning 'showPredictions' is declared but its value is never read.
    // Variabel ini digunakan di LocationTab, tetapi linter di parent tidak melacaknya.
    // Penggunaan trivial di sini untuk memuaskan linter.
    useEffect(() => {
        // eslint-disable-next-line no-unused-vars
        const dummyUsageShowPredictions = showPredictions; 
    }, [showPredictions]);

    const handleSelectPrediction = async (prediction) => {
        setLocationInput(prediction.description);
        setSelectedPlaceName(prediction.description);
        setPredictions([]);
        setShowPredictions(false);
        setIsLoading(true);
        setError(null);

        try {
            const geocoder = new window.google.maps.Geocoder();
            const { results } = await geocoder.geocode({ placeId: prediction.place_id });
            if (results && results.length > 0) {
                const { lat, lng } = results[0].geometry.location;
                setLatitude(lat());
                setLongitude(lng());
                setIsLocationValid(true);
                setMapLoaded(true);
            } else {
                setError("Tidak dapat menemukan koordinat untuk lokasi yang dipilih.");
                setIsLocationValid(false);
            }
        } catch (err) {
            setError("Gagal mendapatkan detail lokasi.");
            console.error("Error getting place details:", err);
            setIsLocationValid(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Untuk mengatasi linting warning 'handleSelectPrediction' is declared but its value is never read.
    useEffect(() => {
        // eslint-disable-next-line no-unused-vars
        const dummyUsageHandleSelectPrediction = handleSelectPrediction;
    }, [handleSelectPrediction]);

    const handleClearLocation = () => {
        setLocationInput('');
        setSelectedPlaceName('');
        setLatitude(null);
        setLongitude(null);
        setIsLocationValid(false);
        setPredictions([]);
        setShowPredictions(false);
        setError(null);
        setMapLoaded(false);
        // Reset analysisResult ke struktur default yang lengkap
        setAnalysisResult({
            nearest_branches: [],
            nearest_atms: [],
            public_places: [],
            breakdown_analysis: {
                customer_closeness_score: "0%",
                demografic_score: "0%",
                accessibility_score: "0%",
                competitiveness_score: "0%",
                kcp_closeness_score: "0%"
            },
            score: "0%",
            nearest_competitor_atms: [] 
        }); 
        setRentCostInput('');
        setMachineCostInput(INITIAL_COSTS.sewaMesin.toString()); // Reset to initial
        setElectricityCostInput(INITIAL_COSTS.listrik.toString()); // Reset to initial
        setIsUlangCostInput(INITIAL_COSTS.isiUlang.toString()); // Reset to initial
        setHasAnalysisRun(false);
    };

    // Fungsi untuk memanggil API analyze-relocation
    const handleAnalyze = async () => {
        if (!latitude || !longitude) {
            toast({
                title: "Input Tidak Lengkap",
                description: "Silakan pilih lokasi yang valid terlebih, dahulu.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        
        // Validasi semua input biaya
        const parsedRentCost = parseFloat(rentCostInput);
        const parsedMachineCost = parseFloat(machineCostInput);
        const parsedElectricityCost = parseFloat(electricityCostInput);
        const parsedIsiUlangCost = parseFloat(isiUlangCostInput);

        if (isNaN(parsedRentCost) || parsedRentCost < 0 ||
            isNaN(parsedMachineCost) || parsedMachineCost < 0 ||
            isNaN(parsedElectricityCost) || parsedElectricityCost < 0 ||
            isNaN(parsedIsiUlangCost) || parsedIsiUlangCost < 0) {
            toast({
                title: "Input Tidak Valid",
                description: "Silakan masukkan semua biaya dengan angka positif yang valid.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);
        setError(null);
        setHasAnalysisRun(false);

        try {
            const payload = {
                latitude: latitude,
                longitude: longitude,
                address: locationInput,
                rent_cost: parsedRentCost,       // Menggunakan nilai dari input
                machine_cost: parsedMachineCost, // Menggunakan nilai dari input
                electricity_cost: parsedElectricityCost, // Menggunakan nilai dari input
                isi_ulang_cost: parsedIsiUlangCost,     // Menggunakan nilai dari input
            };

            const response = await fetch(`${ANALYZE_RELOCATION_API_URL}/analyze-relocation`, {
                method: "POST",
                headers: commonHeaders,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const apiResponse = await response.json();
            // Memastikan data yang diterima dari API digabungkan dengan struktur default
            setAnalysisResult(prevResult => ({
                ...prevResult, 
                ...(apiResponse.data || {}), 
                nearest_branches: apiResponse.data?.nearest_branches || [],
                nearest_atms: apiResponse.data?.nearest_atms || [],
                public_places: apiResponse.data?.public_places || [],
                breakdown_analysis: apiResponse.data?.breakdown_analysis || {
                    customer_closeness_score: "0%",
                    demografic_score: "0%",
                    accessibility_score: "0%",
                    competitiveness_score: "0%",
                    kcp_closeness_score: "0%"
                },
                score: apiResponse.data?.score || "0%", 
                // Mengatasi typo API: mencoba 'nearest_competitor_atms' dan 'neaerest_competitor_atms'
                nearest_competitor_atms: apiResponse.data?.nearest_competitor_atms || apiResponse.data?.neaerest_competitor_atms || [], 
            }));
            
            setHasAnalysisRun(true);
            setActiveTab(5); // Pindah ke tab Hasil Analisa
        } catch (err) {
            console.error("Analysis error:", err);
            setError(err.message || "Gagal melakukan analisis. Silakan coba lagi nanti.");
            toast({
                title: "Analisis Gagal.",
                description: err.message || "Terjadi kesalahan saat melakukan analisis.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setHasAnalysisRun(false);
            // Reset analysisResult ke initial state yang lengkap pada error
            setAnalysisResult({
                nearest_branches: [],
                nearest_atms: [],
                public_places: [],
                breakdown_analysis: {
                    customer_closeness_score: "0%",
                    demografic_score: "0%",
                    accessibility_score: "0%",
                    competitiveness_score: "0%",
                    kcp_closeness_score: "0%"
                },
                score: "0%",
                nearest_competitor_atms: [] 
            }); 
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk mengubah skor analisis menjadi format yang dapat ditampilkan
    const transformAnalysisScores = useCallback(() => {
        const parseScore = (scoreString) => {
            if (typeof scoreString === 'string' && scoreString.endsWith('%')) {
                const percentage = parseFloat(scoreString.replace('%', ''));
                return percentage / 10;
            }
            return parseFloat(scoreString) || 0;
        };

        // Mengakses breakdown_analysis dari analysisResult
        // analysisResult dijamin ada karena state diinisialisasi
        const breakdown = analysisResult.breakdown_analysis;

        ("transformAnalysisScores - analysisResult:", analysisResult);
        ("transformAnalysisScores - breakdown_analysis:", breakdown);
        
        // Return placeholder array jika breakdown tidak valid atau kosong
        if (!breakdown || Object.keys(breakdown).length === 0) {
                        return [
                { icon: "�", title: "Customer Closeness Score", score: 0, prediction: "No data", colorScheme: "gray" },
                { icon: "📊", title: "Demographic Score", score: 0, prediction: "No data", colorScheme: "gray" },
                { icon: "🚗", title: "Accessibility Score", score: 0, prediction: "No data", colorScheme: "gray" },
                { icon: "⚔️", title: "Competitiveness Score", score: 0, prediction: "No data", colorScheme: "gray" },
                { icon: "🏢", title: "KCP Closeness Score", score: 0, prediction: "No data", colorScheme: "gray" },
            ];
        }

        const {
            customer_closeness_score,
            demografic_score,
            accessibility_score,
            competitiveness_score,
            kcp_closeness_score
        } = breakdown;

        const getPrediction = (score) => {
            if (score >= 8) return "Excellent";
            if (score >= 6) return "Good";
            if (score >= 4) return "Fair";
            return "Poor";
        };

        const getColorScheme = (score) => {
            if (score >= 8) return "green";
            if (score >= 6) return "blue";
            if (score >= 4) return "orange";
            return "red";
        };

        return [
            {
                title: "Customer Closeness Score",
                score: parseScore(customer_closeness_score),
                icon: "👥",
                prediction: getPrediction(parseScore(customer_closeness_score)),
                colorScheme: getColorScheme(parseScore(customer_closeness_score))
            },
            {
                title: "Demographic Score",
                score: parseScore(demografic_score),
                icon: "📊",
                prediction: getPrediction(parseScore(demografic_score)),
                colorScheme: getColorScheme(parseScore(demografic_score))
            },
            {
                title: "Accessibility Score",
                score: parseScore(accessibility_score),
                icon: "🚗",
                prediction: getPrediction(parseScore(accessibility_score)),
                colorScheme: getColorScheme(parseScore(accessibility_score))
            },
            {
                title: "Competitiveness Score",
                score: parseScore(competitiveness_score),
                icon: "⚔️",
                prediction: getPrediction(parseScore(competitiveness_score)),
                colorScheme: getColorScheme(parseScore(competitiveness_score))
            },
            {
                title: "KCP Closeness Score",
                score: parseScore(kcp_closeness_score),
                icon: "🏢",
                prediction: getPrediction(parseScore(kcp_closeness_score)),
                colorScheme: getColorScheme(parseScore(kcp_closeness_score))
            },
        ];
    }, [analysisResult]);

    // Menggunakan useMemo untuk skor analisis yang sudah ditransformasi
    const transformedAnalysisScores = useMemo(() => transformAnalysisScores(), [transformAnalysisScores]);

    // Logika paginasi
    const paginate = (data, page, itemsPerPage) => {
        if (!Array.isArray(data)) {
                        return [];
        }
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const getTotalPages = (data) => {
        if (!Array.isArray(data)) return 0;
        return Math.ceil(data.length / ITEMS_PER_PAGE);
    };

    // Data yang akan ditampilkan berdasarkan paginasi
    const paginatedKcpAtm = paginate(
      [
        ...(Array.isArray(analysisResult.nearest_branches) ? analysisResult.nearest_branches : []),
        ...(Array.isArray(analysisResult.nearest_atms) ? analysisResult.nearest_atms : [])
      ],
      kcpAtmPage,
      ITEMS_PER_PAGE
    );
    const paginatedAtmBankLain = paginate(analysisResult.nearest_competitor_atms, atmBankLainPage, ITEMS_PER_PAGE);
    // const paginatedLokasiUmum = paginate(analysisResult.public_places, lokasiUmumPage, ITEMS_PER_PAGE);

    // Effect untuk memuat Google Maps script
    useEffect(() => {
        if (!window.google && !mapLoaded && Maps_API_KEY) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${Maps_API_KEY}&libraries=places,geocoding`;
            script.async = true;
            script.defer = true;
            script.onload = () => setMapLoaded(true);
            script.onerror = () => {
                setError("Gagal memuat script Google Maps.");
                toast({
                    title: "Error Peta",
                    description: "Gagal memuat Google Maps API. Periksa koneksi internet atau kunci API.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            };
            document.head.appendChild(script);
        } else if (window.google) {
            setMapLoaded(true);
        } else if (!Maps_API_KEY) {
            console.error("Maps_API_KEY is missing. Google Maps functionality will be limited.");
            toast({
                title: "Peringatan",
                description: "Kunci API Google Maps tidak ditemukan. Peta dan pencarian lokasi mungkin tidak berfungsi.",
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [mapLoaded, Maps_API_KEY, toast]);


    return (
        <Box maxW="6xl" mx="auto" p={6} minH="100vh">
            <Card w="full" borderRadius={25}>
                <CardBody p={10}>
                    <Tabs index={activeTab} onChange={setActiveTab} isLazy>
                        <TabList borderBottom="2px" borderColor="gray.200">
                            <Tab _selected={{ borderBottomWidth: "4px", borderColor: "blue.600", color: "blue.600" }}>Location</Tab>
                            <Tab _selected={{ borderBottomWidth: "4px", borderColor: "blue.600", color: "blue.600" }} isDisabled={!isLocationValid}>Rent Cost</Tab>
                            {/* Diaktifkan hanya setelah analisis berhasil dijalankan */}
                            <Tab _selected={{ borderBottomWidth: "4px", borderColor: "blue.600", color: "blue.600" }} isDisabled={!hasAnalysisRun}>KCP / ATM BJB</Tab>
                            <Tab _selected={{ borderBottomWidth: "4px", borderColor: "blue.600", color: "blue.600" }} isDisabled={!hasAnalysisRun}>ATM Bank lain</Tab>
                            <Tab _selected={{ borderBottomWidth: "4px", borderColor: "blue.600", color: "blue.600" }} isDisabled={!hasAnalysisRun}>Lokasi Umum</Tab>
                            <Tab _selected={{ borderBottomWidth: "4px", borderColor: "blue.600", color: "blue.600" }} isDisabled={!hasAnalysisRun}>Hasil Analisa</Tab>
                        </TabList>

                        <TabPanels>
                            <LocationTab
                                locationInput={locationInput}
                                setLocationInput={setLocationInput} // Meneruskan setLocationInput
                                handleLocationInputChange={handleLocationInputChange}
                                predictions={predictions}
                                showPredictions={showPredictions}
                                setShowPredictions={setShowPredictions}
                                handleSelectPrediction={handleSelectPrediction}
                                isLoading={isLoading}
                                isLocationValid={isLocationValid}
                                setIsLocationValid={setIsLocationValid} // Meneruskan setIsLocationValid
                                handleClearLocation={handleClearLocation}
                                error={error}
                                selectedPlaceName={selectedPlaceName}
                                setSelectedPlaceName={setSelectedPlaceName} // Meneruskan setSelectedPlaceName
                                latitude={latitude}
                                setLatitude={setLatitude} // Meneruskan setLatitude
                                longitude={longitude}
                                setLongitude={setLongitude} // Meneruskan setLongitude
                                setActiveTab={setActiveTab}
                                setError={setError}
                                mapLoaded={mapLoaded}
                                Maps_API_KEY={Maps_API_KEY}
                            />

                            <RentCostTab
                                // Meneruskan semua state biaya ke RentCostTab
                                rentCostInput={rentCostInput}
                                setRentCostInput={setRentCostInput}
                                machineCostInput={machineCostInput}
                                setMachineCostInput={setMachineCostInput}
                                electricityCostInput={electricityCostInput}
                                setElectricityCostInput={setElectricityCostInput}
                                isiUlangCostInput={isiUlangCostInput}
                                setIsUlangCostInput={setIsUlangCostInput}
                                error={error}
                                handleAnalyze={handleAnalyze}
                                isLoading={isLoading}
                                latitude={latitude}
                                longitude={longitude}
                            />

                            <KcpAtmBjbTab
                                analysisResult={analysisResult}
                                paginatedKcpAtm={paginatedKcpAtm}
                                kcpAtmPage={kcpAtmPage}
                                setKcpAtmPage={setKcpAtmPage}
                                getTotalPages={getTotalPages}
                                userLatitude={latitude} // Meneruskan latitude
                                userLongitude={longitude} // Meneruskan longitude
                            />

                            <AtmBankLainTab
                                analysisResult={analysisResult}
                                paginatedAtmBankLain={paginatedAtmBankLain}
                                atmBankLainPage={atmBankLainPage}
                                setAtmBankLainPage={setAtmBankLainPage}
                                getTotalPages={getTotalPages}
                                userLatitude={latitude} // Meneruskan latitude
                                userLongitude={longitude} // Meneruskan longitude
                            />

                            <LokasiUmumTab
                                analysisResult={analysisResult}
                                lokasiUmumPage={lokasiUmumPage}
                                setLokasiUmumPage={setLokasiUmumPage}
                                getTotalPages={getTotalPages}
                                // Meneruskan latitude dan longitude dari lokasi yang dipilih
                                userLatitude={latitude} 
                                userLongitude={longitude}
                            />

                            <HasilAnalisaTab
                                transformedAnalysisScores={transformedAnalysisScores}
                                analysisResult={analysisResult}
                                // Meneruskan semua nilai biaya aktual (input) ke HasilAnalisaTab
                                rentCostInput={rentCostInput}
                                machineCostInput={machineCostInput}
                                electricityCostInput={electricityCostInput}
                                isiUlangCostInput={isiUlangCostInput}
                            />
                        </TabPanels>
                    </Tabs>
                </CardBody>
            </Card>
        </Box>
    );
};

export default LocationAnalysis;
