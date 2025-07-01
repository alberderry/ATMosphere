// src/components/Pages/PerformanceReports.jsx
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Spinner,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from '../../contexts/AuthContext';
import { SearchIcon } from '@chakra-ui/icons';

// Import komponen Card yang sudah dipisahkan
import BarChartCard from '../../components/PerformanceReports/BarChartCard'; // Sesuaikan path jika berbeda
import DonutChartCard from '../../components/PerformanceReports/DonutChartCard'; // Sesuaikan path jika berbeda
import DetailATMCard from '../../components/PerformanceReports/DetailATMCard';
import ATMListItemCard from '../../components/PerformanceReports/ATMListItemCard';

// --- API Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// --- Utility Functions ---
const periods = [
  { name: 'Juli - September, 2024', id: 1 },
  { name: 'Oktober - Desember, 2024', id: 2 },
  { name: 'Januari - Maret, 2025', id: 3 },
  { name: 'April - Juni, 2025', id: 4 },
];

const branchIdToKanwilMap = {
  1: 'Kanwil 1', 2: 'Kanwil 2', 3: 'Kanwil 3', 4: 'Kanwil 4', 5: 'Kanwil 5',
  6: 'Kanwil 6', 8: 'Kanwil 8',
};

const getKanwilFromBranchId = (branchId) => branchIdToKanwilMap[branchId] || `Branch ID ${branchId}`;

const formatChange = (currentValue, previousValue, isFirstPeriod) => {
  if (isFirstPeriod) {
    return { value: '-', color: 'gray' };
  }

  if (previousValue === undefined || previousValue === null || previousValue === 0) {
    if (currentValue > 0) return { value: `+${currentValue.toLocaleString('id-ID')}`, color: 'green' };
    if (currentValue < 0) return { value: `${currentValue.toLocaleString('id-ID')}`, color: 'red' };
    return { value: '0', color: 'gray' };
  }

  const diff = currentValue - previousValue;
  if (diff > 0) {
    return { value: `+${diff.toLocaleString('id-ID')}`, color: 'green' };
  } else if (diff < 0) {
    return { value: `${diff.toLocaleString('id-ID')}`, color: 'red' };
  }
  return { value: '0', color: 'gray'};
};

const PerformanceReports = ({ selectedPeriod }) => {
  const [apiAtmPerformanceData, setApiAtmPerformanceData] = useState([]);
  const [prevApiAtmPerformanceData, setPrevApiAtmPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedAtmIdForDetails, setSelectedAtmIdForDetails] = useState(null);
  const [activeAtmId, setActiveAtmId] = useState(null); 

  const hasUserSelectedAtmRef = useRef(false); 
  const topOfPageRef = useRef(null); 

  const { getAccessToken, getUserProfile } = useAuth();
  const userProfile = getUserProfile();

  const bgColor = useColorModeValue("blue.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const currentPeriodId = useMemo(() => {
    const period = periods.find(p => p.name === selectedPeriod);
    console.log("PerformanceReports: currentPeriodId calculated as", period?.id, "for selectedPeriod:", selectedPeriod);
    return period?.id;
  }, [selectedPeriod]);

  const userBranchId = useMemo(() => {
    const id = userProfile?.branch_id?.id ?? 0;
    console.log("PerformanceReports: userBranchId from profile:", id);
    return id;
  }, [userProfile]);

  const fetchApiAtmPerformanceData = useCallback(async (periodId, currentBranchId) => {
    console.log(`PerformanceReports: fetchApiAtmPerformanceData called for periodId: ${periodId}, branchId: ${currentBranchId}`);
    if (!periodId || (currentBranchId === null || currentBranchId === undefined)) {
        console.warn("PerformanceReports: Skipping fetchApiAtmPerformanceData: Period ID or Branch ID not available.");
        return [];
    }

    const authToken = getAccessToken();
    if (!authToken) {
      console.error("PerformanceReports: Auth token not available for API call.");
      setError("Autentikasi diperlukan untuk memuat data performa ATM.");
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}atms-performance?period_id=${periodId}&branch_id=${currentBranchId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (!response.ok) {
        const errorDetail = await response.text();
        console.error(`PerformanceReports: API responded with status ${response.status} for period_id: ${periodId}, branch_id: ${currentBranchId}. Error: ${errorDetail}`);
        throw new Error(`HTTP error! status: ${response.status} for period_id: ${periodId}, branch_id: ${currentBranchId}. Details: ${errorDetail.substring(0, 100)}...`);
      }
      const textResponse = await response.text();
      try {
        const result = JSON.parse(textResponse);
        console.log(`PerformanceReports: API response for atms-performance (period ${periodId}, branch ${currentBranchId}):`, result);

        if (result.data && result.data.atm_performances) {
          return result.data.atm_performances.map(item => {
            const tierName = item.tier === 0 ? 'TIDAK DIHITUNG' : `TIER ${item.tier}`; 
            
            return {
              id: item.atm_id.id, 
              kodeAtm: item.atm_id.code,
              typeAtm: item.atm_id.type,
              atm_branch_id: item.atm_id.branch_id?.id, // Ensure this is correctly extracted
              kodeCabang: item.atm_id.branch_id?.branch_code?.toString() || 'N/A', 
              kodeCabangInduk: item.atm_id.branch_id?.parent_id?.branch_code?.toString() || 'N/A', 
              kanwil: getKanwilFromBranchId(item.atm_id.branch_id?.id), 
              frekuensiTransaksi: item.volume_trx,
              nominalTrx: item.nominal_trx,
              fee: item.fee,
              tier: tierName,
              // These fields are taken directly from the API response for BarChart
              volume_trx: item.volume_trx || 0,
              nominal_trx: item.nominal_trx || 0,
              fee_trx: item.fee || 0, // Using fee_trx to avoid naming conflict with existing 'fee'
              laporanPerQuarter: { Q1: 'N/A', Q2: 'N/A', Q3: 'N/A', Q4: 'N/A' },
              rataRata3Bulan: 'N/A',
            };
          });
        }
        return [];
      } catch (jsonError) {
        console.error(`PerformanceReports: JSON Parsing Error for period ${periodId}, branch ${currentBranchId}:`, jsonError, `Response text: ${textResponse.substring(0, 500)}...`);
        throw new Error(`Invalid JSON response from API for period_id ${periodId}, branch_id ${currentBranchId}. It might be an HTML error page. (Start: ${textResponse.substring(0, 100)}...)`);
      }
    } catch (err) {
      console.error(`PerformanceReports: Failed to fetch API data: ${err.message}`);
      setError(`Gagal memuat data dari API: ${err.message}`);
      return [];
    }
  }, [getAccessToken]);

  useEffect(() => {
    const loadApiData = async () => {
      setLoading(true);
      setError(null);
      
      if (userBranchId === -1) { // Changed from null/undefined check to 0, assuming 0 is default
          console.warn("PerformanceReports: Skipping loadApiData: User Branch ID is 0.");
          setLoading(false);
          setError("Branch ID pengguna belum tersedia. Harap masuk kembali atau tunggu.");
          return;
      }
      if (!currentPeriodId) {
        console.warn("PerformanceReports: Skipping loadApiData: currentPeriodId is null or undefined.");
        setLoading(false);
        setError("Periode belum dipilih.");
        return;
      }

      console.log(`PerformanceReports: Loading data for currentPeriodId: ${currentPeriodId}, userBranchId: ${userBranchId}`);
      try {
        const currentDataPromise = fetchApiAtmPerformanceData(currentPeriodId, userBranchId);
        const currentIndexInPeriods = periods.findIndex(p => p.id === currentPeriodId);
        let previousDataPromise = Promise.resolve([]);
        if (currentIndexInPeriods > 0) {
          const previousPeriodId = periods[currentIndexInPeriods - 1].id;
          previousDataPromise = fetchApiAtmPerformanceData(previousPeriodId, userBranchId);
        }

        const [currentData, previousData] = await Promise.all([currentDataPromise, previousDataPromise]);
        setApiAtmPerformanceData(currentData);
        setPrevApiAtmPerformanceData(previousData);

        if (!currentData || currentData.length === 0) {
          setError(`Tidak ada data performa ATM untuk periode ${selectedPeriod} dan branch ID ${userBranchId}.`);
          setSelectedAtmIdForDetails(null); 
          setActiveAtmId(null); 
          hasUserSelectedAtmRef.current = false; 
          console.log("PerformanceReports: No data, resetting selected ID and user selection flag.");
        } else {
            // Check if selectedAtmIdForDetails is still valid in currentData
            const isSelectedAtmStillPresent = currentData.some(atm => atm.id === selectedAtmIdForDetails);

            if (!hasUserSelectedAtmRef.current || !isSelectedAtmStillPresent) {
                // Auto-select the first ATM if nothing was selected by user or previously selected ATM is gone
                setSelectedAtmIdForDetails(currentData[0].id);
                setActiveAtmId(currentData[0].id); 
                hasUserSelectedAtmRef.current = false; // Reset to allow re-selection logic
                console.log("PerformanceReports: Auto-selecting first ATM ID:", currentData[0].id, "due to no previous selection or missing ATM.");
            } else {
              // Keep the currently selected ATM if it's still in the list
              console.log("PerformanceReports: Keeping previously selected ATM ID:", selectedAtmIdForDetails);
            }
        }

      } catch (err) {
        console.error("PerformanceReports: Error in loadApiData useEffect:", err);
        setError(`Gagal memuat data dari API: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadApiData();
  }, [currentPeriodId, fetchApiAtmPerformanceData, selectedPeriod, userBranchId]); // Removed selectedAtmIdForDetails from dependencies to avoid re-triggering auto-selection

  const filteredAtmDetailsWithChanges = useMemo(() => {
    let filteredBySearch = apiAtmPerformanceData.filter(atm =>
      Object.values(atm).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    const activeAtm = filteredBySearch.find(atm => atm.id === activeAtmId);
    let finalFilteredList = [];

    if (activeAtm) {
        finalFilteredList.push(activeAtm);
        const remainingAtms = filteredBySearch.filter(atm => atm.id !== activeAtmId);
        finalFilteredList = [...finalFilteredList, ...remainingAtms];
    } else {
        finalFilteredList = filteredBySearch;
    }


    const mappedAtms = finalFilteredList.map(atm => {
      const prevAtm = prevApiAtmPerformanceData.find(prevApiItem => prevApiItem.kodeAtm === atm.kodeAtm);

      const frekuensiTransaksiChange = formatChange(atm.frekuensiTransaksi, prevAtm?.frekuensiTransaksi, currentPeriodId === periods[0].id);
      const nominalTrxChange = formatChange(atm.nominalTrx, prevAtm?.nominalTrx, currentPeriodId === periods[0].id);
      const feeChange = formatChange(atm.fee, prevAtm?.fee, currentPeriodId === periods[0].id);

      return {
        ...atm,
        frekuensiTransaksiChange,
        nominalTrxChange,
        feeChange,
      };
    });
    console.log("PerformanceReports: filteredAtmDetailsWithChanges updated. Count:", mappedAtms.length);
    return mappedAtms;
  }, [apiAtmPerformanceData, prevApiAtmPerformanceData, currentPeriodId, searchTerm, activeAtmId, periods]); // Added periods to dependencies

  const handleSelectAtmForDetails = useCallback((atmId) => {
    console.log("PerformanceReports: handleSelectAtmForDetails called with ID:", atmId);
    setSelectedAtmIdForDetails(atmId);
    setActiveAtmId(atmId); 
    hasUserSelectedAtmRef.current = true; // Mark that user explicitly selected an ATM

    if (topOfPageRef.current) {
      topOfPageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []); 

  useEffect(() => {
      console.log("PerformanceReports: selectedAtmIdForDetails (state) changed to:", selectedAtmIdForDetails);
  }, [selectedAtmIdForDetails]);

  const handleExport = useCallback(() => {
    if (!currentPeriodId || userBranchId == null) {
      alert("Cannot export: Period or Branch ID is not available.");
      return;
    }
    const exportUrl = `${API_BASE_URL}atm-performance/download?period_id=${currentPeriodId}&branch_id=${userBranchId}`;
    window.open(exportUrl, '_blank');
  }, [currentPeriodId, userBranchId]);

  const selectedAtmDetails = useMemo(() => {
    const details = filteredAtmDetailsWithChanges.find(atm => atm.id === selectedAtmIdForDetails);
    console.log("PerformanceReports: selectedAtmDetails computed:", details);
    return details;
  }, [filteredAtmDetailsWithChanges, selectedAtmIdForDetails]);


  return (
    <Box p={6} bg={bgColor} minH="100vh">
        <div ref={topOfPageRef} /> 
      <VStack spacing={6} align="stretch">
        <HStack spacing={6} align="flex-start" width="100%">
          <BarChartCard 
            selectedPeriodId={currentPeriodId} 
            selectedAtmId={selectedAtmIdForDetails} 
            atmBranchId={selectedAtmDetails?.atm_branch_id} // Make sure atm_branch_id is correctly propagated here
            getAccessToken={getAccessToken} 
            periods={periods} 
          />
          <DonutChartCard atmData={selectedAtmDetails} /> 
          <DetailATMCard key={selectedAtmIdForDetails || 'no-atm'} atmId={selectedAtmIdForDetails} selectedPeriod={selectedPeriod} />
        </HStack>

        <HStack spacing={6} align="flex-start" width="100%" mt={-20}>
          <Box flex="1" />
          <Box flex="1" />
          <VStack align="stretch" spacing={2} flex="1">
            <HStack justify="flex-end" spacing={2}>
              <Button colorScheme="blue" size="md" borderRadius="25px">Filter</Button>
              <Button colorScheme="blue" size="md" borderRadius="25px" onClick={handleExport}>Export</Button>
            </HStack>
            <HStack
              bg={cardBg}
              borderRadius="25px"
              p={2}
              pr={3}
              boxShadow="sm"
              width="100%"
            >
              <SearchIcon color="gray.400" ml={1} />
              <Input
                placeholder="Search for something"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="unstyled"
                size="md"
                flexGrow={1}
                _focus={{ boxShadow: 'none' }}
              />
            </HStack>
          </VStack>
        </HStack>

        <Text fontSize="xl" fontWeight="semibold">ATM List</Text>

        {loading ? (
          <Flex h="200px" justifyContent="center" alignItems="center" bg={cardBg} borderRadius="25px" boxShadow="md">
            <VStack>
              <Spinner size="lg" color="blue.500" />
              <Text>Memuat data performa ATM...</Text>
            </VStack>
          </Flex>
        ) : error ? (
          <Flex h="200px" justifyContent="center" alignItems="center" flexDirection="column" p={4} bg={cardBg} borderRadius="25px" boxShadow="md">
            <Text color="red.500" fontWeight="bold" mb={2}>Terjadi Kesalahan Saat Memuat Data Performa ATM:</Text>
            <Text color="red.400" textAlign="center" fontSize="sm">{error}</Text>
            <Text color="gray.500" mt={4} fontSize="xs">Pastikan API berjalan dan parameter yang dikirim benar.</Text>
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {filteredAtmDetailsWithChanges.length === 0 ? (
              <Text textAlign="center" py={4} bg={cardBg} borderRadius="25px" boxShadow="md">Tidak ada data ATM untuk Kanwil atau periode ini.</Text>
            ) : (
              filteredAtmDetailsWithChanges.map((atm) => (
                <ATMListItemCard 
                    key={atm.id} 
                    atm={atm} 
                    onViewDetails={handleSelectAtmForDetails} 
                    isActive={atm.id === activeAtmId} 
                />
              ))
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default PerformanceReports;