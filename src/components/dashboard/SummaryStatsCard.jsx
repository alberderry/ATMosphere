// src/components/SummaryStatsCards.jsx

import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Badge,
  Flex,
  SimpleGrid,
  Spinner,
  GridItem,
} from '@chakra-ui/react';
import { Icon } from '@iconify/react';
// import { formatPercentageChange } from '../../utils/dashboardUtils';// Import the helper

const SummaryStatsCards = ({ statsData, loading, error, currentPeriodId }) => {
  // Definisikan array warna gradasi yang akan digunakan untuk setiap kartu
  // Anda bisa menyesuaikan warna dan arah gradasi sesuai keinginan
  const gradientColors = [
    "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)", // Emas ke Oranye
    "linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)", // Biru Langit ke Baja Biru
    "linear-gradient(135deg, #90EE90 0%, #32CD32 100%)", // Hijau Muda ke Lime Green
    // Tambahkan lebih banyak gradasi jika Anda memiliki lebih dari 3 kartu atau ingin variasi
  ];

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {loading ? (
        <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
          <Flex h="150px" justifyContent="center" alignItems="center">
            <VStack>
              <Spinner size="lg" color="blue.500" />
              <Text>Memuat data ringkasan...</Text>
            </VStack>
          </Flex>
        </GridItem>
      ) : error ? (
        <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
          <Flex h="150px" justifyContent="center" alignItems="center" flexDirection="column" p={4}>
            <Text color="red.500" fontWeight="bold" mb={2}>Terjadi Kesalahan Saat Memuat Data Ringkasan:</Text>
            <Text color="red.400" textAlign="center" fontSize="sm">{error}</Text>
            <Text color="gray.500" mt={4} fontSize="xs">Silakan cek URL API Anda atau pastikan server berjalan dengan benar.</Text>
          </Flex>
        </GridItem>
      ) : (
        statsData.map((stat, index) => (
          <Card
            key={index}
            borderRadius={25}
            // Gunakan warna gradasi dari array, cycling through using modulo operator
            // Jika ada lebih dari jumlah warna gradasi, akan kembali ke awal
            bg={gradientColors[index % gradientColors.length]}
            shadow="lg" // Tingkatkan bayangan agar gradasi lebih menonjol
            color="white" // Pastikan teks berwarna putih agar kontras dengan gradasi
            _hover={{
              transform: "translateY(-5px)", // Efek angkat saat hover
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              boxShadow: "xl", // Bayangan lebih besar saat hover
            }}
          >
            <CardBody borderR>
              <Flex align="flex-start">
                {stat.icon && (
                  <Box
                    w="60px"
                    h="60px"
                    // Gunakan warna ikon yang kontras dengan gradasi
                    bg="rgba(255, 255, 255, 0.2)" // Latar belakang ikon semi-transparan putih
                    borderRadius="full"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    mr={6}
                    flexShrink={0}
                  >
                    <Icon
                      icon={stat.icon}
                      fontSize="60px"
                      color="white" // Warna ikon putih
                    />
                  </Box>
                )}
                <VStack align="start" spacing={1} flex="1">
                  <Text fontSize="md" color="whiteAlpha.800">{stat.label}</Text> {/* Warna teks label */}
                  <HStack justify="space-between" w="full">
                    <Text fontSize="1xl" fontWeight="bold" color="white">{stat.value}</Text> {/* Warna teks nilai */}
                    {/* PERUBAHAN: Hanya tampilkan badge pertumbuhan jika currentPeriodId BUKAN 1 */}
                    {currentPeriodId !== 1 && (
                      <Badge
                        colorScheme={stat.color} // Skema warna Badge masih bisa digunakan
                        variant="solid" // Ubah ke solid agar lebih terlihat di atas gradasi
                        px={2}
                        py={2}
                        borderRadius="25px"
                        color="white" // Pastikan teks badge putih
                      >
                        {stat.growth}
                      </Badge>
                    )}
                  </HStack>
                  {/* Teks "from last period" juga hanya tampil jika badge pertumbuhan ditampilkan */}
                  {currentPeriodId !== 1 && (
                    <Text fontSize="xs" color="whiteAlpha.700">from last period</Text> 
                  )}
                </VStack>
              </Flex>
            </CardBody>
          </Card>
        ))
      )}
    </SimpleGrid>
  );
};

export default SummaryStatsCards;
