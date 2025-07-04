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
  Select,
  Checkbox
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
    // **NAMA FIELD DIUBAH**: replenishment_cost
    replenishment_cost: '',
    // cost_period: 'monthly',
  });
  const [loading, setLoading] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { getAccessToken } = useAuth();

  const [branchSearchInput, setBranchSearchInput] = useState('');
  const [branchSuggestions, setBranchSuggestions] = useState([]);
  const [selectedBranchName, setSelectedBranchName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [initialBranchLoadError, setInitialBranchLoadError] = useState(false);

  const [allBranches, setAllBranches] = useState([]);

  const [enableCostFields, setEnableCostFields] = useState(false);

  const debounceTimeoutRef = useRef(null);
  const branchSearchRef = useRef(null);

  const canEditBranch = userBranchId === 0;

  console.log("Modal Open:", isOpen);
  console.log("Prop userBranchId (dari props):", userBranchId);
  console.log("canEditBranch (apakah user bisa cari cabang lain?):", canEditBranch);
  console.log("Current branchSearchInput (teks di input pencarian):", branchSearchInput);
  console.log("Jumlah branchSuggestions yang ada (hasil filter):", branchSuggestions.length);
  console.log("Jumlah allBranches yang ada (semua dari API):", allBranches.length);
  console.log("Enable Cost Fields:", enableCostFields);


  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      branch_id: selectedBranchId
    }));
  }, [selectedBranchId]);

  const fetchAllBranches = useCallback(async () => {
    setSuggestionLoading(true);
    try {
      const authToken = getAccessToken();
      const response = await axios.get(`${baseUrl}/branches?limit=99999`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      console.log("Respons API untuk SEMUA cabang:", response.data);

      if (response.data && response.data.data && Array.isArray(response.data.data.branches)) {
        setAllBranches(response.data.data.branches);
      } else {
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
      setSuggestionLoading(false);
    }
  }, [baseUrl, getAccessToken, toast]);

  useEffect(() => {
    const fetchInitialBranchName = async () => {
      setInitialBranchLoadError(false);
      if (!canEditBranch) {
        setSuggestionLoading(true);
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
      } else {
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
        replenishment_cost: '', // Reset replenishment cost
        cost_period: 'monthly',
      });
      setEnableCostFields(false);
      setError(null);
      fetchInitialBranchName();

      if (canEditBranch) {
        setAllBranches([]);
        fetchAllBranches();
      }
    } else {
      setAllBranches([]);
    }
  }, [isOpen, userBranchId, baseUrl, getAccessToken, toast, canEditBranch, fetchAllBranches]);


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNumberChange = useCallback((name, valueString) => {
    const value = parseFloat(valueString);
    setFormData((prev) => ({ ...prev, [name]: isNaN(value) ? '' : value }));
  }, []);

  const filterBranchSuggestions = useCallback((query) => {
    if (query.length < 3) {
      setBranchSuggestions([]);
      console.log("Query terlalu pendek (< 3 karakter) untuk saran:", query);
      return;
    }

    const filtered = allBranches.filter(branch =>
      branch.name.toLowerCase().includes(query.toLowerCase())
    );
    setBranchSuggestions(filtered);
    console.log("Cabang difilter dari allBranches:", filtered.length, "hasil.");
  }, [allBranches]);


  const handleBranchSearchChange = useCallback((e) => {
    console.log("handleBranchSearchChange dipicu. canEditBranch:", canEditBranch);
    if (!canEditBranch) return;

    const value = e.target.value;
    setBranchSearchInput(value);
    setSelectedBranchName(value);

    if (allBranches.length === 0 && !suggestionLoading) {
      fetchAllBranches();
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (value.length >= 3) {
      console.log("Mengatur debounce untuk filterBranchSuggestions dengan query:", value);
      debounceTimeoutRef.current = setTimeout(() => {
        filterBranchSuggestions(value);
      }, 300);
    } else {
      console.log("Input terlalu pendek atau dibersihkan, menghapus saran dan ID yang dipilih.");
      setBranchSuggestions([]);
      setSelectedBranchId(null);
    }
  }, [canEditBranch, allBranches, fetchAllBranches, filterBranchSuggestions, suggestionLoading]);

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

    // Bangun requestBody secara kondisional
    let requestBody = {
      branch_id: selectedBranchId,
      code: formData.code,
      name: formData.name,
      address: formData.address,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      type: formData.type,
      brand: formData.brand,
    };

    // Tambahkan biaya hanya jika checkbox diaktifkan
    if (enableCostFields) {
      requestBody = {
        ...requestBody,
        electricity_cost: parseFloat(formData.electricity_cost),
        electronic_cost: parseFloat(formData.electronic_cost),
        rent_cost: parseFloat(formData.rent_cost),
        machine_cost: parseFloat(formData.machine_cost),
        replenishment_cost: parseFloat(formData.replenishment_cost), // Nama field disesuaikan
        
      };
    }

    // Daftar field yang wajib diisi (selain biaya jika checkbox tidak diaktifkan)
    const baseRequiredFields = ['branch_id', 'code', 'name', 'address', 'latitude', 'longitude', 'type', 'brand'];
    let allRequiredFields = [...baseRequiredFields];

    // Jika checkbox biaya diaktifkan, tambahkan field biaya ke daftar requiredFields
    if (enableCostFields) {
      allRequiredFields = [
        ...allRequiredFields,
        'electricity_cost',
        'electronic_cost',
        'rent_cost',
        'machine_cost',
        'replenishment_cost', // Nama field disesuaikan
      ];
    }

    for (const field of allRequiredFields) {
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

    if (enableCostFields) {
      const costFields = ['electricity_cost', 'electronic_cost', 'rent_cost', 'machine_cost', 'replenishment_cost']; // Nama field disesuaikan
      for (const costField of costFields) {
        if (isNaN(requestBody[costField])) {
          setError(`Biaya '${costField}' harus berupa angka yang valid.`);
          setLoading(false);
          toast({
            title: "Input Tidak Valid",
            description: `Biaya '${costField}' harus berupa angka yang valid.`,
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          return;
        }
      }
    }

    try {
      const response = await axios.post(`${baseUrl}atms`, requestBody, {
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
  }, [formData, selectedBranchId, canEditBranch, initialBranchLoadError, enableCostFields, baseUrl, getAccessToken, onSuccess, toast]);

  const formFields = useMemo(() => [
    { name: 'code', label: 'Kode ATM', type: 'text', isRequired: true, value: formData.code, handler: handleChange },
    { name: 'name', label: 'Nama ATM', type: 'text', isRequired: true, value: formData.name, handler: handleChange },
    { name: 'address', label: 'Alamat', type: 'text', isRequired: true, value: formData.address, handler: handleChange },
    { name: 'latitude', label: 'Latitude', type: 'number', isRequired: true, value: formData.latitude, handler: handleNumberChange },
    { name: 'longitude', label: 'Longitude', type: 'number', isRequired: true, value: formData.longitude, handler: handleNumberChange },
    {
      name: 'type',
      label: 'Tipe Mesin',
      type: 'select',
      isRequired: true,
      value: formData.type,
      handler: handleChange,
      options: [
        { value: '', label: 'Pilih Tipe Mesin' },
        { value: 'ATM', label: 'ATM' },
        { value: 'CRM', label: 'CRM' }
      ]
    },
    { name: 'brand', label: 'Brand', type: 'text', isRequired: true, value: formData.brand, handler: handleChange },
    // Biaya-biaya ini sekarang dikontrol oleh `enableCostFields`
    { name: 'electricity_cost', label: 'Electricity Cost', type: 'number', isRequired: enableCostFields, value: formData.electricity_cost, handler: handleNumberChange, disabled: !enableCostFields },
    { name: 'electronic_cost', label: 'Electronic Cost', type: 'number', isRequired: enableCostFields, value: formData.electronic_cost, handler: handleNumberChange, disabled: !enableCostFields },
    { name: 'rent_cost', label: 'Facility Rental Cost', type: 'number', isRequired: enableCostFields, value: formData.rent_cost, handler: handleNumberChange, disabled: !enableCostFields },
    { name: 'machine_cost', label: 'Machine Rental Cost', type: 'number', isRequired: enableCostFields, value: formData.machine_cost, handler: handleNumberChange, disabled: !enableCostFields },
    { name: 'replenishment_cost', label: 'Cash Replenishment Cost', type: 'number', isRequired: enableCostFields, value: formData.replenishment_cost, handler: handleNumberChange, disabled: !enableCostFields },
  ], [formData, handleChange, handleNumberChange, enableCostFields]);

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
                isDisabled={!canEditBranch || suggestionLoading}
              />
              {suggestionLoading && (
                <HStack mt={2} justifyContent="center"><Spinner size="sm" /> <Text fontSize="sm" color="gray.500">
                  {canEditBranch ? 'Memuat daftar cabang lengkap...' : 'Memuat cabang default...'}
                </Text></HStack>
              )}
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
              {selectedBranchName && (
                <Text mt={2} fontSize="sm" color={initialBranchLoadError ? "red.600" : "green.600"}>
                  Cabang Terpilih: {selectedBranchName} {selectedBranchId ? '' : ''}
                </Text>
              )}
              {canEditBranch && !selectedBranchId && branchSearchInput.length > 0 && !suggestionLoading && allBranches.length > 0 && branchSuggestions.length === 0 && branchSearchInput.length >= 3 && (
                <Text mt={2} fontSize="sm" color="gray.500">
                  Tidak ada cabang ditemukan.
                </Text>
              )}
              {canEditBranch && !selectedBranchId && branchSearchInput.length > 0 && !suggestionLoading && branchSuggestions.length > 0 && (
                <Text mt={2} fontSize="sm" color="orange.500">
                  Pilih cabang dari daftar saran.
                </Text>
              )}
              {error && (error.includes('Branch must be selected') || (error.includes('branch_id') && !selectedBranchId)) && canEditBranch && (
                <Text color="red.500" fontSize="sm">Cabang harus dipilih.</Text>
              )}
              {initialBranchLoadError && (
                <Text color="red.500" fontSize="sm">
                  Gagal memuat cabang yang ditetapkan. Tidak dapat menyimpan.
                </Text>
              )}
            </FormControl>

            {formFields.filter(field => !['electricity_cost', 'electronic_cost', 'rent_cost', 'machine_cost', 'replenishment_cost'].includes(field.name)).map(field => (
              <FormControl key={field.name} id={field.name} isRequired={field.isRequired}>
                <FormLabel>{field.label}</FormLabel>
                {field.type === 'number' ? (
                  <NumberInput value={field.value} onChange={(val) => field.handler(field.name, val)}>
                    <NumberInputField name={field.name} placeholder={`Masukkan ${field.label.toLowerCase()}`} />
                  </NumberInput>
                ) : field.type === 'select' ? (
                  <Select
                    name={field.name}
                    value={field.value}
                    onChange={field.handler}
                    placeholder={field.options[0].label}
                  >
                    {field.options.slice(1).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
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

            ---

            <FormControl display="flex" alignItems="center">
              <Checkbox
                id="enable_cost_fields"
                isChecked={enableCostFields}
                onChange={(e) => setEnableCostFields(e.target.checked)}
              >
                Aktifkan Pengisian Biaya Operasional
              </Checkbox>
            </FormControl>

            {enableCostFields && (
              <FormControl id="cost_period" isRequired={true}>
                <FormLabel>Periode Biaya</FormLabel>
                <Select
                  name="cost_period"
                 
                  onChange={handleChange}
                >
                  <option value="monthly">Per Bulan</option>
                  <option value="annually">Per Tahun</option>
                </Select>
              </FormControl>
            )}

            {enableCostFields && (
              <>
                {formFields.filter(field => ['electricity_cost', 'electronic_cost', 'rent_cost', 'machine_cost', 'replenishment_cost'].includes(field.name)).map(field => (
                  <FormControl key={field.name} id={field.name} isRequired={field.isRequired} isDisabled={field.disabled}>
                    <FormLabel>{field.label}</FormLabel>
                    <NumberInput value={field.value} onChange={(val) => field.handler(field.name, val)}>
                      <NumberInputField name={field.name} placeholder={`Masukkan ${field.label.toLowerCase()}`} />
                    </NumberInput>
                  </FormControl>
                ))}
              </>
            )}

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