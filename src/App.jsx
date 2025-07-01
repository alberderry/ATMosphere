import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { useState } from 'react'; // Import useState


import Layout from './components/Layout.jsx'; // Sesuaikan path components
import Dashboard from './pages/Dashboard.jsx'; // Sesuaikan path pages
import MapView from './pages/MapViewPage.jsx'; // Sesuaikan path pages
import CBAAnalytics from './pages/CBAAnalytics.jsx'; // Sesuaikan path pages
// import Relocation2 from './components/relocation2/location_analysis.jsx'; // Sesuaikan path components
import CBASelectionPage from './pages/CBASelectionPage.jsx'; // Sesuaikan path pages
import Master from './components/Master/Master.jsx'; // Sesuaikan path pages
import ApiTester from './ApiTester.jsx'; // Import ApiTester untuk pengujian API
import ATMCRMPage from './pages/ATMCRMPage.jsx'; // Sesuaikan path pages
import CostPage from './pages/CostPage.jsx'; // Sesuaikan path pages
import Relocation from './pages/RelocationPage.jsx'; // Sesuaikan path pages
import SubmissionPage from './pages/SubmissionPage.jsx'; // Sesuaikan path pages
import Login from './contexts/Login.jsx';
import PerformanceReportsPage from './pages/PerformanceReportsPage.jsx'; // Sesuaikan path pages
import { useAuth } from '../src/contexts/AuthContext'; // Import useAuth untuk otentikasi
import MachineDetail from './pages/MachineDetails.jsx'; // Sesuaikan path pages

function App() {
  const { isAuthenticated } = useAuth();

  // State untuk periode yang dipilih, dikelola di komponen induk (App.jsx)
  const [selectedPeriod, setSelectedPeriod] = useState('Juli - September, 2024');

  return (
    <Box minH="100vh" bg="blue.50">
      <Routes>
        {/* Rute untuk halaman Login, selalu dapat diakses tanpa otentikasi */}
        <Route path="/login" element={<Login />} />

        {/* Rute baru untuk ApiTester, dapat diakses tanpa otentikasi
            Ini akan membantu mengisolasi masalah API */}
        <Route path="/api-test" element={<ApiTester />} />

        {/* Rute untuk halaman utama (/) */}
        {/* Jika tidak terotentikasi, arahkan ke /login */}
        {/* Jika terotentikasi, tampilkan Layout dan rute anak-anaknya */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              // Meneruskan selectedPeriod dan setSelectedPeriod ke Layout
              // Layout kemudian harus meneruskannya ke komponen Header di dalamnya.
              <Layout selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* Rute anak-anak di dalam Layout. Rute-rute ini otomatis dilindungi
              karena parent Route (path="/") sudah memeriksa otentikasi. */}
          {/* Meneruskan selectedPeriod ke Dashboard */}
          <Route index element={<Dashboard selectedPeriod={selectedPeriod} />} />

          {/* Meneruskan selectedPeriod ke Dashboard */}
          <Route path="dashboard" element={<Dashboard selectedPeriod={selectedPeriod} />} />

          {/* Meneruskan selectedPeriod ke MapView */}
          <Route path="analytics/map-view" element={<MapView selectedPeriod={selectedPeriod} />} />
          {/* Rute untuk Trx-Fee, meneruskan selectedPeriod dari App.jsx */}
          <Route path="analytics/trx-fee" element={<PerformanceReportsPage selectedPeriod={selectedPeriod} />} />
          <Route path="master" element={<Master selectedPeriod={selectedPeriod} />} />

          {/* PENTING: Rute ini harus didefinisikan SEBELUM rute dengan parameter (:atmId) */}
          <Route path="analytics/cba" element={<CBASelectionPage />} />
          {/* Rute untuk CBA Analytics dengan parameter atmId */}
          <Route path="analytics/cba/:atmId" element={<CBAAnalytics />} />
          
          {/* Parent route "Action" */}
          <Route path="action">
            {/* Rute untuk Relocation */}
            {/* <Route path="cba-simulation" element={<Relocation2 />} /> */}
            {/* Rute untuk CBA Simulation (menggunakan komponen Relocation juga) */}
            <Route path="cba-simulation" element={<Relocation />} />
            <Route path="cba-simulation/edit/:relocationId" element={<Relocation />} /> {/* <--- TAMBAHKAN INI */}
            {/* Rute baru untuk SubmissionPage */}
            <Route path="submission" element={<SubmissionPage />} /> 
          </Route>

          <Route path="master" element={<Master />} />
          <Route path="master/:id" element={<MachineDetail />} />
          <Route path="atm-crm" element={<ATMCRMPage />} />
          <Route path="atm-crm/cost" element={<CostPage />} />
        </Route>

        {/* Catch-all route untuk rute yang tidak dikenal */}
        {/* Jika pengguna mencoba mengakses rute lain yang tidak terdefinisi,
            selalu arahkan ke /login (jika tidak terotentikasi, ini akan menjadi default) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Box>
  );
}

export default App;
