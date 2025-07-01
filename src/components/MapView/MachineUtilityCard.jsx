// src/components/MapView/MachineUtilityCard.jsx
import {
  Box,
  Flex,
  Text,
  HStack, // Tetap ada karena masih digunakan di dalam useMemo
  // Select, // Dihapus karena filter kanwil dipindahkan
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
  // selectedKanwilId, // Dihapus sebagai prop
  // setSelectedKanwilId, // Dihapus sebagai prop
  // kanwilOptions, // Dihapus sebagai prop
  atmPerformances, 
  getTierColor,
  selectedKanwilId, // Menerima selectedKanwilId untuk filtering data di useMemo
  selectedTier // Menerima selectedTier untuk filtering data di useMemo
}) => {

  const aggregatedTableData = useMemo(() => {
    if (atmPerformances.length === 0) {
      return [];
    }

    const tierGroupedData = {};
    const atmIdCount = new Set();

    atmPerformances.filter(perf => {
      // Pastikan ada atm_id dan atm_id.branch_id
      const matchesKanwil = selectedKanwilId === '' ||  
                            (perf.atm_id && String(perf.atm_id.branch_id.id) === selectedKanwilId);
      const matchesTier = selectedTier === 'all' ||
                          (perf.tier !== null && String(perf.tier) === selectedTier) ||
                          (selectedTier === '0' && perf.tier === 0); // Consider '0' for 'Tidak Dihitung' tier

      return matchesKanwil && matchesTier;
    }).forEach(perf => {
        const tierLabel = perf.tier === 0 ? 'TIDAK DIHITUNG' : 
          (typeof perf.tier === 'number' && perf.tier >= 1 && perf.tier <= 4) ? `TIER ${perf.tier}` : 'N/A';
        
        if (tierLabel === 'N/A') {
            console.warn(`ATM Performance ID ${perf.id} has invalid or missing tier: ${perf.tier}. Skipping for aggregation.`);
            return;
        }

        if (!tierGroupedData[tierLabel]) {
            tierGroupedData[tierLabel] = {
                count: 0,
                totalTrx: 0,
                totalFee: 0,
                uniqueAtms: new Set()
            };
        }
        
        if (perf.atm_id && perf.atm_id.id) {
            if (!tierGroupedData[tierLabel].uniqueAtms.has(perf.atm_id.id)) {
                tierGroupedData[tierLabel].uniqueAtms.add(perf.atm_id.id);
                tierGroupedData[tierLabel].count++;
            }
            atmIdCount.add(perf.atm_id.id);
        }
        
        if (typeof perf.volume_trx === 'number') {
            tierGroupedData[tierLabel].totalTrx += perf.volume_trx;
        }
        if (typeof perf.fee === 'number') {
            tierGroupedData[tierLabel].totalFee += perf.fee;
        }
    });

    const totalUniqueAtmsOverall = atmIdCount.size;

    const resultTableData = Object.keys(tierGroupedData).map(tierLabel => {
        const data = tierGroupedData[tierLabel];
        const count = data.count;
        
        const percentage = totalUniqueAtmsOverall > 0 
            ? (count / totalUniqueAtmsOverall * 100) 
            : 0;

        const rataTransaksi = data.count > 0 ? (data.totalTrx / data.count) : 0;
        const rataFee = data.count > 0 ? (data.totalFee / data.count) : 0;
        
        return {
            tier: tierLabel,
            kelompokTier: count,
            jumlahMesin: `${percentage.toFixed(2)}%`, 
            persentase: `${percentage.toFixed(2)}%`,
            rataTransaksi: rataTransaksi > 0 ? rataTransaksi.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '-',
            rataFee: rataFee > 0 ? rataFee.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '-',
            color: getTierColor(tierLabel)
        };
    });

    resultTableData.sort((a, b) => {
        if (a.tier === 'TIDAK DIHITUNG') return -1;
        if (b.tier === 'TIDAK DIHITUNG') return 1;
        return parseInt(a.tier.replace('TIER ', '')) - parseInt(b.tier.replace('TIER ', ''));
    });

    return resultTableData;
  }, [atmPerformances, getTierColor, selectedKanwilId, selectedTier]); // Tambahkan dependencies

  const calculatedTotalRow = useMemo(() => {
    let totalKelompokTier = 0;
    let totalVolumeTrx = 0;
    let totalFee = 0;
    
    const uniqueAtmIdsForTotal = new Set();

    atmPerformances.filter(perf => {
      const matchesKanwil = selectedKanwilId === '' || 
                            (perf.atm_id && String(perf.atm_id.branch_id.id) === selectedKanwilId);
      const matchesTier = selectedTier === 'all' ||
                          (perf.tier !== null && String(perf.tier) === selectedTier) ||
                          (selectedTier === '0' && perf.tier === 0);
      return matchesKanwil && matchesTier;
    }).forEach(perf => {
        if (perf.atm_id && perf.atm_id.id) {
            uniqueAtmIdsForTotal.add(perf.atm_id.id);
        }
        if (typeof perf.volume_trx === 'number') {
            totalVolumeTrx += perf.volume_trx;
        }
        if (typeof perf.fee === 'number') {
            totalFee += perf.fee;
        }
    });
    totalKelompokTier = uniqueAtmIdsForTotal.size;

    const rataTransaksiOverall = totalKelompokTier > 0 ? (totalVolumeTrx / totalKelompokTier) : 0;
    const rataFeeOverall = totalKelompokTier > 0 ? (totalFee / totalKelompokTier) : 0;

    return {
        kelompokTier: totalKelompokTier,
        persentase: '100%',
        rataTransaksi: rataTransaksiOverall > 0 ? rataTransaksiOverall.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '-',
        rataFee: rataFeeOverall > 0 ? rataFeeOverall.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '-'
    };
  }, [atmPerformances, selectedKanwilId, selectedTier]); // Tambahkan dependencies

  return (
    <Box bg="white" p={4} borderRadius="lg" boxShadow="md">
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="semibold">Utilitas Mesin</Text>
        {/* Filter Kanwil dan Tier sekarang ada di MapViewCard */}
        <HStack></HStack> {/* Menjaga layout jika ada elemen lain di masa depan */}
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
                <Td textAlign="center">{calculatedTotalRow.rataTransaksi}</Td>
                <Td textAlign="center">{calculatedTotalRow.rataFee}</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MachineUtilityCard;