import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    Box,
    VStack,
    Text,
    InputGroup,
    Input,
    InputRightElement,
    Spinner,
    Icon,
    Portal,
    List,
    ListItem,
    Flex,
    Button,
    TabPanel,
    useToast
} from '@chakra-ui/react';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';

const LocationTab = ({
    locationInput,
    setLocationInput,
    handleLocationInputChange,
    predictions,
    showPredictions,
    setShowPredictions,
    handleSelectPrediction,
    isLoading,
    isLocationValid,
    setIsLocationValid,
    handleClearLocation,
    error,
    selectedPlaceName,
    setSelectedPlaceName,
    latitude,
    setLatitude,
    longitude,
    setLongitude,
    setActiveTab,
    setError,
    mapLoaded,
    // Maps_API_KEY
}) => {
    const inputRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [markerInstance, setMarkerInstance] = useState(null);
    const toast = useToast();

    // State untuk posisi Box prediksi
    const [predictionBoxStyle, setPredictionBoxStyle] = useState({
        top: 0,
        left: 0,
        width: '100%'
    });

    // Effect untuk mengupdate posisi Box prediksi saat input berubah atau window resize
    useEffect(() => {
        const updatePredictionBoxStyle = () => {
            if (inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                setPredictionBoxStyle({
                    top: rect.bottom + window.scrollY, // Posisi bawah input + scrollY untuk posisi absolut di dokumen
                    left: rect.left + window.scrollX,  // Posisi kiri input + scrollX
                    width: rect.width
                });
            }
        };

        updatePredictionBoxStyle(); // Set posisi awal
        window.addEventListener('resize', updatePredictionBoxStyle); // Update saat resize
        window.addEventListener('scroll', updatePredictionBoxStyle); // Update saat scroll

        return () => {
            window.removeEventListener('resize', updatePredictionBoxStyle);
            window.removeEventListener('scroll', updatePredictionBoxStyle);
        };
    }, [locationInput, predictions, showPredictions]); // Tambahkan dependencies yang relevan


    const handleMapClick = useCallback(async (event) => {
        const clickedLat = event.latLng.lat();
        const clickedLng = event.latLng.lng();

        setLatitude(clickedLat);
        setLongitude(clickedLng);
        setIsLocationValid(true);
        setError(null);

        if (window.google && window.google.maps && window.google.maps.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            try {
                const { results } = await geocoder.geocode({ location: { lat: clickedLat, lng: clickedLng } });
                if (results && results.length > 0) {
                    const address = results[0].formatted_address;
                    setLocationInput(address);
                    setSelectedPlaceName(address);
                    setShowPredictions(false);
                } else {
                    setLocationInput(`Lat: ${clickedLat.toFixed(6)}, Lng: ${clickedLng.toFixed(6)}`);
                    setSelectedPlaceName(`Lat: ${clickedLat.toFixed(6)}, Lng: ${clickedLng.toFixed(6)}`);
                    toast({
                        title: "Alamat tidak ditemukan",
                        description: "Koordinat dipilih, tetapi alamat rinci tidak ditemukan.",
                        status: "info",
                        duration: 3000,
                        isClosable: true,
                    });
                }
            } catch (geocodeError) {
                console.error("Error reverse geocoding:", geocodeError);
                toast({
                    title: "Geocoding Gagal",
                    description: "Tidak dapat mengambil alamat untuk lokasi yang diklik.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    }, [setLatitude, setLongitude, setLocationInput, setSelectedPlaceName, setIsLocationValid, setError, toast]);


    useEffect(() => {
        if (mapLoaded && mapContainerRef.current && !mapInstance) {
            try {
                const initialLat = latitude || -6.2088; // Default Jakarta
                const initialLng = longitude || 106.8456; // Default Jakarta

                const mapOptions = {
                    center: { lat: initialLat, lng: initialLng },
                    zoom: 12,
                    fullscreenControl: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    zoomControl: true,
                    scaleControl: true,
                };

                const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
                setMapInstance(map);

                map.addListener("click", handleMapClick);

                if (latitude && longitude) {
                    const marker = new window.google.maps.Marker({
                        position: { lat: latitude, lng: longitude },
                        map: map,
                        title: "Lokasi Dipilih",
                    });
                    setMarkerInstance(marker);
                }

                return () => {
                    if (mapInstance) {
                        window.google.maps.event.clearInstanceListeners(mapInstance);
                    }
                };
            } catch (e) {
                console.error("Error initializing Google Map:", e);
                setError("Gagal memuat peta interaktif. Pastikan kunci API valid.");
            }
        }
    }, [mapLoaded, mapInstance, latitude, longitude, handleMapClick, setError]);


    useEffect(() => {
        if (mapInstance && latitude !== null && longitude !== null) {
            const newPosition = { lat: latitude, lng: longitude };

            if (markerInstance) {
                markerInstance.setPosition(newPosition);
            } else {
                const marker = new window.google.maps.Marker({
                    position: newPosition,
                    map: mapInstance,
                    title: "Lokasi Dipilih",
                });
                setMarkerInstance(marker);
            }
            mapInstance.panTo(newPosition);
            mapInstance.setZoom(15);
        }
    }, [latitude, longitude, mapInstance, markerInstance]);


    return (
        <TabPanel p={6}>
            <VStack spacing={6} align="stretch">
                <Box position="relative">
                    <Text fontSize="lg" fontWeight="semibold" mb={4}>
                        Input Lokasi
                    </Text>
                    <InputGroup>
                        <Input
                            ref={inputRef}
                            placeholder="Hotel Kimaya Braga, Nenjian, Jl Sumur Bandung"
                            value={locationInput}
                            onChange={handleLocationInputChange}
                            onFocus={() => predictions.length > 0 && setShowPredictions(true)}
                            onBlur={() => setTimeout(() => setShowPredictions(false), 200)} // Delay hiding
                        />
                        <InputRightElement width="4.5rem">
                            {isLoading ? <Spinner size="sm" /> :
                                isLocationValid ? <Icon as={FaCheckCircle} color="green.500" /> :
                                    locationInput && !isLocationValid && !isLoading ? (
                                        <Icon as={FaTimesCircle} color="gray.500" cursor="pointer" onClick={handleClearLocation} />
                                    ) :
                                        error ? <Icon as={FaExclamationCircle} color="red.500" /> : null
                            }
                        </InputRightElement>
                    </InputGroup>
                    {error && <Text color="red.500" fontSize="sm" mt={2}>{error}</Text>}

                    {showPredictions && predictions.length > 0 && (
                        <Portal>
                            <Box
                                position="absolute"
                                top={predictionBoxStyle.top}
                                left={predictionBoxStyle.left}
                                width={predictionBoxStyle.width}
                                zIndex={100} // Tingkatkan zIndex agar selalu di atas
                                bg="white"
                                boxShadow="md"
                                borderRadius="md"
                                mt={2}
                                maxHeight="300px"
                                overflowY="auto"
                            >
                                <List spacing={0}>
                                    {predictions.map((prediction) => (
                                        <ListItem
                                            key={prediction.place_id}
                                            p={3}
                                            _hover={{ bg: "gray.100", cursor: "pointer" }}
                                            onClick={() => handleSelectPrediction(prediction)}
                                        >
                                            <Text fontWeight="semibold">{prediction.structured_formatting.main_text}</Text>
                                            <Text fontSize="sm" color="gray.600">{prediction.structured_formatting.secondary_text}</Text>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Portal>
                    )}
                </Box>

                {selectedPlaceName && (
                    <Box>
                        <Text fontSize="md" fontWeight="medium">Lokasi terpilih:</Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.700">{selectedPlaceName}</Text>
                        {latitude && longitude && (
                            <Text fontSize="sm" color="gray.500">
                                Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}
                            </Text>
                        )}
                    </Box>
                )}

                <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={4}>
                        Map View
                    </Text>
                    <Box w="full" h="450px" bg="gray.200" borderRadius="25px" overflow="hidden" position="relative" display="flex" alignItems="center" justifyContent="center">
                        {mapLoaded ? (
                            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <Text color="gray.500">
                                {error ? <VStack><Icon as={FaExclamationCircle} boxSize={8} /><Text>{error}</Text></VStack> : "Memuat peta..."}
                            </Text>
                        )}
                    </Box>
                </Box>

                <Flex justify="flex-end">
                    <Button
                        colorScheme="blue"
                        onClick={() => {
                            if (isLocationValid) {
                                setActiveTab(1);
                                setError(null);
                            } else {
                                setError("Silakan pilih lokasi yang valid dari rekomendasi atau klik di peta.");
                            }
                        }}
                        isDisabled={!isLocationValid || isLoading}
                    >
                        Next
                    </Button>
                </Flex>
            </VStack>
        </TabPanel>
    );
};

export default LocationTab;
