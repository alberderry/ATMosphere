// src/components/PerformanceTrendsCard.jsx

import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Text,
  VStack,
  Flex,
  Heading,
  Spinner,
} from '@chakra-ui/react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Komponen Dot Kustom untuk Area Chart
const CustomDiamondDot = (props) => {
  const { cx, cy, stroke, fill } = props;

  return (
    <g>
      <polygon
        points={`${cx},${cy - 5} ${cx + 5},${cy} ${cx},${cy + 5} ${cx - 5},${cy}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={2}
      />
    </g>
  );
};

// --- FUNGSI HELPER BARU UNTUK FORMATTING ---
// Fungsi untuk memformat angka menjadi Rupiah
const formatToRupiah = (value) => {
  if (value === null || value === undefined) return 'N/A';
  // Menggunakan Intl.NumberFormat untuk pemformatan mata uang Indonesia
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0, // Tidak ada desimal untuk Rupiah bulat
    maximumFractionDigits: 0, // Tidak ada desimal untuk Rupiah bulat
  }).format(value);
};

// Fungsi untuk memformat angka biasa (misal: jumlah transaksi)
const formatNumber = (value) => {
  if (value === null || value === undefined) return 'N/A';
  // Menggunakan Intl.NumberFormat untuk ribuan separator
  return new Intl.NumberFormat('id-ID').format(value);
};
// --- AKHIR FUNGSI HELPER BARU ---

const PerformanceTrend = ({ data, loading, error, cardBg }) => {
  // Memproses data untuk menghitung netAmount (jumlah total dikurangi fee)
  // Ini memungkinkan 'Fee' ditampilkan di dalam total 'Amount'
  const processedData = useMemo(() => {
    if (!data) return [];
    return data.map(item => ({
      ...item,
      // netAmount adalah bagian dari total 'amount' yang bukan 'fee'
      netAmount: item.amount - item.fee,
      // Bar 'fee' akan ditumpuk di atas 'netAmount'
      // Sehingga total tinggi bar tetap sama dengan item.amount asli
    }));
  }, [data]);

  return (
    <Card bg={cardBg} shadow="sm" borderRadius={25}>
      <CardHeader>
        <Heading size="sm" color="gray.700">
          Performance Trends
        </Heading>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Flex h="300px" justifyContent="center" alignItems="center">
            <VStack>
              <Spinner size="lg" color="blue.500" />
              <Text>Memuat data Performance Trends...</Text>
            </VStack>
          </Flex>
        ) : error ? (
          <Flex h="300px" justifyContent="center" alignItems="center" flexDirection="column" p={4}>
            <Text color="red.500" fontWeight="bold" mb={2}>Terjadi Kesalahan Saat Memuat Data:</Text>
            <Text color="red.400" textAlign="center" fontSize="sm">{error}</Text>
            <Text color="gray.500" mt={4} fontSize="xs">Silakan cek URL API atau pastikan server berjalan dengan benar.</Text>
          </Flex>
        ) : (
          <Box w="full" h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  {/* Gradien dan Glow untuk "Net Amount" (Bagian Atas - Biru) */}
                  <linearGradient id="netAmountGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4299E1" stopOpacity={1} /> {/* Biru Tua (Chakra blue.500) */}
                    <stop offset="95%" stopColor="#63B3ED" stopOpacity={0.8} /> {/* Biru Lebih Terang (Chakra blue.300) */}
                  </linearGradient>
                  <filter id="netAmountGlow">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                    <feFlood floodColor="#63B3ED" floodOpacity="0.8" result="color" /> {/* Glow warna biru terang */}
                    <feComposite in="color" in2="blur" operator="in" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>

                  {/* Gradien dan Glow untuk "Fee" (Bagian Bawah - Kuning) */}
                  <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFC107" stopOpacity={1} /> {/* Kuning Oranye */}
                    <stop offset="95%" stopColor="#FFEB3B" stopOpacity={0.8} /> {/* Kuning Cerah */}
                  </linearGradient>
                  <filter id="feeGlow">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                    <feFlood floodColor="#FFEB3B" floodOpacity="0.8" result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>

                  {/* Gradien untuk "Transaction" (Area Chart) */}
                  <linearGradient id="transactionGradient" x1="0" y1="0" x2="0" y2="1">
                    {/* Meningkatkan stopOpacity untuk membuat bayangan lebih tebal */}
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.6} /> {/* Lebih pekat */}
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} /> {/* Tetap transparan di bagian bawah */}
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 5" // Meningkatkan ukuran dash array
                  stroke="#e0e0e0" // Bisa juga sedikit menggelapkan warna grid jika perlu
                  strokeWidth={1.8} // Menebalkan garis grid
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  // --- PERUBAHAN DI SINI: MENAMBAHKAN FORMATTER ---
                  formatter={(value, name) => {
                    // 'name' adalah nama yang Anda definisikan di prop 'name' pada Bar/Area components
                    if (name === "Fee" || name === "Nominal Transaction") {
                      return formatToRupiah(value);
                    } else if (name === "Transaction") {
                      return formatNumber(value);
                    }
                    return value; // Fallback jika ada dataKey lain yang tidak diformat
                  }}
                  // Opsional: Anda juga bisa memformat label (dataKey dari XAxis)
                  labelFormatter={(label) => `Periode: ${label}`}
                  // --- AKHIR PERUBAHAN ---
                />
                <Legend />
                {/* Bar "Fee" (bagian bawah stack) */}
                <Bar
                  yAxisId="left"
                  dataKey="fee" // Data key untuk fee
                  stackId="a" // Stack ID yang sama agar menumpuk
                  fill="url(#feeGradient)" // Menggunakan gradien kuning
                  filter="url(#feeGlow)" // Menerapkan glow
                  name="Fee" // Pastikan nama ini sesuai dengan yang dicek di formatter
                  barSize={40} // Ukuran bar diset ke 25px
                  radius={[0, 0, 0, 0]}
                />
                {/* Bar "Net Amount" (bagian atas stack) */}
                <Bar
                  yAxisId="left"
                  dataKey="netAmount" // Data key untuk net amount
                  stackId="a" // Stack ID yang sama agar menumpuk
                  fill="url(#netAmountGradient)" // Menggunakan gradien biru
                  filter="url(#netAmountGlow)" // Menerapkan glow
                  name="Nominal Transaction" // Pastikan nama ini sesuai dengan yang dicek di formatter
                  barSize={40} // Ukuran bar diset ke 25px
                  radius={[4, 4, 0, 0]}
                />
                {/* Area "Transaction" (Area Chart) - Dipindahkan ke bawah agar dirender di depan */}
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="transaction"
                  stroke="#82ca9d"
                  strokeWidth={4} // Tebalkan garis
                  fill="url(#transactionGradient)"
                  name="Transaction" // Pastikan nama ini sesuai dengan yang dicek di formatter
                  dot={<CustomDiamondDot stroke="#82ca9d" fill="white" />} // Menggunakan komponen dot kustom
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

export default PerformanceTrend;