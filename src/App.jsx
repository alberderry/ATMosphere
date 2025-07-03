// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Flex, Spinner, Text, VStack } from '@chakra-ui/react'; // Import Flex, Spinner, Text, VStack
import { useState } from 'react';

import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MapView from './pages/MapViewPage.jsx';
import CBASelectionPage from './pages/CBASelectionPage.jsx';
import Master from './components/Master/Master.jsx';
import ApiTester from './ApiTester.jsx';
import ATMCRMPage from './pages/ATMCRMPage.jsx';
import CostPage from './pages/CostPage.jsx';
import Relocation from './pages/RelocationPage.jsx';
import SubmissionPage from './pages/SubmissionPage.jsx';
import Login from './contexts/Login.jsx';
import PerformanceReportsPage from './pages/PerformanceReportsPage.jsx';
import { useAuth } from '../src/contexts/AuthContext'; // Import useAuth
import MachineDetail from './pages/MachineDetails.jsx';
import CBAAnalyticsComponent from './components/CBAAnalyticsComponent.jsx';

function App() {
  // Ambil isAuthenticated dan isLoading dari useAuth
  const { isAuthenticated, isLoading, error: authError } = useAuth(); // Ambil juga error jika ingin ditampilan

  const [selectedPeriod, setSelectedPeriod] = useState('Juli - September, 2024');

  // Tampilkan layar loading saat status otentikasi masih dalam proses
  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="blue.50">
        <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text fontSize="lg" color="blue.700">Memuat sesi...</Text>
            {/* Opsional: tampilkan error jika ada saat loading */}
            {authError && <Text color="red.500" fontSize="sm">{authError}</Text>} 
        </VStack>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="blue.50">
      <Routes>
        {/* Rute untuk halaman Login, selalu dapat diakses tanpa otentikasi */}
        <Route path="/login" element={<Login />} />

        {/* Rute baru untuk ApiTester */}
        <Route path="/api-test" element={<ApiTester />} />

        {/* Rute untuk halaman utama (/) */}
        {/* Sekarang, kita hanya memeriksa isAuthenticated JIKA isLoading sudah false */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* Rute anak-anak di dalam Layout */}
          <Route index element={<Dashboard selectedPeriod={selectedPeriod} />} />
          <Route path="dashboard" element={<Dashboard selectedPeriod={selectedPeriod} />} />
          <Route path="analytics/map-view" element={<MapView selectedPeriod={selectedPeriod} />} />
          <Route path="analytics/trx-fee" element={<PerformanceReportsPage selectedPeriod={selectedPeriod} />} />
          <Route path="master" element={<Master selectedPeriod={selectedPeriod} />} />
          <Route path="analytics/cba" element={<CBASelectionPage />} />
          <Route path="analytics/cba/:atmId" element={<CBAAnalyticsComponent selectedPeriod={selectedPeriod} />} />
          <Route path="action">
            <Route path="cba-simulation" element={<Relocation />} />
            <Route path="cba-simulation/edit/:relocationId" element={<Relocation />} />
            <Route path="submission" element={<SubmissionPage />} /> 
          </Route>
          <Route path="master" element={<Master />} />
          <Route path="master/:id" element={<MachineDetail />} />
          <Route path="atm-crm" element={<ATMCRMPage />} />
          <Route path="atm-crm/cost" element={<CostPage />} />
        </Route>

        {/* Catch-all route untuk rute yang tidak dikenal */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Box>
  );
}

export default App;