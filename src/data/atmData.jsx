// src/data/atmData.js

// Data dummy untuk analisis CBA
export const dummyCBAData = [
  {
    id: 'ATM001',
    name: 'ATM KCP Sudirman',
    type: 'ATM',
    status: 'Active',
    location: 'Jakarta Pusat',
    tier: 'TIER 1',
    cabangInduk: '001 - Kantor Pusat',
    kanwil: 'Kanwil 1',
    alamat: 'Jl. Jend. Sudirman No.1, Jakarta Pusat',
    titikKoordinat: { lat: -6.2088, lng: 106.8456 },
    costs: {
      machineRental: 5000000, // Rp 5 juta
      locationRental: 10000000, // Rp 10 juta
      electricity: 1500000, // Rp 1.5 juta
      refill: 2000000, // Rp 2 juta
    },
    benefits: {
      transactions: 15000, // 15,000 transaksi
      totalFee: 150000000, // Rp 150 juta
    },
  },
  {
    id: 'CRM005',
    name: 'CRM Cabang Thamrin',
    type: 'CRM',
    status: 'Active',
    location: 'Jakarta Selatan',
    tier: 'TIER 2',
    cabangInduk: '002 - Cabang Utama Thamrin',
    kanwil: 'Kanwil 1',
    alamat: 'Jl. M.H. Thamrin No.10, Jakarta Selatan',
    titikKoordinat: { lat: -6.1953, lng: 106.8229 },
    costs: {
      machineRental: 7000000,
      locationRental: 12000000,
      electricity: 2000000,
      refill: 2500000,
    },
    benefits: {
      transactions: 20000,
      totalFee: 200000000,
    },
  },
  {
    id: 'ATM010',
    name: 'ATM Mall Bandung',
    type: 'ATM',
    status: 'Inactive',
    location: 'Bandung',
    tier: 'TIER 3',
    cabangInduk: '003 - Cabang Utama Bandung',
    kanwil: 'Kanwil 2',
    alamat: 'Jl. Merdeka No.12, Bandung',
    titikKoordinat: { lat: -6.9175, lng: 107.6191 },
    costs: {
      machineRental: 4000000,
      locationRental: 8000000,
      electricity: 1000000,
      refill: 1500000,
    },
    benefits: {
      transactions: 8000,
      totalFee: 80000000,
    },
  },
  {
    id: 'CRM012',
    name: 'CRM Kantor Surabaya',
    type: 'CRM',
    status: 'Active',
    location: 'Surabaya',
    tier: 'TIER 1',
    cabangInduk: '004 - Cabang Utama Surabaya',
    kanwil: 'Kanwil 3',
    alamat: 'Jl. Basuki Rahmat No.5, Surabaya',
    titikKoordinat: { lat: -7.2657, lng: 112.7352 },
    costs: {
      machineRental: 6000000,
      locationRental: 11000000,
      electricity: 1800000,
      refill: 2200000,
    },
    benefits: {
      transactions: 18000,
      totalFee: 180000000,
    },
  },
  {
    id: 'ATM020',
    name: 'ATM Bandara Soetta',
    type: 'ATM',
    status: 'Maintenance',
    location: 'Tangerang',
    tier: 'TIER 4',
    cabangInduk: '005 - KCP Bandara Soetta',
    kanwil: 'Kanwil 1',
    alamat: 'Terminal 3, Bandara Soekarno-Hatta, Tangerang',
    titikKoordinat: { lat: -6.1256, lng: 106.6559 },
    costs: {
      machineRental: 4500000,
      locationRental: 9000000,
      electricity: 1300000,
      refill: 1800000,
    },
    benefits: {
      transactions: 10000,
      totalFee: 100000000,
    },
  },
  {
    id: 'CRM025',
    name: 'CRM KCP Prioritas',
    type: 'CRM',
    status: 'Active',
    location: 'Bandung',
    tier: 'TIER 1',
    cabangInduk: '006 - KCP Prioritas Bandung',
    kanwil: 'Kanwil 2',
    alamat: 'Jl. Asia Afrika No.100, Bandung',
    titikKoordinat: { lat: -6.9219, lng: 107.6091 },
    costs: {
      machineRental: 8000000,
      locationRental: 15000000,
      electricity: 2500000,
      refill: 3000000,
    },
    benefits: {
      transactions: 25000,
      totalFee: 250000000,
    },
  },
];
