// src/components/Master/AtmDetailModal.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Spinner,
  Text,
  VStack,
  HStack,
  Box,
  SimpleGrid,
  Divider,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getTierStyles } from '../../assets/tierColor'; // Pastikan path ini benar

const AtmDetailModal = ({ isOpen, onClose, atmId }) => {
  const [atmDetail, setAtmDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getAccessToken } = useAuth();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const commonHeaders = useMemo(() => {
    const token = getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
      'Content-Type': 'application/json',
    };
  }, [getAccessToken]);

  useEffect(() => {
    const fetchAtmDetail = async () => {
      if (!atmId) {
        setAtmDetail(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${baseUrl}/atms/${atmId}`, { headers: commonHeaders });
        ("Detail ATM Response:", response.data);
        if (response.data && response.data.data) {
          setAtmDetail(response.data.data);
        } else {
          setError("Data detail ATM tidak ditemukan.");
          setAtmDetail(null);
        }
      } catch (err) {
        console.error("Error fetching ATM detail:", err);
        setError(`Gagal memuat detail ATM: ${err.message}`);
        setAtmDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAtmDetail();
  }, [atmId, baseUrl, commonHeaders]);

  // Default styles jika tier tidak ada atau tidak valid
  const defaultStyles = getTierStyles('default');
//   const cardBg = defaultStyles.cardBg;
//   const textColor = defaultStyles.textColor;

  // Mendapatkan gaya tier jika atmDetail tersedia
  const tierStyles = atmDetail?.tier ? getTierStyles(atmDetail.tier) : defaultStyles;

  

// Fungsi untuk memilih denom berdasarkan tipe mesin
const [randomDenom, setRandomDenom] = useState('Rp. 100.000');
useEffect(() => {
    if (atmDetail?.type?.toLowerCase() === 'crm') {
        setRandomDenom('Rp. 100.000 & Rp. 50.000');
    } else {
        setRandomDenom(Math.random() < 0.5 ? 'Rp. 100.000' : 'Rp. 50.000');
    }
    // atmDetail bisa berubah setelah fetch selesai
}, [atmId, atmDetail]);

return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="25px" overflow="hidden">
            <ModalHeader bg={tierStyles.cardBg} color={tierStyles.textColor} pb={2}>
                <HStack justifyContent="space-between" alignItems="center">
                    <Text>Detail ATM</Text>
                    <ModalCloseButton color={tierStyles.textColor} />
                </HStack>
            </ModalHeader>
            <ModalBody p={6} bg="white">
                {loading && (
                    <VStack py={10}>
                        <Spinner size="lg" color="blue.500" />
                        <Text>Memuat detail ATM...</Text>
                    </VStack>
                )}

                {error && (
                    <Alert status="error">
                        <AlertIcon />
                        {error}
                    </Alert>
                )}

                {!loading && !error && atmDetail && (
                    <VStack spacing={4} align="stretch">
                        <HStack justifyContent="space-between" alignItems="flex-start">
                            <VStack align="flex-start" spacing={0}>
                                <Text fontSize="2xl" fontWeight="extrabold" color="blue.700">{atmDetail.code}</Text>
                                <Text fontSize="xl" fontWeight="bold" color="gray.800">{atmDetail.name}</Text>
                            </VStack>
                           
                        </HStack>

                        <Divider />

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                            <VStack align="flex-start" spacing={1}>
                                <Text fontWeight="semibold" color="gray.700">Type:</Text>
                                <Text>{atmDetail.type || 'N/A'}</Text>
                                <Text fontWeight="semibold" color="gray.700">Brand:</Text>
                                <Text>{atmDetail.brand || 'N/A'}</Text>
                                <Text fontWeight="semibold" color="gray.700">Denom : </Text>
                                <Text>{randomDenom}</Text>
                                <Text fontWeight="semibold" color="gray.700">Address:</Text>
                                <Text>{atmDetail.address || 'N/A'}</Text>
                                <Text fontWeight="semibold" color="gray.700">Latitude:</Text>
                                <Text>{atmDetail.latitude || 'N/A'}</Text>
                                <Text fontWeight="semibold" color="gray.700">Longitude:</Text>
                                <Text>{atmDetail.longitude || 'N/A'}</Text>
                            </VStack>

                            <VStack align="flex-start" spacing={1}>
                                <Text fontWeight="semibold" color="gray.700">Kanwil:</Text>
                                <Text>{atmDetail.branch_id?.parent_id?.name || 'N/A'}</Text>
                                <Text fontWeight="semibold" color="gray.700">Kantor Cabang:</Text>
                                <Text>{atmDetail.branch_id?.name || 'N/A'}</Text>
                                <Text fontWeight="semibold" color="gray.700">Kode Cabang:</Text>
                                <Text>{atmDetail.branch_id?.branch_code || 'N/A'}</Text>
                                <Text fontWeight="semibold" color="gray.700">Electricity Cost:</Text>
                                <Text>{atmDetail.electricity_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'N/A'}</Text>
                                <Text fontWeight="semibold" color="gray.700">Electronic Cost:</Text>
                                <Text>{atmDetail.electronic_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'N/A'}</Text>
                                <Text fontWeight="semibold" color="gray.700">Machine Cost:</Text>
                                <Text>{atmDetail.machine_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'N/A'}</Text>
                                <Text fontWeight="semibold" color="gray.700">Rent Cost:</Text>
                                <Text>{atmDetail.rent_cost?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'N/A'}</Text>
                            </VStack>
                        </SimpleGrid>
                        {/* Tambahkan informasi lain sesuai kebutuhan */}
                    </VStack>
                )}
            </ModalBody>
            <ModalFooter>
                <Button onClick={onClose}>Close</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>
);
};

export default AtmDetailModal;