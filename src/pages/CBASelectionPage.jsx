// src/pages/CBASelectionPage.jsx

import {
    Box,
    Heading,
    Text,
    VStack,
    Input,
    Button,
    FormControl,
    FormLabel,
    useToast,
    Card,
    CardBody,
    Spinner,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const CBASelectionPage = () => {
    const [atmCodeInput, setAtmCodeInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();
    const { getAccessToken } = useAuth();

    const handleAnalyzeCBA = async () => {
        const trimmedInput = atmCodeInput.trim();
        if (!trimmedInput) {
            toast({
                title: "Input Kosong",
                description: "Mohon masukkan Kode Mesin ATM/CRM.",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsLoading(true);

        const token = getAccessToken();
        if (!token) {
            toast({
                title: "Otentikasi Gagal",
                description: "Tidak ada token akses. Mohon login kembali.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setIsLoading(false);
            return;
        }

        try {
            // Mengambil semua ATM dalam satu permintaan dengan limit yang sangat besar
            // Asumsi: Backend mendukung parameter 'limit'
            const apiUrl = `${BASE_URL}/atms?limit=99999`; // Mengatur limit yang sangat besar
            (`[CBASelectionPage] Mencari ATM dengan API: ${apiUrl}`);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'ngrok-skip-browser-warning': 'true',
                },
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengambil data ATM');
            }

            // Pastikan data.data dan data.data.atms ada dan merupakan array
            if (data.data && Array.isArray(data.data.atms)) {
                // Cari ATM secara manual di frontend berdasarkan code
                const foundAtm = data.data.atms.find(atm => atm.code.toLowerCase() === trimmedInput.toLowerCase());

                if (foundAtm) {
                    (`[CBASelectionPage] ATM ditemukan:`, foundAtm);
                    navigate(`/analytics/cba/${foundAtm.id}`);
                } else {
                    (`[CBASelectionPage] Kode "${trimmedInput}" tidak ditemukan setelah memuat semua ATM.`);
                    toast({
                        title: "Kode Mesin ATM/CRM Tidak Ditemukan",
                        description: `Kode "${trimmedInput}" tidak ada dalam daftar ATM.`,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } else {
                console.error("[CBASelectionPage] Respon API tidak sesuai format yang diharapkan:", data);
                toast({
                    title: "Kesalahan Data",
                    description: "Respon API tidak sesuai format yang diharapkan (tidak ada daftar ATM).",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error("Error fetching ATM by code:", error);
            toast({
                title: "Terjadi Kesalahan",
                description: `Gagal mencari ATM: ${error.message}`,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box p={6} bg="blue.50" minH="100vh">
            <VStack spacing={6} align="center" justify="center" minH="calc(100vh - 120px)">
                <Card p={8} bg="white" shadow="lg" borderRadius="25px" maxW="1000px" width="1000px">
                    <CardBody p={0}>
                        <VStack spacing={4} align="stretch">
                            <Heading size="lg" color="gray.700" textAlign="center">
                                Cost Benefit Analysis (CBA)
                            </Heading>
                            <Text fontSize="md" color="gray.600" textAlign="center">
                                Masukkan Kode Mesin ATM atau CRM untuk melihat analisis biaya dan manfaatnya secara terperinci.
                            </Text>

                            <FormControl>
                                <FormLabel htmlFor="atmCode" fontSize="sm" fontWeight="medium">Kode Mesin ATM/CRM</FormLabel>
                                <Input
                                    id="atmCode"
                                    placeholder="Contoh: A007 atau B812"
                                    value={atmCodeInput}
                                    onChange={(e) => setAtmCodeInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAnalyzeCBA();
                                        }
                                    }}
                                    size="lg"
                                    bg="white"
                                    borderRadius="25px"
                                    boxShadow="sm"
                                />
                            </FormControl>

                            <Button
                                colorScheme="blue"
                                size="lg"
                                onClick={handleAnalyzeCBA}
                                borderRadius={25}
                                width="full"
                                isLoading={isLoading}
                                loadingText="Mencari ATM..."
                            >
                                {isLoading ? <Spinner size="sm" /> : "Lihat Analisis CBA"}
                            </Button>
                        </VStack>
                    </CardBody>
                </Card>
            </VStack>
        </Box>
    );
};

export default CBASelectionPage;