import {
  Box,
  Flex,
  Text,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  VStack,
  Select,
  Card,
  CardBody,
  Spinner // Import Spinner
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import MapComponent from '../../components/MapComponent';

const MapView = () => {
  // const [activeView, ] = useState('Tier'); // Dihapus karena tidak digunakan
  const [selectedKanwil, setSelectedKanwil] = useState('Kanwil 1');
  const [atmLocations, setAtmLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token autentikasi yang Anda berikan
  const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo0LCJyb2xlIjoidXNlciIsImlzcyI6InRoZS1pc3N1ZXIiLCJleHAiOjE3NDk2OTc3MzIsImlhdCI6MTc0OTYxMTMzMn0.V_Vn05WOZULiqOn06GGV-o6P9PJ0UAlpe8szBEtSNHc';

  // Effect hook untuk mengambil data ATM dari API
  useEffect(() => {
    const fetchAtmData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state

        // Menggunakan URL API penuh tanpa proxy
        const response = await fetch('http://saving-quietly-buffalo.ngrok-free.app/api/atms?branch_id&limit=20&page&search&sortDir', {
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}` // Menambahkan header Authorization
          }
        });

        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
          const errorText = await response.text(); // Read response as text for debugging
          console.error("API Response was not OK:", response.status, response.statusText, errorText);
          throw new Error(`Failed to fetch ATM data: Server responded with status ${response.status} ${response.statusText}. Response: ${errorText.substring(0, 200)}...`);
        }

        // Check content type before parsing as JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const rawText = await response.text();
          console.error("API Response is not JSON. Content-Type:", contentType, "Raw response:", rawText);
          throw new Error(`Failed to fetch ATM data: Expected JSON, but received ${contentType || 'no content type'}. Raw response starts with: ${rawText.substring(0, 100)}...`);
        }
        
        const result = await response.json(); // This is the line that caused the error before

        if (result.data && Array.isArray(result.data.atms)) {
          setAtmLocations(result.data.atms);
        } else {
          throw new Error('Data format unexpected from API. Missing "data.atms" array.');
        }
      } catch (e) {
        console.error("Failed to fetch ATM data:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAtmData();
  }, [AUTH_TOKEN]); // Tambahkan AUTH_TOKEN ke dependensi useEffect

  const tableData = [
    {
      tier: 'TIDAK DIHITUNG',
      kelompokTier: 21,
      jumlahMesin: '-',
      persentase: '3.67%',
      rataTransaksi: '-',
      rataFee: '-',
      color: 'gray'
    },
    {
      tier: 'TIER 1',
      kelompokTier: 124,
      jumlahMesin: '21.68%',
      persentase: '21.68%',
      rataTransaksi: '580.441',
      rataFee: '91.005.852',
      color: 'blue'
    },
    {
      tier: 'TIER 2',
      kelompokTier: 170,
      persentase: '29.72%',
      rataTransaksi: '463.236',
      rataFee: '77.024.195',
      color: 'green'
    },
    {
      tier: 'TIER 3',
      kelompokTier: 145,
      persentase: '25.35%',
      rataTransaksi: '311.836',
      rataFee: '43.375.170',
      color: 'yellow'
    },
    {
      tier: 'TIER 4',
      kelompokTier: 112,
      persentase: '19.58%',
      rataTransaksi: '62.667',
      rataFee: '16.940.605',
      color: 'red'
    }
  ];

  const totalRow = {
    kelompokTier: 572,
    persentase: '100%',
    rataTransaksi: '1.318.170',
    rataFee: '227.445.822'
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'TIER 1': return 'blue';
      case 'TIER 2': return 'green';
      case 'TIER 3': return 'yellow';
      case 'TIER 4': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box p={6} bg="blue.50" minH="calc(100vh - 60px)">
      <VStack spacing={6} align="stretch">
        <Card borderRadius="lg" boxShadow="md">
          <CardBody>
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="lg" fontWeight="semibold">ATM & CRM Positioning</Text>
              <HStack
                bg="white"
                p={1}
                borderRadius="lg"
                boxShadow="sm"
              >
              </HStack>
            </Flex>

            <Box
              h="400px"
              bg="gray.100"
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              mb={4}
            >
              {loading ? (
                <Flex h="full" justifyContent="center" alignItems="center">
                  <VStack>
                    <Spinner size="lg" color="blue.500" />
                    <Text>Memuat data ATM...</Text>
                  </VStack>
                </Flex>
              ) : error ? (
                <Flex h="full" justifyContent="center" alignItems="center" flexDirection="column" p={4}>
                  <Text color="red.500" fontWeight="bold" mb={2}>Terjadi Kesalahan Saat Memuat Data:</Text>
                  <Text color="red.400" textAlign="center" fontSize="sm">{error}</Text>
                  <Text color="gray.500" mt={4} fontSize="xs">Silakan cek URL API Anda atau pastikan server berjalan dengan benar.</Text>
                </Flex>
              ) : (
                <MapComponent atmLocations={atmLocations} />
              )}
            </Box>

            <HStack spacing={6} justify="center" pt={2} pb={4}>
              <HStack>
                <Box w={3} h={3} bg="blue.500" borderRadius="full" />
                <Text fontSize="sm">ATM</Text>
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        <Card bg="white" p={4} borderRadius="lg" boxShadow="md">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="lg" fontWeight="semibold">Utilitas Mesin</Text>
            <HStack>
              <Text fontSize="md">Kanwil</Text>
              <Select
                value={selectedKanwil}
                onChange={(e) => setSelectedKanwil(e.target.value)}
                size="sm"
                width="120px"
                borderRadius="md"
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
                _focus={{ borderColor: "blue.700" }}
              >
                <option value="Kanwil 1" style={{ backgroundColor: 'white', color: 'black' }}>Kanwil 1</option>
                <option value="Kanwil 2" style={{ backgroundColor: 'white', color: 'black' }}>Kanwil 2</option>
                <option value="Kanwil 3" style={{ backgroundColor: 'white', color: 'black' }}>Kanwil 3</option>
              </Select>
            </HStack>
          </Flex>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg="gray.100">
                  <Th>Kelompok Tier</Th>
                  <Th textAlign="center">Jumlah Mesin</Th>
                  <Th textAlign="center">Persentase</Th>
                  <Th textAlign="center">Rata-rata Transaksi</Th>
                  <Th textAlign="center">Rata-rata Fee (Rp.)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tableData.map((row, index) => (
                  <Tr key={index}>
                    <Td>
                      <Badge
                        colorScheme={getTierColor(row.tier)}
                        variant="solid"
                        px={3}
                        py={1}
                        borderRadius="md"
                      >
                        {row.tier}
                      </Badge>
                    </Td>
                    <Td textAlign="center" fontWeight="semibold">{row.kelompokTier}</Td>
                    <Td textAlign="center">{row.persentase}</Td>
                    <Td textAlign="center">{row.rataTransaksi}</Td>
                    <Td textAlign="center">{row.rataFee}</Td>
                  </Tr>
                ))}
                <Tr bg="blue.50" fontWeight="bold">
                  <Td>TOTAL</Td>
                  <Td textAlign="center">{totalRow.kelompokTier}</Td>
                  <Td textAlign="center">{totalRow.persentase}</Td>
                  <Td textAlign="center">{totalRow.rataTransaksi}</Td>
                  <Td textAlign="center">{totalRow.rataFee}</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Card>
      </VStack>
    </Box>
  );
};

export default MapView;
