// src/components/MapView/MachineUtilityCard.jsx
import {
    Box,
    Flex,
    Text,
    HStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Badge,
} from '@chakra-ui/react';
import { useMemo } from 'react';

const MachineUtilityCard = ({ 
    atmPerformances, 
    getTierColor,
    selectedKanwilId, 
    selectedTier,
    kanwilToChildrenMap 
}) => {

    const aggregatedTableData = useMemo(() => {
        if (!atmPerformances || atmPerformances.length === 0) {
            return [];
        }

        const tierGroupedData = {};
        const uniqueAtmsByTier = new Map(); 
        const totalUniqueAtmsOverall = new Set(); // Ini untuk menghitung persentase total

        const filteredPerformances = atmPerformances.filter(perf => {
            const atmBranchId = perf.atm_id?.branch_id?.id; 
            const atmParentKanwilId = perf.atm_id?.branch_id?.parent_id?.id;
            const tierFromPerf = perf.tier;

            let matchesKanwil = false;
            if (selectedKanwilId === '') {
                matchesKanwil = true;
            } else if (!atmBranchId) {
                matchesKanwil = false;
            } else {
                const selectedKanwilIdString = String(selectedKanwilId);

                if (String(atmBranchId) === selectedKanwilIdString) {
                    matchesKanwil = true;
                } else if (atmParentKanwilId !== undefined && atmParentKanwilId !== null && String(atmParentKanwilId) === selectedKanwilIdString) {
                    matchesKanwil = true;
                } else {
                    const targetBranchIds = kanwilToChildrenMap[selectedKanwilIdString];
                    if (targetBranchIds && Array.isArray(targetBranchIds)) {
                        matchesKanwil = targetBranchIds.includes(String(atmBranchId));
                    } else {
                         matchesKanwil = false; 
                    }
                }
            }
            
            let matchesTier = false;
            const normalizedTierFromPerf = (tierFromPerf === null || tierFromPerf === 'N/A' || tierFromPerf === 'TIDAK DIHITUNG' || perf.tier === 0) ? '0' : String(tierFromPerf);
            
            if (selectedTier === 'all') {
                matchesTier = true;
            } else {
                matchesTier = normalizedTierFromPerf === selectedTier;
            }

            return matchesKanwil && matchesTier;
        });

        if (filteredPerformances.length === 0) {
            return [];
        }

        filteredPerformances.forEach(perf => {
            let tierLabel = '';
            let tierNumericValue = 0;

            if (perf.tier === 0 || perf.tier === null || perf.tier === 'N/A' || perf.tier === 'TIDAK DIHITUNG') {
                tierLabel = 'TIDAK DIHITUNG';
                tierNumericValue = 0;
            } else if (typeof perf.tier === 'number' && perf.tier >= 1 && perf.tier <= 4) {
                tierLabel = `TIER ${perf.tier}`;
                tierNumericValue = perf.tier;
            } else {
                return; 
            }
            
            if (!tierGroupedData[tierLabel]) {
                tierGroupedData[tierLabel] = {
                    count: 0,
                    totalTrx: 0, // Ini adalah SUM untuk tier tersebut
                    totalFee: 0, // Ini adalah SUM untuk tier tersebut
                    tierNumericValue: tierNumericValue
                };
                uniqueAtmsByTier.set(tierLabel, new Set());
            }
            
            if (perf.atm_id && perf.atm_id.id) {
                const atmId = perf.atm_id.id;
                if (!uniqueAtmsByTier.get(tierLabel).has(atmId)) {
                    tierGroupedData[tierLabel].count++;
                    uniqueAtmsByTier.get(tierLabel).add(atmId);
                }
                totalUniqueAtmsOverall.add(atmId); 
            }
            
            if (typeof perf.volume_trx === 'number') {
                tierGroupedData[tierLabel].totalTrx += perf.volume_trx;
            }
            if (typeof perf.fee === 'number') {
                tierGroupedData[tierLabel].totalFee += perf.fee;
            }
        });

        const resultTableData = Object.keys(tierGroupedData).map(tierLabel => {
            const data = tierGroupedData[tierLabel];
            const count = data.count;
            
            const percentage = totalUniqueAtmsOverall.size > 0 
                ? (count / totalUniqueAtmsOverall.size * 100) 
                : 0; 

            // Ini adalah rata-rata per mesin untuk baris tier
            const rataTransaksi = count > 0 ? (data.totalTrx / count) : 0;
            const rataFee = count > 0 ? (data.totalFee / count) : 0;
            
            return {
                tier: tierLabel,
                kelompokTier: count,
                persentase: `${percentage.toFixed(2)}%`, 
                // Simpan nilai numerik dari rata-rata juga agar mudah dijumlahkan nanti
                rataTransaksiNumeric: rataTransaksi, // Tambahkan ini
                rataFeeNumeric: rataFee,         // Tambahkan ini
                rataTransaksi: rataTransaksi > 0 ? rataTransaksi.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '-',
                rataFee: rataFee > 0 ? rataFee.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '-',
                color: getTierColor(data.tierNumericValue)
            };
        });

        resultTableData.sort((a, b) => {
            const valA = tierGroupedData[a.tier].tierNumericValue;
            const valB = tierGroupedData[b.tier].tierNumericValue;
            return valA - valB;
        });

        return resultTableData;
    }, [atmPerformances, getTierColor, selectedKanwilId, selectedTier, kanwilToChildrenMap]);

    const calculatedTotalRow = useMemo(() => {
        let totalKelompokTier = 0;
        let totalPersentase = 0;
        let sumOfRataTransaksi = 0; // Ini yang akan menjumlahkan rata-rata dari setiap tier
        let sumOfRataFee = 0;       // Ini yang akan menjumlahkan rata-rata dari setiap tier
        
        // Kita tidak lagi memfilter ulang atmPerformances di sini.
        // Kita akan menggunakan aggregatedTableData yang sudah terfilter dan terhitung per tier.
        if (aggregatedTableData.length > 0) {
            aggregatedTableData.forEach(row => {
                totalKelompokTier += row.kelompokTier;
                // Untuk persentase, kita bisa ambil dari yang 100% atau jumlahkan jika perlu,
                // tapi 100% untuk total sudah benar jika berdasarkan total mesin.
                // Mengurai string persentase untuk menjumlahkan
                totalPersentase += parseFloat(row.persentase); 

                // Menjumlahkan nilai numerik rata-rata dari setiap tier
                if (typeof row.rataTransaksiNumeric === 'number' && row.rataTransaksiNumeric > 0) { // Pastikan bukan '-' atau nol
                    sumOfRataTransaksi += row.rataTransaksiNumeric;
                }
                if (typeof row.rataFeeNumeric === 'number' && row.rataFeeNumeric > 0) { // Pastikan bukan '-' atau nol
                    sumOfRataFee += row.rataFeeNumeric;
                }
            });
        }
        
        return {
            kelompokTier: totalKelompokTier,
            persentase: totalPersentase.toFixed(2) + '%', // Menjaga format persentase
            rataTransaksi: sumOfRataTransaksi > 0 ? sumOfRataTransaksi.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '-',
            rataFee: sumOfRataFee > 0 ? sumOfRataFee.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '-'
        };
    }, [aggregatedTableData]); // Dependency diubah menjadi aggregatedTableData

    return (
        <Box bg="white" p={4} borderRadius="lg" boxShadow="md">
            <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="lg" fontWeight="semibold">Utilitas Mesin</Text>
                <HStack></HStack> 
            </Flex>
            <TableContainer>
                <Table variant="simple" size="sm">
                    <Thead>
                        <Tr bg="gray.100">
                            <Th>Kelompok Tier</Th>
                            <Th textAlign="center">Jumlah Mesin</Th>
                            <Th textAlign="center">Persentase</Th>
                            <Th textAlign="center">Rata-rata Transaksi</Th> 
                            <Th textAlign="center">Rata-rata Fee (Rp.)</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {aggregatedTableData.map((row) => (
                            <Tr key={row.tier}>
                                <Td>
                                    <Badge
                                        colorScheme={row.color}
                                        variant="solid"
                                        px={3}
                                        py={1}
                                        borderRadius="md"
                                    >
                                        {row.tier}
                                    </Badge>
                                </Td>
                                <Td textAlign="center" fontWeight="semibold">{row.kelompokTier}</Td>
                                <Td textAlign="center">{row.persentase}</Td>
                                <Td textAlign="center">{row.rataTransaksi}</Td> 
                                <Td textAlign="center">{row.rataFee}</Td>
                            </Tr>
                        ))}
                        {aggregatedTableData.length > 0 && (
                            <Tr bg="blue.50" fontWeight="bold">
                                <Td>TOTAL</Td>
                                <Td textAlign="center">{calculatedTotalRow.kelompokTier}</Td>
                                <Td textAlign="center">{calculatedTotalRow.persentase}</Td>
                                {/* Ini sekarang akan menampilkan TOTAL SUM dari rata-rata per tier */}
                                <Td textAlign="center">{calculatedTotalRow.rataTransaksi}</Td> 
                                <Td textAlign="center">{calculatedTotalRow.rataFee}</Td>       
                            </Tr>
                        )}
                        {aggregatedTableData.length === 0 && (
                            <Tr>
                                <Td colSpan={5} textAlign="center" py={4} color="gray.500">
                                    Tidak ada data ATM yang cocok dengan filter yang dipilih.
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default MachineUtilityCard;