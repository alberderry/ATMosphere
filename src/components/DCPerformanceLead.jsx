import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardHeader,
  CardBody,
  Text,
  VStack,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
  Flex,
  SimpleGrid,
  Heading,
  useColorModeValue,
  Spinner // Tambahkan Spinner untuk loading state
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Icon } from '@iconify/react'; // Pastikan Icon diimpor

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import * as d3 from 'd3'; // Import d3 untuk menggambar SVG kustom
import axios from 'axios'; // Import Axios

// Custom Tooltip untuk Pie Chart
const CustomPieTooltip = ({ active, payload }) => {
  // Memastikan tooltip hanya aktif dan memiliki payload
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Mengambil data dari payload pertama
    return (
      <Box
        bg="white"
        p={3}
        borderRadius="md"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
      >
        <Text fontWeight="bold" color={data.color}>{data.name}</Text>
        <Text fontSize="sm">Persentase: {data.value.toFixed(2)}%</Text>
        <Text fontSize="sm">Jumlah ATM: {data.atmCount}</Text>
        <Text fontSize="sm">Jumlah CRM: {data.crmCount}</Text>
      </Box>
    );
  }
  return null;
};

// Custom Label untuk CustomDonutChart
const CustomLabel = ({ arc }) => {
  // Mengurangi offset untuk mendekatkan label ke irisan
  const labelOffset = 50; // Jarak label dari tepi luar dinamis donut (ditingkatkan)
  const dotOffset = 20;   // Jarak titik warna dari tepi luar dinamis donut (ditingkatkan)

  // Menggunakan d3.arc() untuk menghitung posisi centroid pada busur imajiner
  // Ini membantu label "mengikuti" bentuk melengkung irisan
  const labelArcGenerator = d3.arc()
    .innerRadius(arc.dynamicOuterRadius + labelOffset)
    .outerRadius(arc.dynamicOuterRadius + labelOffset);

  const dotArcGenerator = d3.arc()
    .innerRadius(arc.dynamicOuterRadius + dotOffset)
    .outerRadius(arc.dynamicOuterRadius + dotOffset);

  const [x, y] = labelArcGenerator.centroid(arc);
  const [dotX, dotY] = dotArcGenerator.centroid(arc);

  // Menentukan posisi anchor teks (start atau end) berdasarkan posisi sudut
  // Ini memastikan teks menjauh dari pusat chart
  const midAngle = (arc.startAngle + arc.endAngle) / 2;
  const textAnchor = (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2) ? 'end' : 'start';

  return (
    <g>
      {/* Titik warna (SVG circle) */}
      <circle cx={dotX} cy={dotY} r={4} fill={arc.data.color} />

      {/* Teks label (SVG text) */}
      <text x={x} y={y} fill={arc.data.color} textAnchor={textAnchor} dominantBaseline="central">
        <tspan x={x} dy="-0.5em" style={{ fontWeight: 'bold', fontSize: '12px' }}>{arc.data.name}</tspan>
        <tspan x={x} dy="1em" style={{ fontSize: '11px' }}>{`${(arc.data.value).toFixed(2)}%`}</tspan>
      </text>
    </g>
  );
};

// Komponen Donut Chart Kustom
const CustomDonutChart = ({ data, width = 300, height = 300 }) => {
  const centerX = width / 2; // Pusat X chart
  const centerY = height / 2; // Pusat Y chart
  const baseInnerRadius = 60; // Radius dalam dasar
  const baseOuterRadius = 90; // Radius luar dasar
  const maxThicknessIncrease = 40; // Peningkatan ketebalan maksimum untuk irisan terbesar

  // Mengatur d3.pie untuk menghitung sudut awal dan akhir setiap irisan
  const pie = d3.pie()
    .value(d => d.value) // Menggunakan 'value' (persentase) untuk menentukan ukuran irisan
    .sort(null); // Mempertahankan urutan data asli

  // Menghitung data untuk setiap irisan (arc)
  const arcs = pie(data).map(p => {
    // Menghitung radius luar dinamis berdasarkan persentase
    // Semakin besar persentase, semakin tebal irisan
    const dynamicOuterRadius = baseOuterRadius + (p.data.value / 100) * maxThicknessIncrease;

    // Membuat generator arc untuk setiap irisan dengan radius dinamis
    const arcGenerator = d3.arc()
      .innerRadius(baseInnerRadius)
      .outerRadius(dynamicOuterRadius);

    return {
      ...p, // Menyalin semua properti dari objek pie asli
      path: arcGenerator(p), // Data path SVG untuk irisan
      centroid: arcGenerator.centroid(p), // Titik tengah irisan untuk penempatan label
      dynamicOuterRadius: dynamicOuterRadius, // Radius luar yang dihitung
    };
  });

  const [hoveredSlice, setHoveredSlice] = useState(null); // State untuk melacak irisan yang di-hover
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 }); // Posisi tooltip

  // Handler saat mouse bergerak di atas irisan
  const handleMouseMove = (event, sliceData) => {
    setHoveredSlice(sliceData);
    // Menggunakan clientX/Y untuk posisi tooltip yang akurat di layar
    setTooltipPos({ x: event.clientX, y: event.clientY });
  };

  // Handler saat mouse meninggalkan irisan
  const handleMouseLeave = () => {
    setHoveredSlice(null);
  };

  return (
    <Box position="relative" width={width} height={height}>
      {/* SVG Container untuk menggambar donut chart */}
      <svg width={width} height={height}>
        {/* Grup untuk menempatkan semua irisan di tengah SVG */}
        <g transform={`translate(${centerX}, ${centerY})`}>
          {arcs.map((arc, index) => (
            <path
              key={index}
              d={arc.path} // Data path SVG
              fill={arc.data.color} // Warna irisan
              onMouseMove={(e) => handleMouseMove(e, arc.data)} // Event hover
              onMouseLeave={handleMouseLeave} // Event mouse leave
              style={{ transition: 'fill 0.3s ease' }} // Transisi warna saat hover
            />
          ))}
          {/* Render Custom Labels untuk setiap irisan */}
          {arcs.map((arc, index) => (
            <CustomLabel
              key={`label-${index}`}
              arc={arc} // Meneruskan data arc lengkap ke komponen label
            />
          ))}
        </g>
      </svg>
      
      {/* Tooltip yang muncul saat hover */}
      {hoveredSlice && (
        <Box
          position="fixed" // Menggunakan fixed agar tooltip tidak terpotong oleh overflow container
          left={tooltipPos.x + 10} // Offset posisi tooltip dari kursor
          top={tooltipPos.y + 10}
          zIndex={999} // Memastikan tooltip berada di atas elemen lain
        >
          <CustomPieTooltip active={true} payload={[{ payload: hoveredSlice }]} />
        </Box>
      )}
    </Box>
  );
};


const DashboardComponent = ({
  selectedPeriod, // Menerima selectedPeriod sebagai prop
  performanceTrendsData,
  roiTrendsData,
  leaderboardData,
  leaderboardTab,
  setLeaderboardTab,
  leaderboardMetric,
  setLeaderboardMetric,
}) => {
  const bgColor = useColorModeValue("blue.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  const [tierDistributionData, setTierDistributionData] = useState([]);
  const [tierLoading, setTierLoading] = useState(true);
  const [tierError, setTierError] = useState(null);
  const [totalUnits, setTotalUnits] = useState({ atm: 0, crm: 0, total: 0 }); // State untuk total unit

  // State baru untuk summary stats
  const [summaryStatsData, setSummaryStatsData] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJyb2xlIjoidXNlciIsImlzcyI6InRoZS1pc3N1ZXIiLCJleHAiOjE3NDk5MDQ4OTQsImlhdCI6MTc0OTgxODQ5NH0.Zh2RvOIkvZ2bBOQrvTM7j2ZpntH8dmOngdWb36StMNg'; // Ganti dengan token yang sesuai
  const BASE_URL = 'https://guided-globally-oryx.ngrok-free.app/api';

  const commonHeaders = useMemo(() => ({
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    "ngrok-skip-browser-warning": "true",
    'Content-Type': 'application/json',
  }), [AUTH_TOKEN]);

  // Fungsi untuk memetakan string periode ke ID numerik
  const getPeriodId = (periodString) => {
    switch (periodString) {
      case "Januari - Maret, 2025": return 1;
      case "April - Juni, 2025": return 2;
      case "Juli - September, 2025": return 3;
      case "Oktober - Desember, 2025": return 4;
      default: return 3;
    }
  };

  const currentPeriodId = useMemo(() => getPeriodId(selectedPeriod), [selectedPeriod]);

  // Fungsi untuk mendapatkan warna berdasarkan tier numerik
  const getTierColor = (tierValue) => {
    switch (tierValue) {
      case 1: return '#007bff'; // blue.400
      case 2: return '#28a745'; // green.400
      case 3: return '#ffc107'; // yellow.400
      case 4: return '#dc3545'; // red.500
      case 0: return '#6c757d'; // gray.400 (untuk TIDAK DIHITUNG)
      default: return '#6c757d'; // Default gray
    }
  };

  // Fungsi untuk memformat perubahan persentase dan menentukan warna badge
  const formatPercentageChange = (currentValue, previousValue) => {
    // Handle cases where previousValue is 0 or undefined to avoid division by zero
    if (previousValue === 0 || previousValue === undefined || previousValue === null) {
      if (currentValue > 0) {
        return { growth: '+Inf%', color: 'green' };
      } else if (currentValue < 0) {
        return { growth: '-Inf%', color: 'red' };
      } else {
        return { growth: '0.0%', color: 'gray' };
      }
    }

    const change = currentValue - previousValue;
    const percentage = (change / previousValue) * 100;
    const sign = percentage >= 0 ? '+' : '';
    const color = percentage >= 0 ? 'green' : 'red'; // Green for positive/zero, red for negative

    return {
      growth: `${sign}${percentage.toFixed(1)}%`,
      color: color,
    };
  };

  // Effect hook untuk mengambil data Tier Distribution dari API
  useEffect(() => {
    const fetchTierDistribution = async () => {
      setTierLoading(true);
      setTierError(null);
      try {
        const response = await axios.get(`${BASE_URL}/tier-distribution?period_id=${currentPeriodId}`, { headers: commonHeaders });
        
        const rawTierData = response.data.data; // Data tier ada di dalam objek 'data'

        if (!rawTierData || typeof rawTierData !== 'object') {
          throw new Error('Tier distribution data is empty or in unexpected format (not an object).');
        }

        let totalAtmCount = 0;
        let totalCrmCount = 0;
        const tiersFromApi = new Map(); // Use a Map for consistent order and easier access by tier number

        // Populate tiersFromApi and calculate initial totals
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

        // Define all expected tiers (0 for 'TIDAK DIHITUNG', 1-4 for TIER 1-4)
        const allExpectedTiers = [0, 1, 2, 3, 4];

        allExpectedTiers.forEach(tierNum => {
          const tierInfo = tiersFromApi.get(tierNum) || { atm: 0, crm: 0 }; // Default to 0 if not found in API
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

    fetchTierDistribution();
  }, [currentPeriodId, BASE_URL, commonHeaders]);


  // Effect hook untuk mengambil data Summary Stats dari API
  useEffect(() => {
    const fetchSummaryStats = async () => {
      setSummaryLoading(true);
      setSummaryError(null);
      try {
        // Fetch current period data
        const currentResponse = await axios.get(`${BASE_URL}/summary-by-period?period_id=${currentPeriodId}&branch_id=0`, { headers: commonHeaders });
        const currentApiData = currentResponse.data.data;

        // Determine previous period ID
        let previousPeriodIdForComparison = currentPeriodId === 1 ? 0 : currentPeriodId - 1; 

        let previousApiData = null;

        if (currentPeriodId > 1) { 
          try {
            const previousResponse = await axios.get(`${BASE_URL}/summary-by-period?period_id=${previousPeriodIdForComparison}&branch_id=0`, { headers: commonHeaders });
            previousApiData = previousResponse.data.data;
          } catch (prevError) {
                        // It's okay if previous data is not found, we will treat it as 0 for comparison
          }
        }
        
        // Memformat nilai ke dalam Rupiah jika perlu
        const formatRupiah = (value) => {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(value || 0);
        };

        const newSummaryStats = [
          {
            label: 'Total Transaction',
            value: (currentApiData.total_transaction || 0).toLocaleString('id-ID'),
            growth: formatPercentageChange(currentApiData.total_transaction || 0, previousApiData?.total_transaction || 0).growth,
            color: formatPercentageChange(currentApiData.total_transaction || 0, previousApiData?.total_transaction || 0).color,
            icon: 'tabler:repeat', // Icon untuk Total Transaction
            iconBgColor: 'white', // Warna latar belakang kuning
            iconFgColor: 'yellow' // Warna ikon putih
          },
          {
            label: 'Total Amount',
            value: formatRupiah(currentApiData.total_amount),
            growth: formatPercentageChange(currentApiData.total_amount || 0, previousApiData?.total_amount || 0).growth,
            color: formatPercentageChange(currentApiData.total_amount || 0, previousApiData?.total_amount || 0).color,
            icon: 'tdesign:money', // Icon untuk Total Amount
            iconBgColor: 'white', // Warna latar belakang biru
            iconFgColor: 'blue' // Warna ikon putih
          },
          {
            label: 'Total Fee',
            value: formatRupiah(currentApiData.total_fee),
            growth: formatPercentageChange(currentApiData.total_fee || 0, previousApiData?.total_fee || 0).growth,
            color: formatPercentageChange(currentApiData.total_fee || 0, previousApiData?.total_fee || 0).color,
            icon: 'fa6-solid:money-bill-trend-up', // Icon untuk Total Fee
            iconBgColor: 'white', // Warna latar belakang biru
            iconFgColor: 'blue' // Warna ikon putih
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
        // Set default/empty data if error occurs
        setSummaryStatsData([
          { label: 'Total Transaction', value: 'N/A', growth: 'N/A', color: 'gray', icon: 'tabler:repeat', iconBgColor: 'gray.200', iconFgColor: 'gray.600' },
          { label: 'Total Amount', value: 'N/A', growth: 'N/A', color: 'gray', icon: 'tdesign:money', iconBgColor: 'gray.200', iconFgColor: 'gray.600' },
          { label: 'Total Fee', value: 'N/A', growth: 'N/A', color: 'gray', icon: 'fa6-solid:money-bill-trend-up', iconBgColor: 'gray.200', iconFgColor: 'gray.600' },
        ]);
      } finally {
        setSummaryLoading(false);
      }
    };
    fetchSummaryStats();
  }, [currentPeriodId, BASE_URL, commonHeaders]); // Efek akan dijalankan ulang saat periode berubah


  return (
    <Box p={6} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
      
        {/* Bagian Statistik Ringkasan */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {summaryLoading ? (
            <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
              <Flex h="150px" justifyContent="center" alignItems="center">
                <VStack>
                  <Spinner size="lg" color="blue.500" />
                  <Text>Memuat data ringkasan...</Text>
                </VStack>
              </Flex>
            </GridItem>
          ) : summaryError ? (
            <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
              <Flex h="150px" justifyContent="center" alignItems="center" flexDirection="column" p={4}>
                <Text color="red.500" fontWeight="bold" mb={2}>Terjadi Kesalahan Saat Memuat Data Ringkasan:</Text>
                <Text color="red.400" textAlign="center" fontSize="sm">{summaryError}</Text>
              </Flex>
            </GridItem>
          ) : (
            summaryStatsData.map((stat, index) => (
              <Card key={index} bg={cardBg} shadow="sm">
                <CardBody>
                  <Flex align="flex-start">
                    {stat.icon && (
                      <Box
                        w="60px" // Lebar tetap untuk wadah ikon
                        h="60px" // Tinggi tetap untuk wadah ikon
                        bg={stat.iconBgColor} // Warna latar belakang untuk wadah ikon
                        borderRadius="full" // Membuatnya lingkaran
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        mr={6} // Margin kanan untuk jarak dari teks (diperbesar)
                        flexShrink={0} // Mencegah penyusutan pada layar yang lebih kecil
                      >
                        <Icon 
                          icon={stat.icon} 
                          fontSize="60px" // Ukuran ikon di dalam lingkaran
                          color={stat.iconFgColor} // Warna ikon itu sendiri (putih untuk kontras)
                        />
                      </Box>
                    )}
                    <VStack align="start" spacing={1} flex="1">
                      <Text fontSize="md" color="gray.600">{stat.label}</Text>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="1xl" fontWeight="bold" color="gray.800">{stat.value}</Text>
                        {/* Conditional rendering for growth badge */}
                        {currentPeriodId !== 1 && (
                          <Badge colorScheme={stat.color} variant="subtle" px={1} py={1} borderRadius="md">
                            {stat.growth}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="gray.500">from last period</Text>
                    </VStack>
                  </Flex>
                </CardBody>
              </Card>
            ))
          )}
        </SimpleGrid>

        {/* Bagian Chart - Dimodifikasi untuk menyelaraskan ketiga chart */}
        <Grid templateColumns={{ base: '1fr', md: '1fr', lg: 'repeat(3, 1fr)' }} gap={6}>
          {/* Chart Distribusi Tier (Donut Chart) - Menggunakan komponen kustom */}
          <GridItem>
            <Card bg={cardBg} shadow="sm">
              <CardHeader>
                <Heading size="md" color="gray.700">Tier Distribution</Heading>
              </CardHeader>
              <CardBody>
                {tierLoading ? (
                  <Flex h="300px" justifyContent="center" alignItems="center">
                    <VStack>
                      <Spinner size="lg" color="blue.500" />
                      <Text>Memuat data Tier Distribution...</Text>
                    </VStack>
                  </Flex>
                ) : tierError ? (
                  <Flex h="300px" justifyContent="center" alignItems="center" flexDirection="column" p={4}>
                    <Text color="red.500" fontWeight="bold" mb={2}>Terjadi Kesalahan Saat Memuat Data:</Text>
                    <Text color="red.400" textAlign="center" fontSize="sm">{tierError}</Text>
                    <Text color="gray.500" mt={4} fontSize="xs">Silakan cek URL API atau pastikan server berjalan dengan benar.</Text>
                  </Flex>
                ) : (
                  <Box position="relative" w="full" h="300px">
                    <CustomDonutChart
                      data={tierDistributionData}
                      width={300}
                      height={300}
                    />
                     {/* Teks di tengah chart (Total Unit, ATM, CRM) - DIKEMBALIKAN DENGAN DATA DINAMIS */}
                    <VStack
                        position="absolute"
                        top="50%"
                        left="45%"
                        transform="translate(-50%, -50%)"
                        zIndex={1}
                        color="gray.800"
                        spacing={0}
                        bg="white"
                        p={2}
                        borderRadius="md"
                        boxShadow="sm"
                        border="1px solid"
                        borderColor="gray.200"
                        textAlign="center"
                    >
                        <Text fontSize="md" fontWeight="bold">
                        {totalUnits.total} Unit
                        </Text>
                        <Text fontSize="xs" color="gray.600">ATM: {totalUnits.atm}</Text>
                        <Text fontSize="xs" color="gray.600">CRM: {totalUnits.crm}</Text>
                    </VStack>
                  </Box>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Chart Tren Kinerja (Bar Chart dengan Garis) */}
          <GridItem>
            <Card bg={cardBg} shadow="sm">
              <CardHeader>
                <Heading size="md" color="gray.700">Performance Trends</Heading>
              </CardHeader>
              <CardBody>
                <Box w="full" h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceTrendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="amount" fill="#8884d8" name="Amount" />
                      <Bar dataKey="fee" fill="#82ca9d" name="Fee" />
                      <Line type="monotone" dataKey="transaction" stroke="#ffc658" name="Transaction" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>
          </GridItem>

          {/* Chart Tren ROI (Line Chart dengan Bar) */}
          <GridItem>
            <Card bg={cardBg} shadow="sm">
              <CardHeader>
                <Heading size="md" color="gray.700">ROI Trends</Heading>
              </CardHeader>
              <CardBody>
                <Box w="full" h="300px">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={roiTrendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="roi" stroke="#8884d8" activeDot={{ r: 8 }} name="ROI" />
                      <Bar dataKey="cost" fill="#82ca9d" name="Cost" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Bagian Leaderboard Kinerja */}
        <Card bg={cardBg} shadow="sm">
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="lg" fontWeight="semibold">Performance Leaderboard</Text>

              <Tabs variant="enclosed" index={leaderboardTab} onChange={(index) => setLeaderboardTab(index)}>
                <HStack justify="space-between">
                  <TabList>
                    <Tab _selected={{ bg: "blue.500", color: "white" }}>ATM</Tab>
                    <Tab _selected={{ bg: "blue.500", color: "white" }}>KC</Tab>
                    <Tab _selected={{ bg: "blue.500", color: "white" }}>KANWIL</Tab>
                  </TabList>

                  <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="blue.500" color="white" size="sm">
                      {leaderboardMetric}
                    </MenuButton>
                    <MenuList>
                      <MenuItem onClick={() => setLeaderboardMetric('Revenue')}>Fee</MenuItem>
                      <MenuItem onClick={() => setLeaderboardMetric('Transactions')}>Transactions</MenuItem>
                      <MenuItem onClick={() => setLeaderboardMetric('Growth')}>Revenue</MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>

                <TabPanels>
                  {[0, 1, 2].map(tabIndex => (
                    <TabPanel key={tabIndex} p={0} pt={4}>
                      <TableContainer>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th></Th>
                              <Th>Transactions Fee</Th>
                              <Th>Transactions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {leaderboardData.map((item) => (
                              <Tr key={item.id}>
                                <Td>
                                  <HStack spacing={3}>
                                    <Avatar size="sm" bg={item.avatarBg} />
                                    <VStack align="start" spacing={0}>
                                      <HStack>
                                        <Text fontSize="sm" fontWeight="medium">{item.name}</Text>
                                        {item.code && <Badge colorScheme="blue" size="sm">{item.code}</Badge>}
                                      </HStack>
                                      <HStack spacing={4}>
                                        {item.kc && <Text fontSize="xs" color="gray.600">{item.kc}</Text>}
                                        {item.kanwil && <Text fontSize="xs" color="gray.600">{item.kanwil}</Text>}
                                      </HStack>
                                    </VStack>
                                  </HStack>
                                </Td>
                                <Td>
                                  <Text fontSize="sm" fontWeight="medium">Rp.{item.revenue}</Text>
                                </Td>
                                <Td>
                                  <Text fontSize="sm" fontWeight="medium">Rp.{item.fee || '-'}</Text>
                                </Td>
                                <Td>
                                  <Text fontSize="sm" fontWeight="medium">{item.transactions}</Text>
                                </Td>
                                <Td>
                                  <Text fontSize="sm" fontWeight="medium" color={item.growth.startsWith('+') ? 'green.500' : 'red.500'}>
                                    {item.growth}
                                  </Text>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default DashboardComponent;
 