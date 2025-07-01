// src/pages/CBAAnalytics.jsx

import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Center, Spinner, Text, VStack, Box } from '@chakra-ui/react'
import CBAAnalyticsComponent from '../components/CBAAnalyticsComponent'
import { dummyCBAData } from '../data/atmData'; // Import data dummy dari file terpisah

const CBAAnalytics = () => {
  const { atmId } = useParams() // Mengambil ID ATM dari URL
  const [selectedAtm, setSelectedAtm] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Simulasikan pengambilan data dari API
    const fetchedAtm = dummyCBAData.find((atm) => atm.id.toLowerCase() === atmId.toLowerCase()) // Tambahkan .toLowerCase() untuk case-insensitivity
    setTimeout(() => {
      setSelectedAtm(fetchedAtm)
      setLoading(false)
    }, 500) // Simulasi loading 0.5 detik
  }, [atmId])

  if (loading) {
    return (
      <Center h="100vh">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text mt={4}>Memuat analisis CBA...</Text>
        </VStack>
      </Center>
    )
  }

  if (!selectedAtm) {
    return (
      <Center h="100vh">
        <Text fontSize="xl" color="red.500">
          Analisis CBA untuk ATM dengan ID "{atmId}" tidak ditemukan.
        </Text>
      </Center>
    )
  }

  return (
    <Box bg="blue.50" minH="100vh"> {/* Latar belakang biru muda untuk seluruh halaman */}
      <CBAAnalyticsComponent selectedAtm={selectedAtm} />
    </Box>
  )
}

export default CBAAnalytics
