// src/DashboardComponent.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  GridItem,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import axios from 'axios';

// Import komponen-komponen yang dipisahkan
import SummaryStatsCards from './SummaryStatsCard';
import TierDistributionCard from './TierDistributionCard';
import PerformanceTrendsCard from './PerformanceTrend';
import LeaderboardCard from './PerformanceLeaderboardCard';
import { formatPercentageChange } from '../../utils/dashboardUtils';

// Import helper functions
import { getPeriodId, getTierColor, formatRupiah } from '../../utils/dashboardUtils';

// Import useAuth dari AuthContext
import { useAuth } from '../../contexts/AuthContext';

const DashboardComponent = ({ selectedPeriod }) => {
  const bgColor = useColorModeValue("blue.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  // Dapatkan fungsi getAccessToken dan getUserProfile dari AuthContext
  const { getAccessToken, getUserProfile } = useAuth(); 
  const userProfile = getUserProfile(); // Ambil userProfile dari context

  // State untuk Tier Distribution
  const [tierDistributionData, setTierDistributionData] = useState([]);
  const [tierLoading, setTierLoading] = useState(true);
  const [tierError, setTierError] = useState(null);
  const [totalUnits, setTotalUnits] = useState({ atm: 0, crm: 0, total: 0 });

  // State untuk Summary Stats
  const [summaryStatsData, setSummaryStatsData] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // State untuk Performance Trends
  const [performanceTrendsData, setPerformanceTrendsData] = useState([]);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState(null);

  // State untuk Leaderboard
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [leaderboardTab, setLeaderboardTab] = useState(0);
  const [leaderboardMetric, setLeaderboardMetric] = useState('Fee');

  // Gunakan BASE_URL dari environment variable
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

  const currentPeriodId = useMemo(() => getPeriodId(selectedPeriod), [selectedPeriod]);

  // Dapatkan branch_id dari userProfile. Jika null/undefined, set ke 0 sebagai default
  const branchId = useMemo(() => userProfile?.branch_id?.id ?? 0, [userProfile]); // Menggunakan nullish coalescing operator

  // Effect hook untuk mengambil data Tier Distribution dari API
  useEffect(() => {
    const fetchTierDistribution = async () => {
      setTierLoading(true);
      setTierError(null);
      try {
        // Menambahkan parameter branch_id ke URL
        const response = await axios.get(`${BASE_URL}/tier-distribution?period_id=${currentPeriodId}&branch_id=${branchId}`, { headers: commonHeaders });

        const rawTierData = response.data.data;

        if (!rawTierData || typeof rawTierData !== 'object') {
          throw new Error('Tier distribution data is empty or in unexpected format (not an object).');
        }

        let totalAtmCount = 0;
        let totalCrmCount = 0;
        const tiersFromApi = new Map();

        for (const tierKey in rawTierData) {
          if (Object.hasOwn(rawTierData, tierKey) && tierKey.startsWith('tier_')) {
            const tierNumber = parseInt(tierKey.replace('tier_', ''), 10);
            if (!isNaN(tierNumber)) {
              const atm = rawTierData[tierKey].atm || 0;
              const crm = rawTierData[tierKey].crm || 0;
              tiersFromApi.set(tierNumber, { atm, crm });
              totalAtmCount += atm;
              totalCrmCount += crm;
            }
          }
        }

        const grandTotalUnits = totalAtmCount + totalCrmCount;
        const fetchedData = [];

        const allExpectedTiers = [0, 1, 2, 3, 4];

        allExpectedTiers.forEach(tierNum => {
          const tierInfo = tiersFromApi.get(tierNum) || { atm: 0, crm: 0 };
          const atmCount = tierInfo.atm;
          const crmCount = tierInfo.crm;
          const tierTotal = atmCount + crmCount;
          const percentage = grandTotalUnits > 0 ? (tierTotal / grandTotalUnits) * 100 : 0;

          fetchedData.push({
            name: tierNum === 0 ? 'TIDAK DIHITUNG' : `TIER ${tierNum}`,
            value: percentage,
            atmCount: atmCount,
            crmCount: crmCount,
            color: getTierColor(tierNum)
          });
        });

        setTierDistributionData(fetchedData);
        setTotalUnits({
          atm: totalAtmCount,
          crm: totalCrmCount,
          total: grandTotalUnits
        });

      } catch (e) {
        console.error("Failed to fetch tier distribution data:", e);
        if (e.response) {
          console.error("Server Response Error:", e.response.status, e.response.data);
          setTierError(`Failed to fetch tier distribution data: Server responded with status ${e.response.status}. Message: ${e.response.data.message || JSON.stringify(e.response.data)}`);
        } else if (e.request) {
          console.error("No response received:", e.request);
          setTierError("Failed to fetch tier distribution data: No response from server. Check network connection.");
        } else {
          setTierError(`Failed to fetch tier distribution data: ${e.message}`);
        }
      } finally {
        setTierLoading(false);
      }
    };

    // PENTING: Panggil fetchTierDistribution hanya jika commonHeaders siap dan branchId valid
    // Mengubah kondisi pengecekan branchId agar memperlakukan 0 sebagai nilai valid
    if (commonHeaders.Authorization && commonHeaders.Authorization !== 'Bearer null' && (branchId !== null && branchId !== undefined)) {
        fetchTierDistribution();
    } else if (branchId === null || branchId === undefined) { // Kondisi lebih spesifik jika branchId benar-benar null/undefined
      setTierLoading(false);
      setTierError("Branch ID not available or invalid for fetching tier distribution data.");
    }
    else { // Fallback jika token tidak tersedia
      setTierLoading(false); 
      setTierError("Authentication token not available. Please log in.");
    }
  }, [currentPeriodId, BASE_URL, commonHeaders, branchId]);


  // Effect hook untuk mengambil data Summary Stats dari API
  useEffect(() => {
    const fetchSummaryStats = async () => {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        // Menggunakan branchId yang dinamis
        const currentResponse = await axios.get(`${BASE_URL}/summary-by-period?period_id=${currentPeriodId}&branch_id=${branchId}`, { headers: commonHeaders });
        const currentApiData = currentResponse.data.data;

        let previousPeriodIdForComparison = currentPeriodId === 1 ? 0 : currentPeriodId - 1;

        let previousApiData = null;

        if (currentPeriodId > 1) {
          try {
            // Menggunakan branchId yang dinamis
            const previousResponse = await axios.get(`${BASE_URL}/summary-by-period?period_id=${previousPeriodIdForComparison}&branch_id=${branchId}`, { headers: commonHeaders });
            previousApiData = previousResponse.data.data;
          } catch (prevError) {
            console.warn(`Failed to fetch previous period data for period_id=${previousPeriodIdForComparison}:`, prevError);
          }
        }

        const newSummaryStats = [
          {
            label: 'Total Transaction',
            value: (currentApiData.total_transaction || 0).toLocaleString('id-ID'),
            growth: formatPercentageChange(currentApiData.total_transaction || 0, previousApiData?.total_transaction || 0).growth,
            color: formatPercentageChange(currentApiData.total_transaction || 0, previousApiData?.total_transaction || 0).color,
            icon: 'tabler:repeat',
            iconBgColor: 'white',
            iconFgColor: 'yellow'
          },
          {
            label: 'Total Amount',
            value: formatRupiah(currentApiData.total_amount),
            growth: formatPercentageChange(currentApiData.total_amount || 0, previousApiData?.total_amount || 0).growth,
            color: formatPercentageChange(currentApiData.total_amount || 0, previousApiData?.total_amount || 0).color,
            icon: 'tdesign:money',
            iconBgColor: 'white',
            iconFgColor: 'blue'
          },
          {
            label: 'Total Fee',
            value: formatRupiah(currentApiData.total_fee),
            growth: formatPercentageChange(currentApiData.total_fee || 0, previousApiData?.total_fee || 0).growth,
            color: formatPercentageChange(currentApiData.total_fee || 0, previousApiData?.total_fee || 0).color,
            icon: 'fa6-solid:money-bill-trend-up',
            iconBgColor: 'white',
            iconFgColor: 'blue'
          },
        ];
        setSummaryStatsData(newSummaryStats);
      } catch (e) {
        console.error("Failed to fetch summary stats data:", e);
        if (e.response) {
          console.error("Server Response Error:", e.response.status, e.response.data);
          setSummaryError(`Gagal memuat data ringkasan: Server merespons dengan status ${e.response.status}. Pesan: ${e.response.data.message || JSON.stringify(e.response.data)}`);
        } else if (e.request) {
          console.error("Tidak ada respons diterima:", e.request);
          setSummaryError("Gagal memuat data ringkasan: Tidak ada respons dari server. Periksa koneksi jaringan.");
        } else {
          setSummaryError(`Gagal memuat data ringkasan: ${e.message}`);
        }
        setSummaryStatsData([
          { label: 'Total Transaction', value: 'N/A', growth: 'N/A', color: 'gray', icon: 'tabler:repeat', iconBgColor: 'gray.200', iconFgColor: 'gray.600' },
          { label: 'Total Amount', value: 'N/A', growth: 'N/A', color: 'gray', icon: 'tdesign:money', iconBgColor: 'gray.200', iconFgColor: 'gray.600' },
          { label: 'Total Fee', value: 'N/A', growth: 'N/A', color: 'gray', icon: 'fa6-solid:money-bill-trend-up', iconBgColor: 'gray.200', iconFgColor: 'gray.600' },
        ]);
      } finally {
        setSummaryLoading(false);
      }
    };
    // PENTING: Panggil fetchSummaryStats hanya jika commonHeaders siap dan branchId valid
    // Mengubah kondisi pengecekan branchId agar memperlakukan 0 sebagai nilai valid
    if (commonHeaders.Authorization && commonHeaders.Authorization !== 'Bearer null' && (branchId !== null && branchId !== undefined)) {
        fetchSummaryStats();
    } else if (branchId === null || branchId === undefined) {
        setSummaryLoading(false);
        setSummaryError("Branch ID not available or invalid for fetching summary stats.");
    }
    else {
      setSummaryLoading(false);
      setSummaryError("Authentication token not available. Please log in.");
    }
  }, [currentPeriodId, BASE_URL, commonHeaders, branchId]);

  // Effect hook for Performance Trends data
  useEffect(() => {
    const fetchPerformanceTrends = async () => {
      setPerformanceLoading(true);
      setPerformanceError(null);
      try {
        // Menggunakan branchId yang dinamis
        const response = await axios.get(`${BASE_URL}/performance-trends?branch_id=${branchId}&period_id=${currentPeriodId}`, { headers: commonHeaders });
        const rawData = response.data.data.performance_trends;

        const formattedData = rawData.map(item => ({
          name: item.period_id.name,
          amount: item.amount,
          fee: item.fee,
          transaction: item.transaction
        }));
        setPerformanceTrendsData(formattedData);
      } catch (e) {
        console.error("Failed to fetch performance trends data:", e);
        if (e.response) {
          console.error("Server Response Error:", e.response.status, e.response.data);
          setPerformanceError(`Gagal memuat tren kinerja: Server merespons dengan status ${e.response.status}. Pesan: ${e.response.data.message || JSON.stringify(e.response.data)}`);
        } else if (e.request) {
          console.error("Tidak ada respons diterima:", e.request);
          setPerformanceError("Gagal memuat tren kinerja: Tidak ada respons dari server. Periksa koneksi jaringan.");
        } else {
          setPerformanceError(`Gagal memuat tren kinerja: ${e.message}`);
        }
        setPerformanceTrendsData([]);
      } finally {
        setPerformanceLoading(false);
      }
    };
    // PENTING: Panggil fetchPerformanceTrends hanya jika commonHeaders siap dan branchId valid
    // Mengubah kondisi pengecekan branchId agar memperlakukan 0 sebagai nilai valid
    if (commonHeaders.Authorization && commonHeaders.Authorization !== 'Bearer null' && (branchId !== null && branchId !== undefined)) {
        fetchPerformanceTrends();
    } else if (branchId === null || branchId === undefined) {
        setPerformanceLoading(false);
        setPerformanceError("Branch ID not available or invalid for fetching performance trends.");
    }
    else {
      setPerformanceLoading(false);
      setPerformanceError("Authentication token not available. Please log in.");
    }
  }, [currentPeriodId, BASE_URL, commonHeaders, branchId]); // Added branchId to dependencies

  // Effect hook untuk mengambil data Leaderboard dari API
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLeaderboardLoading(true);
      setLeaderboardError(null);
      try {
        const metricParam = leaderboardMetric === 'Fee' ? 'fee' : 'volume_trx';

        // Menggunakan branchId yang dinamis
        const currentLeaderboardResponse = await axios.get(
          `${BASE_URL}/atms-leaderboard?period_id=${currentPeriodId}&performance_by=${metricParam}&branch_id=${branchId}`,
          { headers: commonHeaders }
        );
        const currentLeaderboardRawData = currentLeaderboardResponse.data.data.atm_performances;

        let previousLeaderboardRawData = [];
        if (currentPeriodId > 1) {
          try {
            // Menggunakan branchId yang dinamis
            const previousLeaderboardResponse = await axios.get(
              `${BASE_URL}/atms-leaderboard?period_id=${currentPeriodId - 1}&performance_by=${metricParam}&branch_id=${branchId}`,
              { headers: commonHeaders }
            );
            previousLeaderboardRawData = previousLeaderboardResponse.data.data.atm_performances;
          } catch (prevLBErr) {
            console.warn(`Failed to fetch previous leaderboard data for period_id=${currentPeriodId - 1}:`, prevLBErr);
          }
        }

        const previousLeaderboardMap = new Map(
          previousLeaderboardRawData.map(item => [item.atm_id.id, item])
        );

        const formattedLeaderboard = currentLeaderboardRawData.map(item => {
          const prevItem = previousLeaderboardMap.get(item.atm_id.id);

          const currentFee = item.fee || 0;
          const currentVolumeTrx = item.volume_trx || 0;

          const prevFee = prevItem?.fee || 0;
          const prevVolumeTrx = prevItem?.volume_trx || 0;

          let growthPercentage = { growth: 'N/A', color: 'gray' };

          if (leaderboardMetric === 'Fee') {
            growthPercentage = formatPercentageChange(currentFee, prevFee);
          } else if (leaderboardMetric === 'Transactions') {
            growthPercentage = formatPercentageChange(currentVolumeTrx, prevVolumeTrx);
          }

          return {
            id: item.id,
            name: item.atm_id.name,
            code: item.atm_id.code,
            address: item.atm_id.address || 'N/A',
            tier: item.tier || 'N/A',
            fee: (item.fee || 0).toLocaleString('id-ID'),
            nominal_trx: (item.nominal_trx || 0).toLocaleString('id-ID'),
            transactions: (typeof item.volume_trx === 'number' ? item.volume_trx.toLocaleString('id-ID') : '0'),
            avatarBg: `hsl(${Math.random() * 360}, 70%, 70%)`,
            growth: currentPeriodId !== 1 ? growthPercentage.growth : 'N/A',
            growthColor: currentPeriodId !== 1 ? growthPercentage.color : 'gray',
          };
        });
        setLeaderboardData(formattedLeaderboard);

      } catch (e) {
        console.error("Failed to fetch leaderboard data:", e);
        if (e.response) {
          console.error("Server Response Error:", e.response.status, e.response.data);
          setLeaderboardError(`Gagal memuat data leaderboard: Server merespons dengan status ${e.response.status}. Pesan: ${e.response.data.message || JSON.stringify(e.response.data)}`);
        } else if (e.request) {
          console.error("Tidak ada respons diterima:", e.request);
          setLeaderboardError("Gagal memuat data leaderboard: Tidak ada respons dari server. Periksa koneksi jaringan.");
        } else {
          setLeaderboardError(`Gagal memuat data leaderboard: ${e.message}`);
        }
        setLeaderboardData([]);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    // PENTING: Panggil fetchLeaderboardData hanya jika commonHeaders siap dan branchId valid
    // Mengubah kondisi pengecekan branchId agar memperlakukan 0 sebagai nilai valid
    if (commonHeaders.Authorization && commonHeaders.Authorization !== 'Bearer null' && (branchId !== null && branchId !== undefined)) {
        fetchLeaderboardData();
    } else if (branchId === null || branchId === undefined) {
        setLeaderboardLoading(false);
        setLeaderboardError("Branch ID not available or invalid for fetching leaderboard data.");
    }
    else {
      setLeaderboardLoading(false);
      setLeaderboardError("Authentication token not available. Please log in.");
    }
  }, [currentPeriodId, leaderboardMetric, BASE_URL, commonHeaders, branchId]); // Added branchId to dependencies


  return (
    <Box p={6} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Bagian Statistik Ringkasan */}
        <SummaryStatsCards
          statsData={summaryStatsData}
          loading={summaryLoading}
          error={summaryError}
          currentPeriodId={currentPeriodId}
          cardBg={cardBg}
        />

        {/* Bagian Chart */}
        <Grid templateColumns={{ base: '1fr', md: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {/* Chart Distribusi Tier */}
          <GridItem>
            <TierDistributionCard
              data={tierDistributionData}
              totalUnits={totalUnits}
              loading={tierLoading}
              error={tierError}
              cardBg={cardBg}
            />
          </GridItem>

          {/* Chart Tren Kinerja */}
          <GridItem>
            <PerformanceTrendsCard
              data={performanceTrendsData}
              loading={performanceLoading}
              error={performanceError}
              cardBg={cardBg}
            />
          </GridItem>

          {/* Anda bisa menambahkan Chart Tren ROI di sini jika diperlukan */}
        </Grid>

        {/* Bagian Leaderboard Kinerja */}
        <LeaderboardCard
          data={leaderboardData}
          loading={leaderboardLoading}
          error={leaderboardError}
          leaderboardTab={leaderboardTab}
          setLeaderboardTab={setLeaderboardTab}
          leaderboardMetric={leaderboardMetric}
          setLeaderboardMetric={setLeaderboardMetric}
          currentPeriodId={currentPeriodId}
          cardBg={cardBg}
        />
      </VStack>
    </Box>
  );
};

export default DashboardComponent;
