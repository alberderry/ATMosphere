// components/RelocationCard.jsx
import React from 'react';
import {
    Box,
    VStack,
    Text,
    HStack,
    Icon,
    Badge,
    IconButton,
    Card, // Perhatikan ini, komponen Card dari Chakra UI
    CardBody, // Perhatikan ini, komponen CardBody dari Chakra UI
} from '@chakra-ui/react';
import {
    FaMoneyBillWave,
    FaCheckCircle,
    FaTimesCircle,
    FaWrench,
    FaTrash
} from 'react-icons/fa';

// ** Helper Functions (bisa juga dipisah ke file utilities jika banyak) **
const getVolumeTier = (volume) => {
    if (volume > 3600) return { tier: '1', gradient: 'linear-gradient(135deg, #4299E1 0%, #3182CE 100%)' }; // Blue for Tier 1
    if (volume > 2000 && volume <= 3600) return { tier: '2', gradient: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)' }; // Green for Tier 2
    if (volume > 1000 && volume <= 2000) return { tier: '3', gradient: 'linear-gradient(135deg, #ECC94B 0%, #D69E2E 100%)' }; // Yellow for Tier 3
    return { tier: '4', gradient: 'linear-gradient(135deg, #F56565 0%, #E53E3E 100%)' }; // Red for Tier 4
};

const getCardBackgroundGradient = (status) => {
    switch (status) {
        case 'rejected':
            return 'linear-gradient(90deg, rgba(244, 102, 102, 0.74) 0%, rgba(235, 28, 28, 0.59) 100%)'; // Merah gradien
        case 'approved':
            return 'linear-gradient(90deg, rgba(144, 238, 144, 0.2) 0%, rgba(144, 238, 144, 0.5) 100%)'; // Hijau gradien
        case 'in_progress':
            return 'linear-gradient(90deg, rgba(255, 255, 0, 0.2) 0%, rgba(255, 255, 0, 0.5) 100%)'; // Kuning gradien
        default:
            return 'white'; // Default jika status tidak dikenali
    }
};

const RelocationCard = ({
    item,
    currentUserBranchId,
    visibleActionButtons,
    
    handleCardClick,
   
    triggerCancelModal,
}) => {
    // Calculate score (tier) and gradient for each item
    const { tier, gradient } = getVolumeTier(item.volume || 0);
    // Get background gradient for the card based on its state
    const cardBgGradient = getCardBackgroundGradient(item.state);

    return (
        <Card
            key={item.id}
            boxShadow="sm"
            borderRadius="25px"
            bg={cardBgGradient} // Apply the state-based gradient here
            color="white" // Ensure text is readable on colored backgrounds
            cursor="pointer"
            _hover={{ boxShadow: "md", transform: "translateY(-2px)" }}
            onClick={() => handleCardClick(item.id)}
        >
            <CardBody p={4}>
                <HStack alignItems="center" justifyContent="space-between" width="full">
                    {/* Left Section: Icon and IDs */}
                    <HStack alignItems="center" flexShrink={0}>
                        <Card
                            bg="rgba(255, 255, 255, 0.8)" // Slightly transparent white for inner card
                            borderRadius="25px"
                            p={3}
                            mr={4}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon as={FaMoneyBillWave} boxSize={6} color="purple.600" />
                        </Card>

                        <VStack align="flex-start" spacing={0.5}>
                            <Text fontWeight="semibold" fontSize="md" color="black">{`RS${item.id}`}</Text>
                            <Text fontSize="sm" color="black">{`ATM ${item.atm_id?.code || 'N/A'}`}</Text>
                        </VStack>
                    </HStack>

                    {/* Middle Section: Selected Location and Address */}
                    <VStack align="flex-start" spacing={0.5} flex="1" mx={4}>
                        <Text fontSize="sm" color="black">Selected Location</Text>
                        <Text fontSize="md" fontWeight="normal" color="black">{item.address || 'Alamat Tidak Tersedia'}</Text>
                    </VStack>

                    {/* Right Section: Score, Action Icon (Wrench) / Conditional Buttons */}
                    <HStack alignItems="center" spacing={4}>
                        {/* Score */}
                        <Box textAlign="right" minW="70px">
                            <Badge
                                px={2}
                                py={1}
                                borderRadius="md"
                                fontSize="lg"
                                fontWeight="bold"
                                color="white"
                                bgImage={gradient} // This badge still uses the volume-based gradient
                                boxShadow="md"
                            >
                                Tier {tier}
                            </Badge>
                        </Box>

                        {/* Action Icon (Wrench) or Conditional Action Buttons */}
                        {item.state === 'in_progress' && (
                            <>
                                

                                {currentUserBranchId === 0 && visibleActionButtons[item.id] && (
                                    <HStack spacing={2}>
                                        
                                    </HStack>
                                )}

                                {currentUserBranchId !== 0 && visibleActionButtons[item.id] && (
                                    <IconButton
                                        icon={<FaTrash />}
                                        aria-label="Cancel Relocation"
                                        colorScheme="red"
                                        variant="solid"
                                        isRound
                                        onClick={(e) => { e.stopPropagation(); triggerCancelModal(item.id); }}
                                    />
                                )}
                            </>
                        )}
                    </HStack>
                </HStack>
            </CardBody>
        </Card>
    );
};

export default RelocationCard;