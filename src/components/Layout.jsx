// src/components/Layout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom' // Import Outlet
import { Box, Flex } from '@chakra-ui/react'; // Import Box dan Flex dari Chakra UI
import Header from './Header'; // Pastikan path ini benar
import Sidebar from './Sidebar'; // Asumsi Anda memiliki komponen Sidebar

// Layout kini menerima selectedPeriod dan setSelectedPeriod sebagai props
const Layout = ({ selectedPeriod, setSelectedPeriod }) => {
  return (
    <Flex h="100vh">
      {/* Sidebar */}
      {/* Pastikan komponen Sidebar Anda ada dan diimpor dengan benar */}
      <Sidebar />

      {/* Area Konten Utama */}
      <Box flex="1" overflow="hidden">
        {/* Header, menerima props dari App.jsx */}
        {/* Meneruskan selectedPeriod dan setSelectedPeriod ke Header */}
        <Header selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
        
        {/* Konten utama halaman (rute anak-anak) */}
        {/* Menggunakan Outlet untuk merender rute anak-anak */}
        <Box h="calc(100vh - 60px)" overflow="auto"> {/* 60px adalah tinggi header */}
          <Outlet /> 
        </Box>
      </Box>
    </Flex>
  );
};

export default Layout;
