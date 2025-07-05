// src/components/MapView/MapViewCard.jsx
import { Box, Flex, Text, HStack, VStack, Spinner, Select } from '@chakra-ui/react';
import MapViewComponent from './MapViewComponent'
import { useMemo } from 'react';

const MapViewCard = ({ 
  loading, 
  // error, 
  atmLocations, 
  atmPerformances, 
  getTierColor,
  selectedKanwilId, // Menerima prop
  setSelectedKanwilId, // Menerima prop
  kanwilOptions, // Menerima prop
  selectedTier, // Menerima prop
  setSelectedTier // Menerima prop
}) => {

  const combinedAtmLocations = useMemo(() => {
    if (atmLocations.length === 0) {
      return [];
    }

    const performanceMap = new Map();
    atmPerformances.forEach(perf => {
      if (perf.atm_id && perf.atm_id.id) {
        performanceMap.set(perf.atm_id.id, perf);
      }
    });

    // Filtering berdasarkan tier dilakukan di sini
    return atmLocations.map(atm => {
      const performance = performanceMap.get(atm.id);
      return {
        ...atm,
        tier: performance ? performance.tier : 'N/A',
        volume_trx: performance ? performance.volume_trx : 'N/A',
        fee: performance ? performance.fee : 'N/A',
      };
    }).filter(atm => {
      // Filter sisi klien berdasarkan tier jika selectedTier bukan 'all'
      const matchesTier = selectedTier === 'all' || 
                            (atm.tier !== 'N/A' && String(atm.tier) === selectedTier) ||
                            (selectedTier === '0' && atm.tier === 'N/A'); // Handle 'TIDAK DIHITUNG'
      return matchesTier;
    });
  }, [atmLocations, atmPerformances, selectedTier]); // selectedKanwilId TIDAK diperlukan di sini karena sudah difilter di parent

  return (
    <Box borderRadius="25px" boxShadow="md" bg="white">
      <Flex justify="space-between" align="center" p={4} borderBottom="1px solid" borderColor="gray.100">
        <Text fontSize="lg" fontWeight="semibold">ATM & CRM Positioning</Text>
        <HStack spacing={4}>
          <HStack>
            <Text fontSize="md">Kanwil :</Text>
            <Select
              value={selectedKanwilId}
              onChange={(e) => setSelectedKanwilId(e.target.value)}
              size="sm"
              width="150px"
              borderRadius="md"
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              _focus={{ borderColor: "blue.700" }}
            >
              {kanwilOptions.map(option => (
                <option
                  key={option.value}
                  value={option.value}
                  style={{ backgroundColor: 'white', color: 'black' }}
                >
                  {option.label}
                </option>
              ))}
            </Select>
          </HStack>
          <HStack>
            <Text fontSize="md">Tier :</Text>
            <Select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              size="sm"
              width="130px"
              borderRadius="md"
              bg="purple.500" // Warna baru untuk filter Tier
              color="white"
              _hover={{ bg: "purple.600" }}
              _focus={{ borderColor: "purple.700" }}
            >
              <option value="all" style={{ backgroundColor: 'white', color: 'black' }}>Semua Tier</option>
              <option value="0" style={{ backgroundColor: 'white', color: 'black' }}>Tidak Dihitung</option>
              <option value="1" style={{ backgroundColor: 'white', color: 'black' }}>Tier 1</option>
              <option value="2" style={{ backgroundColor: 'white', color: 'black' }}>Tier 2</option>
              <option value="3" style={{ backgroundColor: 'white', color: 'black' }}>Tier 3</option>
              <option value="4" style={{ backgroundColor: 'white', color: 'black' }}>Tier 4</option>
            </Select>
          </HStack>
        </HStack>
      </Flex>
      <Box 
        h="400px" 
        bg="gray.100" 
        borderRadius="20px" 
        overflow="hidden" 
        boxShadow="md" 
        mb={4} 
        mx={4} 
        mt={4} 
      >
        {loading ? (
          <Flex h="full" justifyContent="center" alignItems="center">
            <VStack>
              <Spinner size="lg" color="blue.500" />
              <Text>Memuat data ATM...</Text>
            </VStack>
          </Flex>
        /* ) : error ? ( */
          /* <Flex h="full" justifyContent="center" alignItems="center" flexDirection="column" p={4}>
            <Text color="red.500" fontWeight="bold" mb={2}>Terjadi Kesalahan Saat Memuat Data:</Text>
            <Text color="red.400" textAlign="center" fontSize="sm">{error}</Text>
            <Text color="gray.500" mt={4} fontSize="xs">Silakan cek URL API Anda atau pastikan server berjalan dengan benar.</Text>
          </Flex> */
        ) : (
          <MapViewComponent atmLocations={combinedAtmLocations} userLocation={null} getTierColor={getTierColor} />
        )}
      </Box>

      {/* Legend for ATM colors by tier */}
      <HStack spacing={6} justify="center" pt={2} pb={4}>
        <HStack>
          <Box w={3} h={3} bg="gray.500" borderRadius="full" />
          <Text fontSize="sm">TIDAK DIHITUNG</Text>
        </HStack>
        <HStack>
          <Box w={3} h={3} bg="blue.500" borderRadius="full" />
          <Text fontSize="sm">TIER 1</Text>
        </HStack>
        <HStack>
          <Box w={3} h={3} bg="green.500" borderRadius="full" />
          <Text fontSize="sm">TIER 2</Text>
        </HStack>
        <HStack>
          <Box w={3} h={3} bg="yellow.500" borderRadius="full" />
          <Text fontSize="sm">TIER 3</Text>
        </HStack>
        <HStack>
          <Box w={3} h={3} bg="red.500" borderRadius="full" />
          <Text fontSize="sm">TIER 4</Text>
        </HStack>
      </HStack>
    </Box>
  );
};

export default MapViewCard;
