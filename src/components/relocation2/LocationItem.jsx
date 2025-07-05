import React from 'react';
import { Box, Text, Flex, Center, Icon, VStack } from '@chakra-ui/react';
import { FaBuilding } from 'react-icons/fa'; // Default icon

// Fungsi untuk menghitung jarak Haversine antara dua titik (latitude, longitude)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Tambahkan log untuk debugging
    ("calculateDistance - Inputs:", { lat1, lon1, lat2, lon2 });

    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null || 
        isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        ("calculateDistance - Invalid input, returning null.");
        return null; // Mengembalikan null jika ada koordinat yang hilang atau NaN
    }
    const R = 6371; // Radius bumi dalam kilometer
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Jarak dalam km
    
    ("calculateDistance - Calculated distance:", distance);
    return distance;
};

const LocationItem = ({ location, icon: IconComponent = FaBuilding, userLatitude, userLongitude }) => {
    // Menyesuaikan dengan struktur data dari API real
    const displayAddress = location.address || location.formatted_address;
    
    // Ekstraksi latitude dan longitude dari objek lokasi
    // Menggunakan optional chaining untuk menghindari error jika geometry atau location tidak ada
    const locationLat = location.geometry?.location?.lat || location.latitude; // Menambahkan fallback untuk location.latitude jika ada
    const locationLon = location.geometry?.location?.lng || location.longitude; // Menambahkan fallback untuk location.longitude jika ada


    // Log props yang diterima
    ("LocationItem - Props received:", { location, userLatitude, userLongitude });
    ("LocationItem - Extracted location coordinates:", { locationLat, locationLon });

    // Hitung jarak jika koordinat pengguna dan lokasi tersedia
    let distanceToUser = null;
    if (userLatitude !== null && userLongitude !== null && 
        locationLat !== undefined && locationLon !== undefined &&
        !isNaN(userLatitude) && !isNaN(userLongitude) && 
        !isNaN(locationLat) && !isNaN(locationLon)) {
        
        distanceToUser = calculateDistance(userLatitude, userLongitude, locationLat, locationLon);
    } else {
        ("LocationItem - Not enough valid coordinates to calculate distance.");
    }

    // Logika untuk menampilkan jarak dalam km atau meter
    const formatDistance = (dist) => {
        if (typeof dist !== 'number' || isNaN(dist)) {
            return "N/A";
        }
        if (dist < 1) { // Jika jarak kurang dari 1 km, tampilkan dalam meter
            return `${(dist * 1000).toFixed(0)} m`; // Bulatkan ke meter terdekat
        }
        return `${dist.toFixed(2)} km`; // Tampilkan dalam km dengan 2 desimal
    };

    return (
        <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
            <Flex align="center" gap={4}>
                <Center w="48px" h="48px" bg="pink.100" borderRadius="full">
                    <Icon as={IconComponent} color="pink.600" boxSize={6} />
                </Center>
                <Box flex="1">
                    <Text fontWeight="semibold" fontSize="md">
                        {location.name}
                    </Text>
                    {displayAddress && (
                        <Text fontSize="sm" color="gray.600">
                            {displayAddress}
                        </Text>
                    )}
                </Box>
                <Box textAlign="right">
                    <Text color="green.500" fontWeight="semibold">
                        {/* Tampilkan jarak yang dihitung menggunakan fungsi formatDistance */}
                        {formatDistance(distanceToUser !== null ? distanceToUser : location.distance)}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        Distance
                    </Text>
                </Box>
            </Flex>
        </Box>
    );
};

export default LocationItem;
