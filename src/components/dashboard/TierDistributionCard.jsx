// src/components/TierDistributionCard.jsx

import React, { useState } from 'react';
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
import { ResponsiveContainer } from 'recharts'; // Keeping ResponsiveContainer for consistency if needed elsewhere
import * as d3 from 'd3'; // Import d3 untuk menggambar SVG kustom

// Custom Tooltip untuk Pie Chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        bg="white"
        p={3}
        borderRadius="md"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
      >
        <Text fontWeight="bold" color={data.color}>{data.name}</Text>
        <Text fontSize="sm">Persentase: {data.value.toFixed(2)}%</Text>
        <Text fontSize="sm">Jumlah ATM: {data.atmCount}</Text>
        <Text fontSize="sm">Jumlah CRM: {data.crmCount}</Text>
      </Box>
    );
  }
  return null;
};

// Custom Label untuk CustomDonutChart
const CustomLabel = ({ arc }) => {
  const labelOffset = 50;
  const dotOffset = 20;

  const labelArcGenerator = d3.arc()
    .innerRadius(arc.dynamicOuterRadius + labelOffset)
    .outerRadius(arc.dynamicOuterRadius + labelOffset);

  const dotArcGenerator = d3.arc()
    .innerRadius(arc.dynamicOuterRadius + dotOffset)
    .outerRadius(arc.dynamicOuterRadius + dotOffset);

  const [x, y] = labelArcGenerator.centroid(arc);
  const [dotX, dotY] = dotArcGenerator.centroid(arc);

  const midAngle = (arc.startAngle + arc.endAngle) / 2;
  const textAnchor = (midAngle > Math.PI / 2 && midAngle < 3 * Math.PI / 2) ? 'end' : 'start';

  return (
    <g>
      <circle cx={dotX} cy={dotY} r={4} fill={arc.data.color} />
      <text x={x} y={y} fill={arc.data.color} textAnchor={textAnchor} dominantBaseline="central">
        <tspan x={x} dy="-0.5em" style={{ fontWeight: 'bold', fontSize: '12px' }}>{arc.data.name}</tspan>
        <tspan x={x} dy="1em" style={{ fontSize: '11px' }}>{`${(arc.data.value).toFixed(2)}%`}</tspan>
      </text>
    </g>
  );
};

// Komponen Donut Chart Kustom
const CustomDonutChart = ({ data, width = 300, height = 300 }) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const baseInnerRadius = 60;
  const baseOuterRadius = 90;
  const maxThicknessIncrease = 40;

  // Definisikan warna gradasi dan glow untuk setiap tier
  const tierStyles = {
    'TIER 2': { // Menggunakan 'TIER 1' agar konsisten dengan `data.name` yang diterima
      gradient: { start: '#4CAF50', end: '#8BC34A' }, // Hijau: Mulai lebih terang, akhir lebih gelap/cerah
      glowColor: '#8BC34A', // Hijau terang
      color: '#4CAF50' // Warna dasar
    },
    'TIER 1': { // Menggunakan 'TIER 2'
      gradient: { start: '#2196F3', end: '#64B5F6' }, // Biru: Mulai lebih gelap, akhir lebih terang
      glowColor: '#64B5F6', // Biru terang
      color: '#2196F3' // Warna dasar
    },
    'TIER 3': { // Menggunakan 'TIER 3'
      gradient: { start: '#FFC107', end: '#FFEB3B' }, // Kuning: Mulai lebih gelap, akhir lebih terang
      glowColor: '#FFEB3B', // Kuning terang
      color: '#FFC107' // Warna dasar
    },
    'TIER 4': { // Menggunakan 'TIER 4'
      gradient: { start: '#F44336', end: '#EF9A9A' }, // Merah: Mulai lebih gelap, akhir lebih terang (sesuai permintaan)
      glowColor: '#EF9A9A', // Merah terang
      color: '#F44336' // Warna dasar
    },
    // PERBAIKAN: Menambahkan style untuk "TIDAK DIHITUNG" sesuai dengan `data.name`
    'TIDAK DIHITUNG': {
      gradient: { start: '#78909C', end: '#B0BEC5' }, // Abu-abu ke Abu-abu lebih terang
      glowColor: '#CFD8DC', // Abu-abu terang untuk glow
      color: '#78909C' // Warna dasar abu-abu
    }
  };

  const pie = d3.pie()
    .value(d => d.value)
    .sort(null);

  const arcs = pie(data).map(p => {
    const dynamicOuterRadius = baseOuterRadius + (p.data.value / 100) * maxThicknessIncrease;
    const arcGenerator = d3.arc()
      .innerRadius(baseInnerRadius)
      .outerRadius(dynamicOuterRadius);

    // Normalisasi nama tier untuk pencocokan kunci
    // Menggunakan p.data.name secara langsung karena sudah diformat di DashboardComponent
    const normalizedTierName = p.data.name; 

    return {
      ...p,
      path: arcGenerator(p),
      centroid: arcGenerator.centroid(p),
      dynamicOuterRadius: dynamicOuterRadius,
      // Ambil style dari tierStyles menggunakan nama yang sudah dinormalisasi atau fallback
      style: tierStyles[normalizedTierName] || { gradient: { start: '#CCCCCC', end: '#EEEEEE' }, glowColor: '#EEEEEE', color: '#CCCCCC' }
    };
  });

  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event, sliceData) => {
    setHoveredSlice(sliceData);
    setTooltipPos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredSlice(null);
  };

  return (
    <Box position="relative" width={width} height={height}>
      <svg width={width} height={height}>
        {/* Definisi Filter dan Gradasi */}
        <defs>
          {arcs.map((arc, index) => (
            <React.Fragment key={`defs-${index}`}>
              {/* Gradien Linier untuk setiap segmen */}
              <linearGradient id={`gradient-${arc.data.name.replace(/\s/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={arc.style.gradient.start} />
                <stop offset="100%" stopColor={arc.style.gradient.end} />
              </linearGradient>

              {/* Filter Glow untuk setiap segmen */}
              <filter id={`glow-${arc.data.name.replace(/\s/g, '-')}`}>
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                <feFlood floodColor={arc.style.glowColor} floodOpacity="0.8" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </React.Fragment>
          ))}
        </defs>

        <g transform={`translate(${centerX}, ${centerY})`}>
          {arcs.map((arc, index) => (
            <path
              key={index}
              d={arc.path}
              // Gunakan URL gradasi sebagai fill
              fill={`url(#gradient-${arc.data.name.replace(/\s/g, '-')})`}
              // Terapkan filter glow
              filter={`url(#glow-${arc.data.name.replace(/\s/g, '-')})`}
              onMouseMove={(e) => handleMouseMove(e, { ...arc.data, color: arc.style.color })} // Kirim warna dasar ke tooltip
              onMouseLeave={handleMouseLeave}
              style={{ transition: 'fill 0.3s ease, filter 0.3s ease' }} // Transisi untuk fill dan filter
            />
          ))}
          {arcs.map((arc, index) => (
            <CustomLabel
              key={`label-${index}`}
              arc={{ ...arc, data: { ...arc.data, color: arc.style.color } }} // Kirim warna dasar ke label
            />
          ))}
        </g>
      </svg>
      {hoveredSlice && (
        <Box
          position="fixed"
          left={tooltipPos.x + 10}
          top={tooltipPos.y + 10}
          zIndex={999}
        >
          <CustomPieTooltip active={true} payload={[{ payload: hoveredSlice }]} />
        </Box>
      )}
    </Box>
  );
};


const TierDistributionCard = ({ data, totalUnits, loading, error, cardBg }) => {
  return (
    <Card bg={cardBg} shadow="sm" borderRadius={25}>
      <CardHeader>
        <Heading size="sm" color="gray.700">Tier Distribution</Heading>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Flex h="300px" justifyContent="center" alignItems="center">
            <VStack>
              <Spinner size="lg" color="blue.500" />
              <Text>Memuat data Tier Distribution...</Text>
            </VStack>
          </Flex>
        ) : error ? (
          <Flex h="300px" justifyContent="center" alignItems="center" flexDirection="column" p={4}>
            <Text color="red.500" fontWeight="bold" mb={2}>Terjadi Kesalahan Saat Memuat Data:</Text>
            <Text color="red.400" textAlign="center" fontSize="sm">{error}</Text>
            <Text color="gray.500" mt={4} fontSize="xs">Silakan cek URL API atau pastikan server berjalan dengan benar.</Text>
          </Flex>
        ) : (
          <Box position="relative" w="full" h="300px">
            <CustomDonutChart
              data={data}
              width={600}
              height={300}
            />
            <VStack
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              zIndex={1}
              color="gray.800"
              spacing={0}
              bg="white"
              p={2}
              borderRadius="md"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.200"
              textAlign="center"
            >
              <Text fontSize="md" fontWeight="bold">
                {totalUnits.total} Unit
              </Text>
              <Text fontSize="xs" color="gray.600">ATM: {totalUnits.atm}</Text>
              <Text fontSize="xs" color="gray.600">CRM: {totalUnits.crm}</Text>
            </VStack>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

export default TierDistributionCard;
