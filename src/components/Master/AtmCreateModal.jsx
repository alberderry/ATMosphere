// src/components/Pages/AtmCreateModal.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  HStack,
  Box,
  List,
  ListItem,
  Select // <-- Tambahkan import Select di sini
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AtmCreateModal = ({ isOpen, onClose, onSuccess, baseUrl, userBranchId }) => {
  const [formData, setFormData] = useState({
    branch_id: null,
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
  const [suggestionLoading, setSuggestionLoading] = useState(false); // Untuk loading semua cabang atau cabang awal
  const [error, setError] = useState(null);
  const toast = useToast();
  const { getAccessToken } = useAuth();

  const [branchSearchInput, setBranchSearchInput] = useState('');
  const [branchSuggestions, setBranchSuggestions] = useState([]); // Ini akan berisi hasil filter
  const [selectedBranchName, setSelectedBranchName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [initialBranchLoadError, setInitialBranchLoadError] = useState(false);

  // **STATE BARU**: Untuk menyimpan semua data cabang yang diambil dari API
  const [allBranches, setAllBranches] = useState([]); 

  const debounceTimeoutRef = useRef(null);
  const branchSearchRef = useRef(null); 

  const canEditBranch = userBranchId === 0;

  console.log("Modal Open:", isOpen);
  console.log("Prop userBranchId (dari props):", userBranchId);
  console.log("canEditBranch (apakah user bisa cari cabang lain?):", canEditBranch);
  console.log("Current branchSearchInput (teks di input pencarian):", branchSearchInput);
  console.log("Jumlah branchSuggestions yang ada (hasil filter):", branchSuggestions.length);
  console.log("Jumlah allBranches yang ada (semua dari API):", allBranches.length);


  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      branch_id: selectedBranchId
    }));
  }, [selectedBranchId]);

  // **Fungsi BARU** untuk mengambil SEMUA cabang dari API
  const fetchAllBranches = useCallback(async () => {
    setSuggestionLoading(true); // Mulai loading untuk fetch semua cabang
    try {
      const authToken = getAccessToken();
      const response = await axios.get(`${baseUrl}/branches?limit=99999`, { // TIDAK ADA PARAMETER 'name' di sini
        headers: {
          'Authorization': `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      console.log("Respons API untuk SEMUA cabang:", response.data);
      
      // **PERBAIKAN DI SINI**: Cek response.data.data.branches
      if (response.data && response.data.data && Array.isArray(response.data.data.branches)) {
        setAllBranches(response.data.data.branches); // Ambil array 'branches' yang benar
      } else {
        // Ini akan terpanggil jika format respons tidak sesuai harapan (misal: 'branches' bukan array)
        console.warn("Respons API untuk semua cabang tidak mengandung data array 'branches' yang diharapkan. Respons:", response.data);
        setAllBranches([]);
        toast({
          title: "Error",
          description: "Gagal memuat daftar cabang lengkap. Format data dari server tidak sesuai.",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error fetching all branches:", err);
      setAllBranches([]);
      toast({
        title: "Error",
        description: "Gagal memuat daftar cabang lengkap. Terjadi kesalahan jaringan atau server.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setSuggestionLoading(false); // Selesai loading
    }
  }, [baseUrl, getAccessToken, toast]); // Dependency: hanya berubah jika baseUrl/token berubah

  // Effect untuk menangani userBranchId awal dan mereset form saat modal dibuka/ditutup
  useEffect(() => {
    const fetchInitialBranchName = async () => {
      setInitialBranchLoadError(false);
      if (!canEditBranch) { // Jika user terikat pada branch tertentu (userBranchId bukan 0)
        setSuggestionLoading(true); // Ini loading untuk fetch nama 1 cabang saja
        console.log("Memuat cabang tetap untuk ID:", userBranchId);
        try {
          const authToken = getAccessToken();
          const response = await axios.get(`${baseUrl}/branches/${userBranchId}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              "ngrok-skip-browser-warning": "true",
            },
          });
          if (response.data && response.data.data) {
            setSelectedBranchName(response.data.data.name);
            setSelectedBranchId(response.data.data.id);
            setBranchSearchInput(response.data.data.name);
          } else {
            console.warn("Respons API untuk cabang awal tidak mengandung data yang diharapkan. Respons:", response.data);
            toast({
              title: "Peringatan",
              description: `Cabang default (ID: ${userBranchId}) tidak ditemukan atau tidak valid.`,
              status: "warning",
              duration: 3000,
              isClosable: true,
            });
            setSelectedBranchName(`Cabang ID: ${userBranchId} (Tidak Ditemukan)`);
            setSelectedBranchId(userBranchId);
            setBranchSearchInput(`Cabang ID: ${userBranchId} (Tidak Ditemukan)`);
            setInitialBranchLoadError(true);
            setError(`Cabang dengan ID ${userBranchId} tidak ditemukan.`);
          }
        } catch (err) {
          console.error("Error fetching initial branch:", err);
          toast({
            title: "Error",
            description: "Gagal memuat detail cabang default.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          setSelectedBranchName(`Cabang ID: ${userBranchId} (Gagal Memuat)`);
          setSelectedBranchId(userBranchId);
          setBranchSearchInput(`Cabang ID: ${userBranchId} (Gagal Memuat)`);
          setInitialBranchLoadError(true);
          setError(`Gagal memuat detail cabang dengan ID ${userBranchId}.`);
        } finally {
          setSuggestionLoading(false);
        }
      } else { // Jika userBranchId adalah 0 (admin), izinkan pencarian
        console.log("User adalah admin (userBranchId adalah 0). Resetting state untuk pencarian cabang.");
        setSelectedBranchName('');
        setSelectedBranchId(null);
        setBranchSearchInput('');
        setBranchSuggestions([]);
      }
    };

    if (isOpen) {
      setFormData({
        branch_id: null,
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
      fetchInitialBranchName();
      
      // **Tambahan PENTING**: Jika user adalah admin, ambil semua cabang saat modal dibuka
      if (canEditBranch) {
          setAllBranches([]); // Kosongkan dulu agar selalu fetch ulang jika modal dibuka/tutup
          fetchAllBranches(); 
      }
    } else {
        // Saat modal ditutup, bersihkan semua data cabang untuk menghemat memori
        setAllBranches([]);
    }
  }, [isOpen, userBranchId, baseUrl, getAccessToken, toast, canEditBranch, fetchAllBranches]); // fetchAllBranches sebagai dependency


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNumberChange = useCallback((name, valueString) => {
    const value = parseFloat(valueString);
    setFormData((prev) => ({ ...prev, [name]: isNaN(value) ? '' : value }));
  }, []);

  // **Fungsi ini sekarang hanya untuk FILTERING, bukan fetching**
  const filterBranchSuggestions = useCallback((query) => {
    if (query.length < 3) {
      setBranchSuggestions([]);
      console.log("Query terlalu pendek (< 3 karakter) untuk saran:", query);
      return;
    }

    // Lakukan filter dari data allBranches yang sudah ada
    const filtered = allBranches.filter(branch =>
      branch.name.toLowerCase().includes(query.toLowerCase())
    );
    setBranchSuggestions(filtered);
    console.log("Cabang difilter dari allBranches:", filtered.length, "hasil.");
  }, [allBranches]); // Dependency allBranches karena kita memfilternya


  // Handler untuk perubahan input pencarian cabang (dengan debounce)
  const handleBranchSearchChange = useCallback((e) => {
    console.log("handleBranchSearchChange dipicu. canEditBranch:", canEditBranch);
    if (!canEditBranch) return;

    const value = e.target.value;
    setBranchSearchInput(value);
    setSelectedBranchName(value);

    // Pastikan allBranches sudah dimuat sebelum memfilter
    if (allBranches.length === 0 && !suggestionLoading) { // Jika allBranches kosong dan tidak sedang loading
        // Ini kondisi fallback jika somehow allBranches belum ke-load, tapi idealnya sudah di useEffect
        fetchAllBranches(); 
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (value.length >= 3) {
      console.log("Mengatur debounce untuk filterBranchSuggestions dengan query:", value);
      debounceTimeoutRef.current = setTimeout(() => {
        filterBranchSuggestions(value); // Panggil fungsi FILTERING
      }, 300);
    } else {
      console.log("Input terlalu pendek atau dibersihkan, menghapus saran dan ID yang dipilih.");
      setBranchSuggestions([]);
      setSelectedBranchId(null);
    }
  }, [canEditBranch, allBranches, fetchAllBranches, filterBranchSuggestions, suggestionLoading]); // Tambahkan allBranches dan fetchAllBranches sebagai dependency

  // ... (handleSelectBranch dan handleSubmit tetap sama) ...
  const handleSelectBranch = useCallback((branch) => {
    console.log("handleSelectBranch dipicu. Cabang yang dipilih:", branch);
    if (!canEditBranch) return;

    setSelectedBranchName(branch.name);
    setSelectedBranchId(branch.id);
    setBranchSearchInput(branch.name);
    setBranchSuggestions([]);
  }, [canEditBranch]);

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

    if (!selectedBranchId && canEditBranch) {
        setError("Branch must be selected from suggestions.");
        setLoading(false);
        toast({
            title: "Input Tidak Lengkap",
            description: "Silakan pilih cabang dari daftar saran.",
            status: "warning",
            duration: 3000,
            isClosable: true,
        });
        return;
    }
    if (!canEditBranch && initialBranchLoadError) {
        setError("Tidak dapat menyimpan karena cabang default gagal dimuat.");
        setLoading(false);
        toast({
            title: "Error Fatal",
            description: "ATM tidak dapat ditambahkan karena cabang default tidak dapat dimuat.",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
        return;
    }

    const requestBody = {
      ...formData,
      branch_id: selectedBranchId,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      electricity_cost: parseFloat(formData.electricity_cost),
      electronic_cost: parseFloat(formData.electronic_cost),
      rent_cost: parseFloat(formData.rent_cost),
      machine_cost: parseFloat(formData.machine_cost),
    };

    const requiredFields = ['branch_id', 'code', 'name', 'address', 'latitude', 'longitude', 'type', 'brand', 'electricity_cost', 'electronic_cost', 'rent_cost', 'machine_cost'];
    for (const field of requiredFields) {
      if ((!requestBody[field] && requestBody[field] !== 0) || (field === 'branch_id' && requestBody[field] === null)) {
        setError(`Field '${field}' is required.`);
        setLoading(false);
        toast({
            title: "Input Tidak Lengkap",
            description: `Bidang '${field}' diperlukan.`,
            status: "warning",
            duration: 3000,
            isClosable: true,
        });
        return;
      }
    }
    
    if (isNaN(requestBody.latitude) || isNaN(requestBody.longitude)) {
      setError("Latitude and Longitude must be valid numbers.");
      setLoading(false);
      toast({
          title: "Input Tidak Valid",
          description: "Latitude dan Longitude harus berupa angka yang valid.",
          status: "warning",
          duration: 3000,
          isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(`${baseUrl}/atms`, requestBody, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
          'Content-Type': 'application/json',
        },
      });

      console.log("API POST /atms response:", response.data);

      if (response.status === 201) { 
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
          toast({
            title: "ATM Berhasil Dibuat",
            description: "ATM baru berhasil ditambahkan (detail tidak tersedia dalam respons).",
            status: "success",
            duration: 4000,
            isClosable: true,
          });
          console.warn("Created ATM response missing name or code:", response.data);
        }
        onSuccess(); 
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
  }, [formData, selectedBranchId, canEditBranch, initialBranchLoadError, baseUrl, getAccessToken, onSuccess, toast]);

  const formFields = useMemo(() => [
    { name: 'code', label: 'Kode ATM', type: 'text', isRequired: true, value: formData.code, handler: handleChange },
    { name: 'name', label: 'Nama ATM', type: 'text', isRequired: true, value: formData.name, handler: handleChange },
    { name: 'address', label: 'Alamat', type: 'text', isRequired: true, value: formData.address, handler: handleChange },
    { name: 'latitude', label: 'Latitude', type: 'number', isRequired: true, value: formData.latitude, handler: handleNumberChange },
    { name: 'longitude', label: 'Longitude', type: 'number', isRequired: true, value: formData.longitude, handler: handleNumberChange },
     { // <-- Definisi field 'type' diubah menjadi select
      name: 'type',
      label: 'Tipe Mesin',
      type: 'select', // <-- Tipe diubah
      isRequired: true,
      value: formData.type,
      handler: handleChange,
      options: [ // <-- Tambahkan opsi dropdown
        { value: '', label: 'Pilih Tipe Mesin' }, // Opsi default
        { value: 'ATM', label: 'ATM' },
        { value: 'CRM', label: 'CRM' }
      ]
    },
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
        <ModalHeader borderBottomWidth="1px">Tambahkan Mesin Baru</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} as="form">
            <Text fontSize="sm" color="gray.600" mb={4}>
              Isi detail ATM baru di bawah ini. Pastikan semua informasi akurat.
            </Text>

            {/* Field pencarian/pemilihan Branch ID */}
            <FormControl id="branch_id" isRequired={true} position="relative" ref={branchSearchRef}>
              <FormLabel>Cabang</FormLabel>
              <Input
                name="branch_id_search"
                value={branchSearchInput}
                onChange={handleBranchSearchChange}
                placeholder={canEditBranch ? "Cari nama cabang..." : "Cabang ditetapkan oleh sistem"}
                autoComplete="off"
                isInvalid={!!error && (error.includes('Branch must be selected') || error.includes('branch_id')) || initialBranchLoadError}
                // Disabled jika tidak bisa diedit atau sedang memuat SEMUA cabang
                isDisabled={!canEditBranch || suggestionLoading} 
              />
              {/* Indikator loading */}
              {suggestionLoading && ( // Spinner untuk memuat semua cabang (admin) atau cabang default (fixed)
                <HStack mt={2} justifyContent="center"><Spinner size="sm" /> <Text fontSize="sm" color="gray.500">
                    {canEditBranch ? 'Memuat daftar cabang lengkap...' : 'Memuat cabang default...'}
                </Text></HStack>
              )}
              {/* Daftar saran (hanya ditampilkan jika user bisa mengedit cabang) */}
              {canEditBranch && branchSuggestions.length > 0 && branchSearchInput.length >= 3 && (
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  mt={1}
                  maxH="200px"
                  overflowY="auto"
                  position="absolute"
                  width="100%" 
                  zIndex="popover" 
                  bg="white"
                  boxShadow="md"
                >
                  <VStack align="stretch" spacing={0}>
                    {branchSuggestions.map((branch) => (
                      <Button
                        key={branch.id}
                        variant="ghost"
                        justifyContent="flex-start"
                        onClick={() => handleSelectBranch(branch)}
                        _hover={{ bg: 'blue.50' }}
                        py={2}
                        px={4}
                        whiteSpace="normal"
                        height="auto"
                        textAlign="left"
                      >
                        <Text>{branch.name} </Text>
                      </Button>
                    ))}
                  </VStack>
                </Box>
              )}
              {/* Teks konfirmasi cabang yang dipilih atau pesan error loading */}
              {selectedBranchName && (
                <Text mt={2} fontSize="sm" color={initialBranchLoadError ? "red.600" : "green.600"}>
                    Cabang Terpilih: {selectedBranchName} {selectedBranchId ? '' : ''}
                </Text>
              )}
              {/* Pesan jika tidak ada cabang ditemukan setelah pencarian (untuk user yang bisa mengedit) */}
              {canEditBranch && !selectedBranchId && branchSearchInput.length > 0 && !suggestionLoading && allBranches.length > 0 && branchSuggestions.length === 0 && branchSearchInput.length >=3 && (
                <Text mt={2} fontSize="sm" color="gray.500">
                  Tidak ada cabang ditemukan.
                </Text>
              )}
              {/* Pesan untuk memilih cabang dari saran (untuk user yang bisa mengedit) */}
              {canEditBranch && !selectedBranchId && branchSearchInput.length > 0 && !suggestionLoading && branchSuggestions.length > 0 && (
                 <Text mt={2} fontSize="sm" color="orange.500">
                   Pilih cabang dari daftar saran.
                 </Text>
              )}
              {/* Pesan error spesifik untuk pemilihan cabang atau jika cabang default gagal dimuat */}
              {error && (error.includes('Branch must be selected') || (error.includes('branch_id') && !selectedBranchId)) && canEditBranch && (
                  <Text color="red.500" fontSize="sm">Cabang harus dipilih.</Text>
              )}
              {initialBranchLoadError && ( // Menampilkan error jika cabang default gagal dimuat
                  <Text color="red.500" fontSize="sm">
                      Gagal memuat cabang yang ditetapkan. Tidak dapat menyimpan.
                  </Text>
              )}
            </FormControl>

            {/* Render field form lainnya */}
             {formFields.map(field => (
              <FormControl key={field.name} id={field.name} isRequired={field.isRequired}>
                <FormLabel>{field.label}</FormLabel>
                {/* Logika kondisional untuk merender Input, NumberInput, atau Select */}
                {field.type === 'number' ? (
                  <NumberInput value={field.value} onChange={(val) => field.handler(field.name, val)}>
                    <NumberInputField name={field.name} placeholder={`Masukkan ${field.label.toLowerCase()}`} />
                  </NumberInput>
                ) : field.type === 'select' ? ( // <-- Kondisi baru untuk Select
                  <Select
                    name={field.name}
                    value={field.value}
                    onChange={field.handler} // handler sudah disesuaikan untuk Select
                    placeholder={field.options[0].label} // Gunakan placeholder dari opsi pertama
                  >
                    {field.options.slice(1).map(option => ( // Lewati opsi placeholder pertama
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                ) : ( // Default untuk Input biasa
                  <Input
                    name={field.name}
                    value={field.value}
                    onChange={field.handler}
                    placeholder={`Masukkan ${field.label.toLowerCase()}`}
                  />
                )}
              </FormControl>
            ))}
            {/* Menampilkan error umum (bukan error pemilihan cabang) */}
            {error && !error.includes('Branch must be selected') && !error.includes('branch_id') && !initialBranchLoadError && ( 
              <Text color="red.500" fontSize="sm" textAlign="center" mt={3}>
                Error: {error}
              </Text>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px">
          <HStack spacing={3}>
            <Button 
                colorScheme="blue" 
                onClick={handleSubmit} 
                isLoading={loading} 
                loadingText="Menyimpan" 
                px={6}
                isDisabled={loading || (!canEditBranch && initialBranchLoadError)}
            >
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