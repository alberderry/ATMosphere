import React, { useState } from 'react';
import DashboardComponent from '../components/dashboard/DashboardComponent'; // Import komponen presentasi

// --- Mock Data ---
// Data untuk kartu statistik ringkasan
const summaryStats = [
  { label: 'Total Transaction', value: '11.308.212', growth: '+13.5%', color: 'green', icon: 'tabler:repeat' }, // Card kedua
  { label: 'Total Amount', value: 'Rp.6.567.890.098', growth: '+13.5%', color: 'green', icon: 'tdesign:money' }, // Card ketiga
  { label: 'Total Fee', value: 'Rp.2.034.187.998', growth: '+13.5%', color: 'green', icon: 'fa6-solid:money-bill-trend-up' }, // Card keempat
];

// Data untuk Bar/Line Chart (Performance Trends)
const performanceTrendsData = [
  { name: 'Q1 \'24', amount: 90, fee: 30, transaction: 100 },
  { name: 'Q2 \'24', amount: 120, fee: 40, transaction: 130 },
  { name: 'Q3 \'24', amount: 100, fee: 35, transaction: 110 },
  { name: 'Q4 \'24', amount: 150, fee: 50, transaction: 160 },
  { name: 'Q1 \'25', amount: 80, fee: 25, transaction: 90 },
];

// Data untuk Line Chart (ROI Trends)
const roiTrendsData = [
  { name: 'Figma', roi: 70, cost: 30 },
  { name: 'Sketch', roi: 85, cost: 25 },
  { name: 'XD', roi: 60, cost: 40 },
  { name: 'Photoshop', roi: 95, cost: 20 },
  { name: 'Illustrator', roi: 75, cost: 35 },
  { name: 'AfterEffect', roi: 90, cost: 28 },
];

// Data untuk Performance Leaderboard
const leaderboardData = {
  atm: [
    { id: 1, name: 'ATM KC SUBANG 1', code: 'A017', kc: '0008 - Subang', kanwil: 'Kanwil I', revenue: '2.176.897', fee: '1.656.537', transactions: '7.450', growth: '+15.3%', avatarBg: 'yellow.400' },
    { id: 2, name: 'ATM KC BANDUNG 2', code: 'A022', kc: '0010 - Bandung', kanwil: 'Kanwil I', revenue: '1.980.500', fee: '1.500.000', transactions: '6.800', growth: '+12.1%', avatarBg: 'blue.400' },
    { id: 3, name: 'ATM KC CIMAHI 3', code: 'A030', kc: '0015 - Cimahi', kanwil: 'Kanwil II', revenue: '1.800.000', fee: '1.400.000', transactions: '6.200', growth: '+10.5%', avatarBg: 'green.400' },
  ],
  kc: [
    { id: 1, name: 'KC SUBANG', code: '0008', kanwil: 'Kanwil I', revenue: '15.2M', fee: '10.5M', transactions: '50.000', growth: '+10.0%', avatarBg: 'purple.400' },
    { id: 2, name: 'KC BANDUNG', code: '0010', kanwil: 'Kanwil I', revenue: '14.8M', fee: '9.8M', transactions: '48.000', growth: '+9.5%', avatarBg: 'orange.400' },
  ],
  kanwil: [
    { id: 1, name: 'KANWIL I', code: 'KW01', revenue: '50M', fee: '35M', transactions: '200.000', growth: '+8.0%', avatarBg: 'red.400' },
    { id: 2, name: 'KANWIL II', code: 'KW02', revenue: '45M', fee: '30M', transactions: '180.000', growth: '+7.5%', avatarBg: 'teal.400' },
  ],
};

const Dashboard = ({ selectedPeriod }) => { // Menerima selectedPeriod dari App.jsx
  const [leaderboardTab, setLeaderboardTab] = useState(0); // 0: ATM, 1: KC, 2: KANWIL
  const [leaderboardMetric, setLeaderboardMetric] = useState('Transaction');

  // Logika untuk mendapatkan data leaderboard yang sedang aktif
  const currentLeaderboardData = (() => {
    switch (leaderboardTab) {
      case 0: return leaderboardData.atm;
      case 1: return leaderboardData.kc;
      case 2: return leaderboardData.kanwil;
      default: return leaderboardData.atm;
    }
  })();

  return (
    <DashboardComponent
      selectedPeriod={selectedPeriod} // Meneruskan selectedPeriod ke DashboardComponent
      summaryStats={summaryStats}
      performanceTrendsData={performanceTrendsData}
      roiTrendsData={roiTrendsData}
      leaderboardData={currentLeaderboardData}
      leaderboardTab={leaderboardTab}
      setLeaderboardTab={setLeaderboardTab}
      leaderboardMetric={leaderboardMetric}
      setLeaderboardMetric={setLeaderboardMetric}
    />
  );
};

export default Dashboard;
