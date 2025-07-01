// AtmCard.jsx
import React from 'react'; // Pastikan React diimpor karena kita menggunakan useRef
import {
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Box,
  Icon,
  IconButton,
  useColorModeValue,
  useBoolean, // Import useBoolean hook
  useDisclosure, // Import useDisclosure hook untuk modal
  AlertDialog, // Import AlertDialog
  AlertDialogOverlay, // Import AlertDialogOverlay
  AlertDialogContent, // Import AlertDialogContent
  AlertDialogHeader, // Import AlertDialogHeader
  AlertDialogBody, // Import AlertDialogBody
  AlertDialogFooter, // Import AlertDialogFooter
  Button // Import Button
} from '@chakra-ui/react';
import { FaTrash, FaEye } from 'react-icons/fa'; // Import FaTrash and FaEye
import { getTierStyles } from '../../assets/tierColor'; // Import fungsi getTierStyles

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

// Menerima onCardClick dan onDelete prop
const AtmCard = ({ atm, onCardClick, onDelete }) => {
  const {
    id: atmId,
    code: atmCode,
    name: atmName,
    address: atmAddress,
    branch_id: branchInfo,
    tier,
  } = atm;

  // State untuk mengelola efek hover
  const [isHovered, { on: startHover, off: endHover }] = useBoolean();

  // State dan referensi untuk modal konfirmasi hapus
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(); // Ref untuk tombol "Batal" di modal

  const cardBg = useColorModeValue(
    "linear-gradient(90deg,rgb(255, 255, 255) 0%, rgb(255, 255, 255) 50%, rgb(233, 242, 255) 100%)",
    "linear-gradient(90deg, #2D3748 0%, #2D3748 50%, #4A5568 100%)"
  );
  const textColor = useColorModeValue("black", "white");
  const bottomBoxBg = useColorModeValue("whiteAlpha.800", "gray.700");

  // Pastikan atmId valid sebelum melanjutkan
  if (!atmId) {
    console.warn("AtmCard received an ATM object without a valid ID. Skipping render.");
    return null;
  }

  const currentTierStyles = getTierStyles(tier);

  const kanwilName = branchInfo?.parent_id?.name || 'N/A';
  const kcName = branchInfo?.name || 'N/A';
  const kodeCabang = branchInfo?.branch_code?.toString() || 'N/A';
  const displayedAtmAddress = truncateText(atmAddress, 40);
  const displayedAtmName = truncateText(atmName, 50);

  // Fungsi untuk menangani penghapusan setelah konfirmasi modal
  const handleDeleteConfirm = () => {
    onDelete(atmId); // Panggil fungsi onDelete yang diteruskan dari parent
    onClose(); // Tutup modal setelah penghapusan
  };

  return (
    <Card
      bg={cardBg}
      color={textColor}
      p={4}
      borderRadius="25px"
      boxShadow="md"
      flex="1"
      overflow="hidden"
      position="relative"
      // _hover untuk boxShadow dan cursor tetap ada, transform ditangani overlay
      _hover={{ boxShadow: 'xl', cursor: 'pointer' }}
      transition="all 0.3s ease-in-out"
      onMouseEnter={startHover} // Set hover state to true on mouse enter
      onMouseLeave={endHover}   // Set hover state to false on mouse leave
    >
      <CardBody pb={20}>
        <VStack align="flex-start" spacing={1} width="100%">
          <HStack justifyContent="space-between" width="100%">
            <Text fontSize="md" fontWeight="bold" noOfLines={1} title={atmName}>{displayedAtmName}</Text>
          </HStack>
          <Text fontSize="2xl" fontWeight="extrabold" mt={0}>{atmCode}</Text>

          <HStack justifyContent="space-between" width="100%" mt={4}>
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="sm" color={textColor === "white" ? "whiteAlpha.700" : "gray.600"}>{kanwilName}</Text>
              <Text fontSize="sm" fontWeight="extrabold" color={textColor === "white" ? "whiteAlpha.700" : "gray.600"}>{kcName}</Text>
            </VStack>
            <VStack align="flex-end" spacing={0}>
              <Text fontSize="sm" color={textColor === "white" ? "whiteAlpha.700" : "gray.600"}>Kode Cabang</Text>
              <Text fontSize="md" fontWeight="bold">{kodeCabang}</Text>
            </VStack>
          </HStack>
        </VStack>
      </CardBody>

      <Box
        position="absolute"
        bottom="0"
        left="0"
        width="100%"
        bg={bottomBoxBg}
        p={4}
        borderBottomRadius="25px"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text fontSize="md" fontWeight="medium" noOfLines={1}>{displayedAtmAddress || 'Alamat Tidak Diketahui'}</Text>
        <HStack spacing={-2} pr={2}>
          {/* Menggunakan warna dari tierStyles untuk indikator */}
          <Box mr={-3} bg={currentTierStyles.iconColor} opacity="0.7" borderRadius="full" boxSize="25px" />
          <Box bg={currentTierStyles.iconColor} opacity="0.6" borderRadius="full" boxSize="25px" />
        </HStack>
      </Box>

      {/* Overlay dan Tombol Aksi saat hover */}
      {isHovered && (
        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          borderRadius="25px"
          bg="rgba(0, 0, 0, 0.3)" // Gelapkan card
          display="flex"
          alignItems="center"
          justifyContent="center"
          transition="background-color 0.3s ease-in-out"
          zIndex="1" // Pastikan overlay di atas konten card
        >
          <HStack spacing={4}>
            {/* Tombol Mata (View) */}
            <IconButton
              aria-label="Lihat Detail ATM"
              icon={<Icon as={FaEye} />}
              size="lg"
              colorScheme="whiteAlpha"
              variant="solid"
              onClick={(e) => {
                e.stopPropagation(); // Mencegah onCardClick terpanggil dari parent Card
                onCardClick(atmId); // Panggil fungsi untuk melihat detail
              }}
              _hover={{ bg: 'whiteAlpha.400' }}
            />

            {/* Tombol Hapus - Hanya tampil jika onDelete prop diberikan */}
            {onDelete && (
              <IconButton
                aria-label="Hapus ATM"
                icon={<Icon as={FaTrash} />}
                size="lg"
                colorScheme="red"
                variant="solid"
                onClick={(e) => {
                  e.stopPropagation(); // Mencegah onCardClick terpanggil dari parent Card
                  onOpen(); // Buka modal konfirmasi saat tombol hapus diklik
                }}
                _hover={{ bg: 'red.500' }}
              />
            )}
          </HStack>
        </Box>
      )}

      {/* AlertDialog untuk Konfirmasi Hapus */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Hapus ATM
            </AlertDialogHeader>

            <AlertDialogBody>
              Apakah Anda yakin ingin menghapus ATM "{atmName}" (Kode: {atmCode})? Data yang sudah dihapus tidak bisa dikembalikan.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Batal
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Card>
  );
};

export default AtmCard;