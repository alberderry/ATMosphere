// src/components/NearbyCommonPlacesCard.jsx

import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Flex,
  Spacer,
  Spinner,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from "@chakra-ui/react"
import { getCommonPlaceIcon } from "../../utils/relocationUtils" // Import helper

const NearbyCommonPlacesCard = ({
  cardBg,
  selectedLocation,
  isLoadingCommonPlaces,
  nearbyCommonPlaces,
}) => {
  if (!selectedLocation) return null // Jangan render jika tidak ada lokasi yang dipilih

  const categoryLabels = {
    schools: 'Sekolah',
    supermarkets: 'Supermarket',
    markets: 'Pasar',
    universities: 'Universitas',
    hotels: 'Hotel',
    healthFacilities: 'Fasilitas Kesehatan',
    housingComplexes: 'Perumahan/Komplek',
    restaurants: 'Restoran', // Make sure this is also handled in categoryLabels
    malls: 'Mall', // Make sure this is also handled in categoryLabels
  };


    const getIconForCategoryTab = (categoryKey) => {
    if (categoryKey === 'schools') return getCommonPlaceIcon(['school']);
    if (categoryKey === 'supermarkets') return getCommonPlaceIcon(['supermarket']);
    if (categoryKey === 'markets') return getCommonPlaceIcon(['market']);
    if (categoryKey === 'universities') return getCommonPlaceIcon(['university']);
    if (categoryKey === 'hotels') return getCommonPlaceIcon(['hotel', 'lodging']);
    if (categoryKey === 'healthFacilities') return getCommonPlaceIcon(['hospital', 'health']);
    if (categoryKey === 'housingComplexes') return getCommonPlaceIcon(['housing', 'residential']);
    if (categoryKey === 'restaurants') return getCommonPlaceIcon(['restaurant', 'food']);
    if (categoryKey === 'malls') return getCommonPlaceIcon(['mall', 'shopping_mall']);
    return "📍"; // Default icon
  };

  ("nearbyCommonPlaces prop:", nearbyCommonPlaces);


   return (
    <Card bg={cardBg} shadow="sm">
      <CardHeader>
        <Flex>
          <Box>
            <Heading size="md" color="gray.700">
              Lokasi Umum Terdekat
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Sekolah, Supermarket, Pasar, Universitas, Hotel, Fasilitas Kesehatan, Perumahan/Komplek dalam radius 5km
            </Text>
          </Box>
          <Spacer />
          {isLoadingCommonPlaces && <Spinner size="sm" color="blue.500" />}
        </Flex>
      </CardHeader>
      <CardBody pt={0}>
        {isLoadingCommonPlaces ? (
          <VStack spacing={3}>
            <Spinner size="lg" color="blue.500" />
            <Text fontSize="sm" color="gray.500">
              Mencari lokasi umum terdekat...
            </Text>
          </VStack>
        ) : (
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList overflowX="auto" pb={2}>
              {/* Ensure nearbyCommonPlaces is an object before Object.keys */}
              {Object.keys(nearbyCommonPlaces || {}).map((category) => (
                <Tab key={category} px={4} py={2} fontSize="sm" _selected={{ bg: "blue.50", color: "blue.700" }}>
                  <HStack spacing={1}>
                    <Text fontSize="lg">{getIconForCategoryTab(category)}</Text>
                    <Text>{categoryLabels[category]} ({nearbyCommonPlaces[category]?.length || 0})</Text> {/* Add nullish coalescing for length */}
                  </HStack>
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {Object.keys(nearbyCommonPlaces || {}).map((category) => (
                <TabPanel key={category} p={0} pt={4}>
                  {/* IMPORTANT: Filter out null/undefined entries before mapping */}
                  {/* Also ensure nearbyCommonPlaces[category] is an array before checking length */}
                  {(nearbyCommonPlaces[category] || []).filter(place => place != null).length > 0 ? (
                    <VStack spacing={3} align="stretch" maxH="350px" overflowY="auto">
                      {(nearbyCommonPlaces[category] || []).filter(place => place != null).map((place, index) => (
                        <Box
                          key={place.id || `place-${category}-${index}`}
                          p={3}
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="md"
                          _hover={{ borderColor: "blue.300", bg: "blue.50" }}
                          transition="all 0.2s"
                        >
                          <HStack spacing={3}>
                            {/* Use optional chaining for place.types too */}
                            <Text fontSize="lg">{getCommonPlaceIcon(place.types || [])}</Text>
                            <Box flex="1">
                              <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                                {/* Line 142: Using optional chaining is cleaner and more robust here */}
                                {place.name?.toLowerCase() || ''}
                              </Text>
                              <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                {place.address || ''}
                              </Text>
                              <HStack spacing={2} mt={1}>
                                {place.rating > 0 && (
                                  <Badge colorScheme="yellow" variant="outline" fontSize="xs">
                                    ⭐ {place.rating}
                                  </Badge>
                                )}
                                {place.isOpen !== undefined && (
                                  <Badge colorScheme={place.isOpen ? "green" : "red"} variant="subtle" fontSize="xs">
                                    {place.isOpen ? "Buka" : "Tutup"}
                                  </Badge>
                                )}
                              </HStack>
                            </Box>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <VStack spacing={3} py={6}>
                      <Text fontSize="2xl">🤷‍♀️</Text>
                      <Text fontSize="sm" color="gray.500" textAlign="center">
                        Tidak ada {categoryLabels[category]?.toLowerCase() || 'tempat'} ditemukan dalam radius 5km.
                      </Text>
                    </VStack>
                  )}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        )}
      </CardBody>
    </Card>
  )
}

export default NearbyCommonPlacesCard