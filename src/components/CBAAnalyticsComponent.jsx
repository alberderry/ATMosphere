// src/components/CBAAnalyticsComponent.jsx

import {
    Box,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Text,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    VStack,
    HStack,
    Divider,
    Badge,
    Spinner, // Import Spinner
    Center,  // Import Center
    useToast // Import useToast
} from "@chakra-ui/react"
import { useParams } from 'react-router-dom'; // Import useParams
import { useEffect, useState } from 'react'; // Import useEffect, useState
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper function untuk format mata uang Rupiah
const formatRupiah = (amount) => {
    if (typeof amount !== 'number') return '-';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

// Helper function untuk format angka dengan pemisah ribuan
const formatNumber = (num) => {
    if (typeof num !== 'number') return '-';
    return new Intl.NumberFormat('id-ID').format(num)
}

// Mengubah fungsi getPeriodId untuk memetakan string periode ke ID numerik
const getPeriodId = (periodString) => {
    switch (periodString) {
        case 'Juli - September, 2024': // Ini harus sesuai dengan string yang Anda set di App.jsx
            return 1;
        case 'Oktober - Desember, 2024':
            return 2;
        case 'Januari - Maret, 2025':
            return 3;
        case 'April - Juni, 2025':
            return 4;
        // Tambahkan case lain jika ada periode lain
        default:
                        return 1; // Default ke periode 3 jika tidak cocok
    }
};


// Sekarang CBAAnalyticsComponent akan menerima selectedPeriod sebagai prop
const CBAAnalyticsComponent = ({ selectedPeriod }) => { // Menerima selectedPeriod sebagai prop
    const { atmId } = useParams(); // Ambil atmId dari URL
    const [cbaData, setCbaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();
    const { getAccessToken } = useAuth();

    // Gunakan useEffect untuk fetching data saat komponen dimuat atau atmId/selectedPeriod berubah
    useEffect(() => {
        const fetchCBAData = async () => {
            setLoading(true);
            setCbaData(null); // Reset data sebelum fetch baru

            const token = getAccessToken();
            if (!token) {
                toast({
                    title: "Otentikasi Gagal",
                    description: "Tidak ada token akses. Mohon login kembali.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                setLoading(false);
                return;
            }

            const periodId = getPeriodId(selectedPeriod); // Gunakan prop selectedPeriod
            
            ("[CBAAnalyticsComponent] Mulai fetching data...");
            ("  ATM ID (dari URL):", atmId);
            ("  Selected Period String (dari prop):", selectedPeriod);
            ("  Mapped Period ID:", periodId);

            try {
                const apiUrl = `${BASE_URL}/atm-cba?period_id=${periodId}&atm_id=${atmId}`;
                ("[CBAAnalyticsComponent] API URL yang akan dipanggil:", apiUrl);

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'ngrok-skip-browser-warning': 'true',
                    },
                });
                
                const data = await response.json();
                ("[CBAAnalyticsComponent] Raw API Response:", data); // Log respons mentah dari API

                if (!response.ok) {
                    console.error("[CBAAnalyticsComponent] API Error Response (status non-OK):", data);
                    throw new Error(data.message || 'Gagal mengambil data CBA');
                }

                if (data.data) {
                    setCbaData(data.data);
                    ("[CBAAnalyticsComponent] Data CBA berhasil disimpan ke state:", data.data);
                } else {
                                        toast({
                        title: "Data CBA Tidak Ditemukan",
                        description: `Data CBA untuk ATM dengan ID "${atmId}" pada periode "${selectedPeriod}" tidak ditemukan.`,
                        status: "info",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } catch (error) {
                console.error("[CBAAnalyticsComponent] Error fetching CBA data:", error);
                toast({
                    title: "Terjadi Kesalahan",
                    description: `Gagal mengambil data CBA: ${error.message}`,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                setCbaData(null);
            } finally {
                setLoading(false);
                ("[CBAAnalyticsComponent] Fetching selesai. Loading diset ke false.");
            }
        };

        // Hanya fetch jika atmId dan selectedPeriod keduanya tersedia
        if (atmId && selectedPeriod) {
            fetchCBAData();
        } else {
            ("[CBAAnalyticsComponent] Skipping fetch: atmId atau selectedPeriod belum tersedia.", { atmId, selectedPeriod });
            setLoading(false); // Pastikan loading selesai meskipun tidak ada data
        }
    }, [atmId, selectedPeriod, getAccessToken, toast]); // Tambahkan selectedPeriod ke dependensi useEffect

    // Tampilkan spinner saat loading
    if (loading) {
        return (
            <Center h="100vh">
                <VStack>
                    <Spinner size="xl" color="blue.500" />
                    <Text mt={4}>Memuat analisis CBA...</Text>
                </VStack>
            </Center>
        );
    }

    // Ini adalah cek kunci!
    if (!cbaData) {
        ("[CBAAnalyticsComponent] cbaData is falsy after loading, showing 'Data tidak ditemukan'. Current cbaData:", cbaData);
        return (
            <Box p={6}>
                <Text fontSize="xl" color="gray.500" textAlign="center">
                    Data analisis CBA tidak ditemukan.
                </Text>
            </Box>
        )
    }

    ("[CBAAnalyticsComponent] cbaData is valid, rendering analytics.", cbaData);

    // Ekstrak data dari cbaData (ini tetap sama seperti sebelumnya)
    const {
        atm_id,
        fee,
        volume_trx,
        nominal_trx,
        tier,
        electricity_cost,
        electronic_cost,
        machine_cost,
        rent_cost,
        total_cost,
        net_benefit
    } = cbaData;

    // Helper untuk mendapatkan warna tier
    const getTierColor = (tierValue) => {
        switch (tierValue) {
            case 1: return 'blue';
            case 2: return 'green';
            case 3: return 'yellow';
            case 4: return 'red';
            case 0: return 'gray'; // Untuk 'TIDAK DIHITUNG'
            default: return 'gray';
        }
    }

    return (
        <Box p={6}>
            <VStack spacing={6} align="stretch">
                <Text fontSize="2xl" fontWeight="bold">
                    Analisis Biaya-Manfaat (CBA) untuk {atm_id?.name || 'ATM Tidak Dikenal'}
                </Text>

                {/* Informasi Umum ATM */}
                <Card bg="white" shadow="sm" borderRadius="25px">
                    <CardHeader pb={2}>
                        <HStack justify="space-between" align="center">
                            <Heading size="md" color="gray.700">
                                Informasi Mesin
                            </Heading>
                            <HStack spacing={2}>
                                <Badge 
                                    colorScheme={getTierColor(tier)} 
                                    fontSize="sm" 
                                    px={3} 
                                    py={1} 
                                    borderRadius="md"
                                >
                                    {tier !== null && tier !== undefined ? `TIER ${tier}` : 'TIDAK DIHITUNG'}
                                </Badge>
                            </HStack>
                        </HStack>
                    </CardHeader>
                    <CardBody pt={0}>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                            <Box>
                                <Text fontWeight="semibold" fontSize="sm" color="gray.600">ID Mesin:</Text>
                                <Text fontSize="md">{atm_id?.code || '-'}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="semibold" fontSize="sm" color="gray.600">Tipe:</Text>
                                <Text fontSize="md">{atm_id?.type || '-'}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="semibold" fontSize="sm" color="gray.600">Nama Lokasi ATM:</Text>
                                <Text fontSize="md">{atm_id?.name || '-'}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="semibold" fontSize="sm" color="gray.600">Alamat:</Text>
                                <Text fontSize="md">{atm_id?.address || '-'}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="semibold" fontSize="sm" color="gray.600">Cabang Induk:</Text>
                                <Text fontSize="md">{atm_id?.branch_id?.name || '-'}</Text>
                            </Box>
                            <Box>
                                <Text fontWeight="semibold" fontSize="sm" color="gray.600">Kanwil:</Text>
                                <Text fontSize="md">{atm_id?.branch_id?.parent_id?.name || '-'}</Text>
                            </Box>
                        </SimpleGrid>
                    </CardBody>
                </Card>

                {/* Bagian Biaya (Cost) */}
                <Card bg="white" shadow="sm" borderRadius="25px">
                    <CardHeader pb={2}>
                        <Heading size="md" color="red.600">
                            Biaya (Cost)
                        </Heading>
                        <Text fontSize="sm" color="gray.500" mt={1}>
                            Estimasi biaya operasional bulanan
                        </Text>
                    </CardHeader>
                    <CardBody pt={0}>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                            <Stat>
                                <StatLabel fontSize="sm">Biaya Mesin</StatLabel>
                                <StatNumber fontSize="xl">{formatRupiah(machine_cost)}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel fontSize="sm">Biaya Sewa Tempat</StatLabel>
                                <StatNumber fontSize="xl">{formatRupiah(rent_cost)}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel fontSize="sm">Biaya Listrik</StatLabel>
                                <StatNumber fontSize="xl">{formatRupiah(electricity_cost)}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel fontSize="sm">Biaya Elektronik</StatLabel>
                                <StatNumber fontSize="xl">{formatRupiah(electronic_cost)}</StatNumber>
                            </Stat>
                        </SimpleGrid>
                        <Divider my={4} />
                        <Stat>
                            <StatLabel fontSize="md" fontWeight="bold" color="red.700">Total Biaya</StatLabel>
                            <StatNumber fontSize="2xl" color="red.700">{formatRupiah(total_cost)}</StatNumber>
                        </Stat>
                    </CardBody>
                </Card>

                {/* Bagian Manfaat (Benefit) */}
                <Card bg="white" shadow="sm" borderRadius="25px">
                    <CardHeader pb={2}>
                        <Heading size="md" color="green.600">
                            Manfaat (Benefit)
                        </Heading>
                        <Text fontSize="sm" color="gray.500" mt={1}>
                            Estimasi manfaat bulanan dari operasional mesin
                        </Text>
                    </CardHeader>
                    <CardBody pt={0}>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <Stat>
                                <StatLabel fontSize="sm">Jumlah Transaksi</StatLabel>
                                <StatNumber fontSize="xl">{formatNumber(volume_trx)}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel fontSize="sm">Nominal Transaksi (Rp)</StatLabel>
                                <StatNumber fontSize="xl">{formatRupiah(nominal_trx)}</StatNumber>
                            </Stat>
                            <Stat>
                                <StatLabel fontSize="sm">Total Fee</StatLabel>
                                <StatNumber fontSize="xl">{formatRupiah(fee)}</StatNumber>
                            </Stat>
                        </SimpleGrid>
                    </CardBody>
                </Card>

                {/* Ringkasan Analisis */}
                <Card bg="white" shadow="sm" borderRadius="25px" mb="50px">
                    <CardHeader pb={2}>
                        <Heading size="md" color="blue.600">
                            Ringkasan Analisis CBA
                        </Heading>
                    </CardHeader>
                    <CardBody pt={0}>
                        <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                                <Text fontWeight="semibold">Total Biaya:</Text>
                                <Text color="red.700" fontWeight="bold">{formatRupiah(total_cost)}</Text>
                            </HStack>
                            <HStack justify="space-between">
                                <Text fontWeight="semibold">Total Manfaat (Fee):</Text>
                                <Text color="green.700" fontWeight="bold">{formatRupiah(fee)}</Text>
                            </HStack>
                            <Divider />
                            <HStack justify="space-between">
                                <Text fontWeight="bold" fontSize="lg">Net Benefit:</Text>
                                <Text fontSize="lg" fontWeight="bold" color={net_benefit >= 0 ? "green.700" : "red.700"}>
                                    {formatRupiah(net_benefit)}
                                </Text>
                            </HStack>
                        </VStack>
                    </CardBody>
                </Card>
            </VStack>
        </Box>
    )
}

export default CBAAnalyticsComponent;