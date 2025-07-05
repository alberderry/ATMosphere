// src/components/PerformanceReports/ATMListItemCard.jsx
import React, { useEffect, useRef } from 'react';
// UBAH BARIS INI:
// import { Card, HStack, VStack, Text, Flex, Icon, Button, keyframes } from "@chakra-ui/react";
// MENJADI:
import { Card, HStack, VStack, Text, Flex, Icon, Button } from "@chakra-ui/react";
import { keyframes } from "@emotion/react"; // <-- Import keyframes dari @emotion/react

import { FaMoneyBillAlt } from 'react-icons/fa';
import { getTierStyles } from '../../assets/tierColor';

// Definisikan keyframes untuk animasi "bergetar" atau "naik-turun"
const activeCardAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
`;

// Opsi animasi lain (lebih halus):
/*
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.01); }
  100% { transform: scale(1); }
`;
*/

const ATMListItemCard = ({ atm, onViewDetails, isActive }) => { 
  const { cardBg, textColor, iconBg, iconColor } = getTierStyles(atm.tier); 
  const cardRef = useRef(null); 

  const handleViewDetailsClick = () => {
    ("ATMListItemCard: Button clicked for ATM ID:", atm.id, "Kode ATM:", atm.kodeAtm);
    if (onViewDetails) {
      onViewDetails(atm.id);
    }
  };

  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive]);

  return (
    <Card 
      ref={cardRef} 
      bg={cardBg} 
      borderRadius="25px" 
      boxShadow={isActive ? "0 0 0 3px var(--chakra-colors-blue-500), 0 4px 6px rgba(0, 0, 0, 0.1)" : "md"} 
      animation={isActive ? `${activeCardAnimation} 1.5s ease-in-out infinite alternate` : "none"} 
      transition="all 0.2s ease-in-out, animation 0s" 
      p={4} 
      color={textColor}
      _hover={{ 
        transform: isActive ? "translateY(-5px)" : "translateY(-10px)",
        boxShadow: isActive ? "0 0 0 3px var(--chakra-colors-blue-500), 0 8px 12px rgba(0, 0, 0, 0.2)" : "xl" 
      }}
    >
      <HStack spacing={6} align="center" justify="space-between">
        <HStack spacing={4} align="center">
          <Flex
            boxSize="50px"
            borderRadius="full"
            bg={iconBg}
            justifyContent="center"
            alignItems="center"
          >
            <Icon as={FaMoneyBillAlt} w={6} h={6} color={iconColor} />
          </Flex>
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="sm" color={textColor === "white" ? "whiteAlpha.700" : "gray.600"}>{atm.namaAtm}</Text> 
            <Text fontSize="lg" fontWeight="semibold">{atm.kodeAtm}</Text>
          </VStack>
        </HStack>

        <HStack spacing={10}>
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="sm" color={textColor === "white" ? "whiteAlpha.700" : "gray.600"}>Frekuensi TRX</Text>
            <Text fontSize="md" fontWeight="medium">{atm.frekuensiTransaksi.toLocaleString('id-ID')}</Text>
          </VStack>
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="sm" color={textColor === "white" ? "whiteAlpha.700" : "gray.600"}>Nominal TRX</Text>
            <Text fontSize="md" fontWeight="medium">Rp. {atm.nominalTrx.toLocaleString('id-ID')}</Text>
          </VStack>
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="sm" color={textColor === "white" ? "whiteAlpha.700" : "gray.600"}>Fee Trx</Text>
            <Text fontSize="md" fontWeight="medium">Rp. {atm.fee.toLocaleString('id-ID')}</Text>
          </VStack>
        </HStack>

        <Button
          variant="link"
          colorScheme={textColor === "white" ? "whiteAlpha" : "blue"}
          fontWeight="semibold"
          onClick={handleViewDetailsClick} 
        >
          View Details
        </Button>
      </HStack>
    </Card>
  );
};

export default ATMListItemCard;