import React from 'react';
import { TabPanel, VStack, Text, Button, Flex } from '@chakra-ui/react';
import LocationItem from './LocationItem'; // Pastikan import LocationItem benar
import { FaLandmark } from 'react-icons/fa'; // Icon untuk KCP/Branch

const KcpAtmBjbTab = ({
    analysisResult,
    paginatedKcpAtm,
    kcpAtmPage,
    setKcpAtmPage,
    getTotalPages,
    userLatitude, // Menerima latitude dari lokasi yang dipilih pengguna
    userLongitude // Menerima longitude dari lokasi yang dipilih pengguna
}) => {
    // Tambahkan logging untuk memverifikasi prop
    console.log("KcpAtmBjbTab - received analysisResult:", analysisResult);
    console.log("KcpAtmBjbTab - received paginatedKcpAtm:", paginatedKcpAtm);
    console.log("KcpAtmBjbTab - received userLatitude:", userLatitude); // Logging tambahan
    console.log("KcpAtmBjbTab - received userLongitude:", userLongitude); // Logging tambahan

    // Pastikan nearest_branches adalah array sebelum memanggil getTotalPages
    const totalKcpAtmPages = getTotalPages(analysisResult?.nearest_branches || []);

    return (
        <TabPanel p={6}>
            <VStack spacing={6} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                    Cabang dan ATM BJB Terdekat
                </Text>
                {/* Pastikan paginatedKcpAtm adalah array dan memiliki item sebelum memetakan */}
                {Array.isArray(paginatedKcpAtm) && paginatedKcpAtm.length > 0 ? (
                    paginatedKcpAtm.map((location, index) => (
                        <LocationItem 
                            key={index} 
                            location={location} 
                            icon={FaLandmark} 
                            userLatitude={userLatitude} // Meneruskan userLatitude
                            userLongitude={userLongitude} // Meneruskan userLongitude
                        />
                    ))
                ) : (
                    <Text textAlign="center" color="gray.500" py={10}>
                        Tidak ada data KCP / ATM BJB terdekat yang tersedia.
                    </Text>
                )}

                {totalKcpAtmPages > 1 && (
                    <Flex justify="center" mt={4}>
                        <Button
                            onClick={() => setKcpAtmPage(prev => Math.max(prev - 1, 1))}
                            isDisabled={kcpAtmPage === 1}
                            mr={2}
                        >
                            Previous
                        </Button>
                        <Text alignSelf="center">
                            Page {kcpAtmPage} of {totalKcpAtmPages}
                        </Text>
                        <Button
                            onClick={() => setKcpAtmPage(prev => Math.min(prev + 1, totalKcpAtmPages))}
                            isDisabled={kcpAtmPage === totalKcpAtmPages}
                            ml={2}
                        >
                            Next
                        </Button>
                    </Flex>
                )}
            </VStack>
        </TabPanel>
    );
};

export default KcpAtmBjbTab;
