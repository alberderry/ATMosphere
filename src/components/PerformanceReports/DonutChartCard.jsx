// src/components/Cards/DonutChartCard.jsx
import React from 'react';
import { Card, CardBody, Text, useColorModeValue, Center, VStack, Flex, Box } from "@chakra-ui/react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DonutChartCard = ({ atmData }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const legendTextColor = useColorModeValue("gray.700", "whiteAlpha.800");

  const donutChartData = React.useMemo(() => {
    const fee = atmData?.fee || 0;
    const nominalTrx = atmData?.nominalTrx || 0;
    const frekuensiTransaksi = atmData?.frekuensiTransaksi || 0;

    const rawData = [
      { name: 'Fee Trx', value: fee },
      { name: 'Nominal Trx', value: nominalTrx },
      { name: 'Frekuensi Trx', value: frekuensiTransaksi },
    ];

    const total = rawData.reduce((sum, entry) => sum + entry.value, 0);

    if (total === 0) {
      return [];
    }

    return rawData.filter(entry => entry.value > 0);
  }, [atmData]);

  // Update warna agar sesuai dengan image_88aaf6.png
  const PIE_COLORS = [
    '#6699FF', // Biru terang (lebih mirip dari gambar baru)
    '#00BFB2', // Hijau kebiruan (lebih mirip dari gambar baru)
    '#FF66CC', // Pink (lebih mirip dari gambar baru)
    // Jika ada kategori keempat, tambahkan warna di sini
  ];

  const totalChartValue = React.useMemo(() => {
    return donutChartData.reduce((sum, d) => sum + d.value, 0);
  }, [donutChartData]);


  return (
    <Card bg={cardBg} p={4} borderRadius="25px" boxShadow="md" flex="1">
      <CardBody>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>Distribution Reports</Text> 
        
        {donutChartData.length > 0 ? (
          // Kecilkan tinggi ResponsiveContainer agar chart lebih ringkas
          <ResponsiveContainer width="100%" height={220}> {/* <-- Ubah height dari 220 menjadi 160 */}
            <PieChart key={atmData?.id || 'no-atm-chart'}>
              <Pie
                key={atmData?.id || 'no-atm-data'}
                data={donutChartData}
                cx="50%"
                cy="50%"
                innerRadius={45} // Sedikit perkecil innerRadius
                outerRadius={70}  // Sedikit perkecil outerRadius agar lebih kompak
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
              >
                {donutChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              {/* Tooltip tetap ada untuk detail saat hover */}
              <Tooltip formatter={(value, name) => {
                 const percentage = totalChartValue === 0 ? 0 : (value / totalChartValue) * 100;
                 return [`Rp. ${value.toLocaleString('id-ID')} (${percentage.toFixed(1)}%)`, name];
              }} />
              {/* Legend di bawah chart */}
              <Legend
                verticalAlign="bottom"
                align="left" // Ubah ke 'left' agar rata kiri seperti di gambar
                wrapperStyle={{ paddingTop: '10px' }} // Kurangi padding agar lebih dekat ke chart
                // Perhatikan format legend di gambar: nama kategori diikuti persentase di baris baru.
                // Recharts Legend formatter mungkin tidak mendukung layout 2 baris per item secara native.
                // Jika ingin persis seperti gambar, Anda mungkin perlu CustomLegend (seperti contoh yang dikomentari sebelumnya).
                // Untuk sementara, ini akan menampilkan "Nama: Persentase%" di satu baris.
                formatter={(value, entry) => (
                  <span style={{ color: legendTextColor, fontSize: '0.9em' }}> {/* Perkecil font legend */}
                    {entry.payload.name}: <span style={{ fontWeight: 'bold' }}>{((entry.payload.value / totalChartValue) * 100).toFixed(1)}%</span>
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Center height="160px"> {/* Sesuaikan tinggi Center juga */}
            <VStack>
              <Text fontSize="md" color="gray.500">Pilih ATM untuk melihat distribusi laporan.</Text>
              <Text fontSize="sm" color="gray.400">Atau data transaksi tidak tersedia.</Text>
            </VStack>
          </Center>
        )}
      </CardBody>
    </Card>
  );
};

export default DonutChartCard;