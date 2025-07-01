// src/components/MapView/AtmInfoWindowCard.jsx
import React from 'react';
import { Box, Text, VStack, Flex, Badge, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

/**
 * Komponen terpisah untuk menampilkan detail ATM dalam InfoWindow kustom di peta.
 * Menerima data ATM dan fungsi helper sebagai props.
 */
const AtmInfoWindowCard = ({ atm, onClose, getTierColor, getBadgeTextColor }) => {
  if (!atm) return null; // Pastikan ada data ATM

  return (
    <Box
      // Gaya dasar kotak InfoWindow
      bg="white"
      borderRadius="lg"
      boxShadow="lg"
      p={0}
      maxWidth="280px" // Batasi lebar
      minWidth="250px" // Pastikan lebar minimum
      maxHeight="300px" // Batasi tinggi
      overflowY="auto" // Aktifkan scroll jika konten melebihi tinggi
    >
      {/* Bagian Header InfoWindow: Nama ATM, Code, dan Tombol Tutup */}
      <Flex
        justify="space-between"
        align="center"
        p="10px 15px"
        bg="gray.50"
        borderBottom="1px solid"
        borderColor="gray.100"
        borderTopRadius="lg"
      >
        <Text fontSize="sm" fontWeight="bold" color="gray.800">
          {atm.name}
        </Text>
        {/* PERUBAHAN: Badge sekarang menampilkan 'code' ATM, tapi warnanya tetap berdasarkan tier */}
        <Badge
          bg={getTierColor(atm.tier)} // Warna Badge dari prop, berdasarkan tier
          color={getBadgeTextColor(getTierColor(atm.tier))} // Warna Teks Badge dari prop
          borderRadius="full"
          fontSize="xs"
          px={2}
          py={1}
        >
          {atm.code || 'N/A'} {/* Menampilkan kode ATM */}
        </Badge>
        <IconButton
          icon={<CloseIcon />}
          size="xs"
          variant="ghost"
          aria-label="Close InfoWindow"
          onClick={onClose} // Tombol untuk menutup InfoWindow
        />
      </Flex>

      {/* Bagian Isi InfoWindow: Detail ATM */}
      <Box p="15px">
        <Text fontSize="xs" color="gray.700" mb="10px">
          {atm.address}
        </Text>

        {/* Basic Info */}
        <Flex align="center" mb="10px" pb="5px" borderBottom="1px solid" borderColor="gray.100">
          <Text mr="8px" color="#4299E1">&#9432;</Text> {/* Info icon */}
          <Text fontSize="sm" fontWeight="bold" color="gray.800">Informasi Dasar</Text>
        </Flex>
        <Text fontSize="xs" color="gray.700" ml="20px" mb="3px">
          <strong>Tipe:</strong> {atm.type ? atm.type.toUpperCase() : 'N/A'}
        </Text>
        {/* PERUBAHAN: Menambahkan Brand */}
        <Text fontSize="xs" color="gray.700" ml="20px" mb="3px">
          <strong>Brand:</strong> {atm.brand || 'N/A'}
        </Text>
        {/* PERUBAHAN: Menambahkan Kode Cabang (branch_code) */}
        <Text fontSize="xs" color="gray.700" ml="20px" mb="3px">
          <strong>Kode Cabang:</strong> {atm.branch_id?.branch_code || 'N/A'}
        </Text>
        {/* PERUBAHAN: Menambahkan Tier Kinerja */}
        <Text fontSize="xs" color="gray.700" ml="20px" mb="3px">
          <strong>Tier Kinerja:</strong> {atm.tier !== 'N/A' ? `TIER ${atm.tier}` : 'N/A'}
        </Text>

        {/* Transaction Metrics and Fees */}
        <Flex align="center" mt="15px" mb="10px" pb="5px" borderBottom="1px solid" borderColor="gray.100">
          <Text mr="8px" color="#4299E1">&#x21BB;</Text> {/* Transaction icon */}
          <Text fontSize="sm" fontWeight="bold" color="gray.800">Metrik Transaksi</Text>
        </Flex>
        <Text fontSize="xs" color="gray.700" ml="20px" mb="3px">
          <strong>Volume Transaksi:</strong> {atm.volume_trx !== 'N/A' ? atm.volume_trx.toLocaleString('id-ID') : 'N/A'}
        </Text>
        <Text fontSize="xs" color="gray.700" ml="20px" mb="3px">
          <strong>Fee:</strong> Rp. {atm.fee !== 'N/A' ? atm.fee.toLocaleString('id-ID') : 'N/A'}
        </Text>


        {/* Detail Kantor Induk */}
        {atm.branch_id && (
          <>
            <Flex align="center" mt="15px" mb="10px" pb="5px" borderBottom="1px solid" borderColor="gray.100">
              <Text mr="8px" color="#4299E1">&#x2302;</Text> {/* Building icon */}
              <Text fontSize="sm" fontWeight="bold" color="gray.800">Kantor Induk</Text>
            </Flex>
            <Text fontSize="xs" color="gray.700" ml="20px" mb="3px">
              <strong>Nama Cabang:</strong> {atm.branch_id.name || 'N/A'}
            </Text>
            {/* PERUBAHAN: Menampilkan nama Kanwil (Kantor Induk Level 1) */}
            <Text fontSize="xs" color="gray.700" ml="20px" mb="3px">
              <strong>Kanwil:</strong> {atm.branch_id.parent_id?.name || 'N/A'}
            </Text>
            <Text fontSize="xs" color="gray.700" ml="20px" mb="3px">
              <strong>Alamat Cabang:</strong> {atm.branch_id.address || 'N/A'}
            </Text>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AtmInfoWindowCard;
