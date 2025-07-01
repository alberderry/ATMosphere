// src/components/CBAAnalysisResultCards.jsx

import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  HStack,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Alert, // <--- Ditambahkan
  AlertIcon, // <--- Ditambahkan
  AlertDescription, // <--- Ditambahkan
  AlertTitle, // <--- Ditambahkan
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
} from "@chakra-ui/react"
import { getColorScheme, getTierColor } from "../../utils/relocationUtils" // Import helpers

const CBAAnalysisResultCards = ({
  cardBg,
  analysisResult,
  mockHistoricalData, // Passed as prop
  nearbyCommonPlacesCount, // New prop for total common places
}) => {
  if (!analysisResult) return null // Jangan render jika tidak ada hasil analisis

  return (
    <>
      {/* Main Result Alert */}
      <Alert
        status={
          analysisResult.color === "green" ? "success" : analysisResult.color === "yellow" ? "warning" : "error"
        }
        borderRadius="lg"
        p={4}
      >
        <AlertIcon />
        <Box flex="1">
          <AlertTitle fontSize="lg">
            Status: {analysisResult.potential} ({analysisResult.tier})
          </AlertTitle>
          <AlertDescription fontSize="sm" mt={1}>
            {analysisResult.recommendation}
            {analysisResult.nearbyBranchCount > 0 && (
              <Text as="span" fontWeight="medium" ml={2}>
                • {analysisResult.nearbyBranchCount} KCP BJB terdekat ditemukan
              </Text>
            )}
            {nearbyCommonPlacesCount > 0 && ( // Tambahkan informasi lokasi umum terdekat
              <Text as="span" fontWeight="medium" ml={2}>
                • {nearbyCommonPlacesCount} lokasi umum terdekat ditemukan
              </Text>
            )}
            {analysisResult.nearbyOtherBanksCount > 0 && ( // <--- Tambahkan informasi ATM lain terdekat
              <Text as="span" fontWeight="medium" ml={2}>
                • {analysisResult.nearbyOtherBanksCount} ATM lain terdekat ditemukan
              </Text>
            )}
          </AlertDescription>
        </Box>
        <Badge colorScheme={getTierColor(analysisResult.tier)} variant="solid" fontSize="sm" px={3} py={1}>
          {analysisResult.tier}
        </Badge>
      </Alert>

      {/* Detailed Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Card bg={cardBg} shadow="sm">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm">Skor Total Potensi</StatLabel>
              <StatNumber color={`${analysisResult.color}.500`} fontSize="2xl">
                {analysisResult.score}%
              </StatNumber>
              <Progress
                value={analysisResult.score}
                colorScheme={getColorScheme(analysisResult.potential)}
                size="sm"
                mt={2}
                borderRadius="full"
              />
            </Stat>
          </CardBody>
        </Card>

        

        {/* <Card bg={cardBg} shadow="sm">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm">Kepadatan Nasabah</StatLabel>
              <StatNumber fontSize="2xl">{analysisResult.customerDensity}</StatNumber>
              <StatHelpText fontSize="xs">dalam radius 2km</StatHelpText>
            </Stat>
          </CardBody>
        </Card> */}

        <Card bg={cardBg} shadow="sm">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm">KCP BJB Terdekat</StatLabel>
              <StatNumber fontSize="2xl" color="blue.500">
                {analysisResult.nearbyBranchCount}
              </StatNumber>
              <StatHelpText fontSize="xs">dalam radius 5km</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* NEW CARD: Jumlah Lokasi Umum Terdekat */}
        <Card bg={cardBg} shadow="sm">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm">Lokasi Umum Terdekat</StatLabel>
              <StatNumber fontSize="2xl" color="purple.500">
                {nearbyCommonPlacesCount}
              </StatNumber>
              <StatHelpText fontSize="xs">total dalam radius 5km</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* NEW CARD: Jumlah ATM Lain Terdekat */}
        <Card bg={cardBg} shadow="sm">
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm">ATM Lain Terdekat</StatLabel>
              <StatNumber fontSize="2xl" color="teal.500"> {/* Menggunakan warna teal */}
                {analysisResult.nearbyOtherBanksCount}
              </StatNumber>
              <StatHelpText fontSize="xs">dalam radius 5km</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Detailed Analysis Breakdown */}
      <Card bg={cardBg} shadow="sm">
        <CardHeader>
          <Heading size="md" color="gray.700">
            Breakdown Analisis
          </Heading>
        </CardHeader>
        <CardBody pt={0}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Skor Kedekatan Nasabah
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {analysisResult.proximityScore}%
                  </Text>
                </Flex>
                <Progress
                  value={analysisResult.proximityScore}
                  colorScheme="blue"
                  size="sm"
                  borderRadius="full"
                />
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Skor Demografis
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {analysisResult.demographicScore}%
                  </Text>
                </Flex>
                <Progress
                  value={analysisResult.demographicScore}
                  colorScheme="green"
                  size="sm"
                  borderRadius="full"
                />
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Bonus Kedekatan KCP BJB
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    +{analysisResult.branchProximityBonus}%
                  </Text>
                </Flex>
                <Progress
                  value={analysisResult.branchProximityBonus}
                  colorScheme="cyan"
                  size="sm"
                  borderRadius="full"
                  max={10}
                />
              </Box>
            </VStack>

            <VStack align="stretch" spacing={4}>
              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Skor Kompetisi
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {analysisResult.competitionScore}%
                  </Text>
                </Flex>
                <Progress
                  value={analysisResult.competitionScore}
                  colorScheme="orange"
                  size="sm"
                  borderRadius="full"
                />
              </Box>

              <Box>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">
                    Skor Aksesibilitas
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {analysisResult.accessibilityScore}%
                  </Text>
                </Flex>
                <Progress
                  value={analysisResult.accessibilityScore}
                  colorScheme="purple"
                  size="sm"
                  borderRadius="full"
                />
              </Box>
            </VStack>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={6}>
            <Stat textAlign="center">
              <StatLabel fontSize="sm">Estimasi Biaya Setup</StatLabel>
              <StatNumber fontSize="lg">Rp {Number(analysisResult.estimatedCost).toLocaleString('id-ID')}M</StatNumber>
            </Stat>
            <Stat textAlign="center">
              <StatLabel fontSize="sm">Jumlah Kompetitor</StatLabel>
              <StatNumber fontSize="lg">{analysisResult.competitorCount}</StatNumber>
            </Stat>
            <Stat textAlign="center">
              <StatLabel fontSize="sm">Skor Aksesibilitas</StatLabel>
              <StatNumber fontSize="lg">{analysisResult.accessibilityScore}%</StatNumber>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Historical Comparison */}
      <Card bg={cardBg} shadow="sm">
        <CardHeader>
          <Heading size="md" color="gray.700">
            Perbandingan dengan Data Historis
          </Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Referensi performa relokasi sebelumnya untuk benchmarking
          </Text>
        </CardHeader>
        <CardBody pt={0}>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th fontSize="xs">Lokasi Referensi</Th>
                  <Th fontSize="xs">Tier</Th>
                  <Th fontSize="xs">Success Rate</Th>
                  <Th fontSize="xs">Jumlah Nasabah</Th>
                  <Th fontSize="xs">Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockHistoricalData.map((data) => (
                  <Tr key={data.id}>
                    <Td fontWeight="medium" fontSize="sm">
                      {data.location}
                    </Td>
                    <Td>
                      <Badge colorScheme={getTierColor(data.tier)} variant="solid" fontSize="xs">
                        {data.tier}
                      </Badge>
                    </Td>
                    <Td fontSize="sm">{data.success_rate}%</Td>
                    <Td fontSize="sm" fontWeight="medium">
                      {data.roi}%
                    </Td>
                    <Td fontSize="sm">{data.customers.toLocaleString()}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          data.success_rate >= 80 ? "green" : data.success_rate >= 60 ? "yellow" : "red"
                        }
                        variant="subtle"
                        fontSize="xs"
                      >
                        {data.success_rate >= 80 ? "Sukses" : data.success_rate >= 60 ? "Moderat" : "Kurang"}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </>
  )
}

export default CBAAnalysisResultCards;
