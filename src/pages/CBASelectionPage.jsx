// src/pages/CBASelectionPage.jsx

import {
  Box,
  Heading,
  Text,
  VStack,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
  Card, // Import Card
  CardBody, // Import CardBody (optional, but good practice for Card content)
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { dummyCBAData } from '../data/atmData';

const CBASelectionPage = () => {
  const [atmIdInput, setAtmIdInput] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleAnalyzeCBA = () => {
    const trimmedInput = atmIdInput.trim();
    if (!trimmedInput) {
      toast({
        title: "Input Kosong",
        description: "Mohon masukkan ID ATM/CRM.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Cek apakah ID ATM/CRM ada di data dummy
    const atmExists = dummyCBAData.some(atm => atm.id.toLowerCase() === trimmedInput.toLowerCase());

    if (atmExists) {
      navigate(`/analytics/cba/${trimmedInput}`);
    } else {
      toast({
        title: "ID ATM/CRM Tidak Ditemukan",
        description: `ID "${trimmedInput}" tidak ada dalam daftar.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={6} bg="blue.50" minH="100vh">
      <VStack spacing={6} align="center" justify="center" minH="calc(100vh - 120px)">
        {/* Konten utama dibungkus dalam Card */}
        <Card p={8} bg="white" shadow="lg" borderRadius="lg" maxW="1000px" width="1000px"  >
          <CardBody p={0}> {/* Hapus padding default CardBody jika p sudah di Card */}
            <VStack spacing={4} align="stretch"> {/* Mengatur spacing di dalam Card */}
              <Heading size="lg" color="gray.700" textAlign="center">
                Cost Benefit Analysis (CBA)
              </Heading>
              <Text fontSize="md" color="gray.600" textAlign="center">
                Masukkan ID Mesin ATM atau CRM untuk melihat analisis biaya dan manfaatnya secara terperinci.
              </Text>

              <FormControl> {/* mt={4} dipindahkan ke spacing VStack */}
                <FormLabel htmlFor="atmId" fontSize="sm" fontWeight="medium">ID Mesin ATM/CRM</FormLabel>
                <Input
                  id="atmId"
                  placeholder="Contoh: ATM001 atau CRM005"
                  value={atmIdInput}
                  onChange={(e) => setAtmIdInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAnalyzeCBA();
                    }
                  }}
                  size="lg"
                  bg="white"
                  borderRadius="md"
                  boxShadow="sm"
                />
              </FormControl>

              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleAnalyzeCBA}
                width="full" // Membuat tombol mengisi lebar Card
              >
                Lihat Analisis CBA
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default CBASelectionPage;
