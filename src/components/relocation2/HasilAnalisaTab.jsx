import React, { useState, useEffect, useCallback } from 'react';
import {
    TabPanel,
    VStack,
    Text,
    Grid,
    Card,
    CardBody,
    HStack,
    Box,
    Icon,
    Button,
    Flex,
    useToast,
    Select,
    FormControl,
    FormLabel,
    Spinner,
    Center
} from '@chakra-ui/react';
import {
    FaMoneyBillWave, // For Fee and Nominal
    FaSyncAlt,       // For Volume
    FaLandmark,      // For KCP / ATM BJB
    FaBuilding,      // For ATM Bank Lain
    FaMapMarkerAlt,  // For Lokasi Umum
    FaEye,           // For View Icon
    FaChevronDown    // For dropdown arrow
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth untuk token

// Base URL for API calls. Pastikan ini sesuai dengan setup environment Anda.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const HasilAnalisaTab = ({
    analysisResult,
}) => {
    const toast = useToast();
    const { getAccessToken, isAuthenticated, getUserProfile } = useAuth();

    const [atmList, setAtmList] = useState([]);
    const [selectedAtmId, setSelectedAtmId] = useState('');
    const [isAtmLoading, setIsAtmLoading] = useState(false);
    const [atmError, setAtmError] = useState(null);
    const [isSaving, setIsSaving] = useState(false); // New state for save button loading

    // --- DEBUGGING LOGS START ---
    useEffect(() => {
        console.log("HasilAnalisaTab rendered.");
        console.log("analysisResult prop:", analysisResult);
        if (analysisResult) {
            console.log("analysisResult.breakdown_analysis:", analysisResult.breakdown_analysis);
            if (analysisResult.breakdown_analysis) {
                console.log("analysisResult.breakdown_analysis.fee:", analysisResult.breakdown_analysis.fee);
                console.log("analysisResult.breakdown_analysis.volume:", analysisResult.breakdown_analysis.volume);
                console.log("analysisResult.breakdown_analysis.nominal:", analysisResult.breakdown_analysis.nominal);
            }
        }
    }, [analysisResult]);
    // --- DEBUGGING LOGS END ---


    // Pastikan analysisResult dan properti di dalamnya ada
    // Menggunakan optional chaining dan nilai default untuk menghindari error
    const nearestBranchesCount = analysisResult?.nearest_branches?.length || 0;
    const nearestAtmsCount = analysisResult?.nearest_atms?.length || 0;
    const publicPlacesCount = analysisResult?.public_places?.length || 0;
    const nearestCompetitorAtmsCount = analysisResult?.nearest_competitor_atms?.length || 0;

    // Gabungkan counts KCP dan ATM BJB dari data BJB
    const totalKcpAtmBjbFound = nearestBranchesCount + nearestAtmsCount;

    // Ambil data breakdown_analysis
    const breakdownAnalysis = analysisResult?.breakdown_analysis;

    // Pastikan nilai numerik sebelum memanggil toLocaleString
    const predictedFee = breakdownAnalysis?.fee !== undefined && breakdownAnalysis.fee !== null
        ? breakdownAnalysis.fee.toLocaleString('id-ID')
        : 'N/A';
    const predictedVolume = breakdownAnalysis?.volume !== undefined && breakdownAnalysis.volume !== null
        ? breakdownAnalysis.volume
        : 0; // Default to 0 for calculations
    const predictedNominal = breakdownAnalysis?.nominal !== undefined && breakdownAnalysis.nominal !== null
        ? breakdownAnalysis.nominal.toLocaleString('id-ID')
        : 'N/A';
    // const predictedRevenue = breakdownAnalysis?.revenue || "0%";

    // Ambil relocation_id dari analysisResult
    const relocationId = analysisResult?.id; // Asumsi analysisResult memiliki properti 'id'

    // Fungsi untuk menentukan Tier berdasarkan volume transaksi
    const getTierByVolume = (volume) => {
        if (volume > 3600) return { tier: '1', gradient: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)' }; // Biru
        if (volume > 2000 && volume <= 3600) return { tier: '2', gradient: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)' }; // Hijau
        if (volume > 1000 && volume <= 2000) return { tier: '3', gradient: 'linear-gradient(135deg, #ECC94B 0%, #D69E2E 100%)' }; // Kuning
        return { tier: '4', gradient: 'linear-gradient(135deg, #F56565 0%, #E53E3E 100%)' }; // Merah
    };

    const { tier, gradient } = getTierByVolume(predictedVolume);

    const getOverallPredictionText = (volume) => {
        if (volume > 3600) return "Sangat Berpotensi";
        if (volume > 2000 && volume <= 3600) return "Berpotensi";
        if (volume > 1000 && volume <= 2000) return "Cukup Berpotensi";
        return "Kurang Berpotensi";
    };


    // Fungsi untuk mengambil daftar ATM dari API
    const fetchATMs = useCallback(async () => {
        setIsAtmLoading(true);
        setAtmError(null);
        try {
            const token = getAccessToken();
            const userProfileData = getUserProfile();

            if (!token || !isAuthenticated || !userProfileData) {
                throw new Error("Pengguna tidak terautentikasi atau profil tidak lengkap.");
            }

            const branchId = userProfileData?.branch_id?.id || 6;
            const response = await fetch(`${BASE_URL}/atms?branch_id=${branchId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setAtmList(result.data?.atms || []);
        } catch (err) {
            console.error("Error fetching ATMs:", err);
            setAtmError(err.message || "Gagal memuat daftar ATM.");
            toast({
                title: "Error Memuat ATM",
                description: err.message || "Tidak dapat memuat daftar ATM untuk pemilihan.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-right"
            });
        } finally {
            setIsAtmLoading(false);
        }
    }, [getAccessToken, isAuthenticated, getUserProfile, toast]);

    // Effect untuk memuat ATM saat komponen dimuat
    useEffect(() => {
        if (isAuthenticated) {
            fetchATMs();
        }
    }, [isAuthenticated, fetchATMs]);

    // Fungsi untuk mengirim data ke API /save-relocation setelah memilih ATM
    const handleSave = async () => {
        if (!relocationId) {
            toast({
                title: "Error",
                description: "Relocation ID tidak ditemukan. Harap pastikan analisis telah dijalankan dan hasilnya valid.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-right"
            });
            return;
        }

        if (!selectedAtmId) {
            toast({
                title: "Peringatan",
                description: "Silakan pilih ATM terlebih dahulu.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "bottom-right"
            });
            return;
        }

        setIsSaving(true); // Set loading state for save button
        setAtmError(null);
        try {
            const token = getAccessToken();
            if (!token) {
                throw new Error("Token otentikasi tidak tersedia.");
            }

            const payload = {
                atm_id: parseInt(selectedAtmId), // Pastikan atm_id adalah integer
                relocation_id: relocationId,
            };
            console.log("Sending save-relocation payload:", payload);

            const response = await fetch(`${BASE_URL}/save-relocation`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Save relocation successful:", result);
            toast({
                title: "Relokasi Disimpan",
                description: "Data relokasi dan ATM berhasil disimpan.",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom-right"
            });
        } catch (err) {
            console.error("Error saving relocation:", err);
            setAtmError(err.message || "Gagal menyimpan data relokasi.");
            toast({
                title: "Gagal Menyimpan",
                description: err.message || "Terjadi kesalahan saat menyimpan data relokasi.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-right"
            });
        } finally {
            setIsSaving(false); // Reset loading state
        }
    };

    return (
        <TabPanel p={6}>
            <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                {/* Left Column: Selected Location, Prediction Result, Target Relokasi */}
                <VStack spacing={6} align="stretch">
                    {/* Selected Location Card */}
                    <VStack align="stretch" spacing={4}>
                        <Text fontSize="lg" fontWeight="bold">
                            Selected Location
                        </Text>
                        <Card boxShadow="sm" borderRadius="20px" bg="white" border="1px solid gray">
                            <CardBody p={4} minWidth={600}>
                                <Text fontSize="md" fontWeight="medium" noOfLines={2}>
                                    {analysisResult?.nearest_branches?.[0]?.address || 'Alamat Lokasi Tidak Tersedia'}
                                </Text>
                            </CardBody>
                        </Card>
                    </VStack>

                    <Text fontSize="lg" fontWeight="bold">
                        Prediction result
                    </Text>

                    <VStack align="stretch" spacing={4}>
                        {/* Fee Transaction Prediction */}
                        <Card boxShadow="sm" borderRadius="20px" bg="white" border="1px solid gray">
                            <CardBody p={4}>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack>
                                        <Box bg="orange.50" borderRadius="full" p={2}>
                                            <Icon as={FaMoneyBillWave} boxSize={5} color="orange.400" />
                                        </Box>
                                        <Text fontWeight="medium" fontSize="md">Fee transaction prediction</Text>
                                    </HStack>
                                    <VStack align="flex-end" spacing={0}>
                                        <Text fontSize="md" fontWeight="bold" color="green.600">
                                            Rp. {predictedFee}
                                        </Text>
                                        <Text fontSize="sm" color="gray.500">/Quarter</Text>
                                    </VStack>
                                </HStack>
                            </CardBody>
                        </Card>

                        {/* Volume Transaction Prediction */}
                        <Card boxShadow="sm" borderRadius="20px" bg="white" border="1px solid gray">
                            <CardBody p={4}>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack>
                                        <Box bg="orange.50" borderRadius="full" p={2}>
                                            <Icon as={FaSyncAlt} boxSize={5} color="orange.400" />
                                        </Box>
                                        <Text fontWeight="medium" fontSize="md">Volume transaction prediction</Text>
                                    </HStack>
                                    <VStack align="flex-end" spacing={0}>
                                        <Text fontSize="md" fontWeight="bold" color="green.600">
                                            {predictedVolume.toLocaleString('id-ID')}
                                        </Text>
                                        <Text fontSize="sm" color="gray.500">/Quarter</Text>
                                    </VStack>
                                </HStack>
                            </CardBody>
                        </Card>

                        {/* Nominal Transaction Prediction */}
                        <Card boxShadow="sm" borderRadius="20px" bg="white" border="1px solid gray">
                            <CardBody p={4}>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack>
                                        <Box bg="orange.50" borderRadius="full" p={2}>
                                            <Icon as={FaMoneyBillWave} boxSize={5} color="orange.400" />
                                        </Box>
                                        <Text fontWeight="medium" fontSize="md">Nominal transaction prediction</Text>
                                    </HStack>
                                    <VStack align="flex-end" spacing={0}>
                                        <Text fontSize="md" fontWeight="bold" color="green.600">
                                            Rp. {predictedNominal}
                                        </Text>
                                        <Text fontSize="sm" color="gray.500">/Quarter</Text>
                                    </VStack>
                                </HStack>
                            </CardBody>
                        </Card>
                    </VStack>

                    {/* Target Relokasi Section - ATM selection moved here */}
                    <VStack align="stretch" spacing={4} mt={8}>
                        <Text fontSize="lg" fontWeight="bold">
                            Target relokasi
                        </Text>
                        <FormControl>
                            <FormLabel htmlFor="atm-select-target">Pilih ATM:</FormLabel>
                            <Select
                                id="atm-select-target"
                                placeholder={isAtmLoading ? "Loading ATMs..." : atmError ? "Error loading ATMs" : "Pilih ATM..."}
                                value={selectedAtmId}
                                onChange={(e) => setSelectedAtmId(e.target.value)}
                                size="lg"
                                borderRadius="md"
                                icon={<FaChevronDown />}
                                isDisabled={isAtmLoading || atmList.length === 0}
                                border="1px solid"
                                borderColor="gray.200"
                                boxShadow="sm"
                                _hover={{ borderColor: "gray.300", boxShadow: "md" }}
                                _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
                            >
                                {isAtmLoading ? (
                                    <option value="" disabled>Loading ATMs...</option>
                                ) : atmError ? (
                                    <option value="" disabled>Error loading ATMs</option>
                                ) : atmList.length === 0 ? (
                                    <option value="" disabled>No ATMs available</option>
                                ) : (
                                    atmList.map((atm) => (
                                        <option key={atm.id} value={atm.id}>
                                            {atm.code} - {atm.name} ({atm.address})
                                        </option>
                                    ))
                                )}
                            </Select>
                            {isAtmLoading && (
                                <Center mt={2}>
                                    <Spinner size="sm" color="blue.500" /> <Text ml={2} fontSize="sm" color="gray.500">Loading ATM list...</Text>
                                </Center>
                            )}
                            {atmError && (
                                <Text color="red.500" fontSize="sm" mt={2}>{atmError}</Text>
                            )}
                        </FormControl>
                    </VStack>
                </VStack>

                {/* Right Column: Location Counts & Overall Prediction */}
                <VStack align="end" spacing={6}>
                    {/* Location Counts */}
                    <VStack align="stretch" spacing={3}>
                        {/* KCP / ATM BJB */}
                        <Card boxShadow="sm" minWidth={350} borderRadius="20px" bg="white" border="1px solid gray">
                            <CardBody p={4}>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack>
                                        <Box bg="blue.100" borderRadius="full" p={2}>
                                            <Icon as={FaLandmark} boxSize={5} color="blue.600" />
                                        </Box>
                                        <Text fontWeight="medium">KCP / ATM BJB</Text>
                                    </HStack>
                                    <HStack>
                                        <Text fontWeight="bold">{totalKcpAtmBjbFound} Found</Text>
                                        
                                    </HStack>
                                </HStack>
                            </CardBody>
                        </Card>
                        {/* ATM Bank Lain */}
                        <Card boxShadow="sm" borderRadius="20px" bg="white" border="1px solid gray">
                            <CardBody p={4}>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack>
                                        <Box bg="orange.100" borderRadius="full" p={2}>
                                            <Icon as={FaBuilding} boxSize={5} color="orange.600" />
                                        </Box>
                                        <Text fontWeight="medium">ATM Bank Lain</Text>
                                    </HStack>
                                    <HStack>
                                        <Text fontWeight="bold">{nearestCompetitorAtmsCount} Found</Text>
                                        
                                    </HStack>
                                </HStack>
                            </CardBody>
                        </Card>
                        {/* Lokasi Umum */}
                        <Card boxShadow="sm" borderRadius="20px" bg="white" border="1px solid gray">
                            <CardBody p={4}>
                                <HStack justifyContent="space-between" alignItems="center">
                                    <HStack>
                                        <Box bg="purple.100" borderRadius="full" p={2}>
                                            <Icon as={FaMapMarkerAlt} boxSize={5} color="purple.600" />
                                        </Box>
                                        <Text fontWeight="medium">Lokasi Umum</Text>
                                    </HStack>
                                    <HStack>
                                        <Text fontWeight="bold">{publicPlacesCount} Found</Text>
                                        
                                    </HStack>
                                </HStack>
                            </CardBody>
                        </Card>
                    </VStack>

                    {/* Overall Prediction Card */}
                    <Card bg={gradient} color="white" borderRadius="25px" p={6} textAlign="center" boxShadow="lg">
                        <CardBody>
                            <Text textAlign={"left"} fontSize="sm" fontWeight="normal">Prediction</Text>
                            <Text fontSize="6xl" fontWeight={'normal'} mt={2} mb={4} textAlign={"left"}>
                                TIER {tier}
                            </Text>
                            <Text textAlign={"left"} fontSize="md" fontWeight="normal">
                                Lokasi yang dipilih diprediksi {getOverallPredictionText(predictedVolume)} untuk dilakukan relokasi.
                            </Text>
                            <Button
                                mt={6}
                                colorScheme="red"
                                size="lg"
                                width="full"
                                borderRadius="25px"
                                onClick={handleSave}
                                boxShadow="md"
                                _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                                _active={{ boxShadow: "sm", transform: "translateY(0)" }}
                                isDisabled={!selectedAtmId || isSaving || isAtmLoading} // Disable if no ATM is selected, saving, or ATM list is loading
                                isLoading={isSaving} // Show loading spinner on the button when saving
                            >
                                Save
                            </Button>
                        </CardBody>
                    </Card>
                </VStack>
            </Grid>
        </TabPanel>
    );
};

export default HasilAnalisaTab;
