// components/HasilAnalisaTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom'; // Import useParams
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
    FormControl,
    FormLabel,
    Spinner,
    Center,
    Input,
    InputGroup,
    InputRightElement,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    List,
    ListItem,
    Divider,
} from '@chakra-ui/react';
import {
    FaMoneyBillWave,
    FaSyncAlt,
    FaLandmark,
    FaBuilding,
    FaMapMarkerAlt,
    FaSearch,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const HasilAnalisaTab = ({ analysisResult }) => {
    const toast = useToast();
    const { getAccessToken, isAuthenticated, getUserProfile } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const location = useLocation();
    const { relocationId: urlRelocationId } = useParams(); // Get relocationId from URL params

    const [atmList, setAtmList] = useState([]);
    const [filteredAtmList, setFilteredAtmList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAtmId, setSelectedAtmId] = useState('');
    const [selectedAtmDetails, setSelectedAtmDetails] = useState(null);
    const [isAtmLoading, setIsAtmLoading] = useState(false);
    const [atmError, setAtmError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    // Determine if it's edit mode based on the URL parameter
    const isEditMode = location.pathname.includes('/edit/');

    // Get user profile once
    const userProfile = getUserProfile();
    const canApproveReject = userProfile?.branch_id?.id === 0;

    // Use analysisResult.id if available, otherwise fallback to URL param
    const relocationId = analysisResult?.id || urlRelocationId;


    // --- EFFECT FOR INITIAL ATM SELECTION BASED ON URL OR PASSED STATE ---
    useEffect(() => {
        console.log("--- HasilAnalisaTab useEffect for ATM selection triggered ---");
        console.log("Current URL pathname:", location.pathname, "Is Edit Mode:", isEditMode);
        console.log("analysisResult (inside useEffect):", analysisResult);
        console.log("location.state:", location.state); // Log the entire state object

        if (isEditMode) {
            console.log("Edit mode detected.");
            let initialAtmDetails = null;
            let initialAtmId = '';

            // Prioritize ATM from analysisResult if available
            if (analysisResult && analysisResult.atm) {
                console.log("Using analysisResult.atm for initial selection.");
                initialAtmDetails = analysisResult.atm;
                initialAtmId = analysisResult.atm.id;
            } else if (location.state && location.state.atmId) {
                // Fallback to location.state.atmId if analysisResult.atm is not present
                console.log("Using location.state.atmId for initial selection.");
                initialAtmId = location.state.atmId;
                // If we only have atmId, we might need to fetch full ATM details
                // This would require an additional fetch or ensuring `analysisResult.atm` is always populated correctly on load.
                // For now, we'll assume `analysisResult.atm` comes correctly when detail is fetched.
                // If not, you'd need a `fetchAtmDetailsById` function here.
            } else {
                console.log("No initial ATM data from analysisResult or location.state.");
            }

            if (initialAtmDetails) {
                setSelectedAtmDetails(initialAtmDetails);
                setSelectedAtmId(initialAtmId);
                setSearchTerm(`${initialAtmDetails.code} - ${initialAtmDetails.name} (${initialAtmDetails.address})`);
                console.log("selectedAtmDetails set to:", initialAtmDetails);
                console.log("searchTerm set to:", `${initialAtmDetails.code} - ${initialAtmDetails.name} (${initialAtmDetails.address})`);
            } else if (initialAtmId) {
                 // If we have an ATM ID but no full details (e.g., from location.state.atmId),
                 // we should fetch the details here to populate the display.
                 console.log(`ATM ID ${initialAtmId} found from state, but no full details. Consider fetching.`);
                 // You would need a function like this:
                 // fetchAtmDetailsById(initialAtmId).then(details => {
                 //     setSelectedAtmDetails(details);
                 //     setSelectedAtmId(initialAtmId);
                 //     setSearchTerm(`${details.code} - ${details.name} (${details.address})`);
                 // }).catch(err => console.error("Failed to fetch ATM details:", err));
            } else {
                console.log("No specific ATM pre-selection in edit mode.");
            }
        } else {
            console.log("New analysis mode. Clearing selected ATM details and search term.");
            setSelectedAtmDetails(null);
            setSelectedAtmId('');
            setSearchTerm('');
        }
    }, [location.pathname, location.state, analysisResult, isEditMode]); // Add location.state to dependency array

    // ... (rest of your HasilAnalisaTab.jsx component code)

    const nearestBranchesCount = analysisResult?.nearest_branches?.length || 0;
    const nearestAtmsCount = analysisResult?.nearest_atms?.length || 0;
    const publicPlacesCount = analysisResult?.public_places?.length || 0;
    const nearestCompetitorAtmsCount = analysisResult?.nearest_competitor_atms?.length || 0;

    const totalKcpAtmBjbFound = nearestBranchesCount + nearestAtmsCount;
    const breakdownAnalysis = analysisResult?.breakdown_analysis;

    const predictedFee = breakdownAnalysis?.fee !== undefined && breakdownAnalysis.fee !== null
        ? breakdownAnalysis.fee.toLocaleString('id-ID')
        : 'N/A';
    const predictedVolume = breakdownAnalysis?.volume !== undefined && breakdownAnalysis.volume !== null
        ? breakdownAnalysis.volume
        : 0;
    const predictedNominal = breakdownAnalysis?.nominal !== undefined && breakdownAnalysis.nominal !== null
        ? breakdownAnalysis.nominal.toLocaleString('id-ID')
        : 'N/A';

    const getTierByVolume = (volume) => {
        if (volume > 3600) return { tier: '1', gradient: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)' };
        if (volume > 2000 && volume <= 3600) return { tier: '2', gradient: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)' };
        if (volume > 1000 && volume <= 2000) return { tier: '3', gradient: 'linear-gradient(135deg, #ECC94B 0%, #D69E2E 100%)' };
        return { tier: '4', gradient: 'linear-gradient(135deg, #F56565 0%, #E53E3E 100%)' };
    };

    const { tier, gradient } = getTierByVolume(predictedVolume);

    const getOverallPredictionText = (volume) => {
        if (volume > 3600) return "Sangat Berpotensi";
        if (volume > 2000 && volume <= 3600) return "Berpotensi";
        if (volume > 1000 && volume <= 2000) return "Cukup Berpotensi";
        return "Kurang Berpotensi";
    };

    // The relocationId is now derived from either `analysisResult.id` or `urlRelocationId`
    // const relocationId = analysisResult?.id; // This line should be replaced or augmented
    // It's already defined above as `const relocationId = analysisResult?.id || urlRelocationId;`


    const fetchATMs = useCallback(async () => {
        setIsAtmLoading(true);
        setAtmError(null);
        try {
            const token = getAccessToken();
            const userProfileData = getUserProfile();

            if (!token || !isAuthenticated || !userProfileData) {
                throw new Error("Pengguna tidak terautentikasi atau profil tidak lengkap.");
            }

            const branchId = userProfileData.branch_id?.id;
            console.log("User's branch_id:", branchId);

            let url = `${BASE_URL}/atms?limit=9999999&page=1`;
            // Only filter by branch_id if it's not 0 (meaning, not a superuser/admin branch_id=0)
            if (branchId !== 0 && branchId !== undefined && branchId !== null) {
                 url += `&branch_id=${branchId}`;
            }


            console.log("Fetching ATMs from URL:", url);

            const response = await fetch(url, {
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
            const fetchedAtms = result.data?.atms || [];
            console.log("Fetched ATM list:", fetchedAtms);

            setAtmList(fetchedAtms);
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

    // Fetch ATMs only if not in edit mode
    useEffect(() => {
        if (isAuthenticated && !isEditMode) { // Only fetch if not in edit mode, as selected ATM is pre-filled
            fetchATMs();
        }
    }, [isAuthenticated, fetchATMs, isEditMode]);

    // Effect to filter ATMs when searchTerm or atmList changes (for Modal)
    useEffect(() => {
        if (!isEditMode) {
            if (searchTerm.length > 0) {
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                const filtered = atmList.filter(atm =>
                    atm.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    atm.code.toLowerCase().includes(lowerCaseSearchTerm) ||
                    (atm.branch_id && atm.branch_id.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                    (atm.branch_id && atm.branch_id.parent_id && atm.branch_id.parent_id.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                    atm.address.toLowerCase().includes(lowerCaseSearchTerm)
                );
                setFilteredAtmList(filtered.slice(0, 100));
            } else {
                setFilteredAtmList(atmList.slice(0, 100));
            }
        }
    }, [searchTerm, atmList, isEditMode]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSelectAtm = (atm) => {
        setSelectedAtmId(atm.id);
        setSelectedAtmDetails(atm);
        setSearchTerm(`${atm.code} - ${atm.name}`);
        onClose();
    };

    const handleOpenSearchModal = () => {
        if (!isEditMode) { // Only allow opening modal if not in edit mode
            if (atmList.length === 0 && !isAtmLoading) {
                fetchATMs();
            }
            setSearchTerm('');
            setFilteredAtmList(atmList.slice(0, 100));
            onOpen();
        }
    };

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
                description: "Silakan pilih ATM target dari daftar yang muncul atau cari terlebih dahulu.",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "bottom-right"
            });
            return;
        }

        setIsSaving(true);
        setAtmError(null);
        try {
            const token = getAccessToken();
            if (!token) {
                throw new Error("Token otentikasi tidak tersedia.");
            }

            const payload = {
                atm_id: parseInt(selectedAtmId),
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
            setIsSaving(false);
        }
    };

    const handleAccept = async () => {
        if (!relocationId || !location.state.atmId) {
            toast({
                title: "Error",
                description: "Relocation ID atau ATM ID tidak ditemukan. Harap pastikan analisis telah dijalankan dan ATM target terpilih.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-right"
            });
            return;
        }

        setIsAccepting(true);
        try {
            const token = getAccessToken();
            if (!token) {
                throw new Error("Token otentikasi tidak tersedia.");
            }

            const payload = {
                relocation_id: relocationId,
                atm_id: parseInt(selectedAtmId),
            };
            console.log("Sending accept (save-relocation) payload:", payload);

            const response = await fetch(`${BASE_URL}/approve-relocation/${relocationId}`, {
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
            console.log("Relocation accepted (saved) successfully:", result);
            toast({
                title: "Relokasi Diterima",
                description: "Relokasi berhasil diterima dan disimpan.",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom-right"
            });
        } catch (err) {
            console.error("Error accepting relocation:", err);
            toast({
                title: "Gagal Menerima Relokasi",
                description: err.message || "Terjadi kesalahan saat menerima relokasi.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-right"
            });
        } finally {
            setIsAccepting(false);
        }
    };

    const handleReject = async () => {
        if (!relocationId ) { // Ensure selectedAtmId is available
            toast({
                title: "Error",
                description: "Relocation ID atau ATM ID tidak ditemukan. Harap pastikan analisis telah dijalankan dan ATM target terpilih.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-right"
            });
            return;
        }

        setIsRejecting(true);
        try {
            const token = getAccessToken();
            if (!token) {
                throw new Error("Token otentikasi tidak tersedia.");
            }

            const payload = {
                relocation_id: relocationId,
                atm_id: parseInt(selectedAtmId), // Include atm_id as per your request
            };
            console.log("Sending reject payload:", payload);

            const response = await fetch(`${BASE_URL}/reject-relocation/${relocationId}`, {
                method: "POST", // Assuming POST based on your provided req body, even though path implies PUT
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
            console.log("Relocation rejected successfully:", result);
            toast({
                title: "Relokasi Ditolak",
                description: "Relokasi berhasil ditolak.",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom-right"
            });
        } catch (err) {
            console.error("Error rejecting relocation:", err);
            toast({
                title: "Gagal Menolak Relokasi",
                description: err.message || "Terjadi kesalahan saat menolak relokasi.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-right"
            });
        } finally {
            setIsRejecting(false);
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
                                    {analysisResult?.address || 'Alamat Lokasi Tidak Tersedia'}
                                </Text>
                            </CardBody>
                        </Card>
                    </VStack>

                    <Text fontSize="lg" fontWeight="bold">
                        Prediction result
                    </Text>

                    <VStack align="stretch" spacing={4}>
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

                    {/* Target Relokasi Section - Conditional input and display */}
                    <VStack align="stretch" spacing={4} mt={8}>
                        <Text fontSize="lg" fontWeight="bold">
                            Target relokasi
                        </Text>
                        <FormControl>
                            <FormLabel htmlFor="atm-search-input">Pilih ATM Target:</FormLabel>
                            <InputGroup>
                                <Input
                                    id="atm-search-input"
                                    placeholder={isEditMode ? "ATM target sudah terpilih dari data edit." : "Klik untuk mencari ATM..."}
                                    value={searchTerm}
                                    isReadOnly={isEditMode}
                                    onClick={handleOpenSearchModal}
                                    cursor={isEditMode ? "not-allowed" : "pointer"}
                                    size="lg"
                                    bg="white"
                                    borderRadius="md"
                                    boxShadow="sm"
                                    pr="4.5rem"
                                />
                                <InputRightElement width="4.5rem">
                                    <Button
                                        h="1.75rem"
                                        size="sm"
                                        onClick={handleOpenSearchModal}
                                        isLoading={isAtmLoading}
                                        isDisabled={isEditMode}
                                    >
                                        <Icon as={FaSearch} />
                                    </Button>
                                </InputRightElement>
                            </InputGroup>

                            {/* Display selected ATM details below the input */}
                            {(() => {
                                console.log("Rendering selected ATM details section. current selectedAtmDetails:", location.state || selectedAtmDetails);
                                if (location.state && location.state.atmId && !selectedAtmDetails) {
                                    // Show details from location.state if available and selectedAtmDetails is not set
                                    return (
                                        <Box mt={4} p={3} borderWidth="1px" borderRadius="25" bg="blue.50" borderColor="blue.200">
                                            <Text fontWeight="bold">ATM Terpilih:</Text>
                                            <Text>Kode: {location.state.code || '-'}</Text>
                                            <Text>Nama: {location.state.name || '-'}</Text>
                                            <Text>Alamat: {location.state.address || '-'}</Text>
                                        </Box>
                                    );
                                } else if (selectedAtmDetails) {
                                    // Show details from selectedAtmDetails if available
                                    return (
                                        <Box mt={4} p={3} borderWidth="1px" borderRadius="md" bg="blue.50" borderColor="blue.200">
                                            <Text fontWeight="bold">ATM Terpilih:</Text>
                                            <Text>Kode: {selectedAtmDetails.code}</Text>
                                            <Text>Nama: {selectedAtmDetails.name}</Text>
                                            <Text>Alamat: {selectedAtmDetails.address}</Text>
                                            {isEditMode && (
                                                <>
                                                    <Text>Latitude: {selectedAtmDetails.latitude}</Text>
                                                    <Text>Longitude: {selectedAtmDetails.longitude}</Text>
                                                    {selectedAtmDetails.distance && <Text>Jarak: {selectedAtmDetails.distance.toFixed(2)} meter</Text>}
                                                </>
                                            )}
                                            <Text>Cabang: {selectedAtmDetails.branch_id?.name || 'N/A'}</Text>
                                            <Text>Kanwil: {selectedAtmDetails.branch_id?.parent_id?.name || 'N/A'}</Text>
                                        </Box>
                                    );
                                } else {
                                    return null;
                                }
                            })()}

                            {atmError && !isEditMode && (
                                <Text color="red.500" fontSize="sm" mt={2}>{atmError}</Text>
                            )}
                        </FormControl>
                    </VStack>
                </VStack>

                {/* Right Column: Location Counts & Overall Prediction */}
                <VStack align="end" spacing={6}>
                    <VStack align="stretch" spacing={3}>
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
                                isDisabled={!selectedAtmId || isSaving}
                                isLoading={isSaving}
                            >
                                Save
                            </Button>

                            {/* New Accept and Reject buttons - Visible only in edit mode AND for branch_id = 0 */}
                            {isEditMode && canApproveReject && (
                                <Flex mt={4} justifyContent="space-around">
                                    <Button
                                        colorScheme="green"
                                        size="lg"
                                        borderRadius="25px"
                                        onClick={handleAccept}
                                        isLoading={isAccepting}
                                        isDisabled={isRejecting } 
                                        flex="1"
                                        mr={2}
                                        boxShadow="md"
                                        _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                                        _active={{ boxShadow: "sm", transform: "translateY(0)" }}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        colorScheme="red"
                                        size="lg"
                                        borderRadius="25px"
                                        onClick={handleReject}
                                        isLoading={isRejecting}
                                        isDisabled={isAccepting }   
                                        flex="1"
                                        ml={2}
                                        boxShadow="md"
                                        _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                                        _active={{ boxShadow: "sm", transform: "translateY(0)" }}
                                    >
                                        Reject
                                    </Button>
                                </Flex>
                            )}
                        </CardBody>
                    </Card>
                </VStack>
            </Grid>

            {/* --- ATM Search Modal (only for new analysis mode) --- */}
            {!isEditMode && (
                <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                    <ModalOverlay />
                    <ModalContent borderRadius="md">
                        <ModalHeader borderBottomWidth="1px">Cari ATM Target Relokasi</ModalHeader>
                        <ModalBody>
                            <FormControl mb={4}>
                                <FormLabel htmlFor="modal-atm-search">Cari berdasarkan:</FormLabel>
                                <Input
                                    id="modal-atm-search"
                                    placeholder="Kanwil, Kode ATM, Cabang, Alamat..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    size="md"
                                />
                            </FormControl>

                            {isAtmLoading && atmList.length === 0 ? (
                                <Center py={10}>
                                    <Spinner size="lg" color="blue.500" />
                                    <Text ml={4} fontSize="lg" color="gray.600">Memuat daftar ATM...</Text>
                                </Center>
                            ) : atmError ? (
                                <Center py={10}>
                                    <Text color="red.500" fontSize="md">{atmError}</Text>
                                </Center>
                            ) : filteredAtmList.length === 0 && searchTerm.length > 0 ? (
                                <Center py={10}>
                                    <Text color="gray.500" fontSize="md">Tidak ditemukan ATM yang cocok dengan "{searchTerm}".</Text>
                                </Center>
                            ) : (
                                <List spacing={0}>
                                    {filteredAtmList.map((atm) => (
                                        <React.Fragment key={atm.id}>
                                            <ListItem
                                                p={3}
                                                _hover={{ bg: 'blue.50', cursor: 'pointer' }}
                                                onClick={() => handleSelectAtm(atm)}
                                            >
                                                <Text fontWeight="semibold">{atm.code} - {atm.name}</Text>
                                                <Text fontSize="sm" color="gray.600" noOfLines={1}>
                                                    {atm.address}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    {atm.branch_id?.name} (Kanwil: {atm.branch_id?.parent_id?.name || 'N/A'})
                                                </Text>
                                            </ListItem>
                                            <Divider my={0} />
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </ModalBody>
                        <ModalFooter borderTopWidth="1px">
                            <Button colorScheme="blue" mr={3} onClick={onClose}>
                                Tutup
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </TabPanel>
    );
};

export default HasilAnalisaTab;