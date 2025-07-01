// src/components/relocation/CostInputCard.jsx

import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Input,
  FormControl,
  FormLabel,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";

// Helper function untuk format mata uang Rupiah
const formatRupiah = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "Rp. 0";
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function untuk mengkonversi string rupiah ke angka
const parseRupiah = (value) => {
  if (typeof value !== 'string') return value;
  // Hapus semua karakter non-digit kecuali koma (untuk desimal, jika diperlukan)
  const cleaned = value.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0; // Menggunakan parseInt dan default ke 0 jika tidak valid
};


const CostInputCard = ({ cardBg }) => {
  const [machineRental, setMachineRental] = useState('');
  const [locationRental, setLocationRental] = useState('');
  const [electricityCost, setElectricityCost] = useState('');
  const [refillCost, setRefillCost] = useState('');

  // Handler untuk input yang memformat nilai secara langsung
  const handleInputChange = (e, setter) => {
    const rawValue = e.target.value;
    // Memungkinkan input kosong sementara
    if (rawValue === '') {
      setter('');
      return;
    }
    const parsedValue = parseRupiah(rawValue);
    setter(parsedValue); // Simpan sebagai angka
  };

  // Handler saat input kehilangan fokus (blur) untuk memformat angka
  const handleInputBlur = (setter, currentValue) => {
    if (typeof currentValue === 'number') {
        setter(formatRupiah(currentValue));
    } else if (currentValue === 0) { // Menangani kasus 0 agar tetap diformat
        setter(formatRupiah(0));
    } else {
        setter(''); // Tetapkan kosong jika tidak ada input
    }
  };

  // Handler saat input mendapatkan fokus untuk mengembalikan ke nilai numerik
  const handleInputFocus = (setter, currentValue) => {
    const numValue = parseRupiah(currentValue);
    setter(numValue === 0 ? '' : numValue); // Tampilkan kosong jika 0, atau angka aslinya
  };


  const totalCost = (parseRupiah(machineRental) || 0) +
                    (parseRupiah(locationRental) || 0) +
                    (parseRupiah(electricityCost) || 0) +
                    (parseRupiah(refillCost) || 0);

  return (
    <Card bg={cardBg} shadow="sm">
      <CardHeader>
        <Heading size="md" color="gray.700">
          Input Biaya Relokasi
        </Heading>
        <Text fontSize="sm" color="gray.500" mt={1}>
          Masukkan estimasi biaya-biaya yang terkait dengan relokasi ATM/CRM
        </Text>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium">Biaya Sewa Mesin</FormLabel>
            <Input
              placeholder="Contoh: 5.000.000"
              value={typeof machineRental === 'number' ? machineRental : machineRental}
              onChange={(e) => handleInputChange(e, setMachineRental)}
              onBlur={() => handleInputBlur(setMachineRental, machineRental)}
              onFocus={() => handleInputFocus(setMachineRental, machineRental)}
              type="text" // Gunakan text karena akan diformat
              size="md"
              bg="white"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium">Biaya Sewa Tempat</FormLabel>
            <Input
              placeholder="Contoh: 10.000.000"
              value={typeof locationRental === 'number' ? locationRental : locationRental}
              onChange={(e) => handleInputChange(e, setLocationRental)}
              onBlur={() => handleInputBlur(setLocationRental, locationRental)}
              onFocus={() => handleInputFocus(setLocationRental, locationRental)}
              type="text"
              size="md"
              bg="white"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium">Biaya Listrik</FormLabel>
            <Input
              placeholder="Contoh: 1.500.000"
              value={typeof electricityCost === 'number' ? electricityCost : electricityCost}
              onChange={(e) => handleInputChange(e, setElectricityCost)}
              onBlur={() => handleInputBlur(setElectricityCost, electricityCost)}
              onFocus={() => handleInputFocus(setElectricityCost, electricityCost)}
              type="text"
              size="md"
              bg="white"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" fontWeight="medium">Biaya Isi Ulang</FormLabel>
            <Input
              placeholder="Contoh: 2.000.000"
              value={typeof refillCost === 'number' ? refillCost : refillCost}
              onChange={(e) => handleInputChange(e, setRefillCost)}
              onBlur={() => handleInputBlur(setRefillCost, refillCost)}
              onFocus={() => handleInputFocus(setRefillCost, refillCost)}
              type="text"
              size="md"
              bg="white"
              borderRadius="md"
              boxShadow="sm"
            />
          </FormControl>

          <Box textAlign="right" pt={2}>
            <Text fontSize="md" fontWeight="bold" color="red.600">
              Total Estimasi Biaya: {formatRupiah(totalCost)}
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default CostInputCard;
