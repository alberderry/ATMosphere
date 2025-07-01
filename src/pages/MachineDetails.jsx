// src/pages/MachineDetail.jsx
import {
  Box,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  Divider,
  Spinner,
  Center,
  SimpleGrid // Import SimpleGrid untuk layout yang lebih rapi
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const MachineDetail = () => {
  const { id } = useParams(); // Mendapatkan ID mesin dari URL
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data dummy untuk detail mesin (diperbarui dengan parameter baru)
  const dummyMachineDetails = [
    {
      id: 'ATM001',
      no: 1,
      name: 'ATM KCP Sudirman',
      type: 'ATM', // Kategori
      status: 'Active',
      location: 'Jakarta Pusat',
      tier: 'TIER 1',
      cabangInduk: '001 - Kantor Pusat',
      kanwil: 'Kanwil 1',
      alamat: 'Jl. Jend. Sudirman No.1, Jakarta Pusat',
      titikKoordinat: { lat: -6.2088, lng: 106.8456 },
      kelurahan: 'Karet Tengsin',
      kecamatan: 'Tanah Abang',
      kabKota: 'Jakarta Pusat',
      prov: 'DKI Jakarta',
      idKota: 'JKT01',
      spesifikasi: 'NCR 6622',
      kantor: 'KCP Sudirman',
      keterangan: 'Mesin ini berlokasi strategis di pusat kota, area sibuk.',
      details: {
        serialNumber: 'SN-ATM-001-XYZ',
        installationDate: '2022-01-15',
        lastMaintenance: '2024-05-20',
        softwareVersion: 'V2.1.0',
        networkStatus: 'Online',
      }
    },
    {
      id: 'CRM005',
      no: 2,
      name: 'CRM Cabang Thamrin',
      type: 'CRM', // Kategori
      status: 'Active',
      location: 'Jakarta Selatan',
      tier: 'TIER 2',
      cabangInduk: '002 - Cabang Utama Thamrin',
      kanwil: 'Kanwil 1',
      alamat: 'Jl. M.H. Thamrin No.10, Jakarta Selatan',
      titikKoordinat: { lat: -6.1953, lng: 106.8229 },
      kelurahan: 'Kebon Melati',
      kecamatan: 'Tanah Abang',
      kabKota: 'Jakarta Pusat',
      prov: 'DKI Jakarta',
      idKota: 'JKT01',
      spesifikasi: 'Wincor Cineo 2500',
      kantor: 'Cabang Thamrin',
      keterangan: 'CRM ini sering digunakan untuk layanan pembukaan rekening dan setoran tunai.',
      details: {
        serialNumber: 'SN-CRM-005-ABC',
        installationDate: '2023-03-10',
        lastMaintenance: '2024-04-10',
        softwareVersion: 'V1.5.2',
        networkStatus: 'Online',
      }
    },
    {
      id: 'ATM010',
      no: 3,
      name: 'ATM Mall Bandung',
      type: 'ATM',
      status: 'Inactive',
      location: 'Bandung',
      tier: 'TIER 3',
      cabangInduk: '003 - Cabang Utama Bandung',
      kanwil: 'Kanwil 2',
      alamat: 'Jl. Merdeka No.12, Bandung',
      titikKoordinat: { lat: -6.9175, lng: 107.6191 },
      kelurahan: 'Citarum',
      kecamatan: 'Bandung Wetan',
      kabKota: 'Bandung',
      prov: 'Jawa Barat',
      idKota: 'BDG01',
      spesifikasi: 'Diebold Nixdorf 380',
      kantor: 'Mall Bandung',
      keterangan: 'Mesin perlu diperiksa, kemungkinan masalah koneksi atau hardware.',
      details: {
        serialNumber: 'SN-ATM-010-DEF',
        installationDate: '2021-11-01',
        lastMaintenance: '2024-03-01',
        softwareVersion: 'V2.0.0',
        networkStatus: 'Offline',
      }
    },
    {
      id: 'CRM012',
      no: 4,
      name: 'CRM Kantor Surabaya',
      type: 'CRM',
      status: 'Active',
      location: 'Surabaya',
      tier: 'TIER 1',
      cabangInduk: '004 - Cabang Utama Surabaya',
      kanwil: 'Kanwil 3',
      alamat: 'Jl. Basuki Rahmat No.5, Surabaya',
      titikKoordinat: { lat: -7.2657, lng: 112.7352 },
      kelurahan: 'Embong Kaliasin',
      kecamatan: 'Genteng',
      kabKota: 'Surabaya',
      prov: 'Jawa Timur',
      idKota: 'SBY01',
      spesifikasi: 'Fujitsu G600',
      kantor: 'Kantor Surabaya',
      keterangan: 'Kinerja sangat baik, lokasi ramai dan strategis.',
      details: {
        serialNumber: 'SN-CRM-012-GHI',
        installationDate: '2022-09-20',
        lastMaintenance: '2024-05-15',
        softwareVersion: 'V1.6.0',
        networkStatus: 'Online',
      }
    },
    {
      id: 'ATM020',
      no: 5,
      name: 'ATM Bandara Soetta',
      type: 'ATM',
      status: 'Maintenance',
      location: 'Tangerang',
      tier: 'TIER 4',
      cabangInduk: '005 - KCP Bandara Soetta',
      kanwil: 'Kanwil 1',
      alamat: 'Terminal 3, Bandara Soekarno-Hatta, Tangerang',
      titikKoordinat: { lat: -6.1256, lng: 106.6559 },
      kelurahan: 'Pajang',
      kecamatan: 'Benda',
      kabKota: 'Tangerang',
      prov: 'Banten',
      idKota: 'TNG01',
      spesifikasi: 'NCR 6687',
      kantor: 'Bandara Soetta',
      keterangan: 'Sedang dalam proses upgrade hardware dan software.',
      details: {
        serialNumber: 'SN-ATM-020-JKL',
        installationDate: '2023-01-05',
        lastMaintenance: '2024-05-25',
        softwareVersion: 'V2.2.0',
        networkStatus: 'Online',
      }
    },
    {
      id: 'CRM025',
      no: 6,
      name: 'CRM KCP Prioritas',
      type: 'CRM',
      status: 'Active',
      location: 'Bandung',
      tier: 'TIER 1',
      cabangInduk: '006 - KCP Prioritas Bandung',
      kanwil: 'Kanwil 2',
      alamat: 'Jl. Asia Afrika No.100, Bandung',
      titikKoordinat: { lat: -6.9219, lng: 107.6091 },
      kelurahan: 'Braga',
      kecamatan: 'Sumur Bandung',
      kabKota: 'Bandung',
      prov: 'Jawa Barat',
      idKota: 'BDG01',
      spesifikasi: 'Wincor Cineo 4000',
      kantor: 'KCP Prioritas',
      keterangan: 'Digunakan oleh nasabah prioritas, volume transaksi sangat tinggi.',
      details: {
        serialNumber: 'SN-CRM-025-MNO',
        installationDate: '2022-07-01',
        lastMaintenance: '2024-05-01',
        softwareVersion: 'V1.7.0',
        networkStatus: 'Online',
      }
    },
  ];

  useEffect(() => {
    setLoading(true);
    // Simulasikan pengambilan data dari API
    const fetchedMachine = dummyMachineDetails.find(m => m.id === id);
    setTimeout(() => {
      setMachine(fetchedMachine);
      setLoading(false);
    }, 500); // Simulasi loading 0.5 detik
  }, [id]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'green';
      case 'Inactive': return 'red';
      case 'Maintenance': return 'orange';
      default: return 'gray';
    }
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'TIER 1': return 'blue';
      case 'TIER 2': return 'green';
      case 'TIER 3': return 'yellow';
      case 'TIER 4': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <VStack>
          <Spinner size="xl" color="blue.500" />
          <Text mt={4}>Memuat detail mesin...</Text>
        </VStack>
      </Center>
    );
  }

  if (!machine) {
    return (
      <Center h="100vh">
        <Text fontSize="xl" color="red.500">Mesin dengan ID "{id}" tidak ditemukan.</Text>
      </Center>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">Detail Mesin: {machine.name}</Text>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between" align="center">
                <Text fontSize="xl" fontWeight="semibold">{machine.type} {machine.id}</Text>
                <HStack spacing={2}>
                  <Badge colorScheme={getStatusColor(machine.status)} fontSize="md" px={3} py={1} borderRadius="md">
                    {machine.status}
                  </Badge>
                  <Badge colorScheme={getTierColor(machine.tier)} fontSize="md" px={3} py={1} borderRadius="md">
                    {machine.tier}
                  </Badge>
                </HStack>
              </HStack>
              <Divider />

              {/* Informasi Utama */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box>
                  <Text fontWeight="semibold">No:</Text>
                  <Text>{machine.no}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">ID ATM:</Text>
                  <Text>{machine.id}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">ATM:</Text>
                  <Text>{machine.name}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">Cabang Induk:</Text>
                  <Text>{machine.cabangInduk}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">Kanwil:</Text>
                  <Text>{machine.kanwil}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">Alamat:</Text>
                  <Text>{machine.alamat}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">Titik Koordinat:</Text>
                  {/* Menggunakan optional chaining di sini */}
                  <Text>{machine.titikKoordinat?.lat}, {machine.titikKoordinat?.lng}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">Kelurahan:</Text>
                  <Text>{machine.kelurahan}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">Kecamatan:</Text>
                  <Text>{machine.kecamatan}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">Kab/Kota:</Text>
                  <Text>{machine.kabKota}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">Provinsi:</Text>
                  <Text>{machine.prov}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">ID Kota:</Text>
                  <Text>{machine.idKota}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">Kategori:</Text>
                  <Text>{machine.type}</Text> {/* Menggunakan 'type' sebagai kategori */}
                </Box>
                <Box>
                  <Text fontWeight="semibold">Spesifikasi:</Text>
                  <Text>{machine.spesifikasi}</Text>
                </Box>
                <Box>
                  <Text fontWeight="semibold">Kantor:</Text>
                  <Text>{machine.kantor}</Text>
                </Box>
              </SimpleGrid>

              <Divider />

              {/* Keterangan */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={2}>Keterangan</Text>
                <Text>{machine.keterangan}</Text>
              </Box>

              <Divider />

              {/* Informasi Teknis yang sudah ada */}
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={2}>Informasi Teknis Lainnya</Text>
                <Text><strong>Nomor Seri:</strong> {machine.details.serialNumber}</Text>
                <Text><strong>Tanggal Instalasi:</strong> {machine.details.installationDate}</Text>
                <Text><strong>Terakhir Servis:</strong> {machine.details.lastMaintenance}</Text>
                <Text><strong>Versi Software:</strong> {machine.details.softwareVersion}</Text>
                <Text><strong>Status Jaringan:</strong> {machine.details.networkStatus}</Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default MachineDetail;
