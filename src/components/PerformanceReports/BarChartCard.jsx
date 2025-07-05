// src/components/Cards/BarChartCard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardBody, Text, useColorModeValue, Center, VStack, Spinner, Flex } from "@chakra-ui/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const BarChartCard = ({ selectedPeriodId, selectedAtmId, atmBranchId, getAccessToken, periods }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "white");

  const [apiChartData, setApiChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChartDataForPeriod = useCallback(async (periodId, targetBranchId, targetAtmId) => {
    
    if (!periodId || !targetBranchId || !targetAtmId) {
      console.warn(`[BarChartCard.fetchChartDataForPeriod] Skipping fetch: Missing params (Period: ${periodId}, Branch: ${targetBranchId}, ATM: ${targetAtmId}).`);
      return null;
    }

    const authToken = getAccessToken();
    if (!authToken) {
      console.error("[BarChartCard.fetchChartDataForPeriod] Auth token not available.");
      return null;
    }

    try {
      const url = `${API_BASE_URL}atms-performance?period_id=${periodId}&branch_id=${targetBranchId}`;
            const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[BarChartCard.fetchChartDataForPeriod] API response NOT OK. Status: ${response.status}. Error: ${errorText}`);
        throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorText.substring(0, 100)}...`);
      }

      const result = await response.json();
            
      // --- PERUBAHAN UTAMA DI SINI ---
      // Tambahkan log untuk melihat isi result.data secara spesifik
      if (!result.data) {
                    return null;
      }
      if (!Array.isArray(result.data.atm_performances)) {
                    return null;
      }

      // Pastikan 'success' flag juga diperiksa jika ada di root objek.
      // Sesuai respons Anda, 'success' adalah di root, tapi kita ambil 'message'
      // Jika API Anda punya `result.success: true/false`, ganti `result.message === 'success get list atm performance'`
      // dengan `result.success`
      if (result.message === 'success get list atm performance' && result.data && Array.isArray(result.data.atm_performances)) {
                
        const atmData = result.data.atm_performances.find(atm => {
            if (atm.atm_id && atm.atm_id.id === targetAtmId) {
                                return true;
            }
            return false;
        });

        if (atmData) {
          const periodName = periods.find(p => p.id === periodId)?.name || `Periode ${periodId}`;
                    return {
            name: periodName,
            Fee: atmData.fee || 0,
            VolumeTransaksi: atmData.volume_trx || 0,
            NominalTransaksi: atmData.nominal_trx || 0,
          };
        } else {
                    return null;
        }
      } else {
        // Ini akan menangkap kasus jika message bukan success atau struktur data tidak sesuai ekspektasi
                return null;
      }
    } catch (err) {
      console.error(`[BarChartCard.fetchChartDataForPeriod] Error during fetch or processing for period ${periodId}:`, err);
      return null;
    }
  }, [getAccessToken, periods]);

  useEffect(() => {
    const loadChartData = async () => {
      setLoading(true);
      setError(null);
      setApiChartData([]);

      
      if (!selectedPeriodId ) {
        setLoading(false);
        setError("Pilih ATM untuk melihat performa historis."); 
                return;
      }

      try {
        const promises = [];
        for (let i = 1; i <= selectedPeriodId; i++) {
          promises.push(fetchChartDataForPeriod(i, atmBranchId, selectedAtmId));
        }

                const results = await Promise.all(promises);
        console.log("[BarChartCard.useEffect] Raw results from all fetches (including nulls):", results);
        
        const validData = results.filter(Boolean).sort((a, b) => {
            const periodA = periods.find(p => p.name === a.name);
            const periodB = periods.find(p => p.name === b.name);
            return (periodA?.id || 0) - (periodB?.id || 0);
        });

        setApiChartData(validData);
        console.log("[BarChartCard.useEffect] Final chart data (filtered and sorted):", validData);

        if (validData.length === -1) {
          setError(`Tidak ada data historis untuk ATM ini pada ${selectedPeriodId} periode terakhir.`); 
                  }

      } catch (err) {
        console.error("[BarChartCard.useEffect] Error in loadChartData useEffect:", err);
        setError(`Gagal memuat data chart: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [selectedPeriodId, selectedAtmId, atmBranchId, fetchChartDataForPeriod, periods]);

  const barChartData = useMemo(() => {
      return apiChartData; 
  }, [apiChartData]);


  return (
    <Card bg={cardBg} p={4} borderRadius="25px" boxShadow="md" flex="1">
      <CardBody>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>From Last Period</Text>
        {loading ? (
          <Center height="220px">
            <VStack>
              <Spinner size="lg" color="blue.500" />
              <Text color={textColor}>Memuat data historis...</Text>
            </VStack>
          </Center>
        ) : error ? (
          <Flex h="220px" justifyContent="center" alignItems="center" flexDirection="column" p={4}>
            <Text color="red.500" fontWeight="bold" mb={2}>Error:</Text>
            <Text color="red.400" textAlign="center" fontSize="sm">{error}</Text>
          </Flex>
        ) : barChartData.length === 0 ? (
          <Center height="220px">
            <Text color={textColor}>Tidak ada data historis untuk ATM ini.</Text>
          </Center>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis domain={[0, 'auto']} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend verticalAlign="bottom" align="center" iconType="circle" />
              <Bar dataKey="Fee" fill="#3139C8" name="Fee" barSize={20} radius={[10, 10, 0, 0]} />
              <Bar dataKey="VolumeTransaksi" fill="#2AC9A6" name="Volume Transaksi" barSize={20} radius={[10, 10, 0, 0]} />
              <Bar dataKey="NominalTransaksi" fill="#FFC107" name="Nominal Transaksi" barSize={20} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
};

export default BarChartCard;