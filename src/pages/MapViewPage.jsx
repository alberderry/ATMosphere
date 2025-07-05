// src/components/MapView/MapViewPage.jsx
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
import { useAuth } from '../contexts/AuthContext';

const MapViewPage = ({ selectedPeriod }) => {
    const { getAccessToken, getUserProfile } = useAuth();
    const userProfile = getUserProfile();

    const [selectedKanwilId, setSelectedKanwilId] = useState('');
    const [selectedTier, setSelectedTier] = useState('0');
    const [kanwilOptions, setKanwilOptions] = useState([]);
    const [kanwilToChildrenMap, setKanwilToChildrenMap] = useState({}); // State baru untuk mapping
    const [atmLocations, setAtmLocations] = useState([]);
    const [atmPerformances, setAtmPerformances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    const commonHeaders = useMemo(() => {
        const token = getAccessToken();
        return {
            'Authorization': `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
            'Content-Type': 'application/json',
        };
    }, [getAccessToken]);

    const getPeriodId = (periodString) => {
        switch (periodString) {
            case "Juli - September, 2024": return 1;
            case "Oktober - Desember, 2024": return 2;
            case "Januari - Maret, 2025": return 3;
            case "April - Juni, 2025": return 4;
            default: return 1;
        }
    };

    const currentPeriodId = useMemo(() => getPeriodId(selectedPeriod), [selectedPeriod]);

    const branchId = useMemo(() => userProfile?.branch_id?.id ?? 0, [userProfile]);

    useEffect(() => {
            const fetchKanwilOptions = async () => {
                if (!commonHeaders.Authorization || commonHeaders.Authorization === 'Bearer null' || (branchId === null || branchId === undefined)) {
                                        setKanwilOptions([{ value: '', label: 'Loading Kanwil...' }]);
                    return;
                }
                try {
                    const response = await axios.get(`${BASE_URL}/branches`, { headers: commonHeaders });
                    if (response.data && Array.isArray(response.data.data.branches)) {
                        let allBranches = response.data.data.branches; 
                        let formattedOptions = [];
                        const tempKanwilToChildrenMap = {};
    
                        ("MapViewPage: All Branches API Response:", allBranches); // LOG PENTING INI
    
                        if (branchId === 0) { // Jika user adalah Admin/Global
                            formattedOptions.push({ value: '', label: 'Semua Kanwil' }); 
                            setSelectedKanwilId(''); 
    
                            const rootKanwils = allBranches.filter(branch =>
                                branch.parent_id === null || String(branch.parent_id) === '0' || branch.parent_id === 0 // Lebih robust untuk parent_id
                            );
                            ("MapViewPage: Identified Root Kanwils:", rootKanwils); // LOG PENTING INI
    
                            rootKanwils.sort((a, b) => a.name.localeCompare(b.name));
                            rootKanwils.forEach(kanwil => {
                                const kanwilIdString = String(kanwil.id);
                                formattedOptions.push({
                                    value: kanwilIdString,
                                    label: kanwil.name
                                });
    
                                // Kumpulkan semua anak cabang untuk Kanwil ini
                                // Perhatikan: parent_id bisa berupa objek { id: X, ... } atau langsung number X
                                const childrenIds = allBranches
                                    .filter(branch => {
                                        const branchParentId = typeof branch.parent_id === 'object' && branch.parent_id !== null
                                            ? String(branch.parent_id.id)
                                            : String(branch.parent_id);
                                        return branchParentId === kanwilIdString;
                                    })
                                    .map(branch => String(branch.id)); 
                                
                                // Tambahkan ID Kanwil utama ke daftar anak-anaknya juga
                                // Ini sangat penting jika ada ATM yang langsung tercatat dengan ID Kanwil itu sendiri
                                tempKanwilToChildrenMap[kanwilIdString] = [kanwilIdString, ...childrenIds];
                            });
    
                        } else { // Jika user adalah Kanwil spesifik
                            const userKanwil = allBranches.find(branch => String(branch.id) === String(branchId));
                            if (userKanwil) {
                                const userKanwilIdString = String(userKanwil.id);
                                setSelectedKanwilId(userKanwilIdString); 
    
                                formattedOptions.push({
                                    value: userKanwilIdString,
                                    label: userKanwil.name
                                });
    
                                // Kumpulkan semua anak cabang untuk Kanwil user ini
                                const childrenIds = allBranches
                                    .filter(branch => {
                                        const branchParentId = typeof branch.parent_id === 'object' && branch.parent_id !== null
                                            ? String(branch.parent_id.id)
                                            : String(branch.parent_id);
                                        return branchParentId === userKanwilIdString;
                                    })
                                    .map(branch => String(branch.id));
                                
                                tempKanwilToChildrenMap[userKanwilIdString] = [userKanwilIdString, ...childrenIds];
    
                            } else {
                                setError("MapViewPage: Kanwil ID from user profile not found in branch list.");
                                console.error("MapViewPage: Kanwil ID from user profile not found:", branchId);
                                setKanwilOptions([{ value: '', label: 'Kanwil tidak ditemukan' }]);
                                return;
                            }
                        }
                        
                        setKanwilToChildrenMap(tempKanwilToChildrenMap); 
                        setKanwilOptions(formattedOptions);
                        ("MapViewPage: Final kanwilToChildrenMap:", tempKanwilToChildrenMap); // LOG PENTING INI
                        ("MapViewPage: Final kanwilOptions:", formattedOptions); // LOG PENTING INI
    
                    } else {
                        console.error('MapViewPage: Branches data format unexpected. Missing "data.branches" array.');
                        setKanwilOptions([{ value: '', label: 'Gagal memuat Kanwil' }]);
                    }
                } catch (e) {
                    console.error("MapViewPage: Failed to fetch Kanwil options:", e);
                    setError("Gagal memuat daftar Kanwil.");
                    setKanwilOptions([{ value: '', label: 'Gagal memuat Kanwil' }]);
                }
            };
            fetchKanwilOptions();
        }, [BASE_URL, commonHeaders, branchId]); // Ini OK

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);

            // Logika skipping fetchAllData bisa disederhanakan sedikit
            if (!commonHeaders.Authorization || commonHeaders.Authorization === 'Bearer null') {
                                setLoading(false);
                setError("Authentication token not available. Please log in.");
                return;
            }
            // Tambahkan kondisi untuk menunggu kanwilOptions dan kanwilToChildrenMap terisi
            if (kanwilOptions.length === 0 && branchId === 0) { // Hanya menunggu jika admin dan options belum terisi
                                setLoading(false);
                return;
            }
            if (selectedKanwilId === '' && branchId !== 0) { // Menunggu jika user spesifik dan selectedKanwilId belum diatur
                                setLoading(false);
                setError("Memuat Kanwil spesifik pengguna...");
                return;
            }


            try {
                // Tentukan branch_id yang akan dikirim ke API
                // Jika selectedKanwilId kosong (artinya "Semua Kanwil" untuk admin), kirim 0.
                // Jika selectedKanwilId memiliki nilai (baik dari pilihan user atau Kanwil spesifik user), gunakan itu.
                // Penting: Di sini kita hanya mengirim ID dari Kanwil yang dipilih ke API,
                // filter berdasarkan cabang anak akan dilakukan di frontend oleh MachineUtilityCard
                const finalBranchIdParam = selectedKanwilId === '' ? 0 : Number(selectedKanwilId); // Kirim sebagai Number jika tidak kosong
                
                let atmParams = {
                    limit: 800,
                    page: '',
                    search: '',
                    sortDir: '',
                    branch_id: finalBranchIdParam // Kirim Kanwil utama (atau 0 untuk semua) ke API
                };

                let performanceParams = {
                    period_id: currentPeriodId,
                    branch_id: finalBranchIdParam // Kirim Kanwil utama (atau 0 untuk semua) ke API
                };

                const [atmsResponse, performancesResponse] = await Promise.all([
                    axios.get(`${BASE_URL}/atms`, {
                        headers: commonHeaders,
                        params: atmParams
                    }),

                    axios.get(`${BASE_URL}/atms-performance`, {
                        headers: commonHeaders,
                        params: performanceParams
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
    }, [currentPeriodId, selectedKanwilId, BASE_URL, commonHeaders, branchId, kanwilOptions]); // Tambahkan kanwilOptions ke dependencies

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
                    commonHeaders={commonHeaders}
                />

                <MachineUtilityCard
                    atmPerformances={atmPerformances}
                    getTierColor={getTierColor}
                    selectedKanwilId={selectedKanwilId}
                    selectedTier={selectedTier}
                    kanwilToChildrenMap={kanwilToChildrenMap} // Teruskan mapping ke MachineUtilityCard
                />
            </VStack>
        </Box>
    );
};

export default MapViewPage;