import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  useToast,
  Flex,
  IconButton
} from '@chakra-ui/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AtmCard from './AtmCard';
import AtmDetailModal from './ATMDetailModal';
import AtmCreateModal from './AtmCreateModal';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// --- KONSTANTA UNTUK JUMLAH ITEM PER HALAMAN ---
const ITEMS_PER_PAGE = 10;

const Master = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [atms, setAtms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAtmForDetail, setSelectedAtmForDetail] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [setTotalItems] = useState(0);

  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure();
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure();
  const toast = useToast();

  const { getAccessToken, getUserProfile } = useAuth();
  const userProfile = getUserProfile();

  const commonHeaders = useMemo(() => {
    const token = getAccessToken();
    return {
      'Authorization': `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
      'Content-Type': 'application/json',
    };
  }, [getAccessToken]);

  const branchId = useMemo(() => userProfile?.branch_id?.id ?? 0, [userProfile]);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // Fungsi untuk mengambil data ATM dengan pagination
 const fetchAtms = useCallback(async (page = 1) => {
  setLoading(true);
  setError(null);

  if (branchId === null || branchId === undefined) {
    setError("Branch ID is not available or invalid. Please ensure you are logged in with a valid branch.");
    setLoading(false);
    return;
  }
  if (!commonHeaders.Authorization || commonHeaders.Authorization === 'Bearer null') {
    setError("Authentication token not available. Please log in.");
    setLoading(false);
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('branch_id', branchId);
    params.append('limit', ITEMS_PER_PAGE);

    if (searchTerm) {
      params.append('search', searchTerm);
    }
    if (filterType !== 'all') {
      params.append('type', filterType);
    }

    const response = await axios.get(
      `${baseUrl}/atms?${params.toString()}`, { headers: commonHeaders });

    if (response.data && response.data.data) {
      setAtms(response.data.data.atms || []);

      // --- PERBAIKI BAGIAN INI ---
      // Ambil total_row dari page_info
      const totalCountFromApi = response.data.data.page_info?.total_row || 0; 
      
      // Hitung total pages berdasarkan total_row dan ITEMS_PER_PAGE
      setTotalPages(Math.ceil(totalCountFromApi / ITEMS_PER_PAGE) || 1); 
      // --- AKHIR PERBAIKAN ---
      
      setCurrentPage(page);

      // --- DEBUGGING LOGS (Bisa dihapus setelah yakin berfungsi) ---
      ("API Response Data:", response.data.data);
      ("Total Row from API (from page_info):", totalCountFromApi); // Log baru
      ("Calculated Total Pages:", Math.ceil(totalCountFromApi / ITEMS_PER_PAGE) || 1);
      ("Current Page:", page);
      // -----------------------------------------------------------

    } else {
            setAtms([]);
      setTotalPages(1);
      setTotalItems(0);
    }
  } catch (err) {
    console.error("Error fetching ATM list:", err);
    if (err.response) {
      setError(`Failed to load ATM data: ${err.response.data.message || 'Server error'}`);
    } else if (err.request) {
      setError("Failed to load ATM data: No response from server. Check network connection.");
    } else {
      setError(`Failed to load ATM data: ${err.message}`);
    }
  } finally {
    setLoading(false);
  }
}, [branchId, baseUrl, commonHeaders, searchTerm, filterType]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAtms(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchAtms, searchTerm, filterType]);

  const handleCardClick = (atmId) => {
    setSelectedAtmForDetail(atmId);
    onDetailModalOpen();
  };

  const handleDeleteAtm = useCallback(async (atmId) => {
    if (!atmId) {
      toast({
        title: "Error",
        description: "ATM ID tidak valid untuk dihapus.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`${baseUrl}/atms/${atmId}`, { headers: commonHeaders });

      if (response.status === 200 || response.status === 204) {
        toast({
          title: "Berhasil",
          description: `ATM dengan ID ${atmId} berhasil dihapus.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchAtms(currentPage); // Ambil ulang data untuk halaman saat ini
      } else {
        const errorMessage = response.data?.message || `Gagal menghapus ATM. Status: ${response.status}`;
        toast({
          title: "Gagal Menghapus",
          description: errorMessage,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error deleting ATM:", err);
      toast({
        title: "Gagal Menghapus",
        description: `Terjadi kesalahan saat menghapus ATM: ${err.response?.data?.message || err.message}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [baseUrl, commonHeaders, fetchAtms, toast, currentPage]);

  const handleDetailModalClose = () => {
    setSelectedAtmForDetail(null);
    onDetailModalClose();
  };

  const handleCreateModalSuccess = () => {
    onCreateModalClose();
    fetchAtms(1); // Muat ulang data, kembali ke halaman 1 setelah pembuatan
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchAtms(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchAtms(currentPage + 1);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      fetchAtms(pageNumber);
    }
  };

  // Hasilkan nomor halaman untuk kontrol paginasi
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <Box p={6} bg="blue.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Kontainer untuk Search, Filter, dan Add New Button */}
        <HStack spacing={4} mb={4} justifyContent="space-between" width="full">
          {/* Box untuk Search Input */}
          <Box flex="1" maxW={{ base: "full", md: "400px" }} borderRadius="25px" overflow="hidden" bg="white" boxShadow="sm">
            <Input
              placeholder="Search by ATM Code, Name, Address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              border="none"
              _focus={{ boxShadow: "none", border: "none" }}
            />
          </Box>

          {/* Select Filter */}
          <Box flex="none" ml="auto">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              maxW="200px"
              borderRadius="25px"
            >
              <option value="all">All Types</option>
              <option value="ATM">ATM</option>
              <option value="CRM">CRM</option>
            </Select>
          </Box>
          {/* Add New Machine Button */}
          <Button colorScheme="blue" borderRadius="25px" onClick={onCreateModalOpen}>
            Add New Machine
          </Button>
        </HStack>

        {loading && (
          <HStack justifyContent="center" py={10}>
            <Spinner size="xl" color="blue.500" />
            <Text ml={3}>Loading ATM data...</Text>
          </HStack>
        )}

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {!loading && !error && atms.length === 0 && (
          <Alert status="info">
            <AlertIcon />
            No ATM data found for the selected criteria.
          </Alert>
        )}

        {/* Menampilkan jumlah total item (opsional, untuk mengatasi peringatan ESLint) */}
        

        {!loading && !error && atms.length > 0 && (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 2 }} spacing={6}>
            {atms.map((atm) => (
              <AtmCard
                key={atm.id}
                atm={atm}
                onCardClick={handleCardClick}
                onDelete={handleDeleteAtm}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Pagination Controls - Ditempatkan di luar VStack utama */}
      {/* --- KONDISI TOTALPAGES > 1 TELAH DIHAPUS DI SINI --- */}
      {!loading && !error && ( // Tombol paginasi akan selalu muncul selama tidak loading dan tidak ada error
        <Flex justifyContent="center" mt={8} pb={4} alignItems="center">
          {/* Tombol Previous */}
          <IconButton
            aria-label="Previous Page"
            icon={<FaChevronLeft />}
            onClick={handlePreviousPage}
            isDisabled={currentPage === 1}
            mr={2}
          />

          {/* Tombol Halaman */}
          {getPageNumbers().map((pageNumber) => (
            <Button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              colorScheme={currentPage === pageNumber ? 'blue' : 'gray'}
              variant={currentPage === pageNumber ? 'solid' : 'outline'}
              mx={1}
            >
              {pageNumber}
            </Button>
          ))}

          {/* Tombol Next */}
          <IconButton
            aria-label="Next Page"
            icon={<FaChevronRight />}
            onClick={handleNextPage}
            isDisabled={currentPage === totalPages}
            ml={2}
          />
        </Flex>
      )}

      {/* Render the detail modal */}
      <AtmDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        atmId={selectedAtmForDetail}
      />

      {/* Render the create new ATM modal */}
      <AtmCreateModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        onSuccess={handleCreateModalSuccess}
        baseUrl={baseUrl}
        getAccessToken={getAccessToken}
        userBranchId={branchId}
      />
    </Box>
  );
};

export default Master;