// src/components/LeaderboardCard.jsx

import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar, // Keep Avatar for generic cases
  Image,  // Import Image component
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
// import { formatPercentageChange } from '../../utils/dashboardUtils';

// Import your trophy images
import firstPlaceImg from '../../assets/img/1st.png';
import secondPlaceImg from '../../assets/img/2nd.png';
import thirdPlaceImg from '../../assets/img/3rd.png';

const PerformanceLeaderboardCard = ({
  data,
  loading,
  error,
  leaderboardTab,
  setLeaderboardTab,
  leaderboardMetric,
  setLeaderboardMetric,
  currentPeriodId,
  cardBg,
}) => {
  // Map ranks to image paths
  const rankImages = {
    1: firstPlaceImg,
    2: secondPlaceImg,
    3: thirdPlaceImg,
  };

  return (
    <Card bg={cardBg} shadow="sm" borderRadius={25}>
      <CardBody>
        <VStack align="stretch" spacing={4}>
          <Text fontSize="lg" fontWeight="semibold">Performance Leaderboard</Text>

          <Tabs variant="enclosed" index={leaderboardTab} onChange={(index) => setLeaderboardTab(index)}>
            <HStack justify="space-between">
              <TabList>
                <Tab _selected={{ bg: "blue.500", color: "white" }}>ATM</Tab>
              </TabList>

              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="blue.500" color="white" size="sm" borderRadius={15}>
                  {leaderboardMetric}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setLeaderboardMetric('Fee')}>Fee</MenuItem>
                  <MenuItem onClick={() => setLeaderboardMetric('Transactions')}>Transactions</MenuItem>
                </MenuList>
              </Menu>
            </HStack>

            <TabPanels>
              <TabPanel p={0} pt={4}>
                {loading ? (
                  <Flex h="200px" justifyContent="center" alignItems="center">
                    <VStack>
                      <Spinner size="lg" color="blue.500" />
                      <Text>Memuat data leaderboard...</Text>
                    </VStack>
                  </Flex>
                ) : error ? (
                  <Flex h="200px" justifyContent="center" alignItems="center" flexDirection="column" p={4}>
                    <Text color="red.500" fontWeight="bold" mb={2}>Terjadi Kesalahan Saat Memuat Data Leaderboard:</Text>
                    <Text color="red.400" textAlign="center" fontSize="sm">{error}</Text>
                    <Text color="gray.500" mt={4} fontSize="xs">Pastikan API berjalan dan parameter yang dikirim benar.</Text>
                  </Flex>
                ) : (
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>ATM</Th>
                          
                          <Th>Fee</Th>
                          <Th>Nominal Transaction</Th>
                          <Th>Volume Transactions</Th>
                          <Th>Growth</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {data.map((item, index) => ( // Use index to determine rank
                          <Tr key={item.id}>
                            <Td>
                              <HStack spacing={3}>
                                {/* Conditional rendering for Image or Avatar */}
                                {rankImages[index + 1] ? (
                                  <Image
                                    src={rankImages[index + 1]}
                                    alt={`Rank ${index + 1}`}
                                    boxSize="32px" // Adjust size as needed
                                    objectFit="contain"
                                  />
                                ) : (
                                  <Avatar size="sm" bg={item.avatarBg} />
                                )}
                                <VStack align="start" spacing={0}>
                                  <HStack>
                                    <Text fontSize="sm" fontWeight="medium">{item.name}</Text>
                                    {item.code && <Badge colorScheme="blue" size="sm">{item.code}</Badge>}
                                  </HStack>
                                </VStack>
                              </HStack>
                            </Td>
                           
                            <Td>
                              <Text fontSize="sm" fontWeight="medium">Rp.{item.fee}</Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm" fontWeight="medium">Rp.{item.nominal_trx || '-'}</Text>
                            </Td>
                            <Td>
                              <Text fontSize="sm" fontWeight="medium">{item.transactions}</Text>
                            </Td>
                            <Td>
                              {currentPeriodId !== 1 ? (
                                <Text fontSize="sm" fontWeight="medium" color={item.growthColor === 'green' ? 'green.500' : 'red.500'}>
                                  {item.growth}
                                </Text>
                              ) : (
                                <Text fontSize="sm" fontWeight="medium" color="gray.500">N/A</Text>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default PerformanceLeaderboardCard;