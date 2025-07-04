// components/SubmissionList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    VStack,
    Text,
    Grid,
    Card,
    CardBody,
    Center,
    Spinner,
    useToast,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Button,
    useDisclosure
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RelocationCard from './RelocationCard';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const SubmissionList = () => {
    const { getAccessToken, isAuthenticated, getUserProfile } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [relocations, setRelocations] = useState([]);
    const [relocationAcceptedCount, setRelocationAcceptedCount] = useState(0);
    const [relocationInProcessCount, setRelocationInProcessCount] = useState(0);
    const [relocationRejectedCount, setRelocationRejectedCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleActionButtons, setVisibleActionButtons] = useState({});
    const [selectedRelocationId, setSelectedRelocationId] = useState(null);
    const [showAccepted, setShowAccepted] = useState(false);
    const [showRejected, setShowRejected] = useState(false);

   
    const { isOpen: isCancelModalOpen, onOpen: onCancelModalOpen, onClose: onCancelModalClose } = useDisclosure();

    const cancelRef = React.useRef();

    const userProfileData = getUserProfile();
    const currentUserBranchId = userProfileData?.branch_id?.id;

    const fetchRelocationDetail = useCallback(async (relocationId) => {
        try {
            const token = getAccessToken();
            if (!token) {
                throw new Error("Token otentikasi tidak tersedia.");
            }

            const response = await fetch(`${BASE_URL}/relocations/${relocationId}`, {
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
            return result.data;
        } catch (err) {
            console.error(`Error fetching detail for relocation ${relocationId}:`, err);
            return null;
        }
    }, [getAccessToken]);

    const fetchRelocationData = useCallback(async () => {
        const userProfile = getUserProfile();

        if (!isAuthenticated || !userProfile) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const token = getAccessToken();
            if (!token) {
                throw new Error("Token otentikasi tidak tersedia.");
            }

            const branchId = userProfile?.branch_id?.id;
            let apiUrl = `${BASE_URL}/relocations?page=1&limit=99999`;
            if (branchId) {
                apiUrl += `&branch_id=${branchId}`;
            }

            const response = await fetch(apiUrl, {
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
            let fetchedRelocations = result.data?.relocations || [];

            const relocationsWithDetail = await Promise.all(
                fetchedRelocations.map(async (item) => {
                    // Fetch detail to get the `atm` object which contains `atm.id` and `atm.address` etc.
                    const detail = await fetchRelocationDetail(item.id);
                    return detail ? { ...item, volume: detail.volume, atm: detail.atm } : item;
                })
            );

            setRelocations(relocationsWithDetail);

            const acceptedCount = relocationsWithDetail.filter(item => item.state === 'approved').length;
            const inProcessCount = relocationsWithDetail.filter(item => item.state === 'in_progress').length;
            const RejectedCount = relocationsWithDetail.filter(item => item.state === 'rejected').length;

            setRelocationAcceptedCount(acceptedCount);
            setRelocationInProcessCount(inProcessCount);
            setRelocationRejectedCount(RejectedCount);

        } catch (err) {
            console.error("Error fetching relocation data:", err);
            setError(err.message || "Gagal memuat data relokasi.");
            toast({
                title: "Gagal Memuat Data",
                description: err.message || "Terjadi kesalahan saat memuat daftar relokasi.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-right"
            });
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, getAccessToken, getUserProfile, toast, fetchRelocationDetail]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchRelocationData();
        }
    }, [isAuthenticated, fetchRelocationData]);

    const handleCardClick = (relocation) => {
        console.log("Navigating to edit mode with relocation:", relocation);
        // Pass relocation.atm.id if it exists, otherwise pass null or undefined
        navigate(`/action/cba-simulation/edit/${relocation.id}`, { state: { atmId: relocation.atm_id?.id, code: relocation.atm_id?.code, name: relocation.atm_id?.name, address: relocation.atm_id?.address, } });
    };

    const toggleActionButtons = (relocationId) => {
        setVisibleActionButtons(prev => ({
            ...prev,
            [relocationId]: !prev[relocationId]
        }));
    };

    

    const triggerCancelModal = (id) => {
        setSelectedRelocationId(id);
        onCancelModalOpen();
    };

    

    

    const handleCancelRelocationConfirmed = async () => {
        const relocationId = selectedRelocationId;
        if (!relocationId) return;

        onCancelModalClose();

        setIsLoading(true);
        try {
            const token = getAccessToken();
            const response = await fetch(`${BASE_URL}/cancel-relocation/${relocationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal membatalkan relokasi: ${response.status}`);
            }

            toast({
                title: "Relokasi Dibatalkan",
                description: `Relokasi RS${relocationId} berhasil dibatalkan.`,
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "bottom-right"
            });
            fetchRelocationData();
        } catch (err) {
            console.error("Error canceling relocation:", err);
            toast({
                title: "Gagal Membatalkan",
                description: err.message || "Terjadi kesalahan saat membatalkan relokasi.",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-right"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRelocations = relocations.filter(item => {
        if (item.state === 'in_progress') {
            return true;
        }
        if (item.state === 'approved' && showAccepted) {
            return true;
        }
        if (item.state === 'rejected' && showRejected) {
            return true;
        }
        return false;
    });

    if (isLoading) {
        return (
            <Center h="70vh">
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    if (error) {
        return (
            <Center h="70vh">
                <Text color="red.500" fontSize="lg">Error: {error}</Text>
            </Center>
        );
    }

    return (
        <Box maxW="6xl" mx="auto" p={6} minH="100vh">
            <VStack spacing={8} align="stretch">
                {/* Top Statistics Cards */}
                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                    {/* Card: Relocation accepted */}
                    <Card
                        bg="linear-gradient(90deg, rgba(144, 238, 144, 0.2) 0%, rgba(144, 238, 144, 0.5) 100%)"
                        borderRadius="25px"
                        boxShadow="md"
                        p={6}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        minH="150px"
                        cursor="pointer"
                        onClick={() => setShowAccepted(prev => !prev)}
                    >
                        <CardBody p={0} display="flex" alignItems="center" justifyContent="space-between" width="full">
                            <VStack align="flex-start" spacing={1}>
                                <Text fontSize="lg" fontWeight="semibold" color="green.800">
                                    Relocation accepted
                                </Text>
                                <Text fontSize="md" color="green.700">
                                    {relocationAcceptedCount} Lokasi Telah disetujui
                                </Text>
                            </VStack>
                            <Box
                                bg="white"
                                borderRadius="full"
                                boxSize="80px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                boxShadow="md"
                            >
                                <Text fontSize="4xl" fontWeight="bold" color="green.700">
                                    {relocationAcceptedCount}
                                </Text>
                            </Box>
                        </CardBody>
                    </Card>
                    <Card
                        bg="linear-gradient(90deg, rgba(244, 102, 102, 0.74) 0%, rgba(235, 28, 28, 0.59) 100%)"
                        borderRadius="25px"
                        boxShadow="md"
                        p={6}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        minH="150px"
                        cursor="pointer"
                        onClick={() => setShowRejected(prev => !prev)}
                    >
                        <CardBody p={0} display="flex" alignItems="center" justifyContent="space-between" width="full">
                            <VStack align="flex-start" spacing={1}>
                                <Text fontSize="lg" fontWeight="semibold" color="red.800">
                                    Relocation rejected
                                </Text>
                                <Text fontSize="md" color="red.700">
                                    {relocationRejectedCount} Lokasi Telah ditolak
                                </Text>
                            </VStack>
                            <Box
                                bg="white"
                                borderRadius="full"
                                boxSize="80px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                boxShadow="md"
                            >
                                <Text fontSize="4xl" fontWeight="bold" color="red.700">
                                    {relocationRejectedCount}
                                </Text>
                            </Box>
                        </CardBody>
                    </Card>

                    {/* Card: Relocation in process */}
                    <Card
                        bg="linear-gradient(90deg, rgba(255, 255, 0, 0.2) 0%, rgba(255, 255, 0, 0.5) 100%)"
                        borderRadius="25px"
                        boxShadow="md"
                        p={6}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        minH="150px"
                    >
                        <CardBody p={0} display="flex" alignItems="center" justifyContent="space-between" width="full">
                            <VStack align="flex-start" spacing={1}>
                                <Text fontSize="lg" fontWeight="semibold" color="yellow.800">
                                    Relocation in process
                                </Text>
                                <Text fontSize="md" color="yellow.700">
                                    {relocationInProcessCount} Lokasi sedang dalam proses
                                </Text>
                            </VStack>
                            <Box
                                bg="white"
                                borderRadius="full"
                                boxSize="80px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                boxShadow="md"
                            >
                                <Text fontSize="4xl" fontWeight="bold" color="yellow.800">
                                    {relocationInProcessCount}
                                </Text>
                            </Box>
                        </CardBody>
                    </Card>
                </Grid>

                {/* Submission List */}
                <Box>
                    <Text fontSize="xl" fontWeight="bold" mb={4}>
                        Submission list
                    </Text>
                    <VStack spacing={3} align="stretch">
                        {filteredRelocations.length > 0 ? (
                            filteredRelocations.map((item) => (
                                <RelocationCard
                                    key={item.id}
                                    item={item}
                                    currentUserBranchId={currentUserBranchId}
                                    visibleActionButtons={visibleActionButtons}
                                    toggleActionButtons={toggleActionButtons}
                                    
                                    triggerCancelModal={triggerCancelModal}
                                    handleCardClick={() => handleCardClick(item)} // Pass the whole item
                                />
                            ))
                        ) : (
                            <Text textAlign="center" color="gray.500" py={10}>
                                Tidak ada data relokasi yang ditemukan.
                            </Text>
                        )}
                    </VStack>
                </Box>
            </VStack>

            

            {/* Cancel Confirmation AlertDialog */}
            <AlertDialog
                isOpen={isCancelModalOpen}
                leastDestructiveRef={cancelRef}
                onClose={onCancelModalClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="lg">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Batalkan Relokasi
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Apakah Anda yakin ingin membatalkan relokasi RS{selectedRelocationId} ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onCancelModalClose}>
                                Tidak
                            </Button>
                            <Button colorScheme="red" onClick={handleCancelRelocationConfirmed} ml={3}>
                                Ya, Batalkan
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default SubmissionList;