import React from 'react';
import { TabPanel, VStack, Text, Button, Flex } from '@chakra-ui/react';
import LocationItem from './LocationItem'; // Pastikan import LocationItem benar
import { FaMoneyBillAlt } from 'react-icons/fa'; // Icon untuk ATM Bank Lain

const AtmBankLainTab = ({
    analysisResult,
    paginatedAtmBankLain,
    atmBankLainPage,
    setAtmBankLainPage,
    getTotalPages,
    userLatitude, // Menerima latitude dari lokasi yang dipilih pengguna
    userLongitude // Menerima longitude dari lokasi yang dipilih pengguna
}) => {
    // Tambahkan logging untuk memverifikasi prop
                
    // Menggunakan properti yang sesuai dari analysisResult, perhatikan typo jika ada
    // Misalnya, jika API mengembalikan 'neaerest_competitor_atms' dan bukan 'nearest_competitor_atms'
    const competitorAtmsData = analysisResult?.nearest_competitor_atms || analysisResult?.neaerest_competitor_atms || [];
    const totalAtmBankLainPages = getTotalPages(competitorAtmsData);

    return (
        <TabPanel p={6}>
            <VStack spacing={6} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                    ATM Bank Lain Terdekat
                </Text>
                {/* Pastikan paginatedAtmBankLain adalah array dan memiliki item sebelum memetakan */}
                {Array.isArray(paginatedAtmBankLain) && paginatedAtmBankLain.length > 0 ? (
                    paginatedAtmBankLain.map((location, index) => (
                        <LocationItem 
                            key={index} 
                            location={location} 
                            icon={FaMoneyBillAlt} 
                            userLatitude={userLatitude} // Meneruskan userLatitude
                            userLongitude={userLongitude} // Meneruskan userLongitude
                        /> // Gunakan FaMoneyBillAlt untuk ATM Bank Lain
                    ))
                ) : (
                    <Text textAlign="center" color="gray.500" py={10}>
                        Tidak ada data ATM Bank lain terdekat yang tersedia.
                    </Text>
                )}

                {totalAtmBankLainPages > 1 && (
                    <Flex justify="center" mt={4}>
                        <Button
                            onClick={() => setAtmBankLainPage(prev => Math.max(prev - 1, 1))}
                            isDisabled={atmBankLainPage === 1}
                            mr={2}
                        >
                            Previous
                        </Button>
                        <Text alignSelf="center">
                            Page {atmBankLainPage} of {totalAtmBankLainPages}
                        </Text>
                        <Button
                            onClick={() => setAtmBankLainPage(prev => Math.min(prev + 1, totalAtmBankLainPages))}
                            isDisabled={atmBankLainPage === totalAtmBankLainPages}
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

export default AtmBankLainTab;
