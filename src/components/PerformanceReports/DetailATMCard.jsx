// src/components/PerformanceReports/DetailATMCard.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardBody, VStack, HStack, Text, Box, Icon, Spinner, Flex } from "@chakra-ui/react";
import { FaGoogle } from 'react-icons/fa'; 
import { useAuth } from '../../contexts/AuthContext';
import { getTierStyles } from '../../assets/tierColor'; // Pastikan path benar

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const periods = [
  { name: 'Juli - September, 2024', id: 1 },
  { name: 'Oktober - Desember, 2024', id: 2 },
  { name: 'Januari - Maret, 2025', id: 3 },
  { name: 'April - Juni, 2025', id: 4 },
];

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

const DetailATMCard = ({ atmId, selectedPeriod }) => {
  const [atmDetailData, setAtmDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { getAccessToken } = useAuth();

  const currentPeriodId = useMemo(() => {
    const periodFound = periods.find(p => p.name === selectedPeriod);
    ("DetailATMCard: selectedPeriod =", selectedPeriod, "-> currentPeriodId =", periodFound?.id);
    return periodFound?.id;
  }, [selectedPeriod]);

  const fetchAtmDetail = useCallback(async () => {
    if (!atmId || !currentPeriodId) {
      setAtmDetailData(null);
      setLoading(false);
      ('DetailATMCard: Skipping ATM detail fetch: atmId or currentPeriodId is missing.', { atmId, currentPeriodId });
      return;
    }

    setLoading(true);
    setError(null);
    const authToken = getAccessToken();

    try {
      const url = `${API_BASE_URL}/atm-performance-detail?atm_id=${atmId}&period_id=${currentPeriodId}`;
      ("DetailATMCard: Fetching ATM detail from:", url, "for atmId:", atmId, "periodId:", currentPeriodId);

      const response = await fetch(url, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
      }

      const result = await response.json();
      ("DetailATMCard: ATM Detail API response for atmId", atmId, ":", result);

      if (result.message && result.message.startsWith('success') && result.data) {
        setAtmDetailData(result.data);
      } else {
        setAtmDetailData(null);
        setError("Data detail ATM tidak ditemukan dalam respons API atau respons tidak menunjukkan 'success'.");
      }
    } catch (err) {
      setError(`Gagal memuat detail ATM: ${err.message}`);
      setAtmDetailData(null);
    } finally {
      setLoading(false);
    }
  }, [atmId, currentPeriodId, getAccessToken]); // Dependency atmId dan currentPeriodId adalah kunci

  useEffect(() => {
    ("DetailATMCard: useEffect triggered. atmId prop:", atmId, "currentPeriodId:", currentPeriodId);
    fetchAtmDetail();
  }, [atmId, currentPeriodId, fetchAtmDetail]);

  const renderCardContent = () => {
    const defaultStyles = getTierStyles('default');
    let cardBg = defaultStyles.cardBg;
    let textColor = defaultStyles.textColor;
    let iconBg = defaultStyles.iconBg;
    let iconColor = defaultStyles.iconColor;

    // ... (rest of renderCardContent logic is the same)
    if (loading) {
        return (
          <Card bg={cardBg} color={textColor} p={4} borderRadius="25px" boxShadow="md" flex="1" overflow="hidden" position="relative" _hover={{ transform: 'translateY(-10px)', boxShadow: 'xl' }} transition="all 0.3s ease-in-out">
              <Flex h="150px" justifyContent="center" alignItems="center">
              <Spinner size="md" color="white" />
              <Text ml={2}>Memuat detail ATM...</Text>
              </Flex>
          </Card>
        );
      }
  
      if (error) {
        return (
          <Card bg={cardBg} color={textColor} p={4} borderRadius="25px" boxShadow="md" flex="1" overflow="hidden" position="relative" _hover={{ transform: 'translateY(-10px)', boxShadow: 'xl' }} transition="all 0.3s ease-in-out">
              <Text color="red.200" textAlign="center" p={4}>{error}</Text>
          </Card>
        );
      }
  
      if (!atmDetailData) {
        return (
          <Card bg={cardBg} color={textColor} p={4} borderRadius="25px" boxShadow="md" flex="1" overflow="hidden" position="relative" _hover={{ transform: 'translateY(-10px)', boxShadow: 'xl' }} transition="all 0.3s ease-in-out">
            <Text textAlign="center" p={4} color="whiteAlpha.800">Pilih ATM dari daftar untuk melihat detail.</Text>
          </Card>
        );
      }
  
      const { 
          atm_id: { 
              code: atmCode, 
              name: atmName, 
              address: atmAddress, 
              branch_id: branchInfo 
          }, 
          tier 
      } = atmDetailData;
  
      const currentTierStyles = getTierStyles(tier);
      cardBg = currentTierStyles.cardBg;
      textColor = currentTierStyles.textColor;
      iconBg = currentTierStyles.iconBg;
      iconColor = currentTierStyles.iconColor;
  
      const kanwilName = branchInfo?.parent_id?.name || 'N/A'; 
      const kcName = branchInfo?.name || 'N/A'; 
      const kodeCabang = branchInfo?.branch_code?.toString() || 'N/A'; 
      const displayedAtmAddress = truncateText(atmAddress, 45); 
      const displayedAtmName = truncateText(atmName, 20); 
  
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
          _hover={{ transform: 'translateY(-10px)', boxShadow: 'xl' }}
          transition="all 0.3s ease-in-out"
        >
          <CardBody pb={20}>
            <VStack align="flex-start" spacing={1} width="100%">
              <HStack justifyContent="space-between" width="100%">
                <Text fontSize="md" fontWeight="bold">{displayedAtmName}</Text>
                <Box
                  bg={iconBg}
                  borderRadius="full"
                  boxSize="50px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color={iconColor}
                  mb={-10}
                >
                  <Icon as={FaGoogle} w={7} h={7} />
                </Box>
              </HStack>
              <Text fontSize="2xl" fontWeight="extrabold" mt={0}>{atmCode}</Text> 
  
              <HStack justifyContent="space-between" width="100%" mt={4}>
                <VStack align="flex-start" spacing={0}>
                  <Text fontSize="sm" color={textColor === "white" ? "whiteAlpha.700" : "gray.600"}>{kanwilName}</Text>
                  <Text fontSize="sm" color={textColor === "white" ? "whiteAlpha.700" : "gray.600"}>{kcName}</Text>
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
            bg={cardBg} 
            p={4}
            borderBottomRadius="25px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text fontSize="md" fontWeight="medium">{displayedAtmAddress || 'Alamat Tidak Diketahui'}</Text> 
            <HStack spacing={-2} pr={2}>
              <Box bg="red.400" opacity="0.6" borderRadius="full" boxSize="15px" />
              <Box bg="red.600" opacity="0.6" borderRadius="full" boxSize="15px" />
            </HStack>
          </Box>
        </Card>
      );
  };

  return renderCardContent();
};

export default DetailATMCard;