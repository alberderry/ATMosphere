// src/components/CBAAnalyticsComponent.jsx

import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  HStack,
  Divider,
  Badge,
} from "@chakra-ui/react"

// Helper function untuk format mata uang Rupiah
const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper function untuk format angka dengan pemisah ribuan
const formatNumber = (num) => {
  return new Intl.NumberFormat('id-ID').format(num)
}

const CBAAnalyticsComponent = ({ selectedAtm }) => {
  if (!selectedAtm) {
    return (
      <Box p={6}>
        <Text fontSize="xl" color="gray.500" textAlign="center">
          Pilih ATM untuk melihat analisis CBA.
        </Text>
      </Box>
    )
  }

  // Hitung total biaya
  const totalCost =
    selectedAtm.costs.machineRental +
    selectedAtm.costs.locationRental +
    selectedAtm.costs.electricity +
    selectedAtm.costs.refill

  // Helper untuk mendapatkan warna status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'green'
      case 'Inactive': return 'red'
      case 'Maintenance': return 'orange'
      default: return 'gray'
    }
  }

  // Helper untuk mendapatkan warna tier
  const getTierColor = (tier) => {
    switch (tier) {
      case 'TIER 1': return 'blue'
      case 'TIER 2': return 'green'
      case 'TIER 3': return 'yellow'
      case 'TIER 4': return 'red'
      default: return 'gray'
    }
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">
          Analisis Biaya-Manfaat (CBA) untuk {selectedAtm.name}
        </Text>

        {/* Informasi Umum ATM */}
        <Card bg="white" shadow="sm" borderRadius="lg">
          <CardHeader pb={2}>
            <HStack justify="space-between" align="center">
              <Heading size="md" color="gray.700">
                Informasi Mesin
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme={getStatusColor(selectedAtm.status)} fontSize="sm" px={3} py={1} borderRadius="md">
                  {selectedAtm.status}
                </Badge>
                <Badge colorScheme={getTierColor(selectedAtm.tier)} fontSize="sm" px={3} py={1} borderRadius="md">
                  {selectedAtm.tier}
                </Badge>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              <Box>
                <Text fontWeight="semibold" fontSize="sm" color="gray.600">ID Mesin:</Text>
                <Text fontSize="md">{selectedAtm.id}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" fontSize="sm" color="gray.600">Tipe:</Text>
                <Text fontSize="md">{selectedAtm.type}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" fontSize="sm" color="gray.600">Lokasi:</Text>
                <Text fontSize="md">{selectedAtm.location}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" fontSize="sm" color="gray.600">Alamat:</Text>
                <Text fontSize="md">{selectedAtm.alamat}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" fontSize="sm" color="gray.600">Cabang Induk:</Text>
                <Text fontSize="md">{selectedAtm.cabangInduk}</Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" fontSize="sm" color="gray.600">Kanwil:</Text>
                <Text fontSize="md">{selectedAtm.kanwil}</Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Bagian Biaya (Cost) */}
        <Card bg="white" shadow="sm" borderRadius="lg">
          <CardHeader pb={2}>
            <Heading size="md" color="red.600">
              Biaya (Cost)
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Estimasi biaya operasional bulanan
            </Text>
          </CardHeader>
          <CardBody pt={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              <Stat>
                <StatLabel fontSize="sm">Biaya Sewa Mesin</StatLabel>
                <StatNumber fontSize="xl">{formatRupiah(selectedAtm.costs.machineRental)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel fontSize="sm">Biaya Sewa Tempat</StatLabel>
                <StatNumber fontSize="xl">{formatRupiah(selectedAtm.costs.locationRental)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel fontSize="sm">Biaya Listrik</StatLabel>
                <StatNumber fontSize="xl">{formatRupiah(selectedAtm.costs.electricity)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel fontSize="sm">Biaya Isi Ulang</StatLabel>
                <StatNumber fontSize="xl">{formatRupiah(selectedAtm.costs.refill)}</StatNumber>
              </Stat>
            </SimpleGrid>
            <Divider my={4} />
            <Stat>
              <StatLabel fontSize="md" fontWeight="bold" color="red.700">Total Biaya</StatLabel>
              <StatNumber fontSize="2xl" color="red.700">{formatRupiah(totalCost)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        {/* Bagian Manfaat (Benefit) */}
        <Card bg="white" shadow="sm" borderRadius="lg">
          <CardHeader pb={2}>
            <Heading size="md" color="green.600">
              Manfaat (Benefit)
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Estimasi manfaat bulanan dari operasional mesin
            </Text>
          </CardHeader>
          <CardBody pt={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Stat>
                <StatLabel fontSize="sm">Jumlah Transaksi</StatLabel>
                <StatNumber fontSize="xl">{formatNumber(selectedAtm.benefits.transactions)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel fontSize="sm">Jumlah Fee</StatLabel>
                <StatNumber fontSize="xl">{formatRupiah(selectedAtm.benefits.totalFee)}</StatNumber>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Ringkasan Analisis */}
        <Card bg="white" shadow="sm" borderRadius="lg">
          <CardHeader pb={2}>
            <Heading size="md" color="blue.600">
              Ringkasan Analisis CBA
            </Heading>
          </CardHeader>
          <CardBody pt={0}>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Total Biaya:</Text>
                <Text color="red.700" fontWeight="bold">{formatRupiah(totalCost)}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="semibold">Total Manfaat (Fee):</Text>
                <Text color="green.700" fontWeight="bold">{formatRupiah(selectedAtm.benefits.totalFee)}</Text>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="lg">Net Benefit:</Text>
                <Text fontSize="lg" fontWeight="bold" color={selectedAtm.benefits.totalFee - totalCost >= 0 ? "green.700" : "red.700"}>
                  {formatRupiah(selectedAtm.benefits.totalFee - totalCost)}
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}

export default CBAAnalyticsComponent
