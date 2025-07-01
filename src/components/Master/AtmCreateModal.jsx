// src/components/Pages/AtmCreateModal.jsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  VStack,
  useToast,
  Spinner,
  Text,
  HStack // Import HStack for better layout control
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext'; // Sesuaikan path

const AtmCreateModal = ({ isOpen, onClose, onSuccess, baseUrl, userBranchId }) => {
  const [formData, setFormData] = useState({
    branch_id: userBranchId || 0, // Default to user's branch ID
    code: '',
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    type: '',
    brand: '',
    electricity_cost: '',
    electronic_cost: '',
    rent_cost: '',
    machine_cost: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { getAccessToken } = useAuth();

  // Reset form data when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        branch_id: userBranchId || 0,
        code: '',
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        type: '',
        brand: '',
        electricity_cost: '',
        electronic_cost: '',
        rent_cost: '',
        machine_cost: '',
      });
      setError(null);
    }
  }, [isOpen, userBranchId]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNumberChange = useCallback((name, valueString) => {
    const value = parseFloat(valueString);
    setFormData((prev) => ({ ...prev, [name]: isNaN(value) ? '' : value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const authToken = getAccessToken();
    if (!authToken) {
      setError("Authentication token not available. Please log in.");
      setLoading(false);
      return;
    }

    const requestBody = {
      ...formData,
      // Pastikan nilai numerik dikonversi dengan benar jika belum
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      electricity_cost: parseFloat(formData.electricity_cost),
      electronic_cost: parseFloat(formData.electronic_cost),
      rent_cost: parseFloat(formData.rent_cost),
      machine_cost: parseFloat(formData.machine_cost),
    };

    // Validasi dasar: pastikan field yang wajib tidak kosong (sesuaikan jika ada field opsional)
    const requiredFields = ['branch_id', 'code', 'name', 'address', 'latitude', 'longitude', 'type', 'brand', 'electricity_cost', 'electronic_cost', 'rent_cost', 'machine_cost'];
    for (const field of requiredFields) {
      if (!requestBody[field] && requestBody[field] !== 0) { // Check for empty string, null, undefined. Allow 0.
        setError(`Field '${field}' is required.`);
        setLoading(false);
        return;
      }
    }
    
    // Pastikan latitude dan longitude adalah angka yang valid
    if (isNaN(requestBody.latitude) || isNaN(requestBody.longitude)) {
      setError("Latitude and Longitude must be valid numbers.");
      setLoading(false);
      return;
    }

    try {
      // Pastikan URL memiliki slash yang benar
      const response = await axios.post(`${baseUrl}/atms`, requestBody, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
          'Content-Type': 'application/json',
        },
      });

      console.log("API POST /atms response:", response.data); // Log respons untuk debugging

      if (response.status === 201) { // 201 Created is typical for successful POST
        // Mengakses data ATM yang baru dibuat secara aman
        // Diasumsikan data ATM ada di response.data.data atau langsung di response.data
        const createdAtm = response.data?.data || response.data; 
        const atmName = createdAtm?.name;
        const atmCode = createdAtm?.code;

        if (atmName && atmCode) {
          toast({
            title: "ATM Berhasil Dibuat",
            description: `ATM '${atmName}' (Code: ${atmCode}) berhasil ditambahkan.`,
            status: "success",
            duration: 4000,
            isClosable: true,
          });
        } else {
          // Fallback toast jika nama atau kode tidak ada dalam respons
          toast({
            title: "ATM Berhasil Dibuat",
            description: "ATM baru berhasil ditambahkan (detail tidak tersedia dalam respons).",
            status: "success",
            duration: 4000,
            isClosable: true,
          });
          console.warn("Created ATM response missing name or code:", response.data);
        }
        onSuccess(); // Panggil onSuccess untuk memuat ulang data di Master.jsx dan menutup modal
      } else {
        const msg = response.data?.message || `Gagal membuat ATM. Status: ${response.status}`;
        setError(msg);
        toast({
          title: "Gagal Membuat ATM",
          description: msg,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error creating ATM:", err);
      const errorMessage = err.response?.data?.message || err.message || "Terjadi kesalahan saat membuat ATM.";
      setError(errorMessage);
      toast({
        title: "Gagal Membuat ATM",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [formData, baseUrl, getAccessToken, onSuccess, toast]);

  const formFields = useMemo(() => [
    { name: 'branch_id', label: 'Branch ID', type: 'number', isRequired: true, value: formData.branch_id, handler: handleNumberChange },
    { name: 'code', label: 'Kode ATM', type: 'text', isRequired: true, value: formData.code, handler: handleChange },
    { name: 'name', label: 'Nama ATM', type: 'text', isRequired: true, value: formData.name, handler: handleChange },
    { name: 'address', label: 'Alamat', type: 'text', isRequired: true, value: formData.address, handler: handleChange },
    { name: 'latitude', label: 'Latitude', type: 'number', isRequired: true, value: formData.latitude, handler: handleNumberChange },
    { name: 'longitude', label: 'Longitude', type: 'number', isRequired: true, value: formData.longitude, handler: handleNumberChange },
    { name: 'type', label: 'Tipe', type: 'text', isRequired: true, value: formData.type, handler: handleChange },
    { name: 'brand', label: 'Brand', type: 'text', isRequired: true, value: formData.brand, handler: handleChange },
    { name: 'electricity_cost', label: 'Biaya Listrik', type: 'number', isRequired: true, value: formData.electricity_cost, handler: handleNumberChange },
    { name: 'electronic_cost', label: 'Biaya Elektronik', type: 'number', isRequired: true, value: formData.electronic_cost, handler: handleNumberChange },
    { name: 'rent_cost', label: 'Biaya Sewa', type: 'number', isRequired: true, value: formData.rent_cost, handler: handleNumberChange },
    { name: 'machine_cost', label: 'Biaya Mesin', type: 'number', isRequired: true, value: formData.machine_cost, handler: handleNumberChange },
  ], [formData, handleChange, handleNumberChange]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader borderBottomWidth="1px">Tambahkan ATM Baru</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} as="form" onSubmit={handleSubmit}>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Isi detail ATM baru di bawah ini. Pastikan semua informasi akurat.
            </Text>
            {formFields.map(field => (
              <FormControl key={field.name} id={field.name} isRequired={field.isRequired}>
                <FormLabel>{field.label}</FormLabel>
                {field.type === 'number' ? (
                  <NumberInput value={field.value} onChange={(val) => field.handler(field.name, val)}>
                    <NumberInputField name={field.name} placeholder={`Masukkan ${field.label.toLowerCase()}`} />
                  </NumberInput>
                ) : (
                  <Input
                    name={field.name}
                    value={field.value}
                    onChange={field.handler}
                    placeholder={`Masukkan ${field.label.toLowerCase()}`}
                  />
                )}
              </FormControl>
            ))}
            {error && (
              <Text color="red.500" fontSize="sm" textAlign="center" mt={3}>
                Error: {error}
              </Text>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px">
          <HStack spacing={3}>
            <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading} loadingText="Menyimpan" px={6}>
              Simpan ATM
            </Button>
            <Button variant="ghost" onClick={onClose} isDisabled={loading}>
              Batal
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AtmCreateModal;
