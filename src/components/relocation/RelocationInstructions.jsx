// src/components/RelocationInstructions.jsx

import {
  Box,
  Card,
  CardBody,
  HStack,
  VStack,
  Text,
  
} from "@chakra-ui/react"
import { InfoIcon } from "@chakra-ui/icons"

const RelocationInstructions = ({ cardBg }) => {
  return (
    <Card bg={cardBg} shadow="sm" borderLeft="4px solid" borderLeftColor="blue.400">
      <CardBody>
        <HStack align="start">
          <InfoIcon color="blue.500" mt={1} />
          <VStack align="start" spacing={3}>
            <Text fontWeight="medium" color="gray.700">
              Panduan Penggunaan Analisis Relokasi:
            </Text>
            <VStack align="start" spacing={2} fontSize="sm" color="gray.600">
              <Text>• Masukkan nama lokasi dan koordinat latitude/longitude lokasi target</Text>
              <Text>• Masukkan Biaya perkiraan yang dikeluarkan untuk lokasi itu</Text>
              <Text>• Klik "Analisis Lokasi" untuk memulai simulasi Cost-Benefit Analysis</Text>
              <Text>
                • Sistem akan mengevaluasi potensi berdasarkan kedekatan nasabah, demografi, kompetisi, dan
                aksesibilitas
              </Text>
              <Text>• Review hasil analisis, nasabah terdekat, dan perbandingan dengan data historis</Text>
              <Text>• Gunakan rekomendasi untuk pengambilan keputusan relokasi</Text>
            </VStack>
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  )
}

export default RelocationInstructions
