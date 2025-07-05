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

// Function to load Google Maps script dynamically
const loadGoogleMapsScript = (apiKey) => {
  if (window.google && window.google.maps) {
    return Promise.resolve(); // Already loaded
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
};

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
    replenishment_cost: '',
    cost_period: 'monthly', // Default value
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

  // Map state
  const mapRef = useRef(null);
  const googleMap = useRef(null);
  const marker = useRef(null);
  const mapLoaded = useRef(false); // To track if map script is loaded

  const debounceTimeoutRef = useRef(null);
  const branchSearchRef = useRef(null);
  const latLngInputDebounceRef = useRef(null); // Debounce for manual lat/lng input

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
        replenishment_cost: '',
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
      // Clean up map resources when modal closes
      if (googleMap.current) {
        googleMap.current = null;
        marker.current = null;
        mapLoaded.current = false;
      }
    }
  }, [isOpen, userBranchId, baseUrl, getAccessToken, toast, canEditBranch, fetchAllBranches]);


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNumberChange = useCallback((name, valueString) => {
    const value = parseFloat(valueString);
    setFormData((prev) => ({ ...prev, [name]: isNaN(value) ? '' : value }));

    // Debounce to update map after user finishes typing
    if (latLngInputDebounceRef.current) {
      clearTimeout(latLngInputDebounceRef.current);
    }
    latLngInputDebounceRef.current = setTimeout(() => {
      const lat = name === 'latitude' ? value : parseFloat(formData.latitude);
      const lng = name === 'longitude' ? value : parseFloat(formData.longitude);

      if (googleMap.current && marker.current && !isNaN(lat) && !isNaN(lng)) {
        const newPos = new window.google.maps.LatLng(lat, lng);
        marker.current.setPosition(newPos);
        googleMap.current.setCenter(newPos);
      }
    }, 500); // 500ms debounce
  }, [formData.latitude, formData.longitude]); // Depend on formData lat/lng for correct combined value


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

  // --- Google Maps Logic ---
  // Ganti dengan API Key Google Maps Anda
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_Maps_API_KEY';

  useEffect(() => {
    if (isOpen && mapRef.current && !mapLoaded.current) {
      loadGoogleMapsScript(googleMapsApiKey)
        .then(() => {
          if (mapLoaded.current) return; // Prevent double initialization

          const defaultLocation = { lat: -6.2088, lng: 106.8456 }; // Jakarta coordinates
          const initialLat = parseFloat(formData.latitude);
          const initialLng = parseFloat(formData.longitude);

          const center = (!isNaN(initialLat) && !isNaN(initialLng))
            ? { lat: initialLat, lng: initialLng }
            : defaultLocation;

          googleMap.current = new window.google.maps.Map(mapRef.current, {
            center: center,
            zoom: 12,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          });

          marker.current = new window.google.maps.Marker({
            position: center,
            map: googleMap.current,
            draggable: true,
          });

          marker.current.addListener('dragend', () => {
            const newPos = marker.current.getPosition();
            setFormData(prev => ({
              ...prev,
              latitude: newPos.lat().toFixed(6), // Limit decimal places
              longitude: newPos.lng().toFixed(6), // Limit decimal places
            }));
          });
          mapLoaded.current = true; // Mark map as loaded
        })
        .catch(err => {
          console.error(err);
          toast({
            title: "Error Loading Map",
            description: "Gagal memuat Google Maps. Cek koneksi internet Anda atau kunci API.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        });
    }
  }, [isOpen, googleMapsApiKey, formData.latitude, formData.longitude, toast]);

  // Effect to update map marker when formData.latitude or longitude changes (e.g., manual input)
  useEffect(() => {
    // Only update if map is loaded and the change didn't originate from map drag
    if (mapLoaded.current && googleMap.current && marker.current) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const currentMarkerPos = marker.current.getPosition();
        // Only update if position is different to avoid infinite loop with dragend
        if (currentMarkerPos.lat().toFixed(6) !== lat.toFixed(6) || currentMarkerPos.lng().toFixed(6) !== lng.toFixed(6)) {
          const newPos = new window.google.maps.LatLng(lat, lng);
          marker.current.setPosition(newPos);
          googleMap.current.setCenter(newPos);
        }
      }
    }
  }, [formData.latitude, formData.longitude]);


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
        replenishment_cost: parseFloat(formData.replenishment_cost),
        cost_period: formData.cost_period,
      };
    }

    // Daftar field yang wajib diisi (selain biaya jika checkbox tidak diaktifkan)
    const baseRequiredFields = ['branch_id', 'code', 'name', 'address', 'latitude', 'longitude', 'type', 'brand'];
    let allRequiredFields = [...baseRequiredFields];

    // Jika checkbox biaya diaktifkan, tambahkan field biaya ke daftar requiredFields
    if (enableCostFields) {
      allRequiredFields = [
        ...allRequiredFields,
        // 'electricity_cost',
        // 'electronic_cost',
        // 'rent_cost',
        // 'machine_cost',
        // 'replenishment_cost',
        // 'cost_period',
      ];
    }

    for (const field of allRequiredFields) {
      if ((!requestBody[field] && requestBody[field] !== 0 && field !== 'cost_period') || (field === 'branch_id' && requestBody[field] === null)) {
        setError(`Field '${field}' is required.`);
        setLoading(false);
        toast({
          title: "Input Tidak Lengkap",
          description: `Field '${field}' diperlukan.`,
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
      const costFields = [];
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
            description: "ATM baru berhasil ditambahkan.",
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
    { name: 'code', label: 'Kode ATM', type: 'text', value: formData.code, handler: handleChange },
    { name: 'name', label: 'Nama ATM', type: 'text', value: formData.name, handler: handleChange },
    { name: 'address', label: 'Alamat', type: 'text', value: formData.address, handler: handleChange },
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
    { name: 'electricity_cost', label: 'Electricity Cost', type: 'number',  value: formData.electricity_cost, handler: handleNumberChange, disabled: !enableCostFields },
    { name: 'electronic_cost', label: 'Electronic Cost', type: 'number',  value: formData.electronic_cost, handler: handleNumberChange, disabled: !enableCostFields },
    { name: 'rent_cost', label: 'Facility Rental Cost', type: 'number',  value: formData.rent_cost, handler: handleNumberChange, disabled: !enableCostFields },
    { name: 'machine_cost', label: 'Machine Rental Cost', type: 'number',  value: formData.machine_cost, handler: handleNumberChange, disabled: !enableCostFields },
    { name: 'replenishment_cost', label: 'Cash Replenishment Cost', type: 'number', value: formData.replenishment_cost, handler: handleNumberChange, disabled: !enableCostFields },
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

            {/* Latitude and Longitude Input (always visible) */}
            <FormControl id="location_input">
              <FormLabel>Lokasi (Latitude & Longitude)</FormLabel>
              <HStack spacing={4} width="100%">
                <FormControl id="latitude" isRequired={true}>
                  <FormLabel fontSize="sm">Latitude</FormLabel>
                  <NumberInput
                    value={formData.latitude}
                    onChange={(val) => handleNumberChange('latitude', val)}
                    precision={6} // Display up to 6 decimal places
                    step={0.000001} // Small step for precise changes
                  >
                    <NumberInputField name="latitude" placeholder="e.g., -6.2088" />
                  </NumberInput>
                </FormControl>
                <FormControl id="longitude" isRequired={true}>
                  <FormLabel fontSize="sm">Longitude</FormLabel>
                  <NumberInput
                    value={formData.longitude}
                    onChange={(val) => handleNumberChange('longitude', val)}
                    precision={6} // Display up to 6 decimal places
                    step={0.000001} // Small step for precise changes
                  >
                    <NumberInputField name="longitude" placeholder="e.g., 106.8456" />
                  </NumberInput>
                </FormControl>
              </HStack>
            </FormControl>

            {/* Google Maps View (always visible below inputs) */}
            <Box width="100%" height="400px" borderWidth="1px" borderRadius="md" overflow="hidden">
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
              <Text fontSize="sm" color="gray.600" mt={2} textAlign="center">
                Seret pin di peta untuk menyesuaikan Latitude dan Longitude.
              </Text>
            </Box>

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
                  value={formData.cost_period}
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