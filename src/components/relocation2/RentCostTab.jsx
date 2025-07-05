import React from 'react';
import {
    TabPanel,
    VStack,
    Text,
    Grid,
    GridItem,
    Input,
    Flex,
    Button,
    Spinner,
    FormControl,
    FormLabel,
    FormErrorMessage
} from '@chakra-ui/react';

const RentCostTab = ({
    rentCostInput,
    setRentCostInput,
    machineCostInput,
    setMachineCostInput,
    electricityCostInput,
    setElectricityCostInput,
    isiUlangCostInput,
    setIsUlangCostInput,
    error,
    handleAnalyze,
    isLoading,
    latitude,
    longitude,
    // isEditMode // Tambahkan prop baru ini
}) => {
    const isEditMode1 = location.pathname.includes('/edit/');
    return (
        <TabPanel p={6}>
            <VStack spacing={6} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                    Perkiraan Biaya
                </Text>

                <Grid templateColumns="repeat(2, 1fr)" gap={100}>
                    <GridItem>
                        <FormControl id="machineCost" isInvalid={error && isNaN(parseFloat(machineCostInput))}>
                            <FormLabel color="blue.600" fontWeight="medium">
                                Machine Rental Cost (Rp)
                            </FormLabel>
                            <Input
                                type="number"
                                placeholder="Masukkan biaya sewa mesin"
                                value={machineCostInput}
                                onChange={(e) => setMachineCostInput(e.target.value)}
                                fontSize="2xl"
                                fontWeight="bold"
                            />
                            <FormErrorMessage>Biaya sewa mesin harus angka valid.</FormErrorMessage>
                        </FormControl>
                    </GridItem>
                    <GridItem>
                        <FormControl id="rentCost" isInvalid={error && isNaN(parseFloat(rentCostInput))}>
                            <FormLabel color="blue.600" fontWeight="medium">
                                Facility Rental Cost (Rp)
                            </FormLabel>
                            <Input
                                type="number"
                                placeholder="Masukkan biaya sewa tempat"
                                value={rentCostInput}
                                onChange={(e) => setRentCostInput(e.target.value)}
                                fontSize="2xl"
                                fontWeight="bold"
                            />
                            <FormErrorMessage>Biaya sewa tempat harus angka valid.</FormErrorMessage>
                        </FormControl>
                    </GridItem>
                    <GridItem>
                        <FormControl id="electricityCost" isInvalid={error && isNaN(parseFloat(electricityCostInput))}>
                            <FormLabel color="blue.600" fontWeight="medium">
                                Electricity Cost (Rp)
                            </FormLabel>
                            <Input
                                type="number"
                                placeholder="Masukkan biaya listrik"
                                value={electricityCostInput}
                                onChange={(e) => setElectricityCostInput(e.target.value)}
                                fontSize="2xl"
                                fontWeight="bold"
                            />
                            <FormErrorMessage>Biaya listrik harus angka valid.</FormErrorMessage>
                        </FormControl>
                    </GridItem>
                    <GridItem>
                        <FormControl id="isiUlangCost" isInvalid={error && isNaN(parseFloat(isiUlangCostInput))}>
                            <FormLabel color="blue.600" fontWeight="medium">
                                Cash Replenishment Cost (Rp)
                            </FormLabel>
                            <Input
                                type="number"
                                placeholder="Masukkan biaya isi ulang"
                                value={isiUlangCostInput}
                                onChange={(e) => setIsUlangCostInput(e.target.value)}
                                fontSize="2xl"
                                fontWeight="bold"
                            />
                            <FormErrorMessage>Biaya isi ulang harus angka valid.</FormErrorMessage>
                        </FormControl>
                    </GridItem>
                </Grid>
                {error && <Text color="red.500" fontSize="sm" mt={2}>{error}</Text>}

                <Flex justify="flex-end">
                    <Button
                        colorScheme="blue"
                        onClick={handleAnalyze}
                        isLoading={isLoading}
                        isDisabled={
                            isEditMode1 || // Tombol dinonaktifkan jika dalam mode edit
                            !latitude || !longitude || // Lokasi harus valid
                            isNaN(parseFloat(rentCostInput)) || parseFloat(rentCostInput) < 0 ||
                            isNaN(parseFloat(machineCostInput)) || parseFloat(machineCostInput) < 0 ||
                            isNaN(parseFloat(electricityCostInput)) || parseFloat(electricityCostInput) < 0 ||
                            isNaN(parseFloat(isiUlangCostInput)) || parseFloat(isiUlangCostInput) < 0
                        }
                    >
                        {isLoading ? "Analyzing..." : "Analisis"}
                    </Button>
                </Flex>
            </VStack>
        </TabPanel>
    );
};

export default RentCostTab;