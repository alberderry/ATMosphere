// src/components/NearbyBranchesCard.jsx

import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Flex,
  Spacer,
  Badge,
  Spinner,
  VStack,
  HStack,
} from "@chakra-ui/react"
import { getBranchTypeIcon } from "../../utils/relocationUtils" // Import helper

const NearbyBranchesCard = ({
  cardBg,
  selectedLocation,
  // isLoadingBranches,
  nearbyBJBBranches,
}) => {
  if (!selectedLocation) return null // Jangan render jika tidak ada lokasi yang dipilih

  return (
    <Card bg={cardBg} shadow="sm">
      {/* ... CardHeader ... */}
      <CardBody pt={0}>
        {/* ... loading state ... */}
        {nearbyBJBBranches.length > 0 ? (
          <VStack spacing={3} align="stretch" maxH="350px" overflowY="auto">
            {nearbyBJBBranches.map((branch) => (
              <Box
                key={branch.id}
                p={3}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                _hover={{ borderColor: "blue.300", bg: "blue.50" }}
                transition="all 0.2s"
              >
                <HStack spacing={3}>
                  {/* KOREKSI PANGGILAN DI SINI */}
                  <Text fontSize="lg">{getBranchTypeIcon(branch.name)}</Text> {/* Pass branch.name */}
                  <Box flex="1">
                    <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                      {branch.name}
                    </Text>
                    <Text fontSize="xs" color="gray.600" noOfLines={2}>
                      {branch.address}
                    </Text>
                    <HStack spacing={2} mt={1}>
                      <Badge colorScheme="blue" variant="outline" fontSize="xs">
                        {branch.distance} km
                      </Badge>
                      {/* Rating dan isOpen tidak ada di nearest_branches / nearest_atms API Anda */}
                      {/* branch.rating > 0 && (
                        <Badge colorScheme="yellow" variant="outline" fontSize="xs">
                          ⭐ {branch.rating}
                        </Badge>
                      ) */}
                      {/* branch.isOpen !== undefined && (
                        <Badge colorScheme={branch.isOpen ? "green" : "red"} variant="subtle" fontSize="xs">
                          {branch.isOpen ? "Buka" : "Tutup"}
                        </Badge>
                      ) */}
                    </HStack>
                  </Box>
                </HStack>
              </Box>
            ))}
          </VStack>
        ) : (
          <VStack spacing={3} py={6}>
            <Text fontSize="2xl">🏦</Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Tidak ada KCP BJB ditemukan dalam radius 5km
            </Text>
          </VStack>
        )}
      </CardBody>
    </Card>
  )
}

export default NearbyBranchesCard
