import React, { useState, useMemo } from 'react';
import {
    TabPanel,
    VStack,
    Text,
    Button,
    Flex,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    Badge,
    HStack,
    Icon,
    Box
} from '@chakra-ui/react';
import LocationItem from './LocationItem';
// Import ikon khusus untuk setiap kategori jika tersedia, atau gunakan FaMapMarkerAlt sebagai fallback
import { FaSchool, FaShoppingBag, FaStore, FaUniversity, FaHotel, FaClinicMedical, FaHome, FaMapMarkerAlt } from 'react-icons/fa';

const ITEMS_PER_PAGE = 5; // Define ITEMS_PER_PAGE here if it's not globally accessible

// Definisi kategori dan ikonnya
const CATEGORIES = [
    { name: "Sekolah", icon: FaSchool, key: "school" },
    { name: "Supermarket", icon: FaShoppingBag, key: "supermarket" },
    { name: "Pasar", icon: FaStore, key: "market" },
    { name: "Universitas", icon: FaUniversity, key: "university" },
    { name: "Hotel", icon: FaHotel, key: "hotel" },
    { name: "Faskes", icon: FaClinicMedical, key: "healthcare" }, // Fasilitas Kesehatan
    { name: "Perumahan", icon: FaHome, key: "housing" }, // Asumsi untuk perumahan
    // Tambahkan kategori lain sesuai dengan respons API public_places Anda
];

const LokasiUmumTab = ({
    analysisResult,
    lokasiUmumPage,
    setLokasiUmumPage,
    getTotalPages,
    userLatitude, // Menerima latitude dari lokasi yang dipilih
    userLongitude // Menerima longitude dari lokasi yang dipilih
}) => {
    // State untuk tab kategori aktif di dalam Lokasi Umum
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

    // Tambahkan logging untuk memverifikasi prop
    ("LokasiUmumTab - received analysisResult:", analysisResult);
    ("LokasiUmumTab - received userLatitude:", userLatitude);
    ("LokasiUmumTab - received userLongitude:", userLongitude);

    // Fungsi untuk mengelompokkan public_places berdasarkan kategori
    const groupedPublicPlaces = useMemo(() => {
        const groups = {};
        // Inisialisasi semua grup kategori
        CATEGORIES.forEach(cat => {
            groups[cat.key] = [];
        });

        if (Array.isArray(analysisResult?.public_places)) {
            analysisResult.public_places.forEach(place => {
                const placeCategoryName = place.category ? place.category.toLowerCase() : '';
                
                let matched = false;
                for (const cat of CATEGORIES) {
                    // Mencoba mencocokkan kategori API dengan kunci kategori yang kita definisikan
                    // Menggunakan includes untuk pencocokan yang lebih fleksibel
                    if (placeCategoryName.includes(cat.key) || place.name.toLowerCase().includes(cat.key)) {
                        groups[cat.key].push(place);
                        matched = true;
                        break; 
                    }
                }
                
                // Jika tidak ada kategori yang cocok, tempatkan di 'other' atau abaikan
                if (!matched) {
                    // Opsi: Anda bisa menambahkan kategori 'Lain-lain' jika diperlukan
                    // if (!groups['other']) groups['other'] = [];
                    // groups['other'].push(place);
                }
            });
        }
        ("LokasiUmumTab - groupedPublicPlaces:", groups);
        return groups;
    }, [analysisResult?.public_places]);

    // Data yang akan ditampilkan berdasarkan kategori aktif
    const activeCategoryKey = CATEGORIES[activeCategoryIndex]?.key;
    const currentCategoryData = groupedPublicPlaces[activeCategoryKey] || [];
    
    // Reset halaman saat kategori berubah
    React.useEffect(() => {
        setLokasiUmumPage(1);
    }, [activeCategoryIndex, setLokasiUmumPage]);

    // Logika paginasi untuk data kategori yang sedang aktif
    const paginatedLokasiUmumData = useMemo(() => {
        return (Array.isArray(currentCategoryData) ? currentCategoryData : []).slice(
            (lokasiUmumPage - 1) * ITEMS_PER_PAGE,
            lokasiUmumPage * ITEMS_PER_PAGE
        );
    }, [currentCategoryData, lokasiUmumPage]);

    const totalLokasiUmumPages = getTotalPages(currentCategoryData);

    return (
        <TabPanel p={6}>
            <VStack spacing={6} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                    Lokasi Umum Terdekat
                </Text>

                <Tabs index={activeCategoryIndex} onChange={setActiveCategoryIndex} isLazy variant="soft-rounded" colorScheme="blue">
                    <TabList flexWrap="wrap" justifyContent="center">
                        {CATEGORIES.map((category) => (
                            <Tab key={category.key} px={4} py={2} m={1} borderRadius="full" _selected={{ bg: "blue.500", color: "white" }}>
                                <HStack>
                                    <Icon as={category.icon || FaMapMarkerAlt} />
                                    <Text>{category.name}</Text>
                                    <Badge ml="1" colorScheme="purple">
                                        {groupedPublicPlaces[category.key]?.length || 0}
                                    </Badge>
                                </HStack>
                            </Tab>
                        ))}
                    </TabList>

                    <TabPanels>
                        {CATEGORIES.map((category) => (
                            <TabPanel key={category.key} p={0} pt={4}>
                                <VStack spacing={4} align="stretch">
                                    {Array.isArray(paginatedLokasiUmumData) && paginatedLokasiUmumData.length > 0 ? (
                                        paginatedLokasiUmumData.map((location, locIndex) => (
                                            <LocationItem 
                                                key={locIndex} 
                                                location={location} 
                                                icon={category.icon || FaMapMarkerAlt} 
                                                userLatitude={userLatitude} // Meneruskan ke LocationItem
                                                userLongitude={userLongitude} // Meneruskan ke LocationItem
                                            />
                                        ))
                                    ) : (
                                        <Text textAlign="center" color="gray.500" py={10}>
                                            Tidak ada data lokasi {category.name} terdekat yang tersedia.
                                        </Text>
                                    )}

                                    {totalLokasiUmumPages > 1 && (
                                        <Flex justify="center" mt={4}>
                                            <Button
                                                onClick={() => setLokasiUmumPage(prev => Math.max(prev - 1, 1))}
                                                isDisabled={lokasiUmumPage === 1}
                                                mr={2}
                                            >
                                                Previous
                                            </Button>
                                            <Text alignSelf="center">
                                                Page {lokasiUmumPage} of {totalLokasiUmumPages}
                                            </Text>
                                            <Button
                                                onClick={() => setLokasiUmumPage(prev => Math.min(prev + 1, totalLokasiUmumPages))}
                                                isDisabled={lokasiUmumPage === totalLokasiUmumPages}
                                                ml={2}
                                            >
                                                Next
                                            </Button>
                                        </Flex>
                                    )}
                                </VStack>
                            </TabPanel>
                        ))}
                    </TabPanels>
                </Tabs>
            </VStack>
        </TabPanel>
    );
};

export default LokasiUmumTab;
