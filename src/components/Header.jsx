// src/Header.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  HStack,
  Select, // Tetap import untuk referensi atau jika diperlukan di masa depan, tapi tidak akan digunakan untuk pemilihan periode
  VStack,
  Spinner,
  Icon,
  Button, // Import Button
  Modal, // Import Modal
  ModalOverlay, // Import ModalOverlay
  ModalContent, // Import ModalContent
  ModalBody, // Import ModalBody
  ModalCloseButton, // Import ModalCloseButton
  useDisclosure, // Import useDisclosure hook
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth dari AuthContext

const Header = ({ selectedPeriod, setSelectedPeriod }) => {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Hook untuk mengelola state modal

  // Dapatkan fungsi getAccessToken dan getUserProfile dari AuthContext
  const { getAccessToken, getUserProfile } = useAuth(); 
  const userProfile = getUserProfile(); // Ambil userProfile dari context

  const [totalAtm, setTotalAtm] = useState(0);
  const [totalCrm, setTotalCrm] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState(null);

  // Hapus AUTH_TOKEN yang hardcode, karena sudah diambil dari useAuth
  // const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJyb2xlIjoidXNlciIsImlzcyI6InRoZS1pc3N1ZXIiLCJleHAiOjE3NTAxNTcyMzQsImlhdCI6MTc1MDA3MDgzNH0.BarOaQZuvqHvoxWNbPCZ2Co2_GZBAnBLyX3IcQKTT6Q'
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Gunakan BASE_URL dari env var

  const commonHeaders = useMemo(() => {
    const token = getAccessToken(); // Ambil token dari AuthContext
    return {
      'Authorization': `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true", // Header ngrok
      'Content-Type': 'application/json',
    };
  }, [getAccessToken]); // getAccessToken adalah dependensi karena nilainya (token) bisa berubah

  const periods = useMemo(() => [
    "Juli - September, 2024",
    "Oktober - Desember, 2024",
    "Januari - Maret, 2025",
    "April - Juni, 2025"
  ], []);

  const getPeriodId = (periodString) => {
    switch (periodString) {
      case "Juli - September, 2024": return 1;
      case "Oktober - Desember, 2024": return 2;
      case "Januari - Maret, 2025": return 3;
      case "April - Juni, 2025": return 4;
      default: return 1; // Default ke Q1 2024 jika tidak ada yang cocok
    }
  };

  const currentPeriodId = useMemo(() => getPeriodId(selectedPeriod), [selectedPeriod]);

  // Dapatkan branch_id dari userProfile. Jika null/undefined, set ke 0 sebagai default
  const branchId = useMemo(() => userProfile?.branch_id?.id ?? 0, [userProfile]);

  useEffect(() => {
    const fetchSummaryData = async () => {
      setLoadingSummary(true);
      setErrorSummary(null);
      try {
        // Tambahkan branch_id ke URL permintaan API
        const response = await axios.get(`${BASE_URL}/summary-by-period?period_id=${currentPeriodId}&branch_id=${branchId}`, { headers: commonHeaders });

        if (response.data && response.data.data) {
          const { total_atm, total_crm } = response.data.data;
          setTotalAtm(total_atm || 0);
          setTotalCrm(total_crm || 0);
          setTotalAll((total_atm || 0) + (total_crm || 0));
        } else {
          throw new Error('Summary data format unexpected. Missing "data" object or its properties.');
        }
      } catch (e) {
        console.error("Failed to fetch summary data:", e);
        if (e.response) {
          console.error("Server Response Error:", e.response.status, e.response.data);
          setErrorSummary(`Gagal memuat data ringkasan: Server merespons dengan status ${e.response.status}. Pesan: ${e.response.data.message || JSON.stringify(e.response.data)}`);
        } else if (e.request) {
          console.error("Tidak ada respons diterima:", e.request);
          setErrorSummary("Gagal memuat data ringkasan: Tidak ada respons dari server. Periksa koneksi jaringan.");
        } else {
          setErrorSummary(`Gagal memuat data ringkasan: ${e.message}`);
        }
        setTotalAtm(0);
        setTotalCrm(0);
        setTotalAll(0);
      } finally {
        setLoadingSummary(false);
      }
    };

    // PENTING: Panggil fetchSummaryData hanya jika commonHeaders siap dan branchId valid
    // Mengubah kondisi pengecekan branchId agar memperlakukan 0 sebagai nilai valid
    if (commonHeaders.Authorization && commonHeaders.Authorization !== 'Bearer null' && (branchId !== null && branchId !== undefined)) {
        fetchSummaryData();
    } else if (branchId === null || branchId === undefined) { // Kondisi lebih spesifik jika branchId benar-benar null/undefined
      setLoadingSummary(false);
      setErrorSummary("Branch ID not available or invalid for fetching summary data.");
    }
    else { // Fallback jika token tidak tersedia
      setLoadingSummary(false); 
      setErrorSummary("Authentication token not available. Please log in.");
    }
  }, [currentPeriodId, BASE_URL, commonHeaders, branchId]); // Tambahkan branchId ke dependency array

  const getPageTitle = () => {
    if (location.pathname.includes('analytics/trx-fee')) return 'Performance Reports';
    if (location.pathname.includes('analytics/map-view')) return 'Map View Analytics';
    if (location.pathname.includes('master')) return 'Master';
    if (location.pathname.includes('analytics/cba')) return 'Cost Benefit Analysis';
    if (location.pathname.includes('action/cba-simulation')) return 'Relocation Simulation';
    if (location.pathname.includes('action/submission')) return 'Relocation Submission';
    if (location.pathname.includes('atm-crm')) return 'ATM/CRM';
    return 'Dashboard';
  };

  // Fungsi untuk memilih periode dari modal
  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    onClose(); // Tutup modal setelah memilih
  };

  return (
    <Box bg="blue.50" color="black" px={6} py={10} h="60px">
      <Flex justify="space-between" align="center" h="full">
        {/* Judul halaman di sebelah kiri */}
        <VStack align="flex-start" spacing={0} pt={5}>
          <Text fontSize="2xl" fontWeight="extrabold" color="black">
            {getPageTitle()}
          </Text>
          {/* Tombol yang menggantikan dropdown Select */}
          <Button
            onClick={onOpen} // Buka modal saat diklik
            rightIcon={<ChevronDownIcon />}
            variant="unstyled" // Tanpa styling bawaan agar sesuai desain
            color="black"
            fontWeight="medium"
            width="220px" // Lebar tetap 220px
            textAlign="left" // Teks rata kiri
            px={0} // Hapus padding horizontal bawaan button
            _hover={{
              color: 'blue.600', // Efek hover untuk teks
            }}
            _active={{
              color: 'blue.700', // Efek active untuk teks
            }}
            _focus={{
              boxShadow: 'none', // Menghilangkan outline fokus bawaan
            }}
          >
            {selectedPeriod}
          </Button>
        </VStack>

        {/* Modal untuk pemilihan periode */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(5px)" /> {/* Efek gelap dan blur di belakang */}
          <ModalContent borderRadius="lg" bg="white" p={4} boxShadow="xl" maxW="md">
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={2} align="stretch">
                <Text fontSize="lg" fontWeight="bold" mb={2}>Pilih Periode</Text>
                {periods.map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? "solid" : "ghost"} // Highlight yang dipilih
                    colorScheme={selectedPeriod === period ? "blue" : "gray"}
                    onClick={() => handlePeriodSelect(period)}
                    justifyContent="flex-start" // Teks rata kiri
                    py={6} // Padding vertikal lebih besar
                    borderRadius="md" // Sudut membulat
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "md"
                    }}
                    _active={{
                      transform: "translateY(0px)",
                    }}
                    _focus={{
                      boxShadow: 'none', // Menghilangkan outline fokus bawaan
                    }}
                  >
                    {period}
                  </Button>
                ))}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Bagian informasi ATM dan CRM */}
        <HStack spacing={6}>
          {loadingSummary ? (
            <Flex justifyContent="center" alignItems="center" height="full">
              <Spinner size="md" color="blue.500" />
            </Flex>
          ) : errorSummary ? (
            <Text color="red.500" fontSize="sm">Error: {errorSummary.split(':')[0]}</Text>
          ) : (
            <>
              {/* Informasi ATM */}
              <Box textAlign="center">
                <HStack spacing={5} align="baseline">
                  <Text fontSize="2xl" mt="20px" fontWeight="bold" color="black">
                    {totalAtm.toLocaleString('id-ID')}
                  </Text>
                  <Box bg="yellow.400" color="white" px={3} py={1} borderRadius="xl" fontSize="xs" fontWeight="semibold">
                    Unit
                  </Box>
                </HStack>
                <Text textAlign="left" fontSize="sm" color="gray.700">ATM</Text>
              </Box>

              {/* Informasi CRM */}
              <Box textAlign="center">
                <HStack spacing={5} align="baseline">
                  <Text mt="20px" fontSize="2xl" fontWeight="bold" color="black">
                    {totalCrm.toLocaleString('id-ID')}
                  </Text>
                  <Box bg="yellow.400" color="white" px={3} py={1} borderRadius="xl" fontSize="xs" fontWeight="semibold">
                    Unit
                  </Box>
                </HStack>
                <Text textAlign="left" fontSize="sm" color="gray.700">CRM</Text>
              </Box>

              {/* Informasi TOTAL */}
              <Box textAlign="center">
                <HStack spacing={5} align="baseline">
                  <Text fontSize="2xl" mt="20px" fontWeight="bold" color="black">
                    {totalAll.toLocaleString('id-ID')}
                  </Text>
                  <Box bg="blue.600" color="white" px={3} py={1} borderRadius="xl" fontSize="xs" fontWeight="semibold">
                    Unit
                  </Box>
                </HStack>
                <Text textAlign="left" fontSize="sm" color="gray.700">TOTAL</Text>
              </Box>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
