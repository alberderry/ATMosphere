import {
  Box,
  Flex,
  HStack,
  Button,
  VStack,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

// Import libraries for export functionality
import { FaPrint } from 'react-icons/fa';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Import the new card components
import MapViewCard from '../components/MapView/MapViewCard';
import MachineUtilityCard from '../components/MapView/MachineUtilityCard';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth dari AuthContext

const MapViewPage = ({ selectedPeriod }) => {
  // Dapatkan fungsi getAccessToken dan getUserProfile dari AuthContext
  const { getAccessToken, getUserProfile } = useAuth(); 
  const userProfile = getUserProfile(); // Ambil userProfile dari context

  const [selectedKanwilId, setSelectedKanwilId] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [kanwilOptions, setKanwilOptions] = useState([]);
  const [atmLocations, setAtmLocations] = useState([]);
  const [atmPerformances, setAtmPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // commonHeaders sekarang akan mendapatkan token secara dinamis
  const commonHeaders = useMemo(() => {
    const token = getAccessToken(); // Ambil token dari AuthContext
    return {
      'Authorization': `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true", // Header ngrok
      'Content-Type': 'application/json',
    };
  }, [getAccessToken]); // getAccessToken adalah dependensi karena nilainya (token) bisa berubah

  const getPeriodId = (periodString) => {
    switch (periodString) {
      case "Juli - September, 2024": return 1;
      case "Oktober - Desember, 2024": return 2;
      case "Januari - Maret, 2025": return 3;
      case "April - Juni, 2025": return 4;
      default: return 1; // Default ke Q1 (Juli - September 2024)
    }
  };

  const currentPeriodId = useMemo(() => getPeriodId(selectedPeriod), [selectedPeriod]);

  // Dapatkan branch_id dari userProfile. Jika null/undefined, set ke 0 sebagai default
  const branchId = useMemo(() => userProfile?.branch_id?.id ?? 0, [userProfile]);

  useEffect(() => {
    const fetchKanwilOptions = async () => {
      // Hanya panggil API jika commonHeaders siap dan branchId sudah dimuat
      if (!commonHeaders.Authorization || commonHeaders.Authorization === 'Bearer null' || (branchId === null || branchId === undefined)) {
        console.warn("Skipping fetchKanwilOptions: Token or Branch ID not available yet.");
        setKanwilOptions([{ value: '', label: 'Loading Kanwil...' }]);
        return;
      }
      try {
        const response = await axios.get(`${BASE_URL}/branches`, { headers: commonHeaders });
        if (response.data && Array.isArray(response.data.data.branches)) {
          let kanwils = response.data.data.branches;
          let formattedOptions = [];

          if (branchId === 0) { // Jika branch_id user adalah 0, tampilkan semua Kanwil utama
            kanwils = kanwils.filter(branch =>
              branch.parent_id === null || branch.parent_id === 0 || String(branch.parent_id) === '0'
            );
            formattedOptions.push({ value: '', label: 'Semua Kanwil' }); // Opsi "Semua Kanwil"
            setSelectedKanwilId(''); // Set default ke "Semua Kanwil"
          } else { // Jika branch_id user bukan 0, filter hanya Kanwil yang sesuai
            kanwils = kanwils.filter(branch => String(branch.id) === String(branchId));
            if (kanwils.length > 0) {
              // Jika Kanwil ditemukan, set sebagai pilihan default dan satu-satunya
              setSelectedKanwilId(String(branchId)); 
            } else {
              // Jika Kanwil tidak ditemukan untuk branchId user, set error
              setError("Kanwil ID from user profile not found in branch list.");
              console.error("Kanwil ID from user profile not found:", branchId);
              setKanwilOptions([{ value: '', label: 'Kanwil tidak ditemukan' }]);
              return; // Keluar dari fungsi jika Kanwil tidak ditemukan
            }
          }

          if (kanwils.length > 0) {
            kanwils.sort((a, b) => a.name.localeCompare(b.name));
            kanwils.forEach(branch => {
                formattedOptions.push({
                  value: String(branch.id),
                  label: branch.name
                });
            });
          } else if (branchId === 0) { // Hanya tampilkan warning jika branchId 0 tapi tidak ada root branches
            console.warn("No root branches found. Displaying all branches as options (fallback).");
            response.data.data.branches.sort((a, b) => a.name.localeCompare(b.name)).forEach(branch => {
                formattedOptions.push({
                    value: String(branch.id),
                    label: branch.name
                });
            });
          }
          
          setKanwilOptions(formattedOptions);
        } else {
            console.error('Branches data format unexpected. Missing "data.branches" array.');
            setKanwilOptions([{ value: '', label: 'Gagal memuat Kanwil' }]);
        }
      } catch (e) {
        console.error("Failed to fetch Kanwil options:", e);
        setError("Gagal memuat daftar Kanwil.");
        setKanwilOptions([{ value: '', label: 'Gagal memuat Kanwil' }]);
      }
    };
    fetchKanwilOptions();
  }, [BASE_URL, commonHeaders, branchId]); // Tambahkan branchId sebagai dependency di sini

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);

      // Hanya panggil API jika commonHeaders siap dan selectedKanwilId sudah diatur (baik default '' atau nilai spesifik)
      // Perhatikan: branchId di sini adalah branchId dari userProfile, bukan selectedKanwilId
      // selectedKanwilId akan berubah setelah fetchKanwilOptions selesai
      if (!commonHeaders.Authorization || commonHeaders.Authorization === 'Bearer null' || (selectedKanwilId === '' && branchId !== 0) || (selectedKanwilId === undefined && branchId !== 0)) {
        // Logika ini sedikit kompleks karena selectedKanwilId mungkin kosong saat inisialisasi,
        // tetapi itu bisa berarti "Semua Kanwil" (jika userBranchId=0) atau belum diatur.
        // Jika userBranchId BUKAN 0, dan selectedKanwilId masih kosong, artinya belum siap.
        if (selectedKanwilId === '' && branchId !== 0) {
            console.warn("Skipping fetchAllData: User-specific Kanwil ID not yet set.");
            setLoading(false);
            setError("Memuat Kanwil spesifik pengguna...");
            return;
        }
        if (!commonHeaders.Authorization || commonHeaders.Authorization === 'Bearer null') {
             console.warn("Skipping fetchAllData: Token not available.");
             setLoading(false);
             setError("Authentication token not available. Please log in.");
             return;
        }
      }

      try {
        // Tentukan branch_id yang akan dikirim ke API
        // Jika selectedKanwilId kosong (hanya jika branchId user 0), kirim 0.
        // Jika selectedKanwilId memiliki nilai (baik dari pilihan user atau Kanwil spesifik user), gunakan itu.
        const finalBranchIdParam = selectedKanwilId === '' && branchId === 0 ? 0 : selectedKanwilId;
        
        // Objek params untuk request ATM
        let atmParams = {
            limit: 800,
            page: '',
            search: '',
            sortDir: '',
            branch_id: finalBranchIdParam // Gunakan finalBranchIdParam
        };

        // Objek params untuk request Performance
        let performanceParams = {
            period_id: currentPeriodId,
            branch_id: finalBranchIdParam // Gunakan finalBranchIdParam
        };

        const [atmsResponse, performancesResponse] = await Promise.all([
          axios.get(`${BASE_URL}/atms`, {
            headers: commonHeaders,
            params: atmParams // Gunakan atmParams yang sudah disaring
          }),

          axios.get(`${BASE_URL}/atms-performance`, {
            headers: commonHeaders,
            params: performanceParams // Gunakan performanceParams yang sudah disaring
          }),
        ]);

        const atmsResult = atmsResponse.data;
        const performancesResult = performancesResponse.data;

        if (atmsResult.data && Array.isArray(atmsResult.data.atms)) {
          setAtmLocations(atmsResult.data.atms);
        } else {
          throw new Error('ATM data format unexpected. Missing "data.atms" array.');
        }

        if (performancesResult.data && Array.isArray(performancesResult.data.atm_performances)) {
          setAtmPerformances(performancesResult.data.atm_performances);
        } else {
          throw new Error('Performance data format unexpected. Missing "data.atm_performances" array.');
        }

      } catch (e) {
        console.error("Failed to fetch data:", e);
        if (axios.isAxiosError(e)) {
            if (e.response) {
              console.error("Server Response Error:", e.response.status, e.response.data);
              setError(`Failed to fetch data: Server responded with status ${e.response.status}. Message: ${e.response.data.message || JSON.stringify(e.response.data)}`);
            } else if (e.request) {
              console.error("No response received:", e.request);
              setError("Failed to fetch data: No response from server. Check network connection.");
            }
        } else {
            setError(`Failed to fetch data: ${e.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [currentPeriodId, selectedKanwilId, BASE_URL, commonHeaders, branchId]); // selectedKanwilId dan branchId sebagai dependency

  const getTierColor = useCallback((tierValue) => {
    if (typeof tierValue === 'string') {
        const cleanedTierValue = tierValue.replace('TIER ', '');
        if (cleanedTierValue === 'N/A' || cleanedTierValue === 'TIDAK DIHITUNG') {
            return 'gray';
        }
        const tierNumber = parseInt(cleanedTierValue, 10);
        switch (tierNumber) {
            case 1: return 'blue';
            case 2: return 'green';
            case 3: return 'yellow';
            case 4: return 'red';
            case 0: return 'gray';
            default: return 'gray';
        }
    } else if (typeof tierValue === 'number') {
        switch (tierValue) {
            case 1: return 'blue';
            case 2: return 'green';
            case 3: return 'yellow';
            case 4: return 'red';
            case 0: return 'gray';
            default: return 'gray';
        }
    }
    return 'gray';
  }, []);

  
  

  return (
    <Box p={6} bg="blue.50" minH="calc(100vh - 60px)">
      <VStack spacing={6} align="stretch">
        <HStack justify="flex-end" mb={-4}>
          <Menu>
           
            <MenuList>
             
            </MenuList>
          </Menu>
        </HStack>

        <MapViewCard
          loading={loading}
          error={error}
          atmLocations={atmLocations}
          atmPerformances={atmPerformances}
          getTierColor={getTierColor}
          selectedKanwilId={selectedKanwilId}
          setSelectedKanwilId={setSelectedKanwilId}
          kanwilOptions={kanwilOptions}
          selectedTier={selectedTier}
          setSelectedTier={setSelectedTier}
          commonHeaders={commonHeaders} // Pastikan commonHeaders diteruskan ke MapViewCard
        />

        <MachineUtilityCard
          atmPerformances={atmPerformances}
          getTierColor={getTierColor}
          selectedKanwilId={selectedKanwilId}
          selectedTier={selectedTier}
        />
      </VStack>
    </Box>
  );
};

export default MapViewPage;
