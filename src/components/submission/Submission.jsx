import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    VStack,
    Text,
    Grid,
    Card,
    CardBody,
    HStack,
    Icon,
    Spacer,
    Spinner,
    Center,
    useToast,
    Badge,
    IconButton,
    AlertDialog, // Import AlertDialog
    AlertDialogOverlay, // Import AlertDialogOverlay
    AlertDialogContent, // Import AlertDialogContent
    AlertDialogHeader, // Import AlertDialogHeader
    AlertDialogBody, // Import AlertDialogBody
    AlertDialogFooter, // Import AlertDialogFooter
    Button, // Import Button
    useDisclosure // Import useDisclosure
} from '@chakra-ui/react';
import {
    FaHandshake,
    FaSpinner,
    FaMoneyBillWave,
    FaCheckCircle, // Icon for Approve
    FaTimesCircle, // Icon for Reject
    FaWrench, // Icon untuk obeng (wrench)
    FaTrash // Icon untuk sampah (trash)
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Submission = () => {
    const { getAccessToken, isAuthenticated, getUserProfile } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [relocations, setRelocations] = useState([]);
    const [relocationAcceptedCount, setRelocationAcceptedCount] = useState(0);
    const [relocationInProcessCount, setRelocationInProcessCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleActionButtons, setVisibleActionButtons] = useState({});
    const [selectedRelocationId, setSelectedRelocationId] = useState(null); // State to hold ID for modal actions

    // Chakra UI Modal Disclosure hooks
    const { isOpen: isRejectModalOpen, onOpen: onRejectModalOpen, onClose: onRejectModalClose } = useDisclosure();
    const { isOpen: isApproveModalOpen, onOpen: onApproveModalOpen, onClose: onApproveModalClose } = useDisclosure();
    const { isOpen: isCancelModalOpen, onOpen: onCancelModalOpen, onClose: onCancelModalClose } = useDisclosure();

    const cancelRef = React.useRef(); // Ref for AlertDialog's initialFocusRef

    const userProfileData = getUserProfile();
    const currentUserBranchId = userProfileData?.branch_id?.id; // Get current user's branch ID

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
            const fetchedRelocations = result.data?.relocations || [];

            setRelocations(fetchedRelocations);

            const acceptedCount = fetchedRelocations.filter(item => item.state === 'approved').length;
            const inProcessCount = fetchedRelocations.filter(item => item.state === 'in_progress').length;

            setRelocationAcceptedCount(acceptedCount);
            setRelocationInProcessCount(inProcessCount);

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
    }, [isAuthenticated, getAccessToken, getUserProfile, toast]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchRelocationData();
        }
    }, [isAuthenticated, fetchRelocationData]);

    const handleCardClick = (relocationId) => {
        navigate(`/action/cba-simulation/edit/${relocationId}`);
    };

    const toggleActionButtons = (relocationId) => {
        setVisibleActionButtons(prev => ({
            ...prev,
            [relocationId]: !prev[relocationId]
        }));
    };

    // Functions to trigger modals
    const triggerRejectModal = (id) => {
        setSelectedRelocationId(id);
        onRejectModalOpen();
    };

    const triggerApproveModal = (id) => {
        setSelectedRelocationId(id);
        onApproveModalOpen();
    };

    const triggerCancelModal = (id) => {
        setSelectedRelocationId(id);
        onCancelModalOpen();
    };

    // Function to handle Reject Relocation after confirmation
    const handleRejectRelocationConfirmed = async () => {
        const relocationId = selectedRelocationId;
        if (!relocationId) return;

        onRejectModalClose(); // Close modal immediately

        setIsLoading(true);
        try {
            const token = getAccessToken();
            const response = await fetch(`${BASE_URL}/reject-relocation/${relocationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal menolak relokasi: ${response.status}`);
            }

            toast({
                title: "Relokasi Ditolak",
                description: `Relokasi RS${relocationId} berhasil ditolak.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            fetchRelocationData();
        } catch (err) {
            console.error("Error rejecting relocation:", err);
            toast({
                title: "Gagal Menolak",
                description: err.message || "Terjadi kesalahan saat menolak relokasi.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle Approve Relocation after confirmation
    const handleApproveRelocationConfirmed = async () => {
        const relocationId = selectedRelocationId;
        if (!relocationId) return;

        onApproveModalClose(); // Close modal immediately

        setIsLoading(true);
        try {
            const token = getAccessToken();
            const response = await fetch(`${BASE_URL}/approve-relocation/${relocationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Gagal menyetujui relokasi: ${response.status}`);
            }

            toast({
                title: "Relokasi Disetujui",
                description: `Relokasi RS${relocationId} berhasil disetujui.`,
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            fetchRelocationData();
        } catch (err) {
            console.error("Error approving relocation:", err);
            toast({
                title: "Gagal Menyetujui",
                description: err.message || "Terjadi kesalahan saat menyetujui relokasi.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle Cancel Relocation after confirmation
    const handleCancelRelocationConfirmed = async () => {
        const relocationId = selectedRelocationId;
        if (!relocationId) return;

        onCancelModalClose(); // Close modal immediately

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
            });
        } finally {
            setIsLoading(false);
        }
    };


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
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
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
                        {relocations.length > 0 ? (
                            relocations.map((item) => (
                                <Card
                                    key={item.id}
                                    boxShadow="sm"
                                    borderRadius="25px"
                                    bg="white"
                                    cursor="pointer"
                                    _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
                                    onClick={() => handleCardClick(item.id)}
                                >
                                    <CardBody p={4}>
                                        <HStack alignItems="center" justifyContent="space-between" width="full">
                                            {/* Left Section: Icon and IDs */}
                                            <HStack alignItems="center" flexShrink={0}>
                                                <Card
                                                    bg="purple.100"
                                                    borderRadius="25px"
                                                    p={3}
                                                    mr={4}
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    <Icon as={FaMoneyBillWave} boxSize={6} color="purple.600" />
                                                </Card>

                                                <VStack align="flex-start" spacing={0.5}>
                                                    <Text fontWeight="semibold" fontSize="md">{`RS${item.id}`}</Text>
                                                    <Text fontSize="sm" color="gray.600">{`ATM ${item.atm_id?.code || 'N/A'}`}</Text>
                                                </VStack>
                                            </HStack>

                                            {/* Middle Section: Selected Location and Address */}
                                            <VStack align="flex-start" spacing={0.5} flex="1" mx={4}>
                                                <Text fontSize="sm" color="gray.700">Selected Location</Text>
                                                <Text fontSize="md" fontWeight="normal" color="gray.800">{item.atm_id?.address || 'Alamat Tidak Tersedia'}</Text>
                                            </VStack>

                                            {/* Right Section: Score, Action Icon (Wrench) / Conditional Buttons */}
                                            <HStack alignItems="center" spacing={4}>
                                                {/* Score */}
                                                <Box textAlign="right" minW="70px">
                                                    <Text fontSize="sm" color="gray.600">Score</Text>
                                                    <Text fontSize="lg" fontWeight="bold" color="green.500">
                                                        70% {/* Placeholder, karena API tidak menyediakan skor */}
                                                    </Text>
                                                </Box>

                                                {/* Action Icon (Wrench) or Conditional Action Buttons */}
                                                {item.state === 'in_progress' && (
                                                    <>
                                                        {/* Tampilkan ikon obeng jika tombol aksi tidak terlihat */}
                                                        {!visibleActionButtons[item.id] && (
                                                            <IconButton
                                                                icon={<FaWrench />}
                                                                aria-label="Toggle Actions"
                                                                colorScheme="gray"
                                                                variant="ghost"
                                                                isRound
                                                                onClick={(e) => { e.stopPropagation(); toggleActionButtons(item.id); }}
                                                            />
                                                        )}

                                                        {/* Tampilkan tombol Reject/Approve jika branch_id 0 dan tombol aksi terlihat */}
                                                        {currentUserBranchId === 0 && visibleActionButtons[item.id] && (
                                                            <HStack spacing={2}>
                                                                <IconButton
                                                                    icon={<FaTimesCircle />}
                                                                    aria-label="Reject Relocation"
                                                                    colorScheme="red"
                                                                    variant="ghost"
                                                                    isRound
                                                                    onClick={(e) => { e.stopPropagation(); triggerRejectModal(item.id); }}
                                                                />
                                                                <IconButton
                                                                    icon={<FaCheckCircle />}
                                                                    aria-label="Approve Relocation"
                                                                    colorScheme="green"
                                                                    variant="ghost"
                                                                    isRound
                                                                    onClick={(e) => { e.stopPropagation(); triggerApproveModal(item.id); }}
                                                                />
                                                            </HStack>
                                                        )}

                                                        {/* Tampilkan tombol Sampah jika branch_id BUKAN 0 dan tombol aksi terlihat */}
                                                        {currentUserBranchId !== 0 && visibleActionButtons[item.id] && (
                                                            <IconButton
                                                                icon={<FaTrash />}
                                                                aria-label="Cancel Relocation"
                                                                colorScheme="red"
                                                                variant="ghost"
                                                                isRound
                                                                onClick={(e) => { e.stopPropagation(); triggerCancelModal(item.id); }}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </HStack>
                                        </HStack>
                                    </CardBody>
                                </Card>
                            ))
                        ) : (
                            <Text textAlign="center" color="gray.500" py={10}>
                                Tidak ada data relokasi yang ditemukan.
                            </Text>
                        )}
                    </VStack>
                </Box>
            </VStack>

            {/* Reject Confirmation AlertDialog */}
            <AlertDialog
                isOpen={isRejectModalOpen}
                leastDestructiveRef={cancelRef}
                onClose={onRejectModalClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="lg">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Tolak Relokasi
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Apakah Anda yakin ingin menolak relokasi RS{selectedRelocationId} ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onRejectModalClose}>
                                Tidak
                            </Button>
                            <Button colorScheme="red" onClick={handleRejectRelocationConfirmed} ml={3}>
                                Ya, Tolak
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Approve Confirmation AlertDialog */}
            <AlertDialog
                isOpen={isApproveModalOpen}
                leastDestructiveRef={cancelRef}
                onClose={onApproveModalClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="lg">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Setujui Relokasi
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Apakah Anda yakin ingin menyetujui relokasi RS{selectedRelocationId} ini?
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onApproveModalClose}>
                                Tidak
                            </Button>
                            <Button colorScheme="green" onClick={handleApproveRelocationConfirmed} ml={3}>
                                Ya, Setujui
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

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
                            Apakah Anda yakin ingin membatalkan relokasi RS{selectedRelocationId} ini? Tindakan ini akan menghapus pengajuan.
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

export default Submission;
