// src/components/relocation/NearbyOtherBanksCard.jsx

import React from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Tag,
  SimpleGrid,
  Spinner,
  Flex,
  Image,
  Link,
//   useColorModeValue,
} from "@chakra-ui/react";
import {
  FaMapMarkerAlt,
  FaMoneyCheckAlt,
  FaDollarSign,
  FaExternalLinkAlt,
} from "react-icons/fa";

const NearbyOtherBanksCard = ({ cardBg, selectedLocation, isLoadingOtherBanks, nearbyOtherBanks, mapsApiKey }) => {
  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" shadow="md" bg={cardBg}>
      <HStack mb={4} justifyContent="space-between" alignItems="center">
        <HStack>
          <Icon as={FaMoneyCheckAlt} w={6} h={6} color="blue.500" />
          <Heading as="h3" size="lg" fontWeight="semibold">
            Bank / ATM Lain Terdekat
          </Heading>
        </HStack>
        {isLoadingOtherBanks && <Spinner size="sm" color="blue.500" />}
      </HStack>

      <Text mb={4} color="gray.600" _dark={{ color: "gray.400" }}>
        Daftar bank atau ATM lain di sekitar lokasi yang dipilih (radius 5 km).
      </Text>

      {selectedLocation && !isLoadingOtherBanks && nearbyOtherBanks.length === 0 && (
        <Text color="gray.500" fontStyle="italic">
          Tidak ada bank atau ATM lain terdekat yang ditemukan dalam radius 5 km.
        </Text>
      )}

      <VStack spacing={4} align="stretch">
        {nearbyOtherBanks.map((bank) => (
          <Box
            key={bank.id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            borderColor="gray.200"
            _dark={{ borderColor: "gray.700" }}
            // bg={useColorModeValue("gray.50", "gray.700")}
            shadow="sm"
          >
            <Flex alignItems="center" mb={2}>
              {bank.photo ? (
                // Menggunakan Maps_API_KEY dari props
                <Image
                  src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${bank.photo}&key=${mapsApiKey}`}
                  alt={bank.name}
                  boxSize="50px"
                  objectFit="cover"
                  borderRadius="md"
                  mr={3}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/ffffff?text=No+Image'; }}
                />
              ) : (
                <Icon as={FaDollarSign} w={8} h={8} color="green.500" mr={3} />
              )}
              <VStack align="start" spacing={0}>
                <Heading as="h4" size="md" fontWeight="bold">
                  {bank.name}
                </Heading>
                <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                  {bank.address}
                </Text>
              </VStack>
            </Flex>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2} fontSize="sm">
              <HStack>
                <Icon as={FaMapMarkerAlt} color="blue.400" />
                <Text>
                  Jarak: <Text as="span" fontWeight="semibold">{bank.distance} km</Text>
                </Text>
              </HStack>
              <HStack>
                {bank.isOpen !== undefined && (
                  <Tag
                    size="sm"
                    colorScheme={bank.isOpen ? "green" : "red"}
                    variant="solid"
                  >
                    {bank.isOpen ? "Buka" : "Tutup"}
                  </Tag>
                )}
                {bank.rating > 0 && (
                  <Tag size="sm" colorScheme="orange" variant="outline">
                    Rating: {bank.rating} ⭐
                  </Tag>
                )}
              </HStack>
            </SimpleGrid>
            {bank.url && (
              <Link href={bank.url} isExternal mt={2} display="flex" alignItems="center" color="blue.500" fontSize="sm">
                Lihat di Google Maps <Icon as={FaExternalLinkAlt} ml={1} />
              </Link>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default NearbyOtherBanksCard;

