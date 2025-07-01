// src/components/RelocationHeader.jsx

import { Box, Card, CardHeader, Heading, Text } from "@chakra-ui/react"

const RelocationHeader = ({ cardBg }) => {
  return (
    <Card bg={cardBg} shadow="sm">
      <CardHeader pb={3}>
        <Heading size="lg" color="blue.600" mb={2}>
          Analisis Relokasi ATM/CRM BJB
        </Heading>
        <Text color="gray.600">
          Simulasi Cost-Benefit Analysis berdasarkan data historis relokasi dan analisis nasabah terdekat
        </Text>
      </CardHeader>
    </Card>
  )
}

export default RelocationHeader
