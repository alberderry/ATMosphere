import {
  Box,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Button,
  // Grid tidak digunakan, bisa dihapus jika tidak diperlukan
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Input,
  Select
} from '@chakra-ui/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'; // Import Link

const Master = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const masterData = [
    { id: 'ATM001', name: 'ATM KCP Sudirman', type: 'ATM', status: 'Active', location: 'Jakarta Pusat', tier: 'TIER 1' },
    { id: 'CRM005', name: 'CRM Cabang Thamrin', type: 'CRM', status: 'Active', location: 'Jakarta Selatan', tier: 'TIER 2' },
    { id: 'ATM010', name: 'ATM Mall Bandung', type: 'ATM', status: 'Inactive', location: 'Bandung', tier: 'TIER 3' },
    { id: 'CRM012', name: 'CRM Kantor Surabaya', type: 'CRM', status: 'Active', location: 'Surabaya', tier: 'TIER 1' },
    { id: 'ATM020', name: 'ATM Bandara Soetta', type: 'ATM', status: 'Maintenance', location: 'Tangerang', tier: 'TIER 4' },
    { id: 'CRM025', name: 'CRM KCP Prioritas', type: 'CRM', status: 'Active', location: 'Bandung', tier: 'TIER 1' },
  ];

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

  const filteredData = masterData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Box p={6} bg="blue.50"> {/* Background color changed to blue.50 */}
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">Master Data Management</Text>
          <Button colorScheme="blue">Add New Machine</Button>
        </HStack>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="semibold">Machine List</Text>
                <HStack spacing={1}>
                  <Input
                    placeholder="Search by ID, Name, Location..."
                    maxW="300px"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    maxW="150px"
                  >
                    <option value="all">All Types</option>
                    <option value="ATM">ATM</option>
                    <option value="CRM">CRM</option>
                  </Select>
                </HStack>
              </HStack>

              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Name</Th>
                      <Th>Type</Th>
                      <Th>Status</Th>
                      <Th>Location</Th>
                      <Th>Tier</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredData.map((item) => (
                      <Tr key={item.id}>
                        <Td fontWeight="semibold">{item.id}</Td>
                        <Td>
                          {/* Mengubah Text menjadi Link */}
                          <Link to={`/master/${item.id}`} style={{ color: 'blue', textDecoration: 'underline' }}>
                            {item.name}
                          </Link>
                        </Td>
                        <Td>{item.type}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </Td>
                        <Td>{item.location}</Td>
                        <Td>
                          <Badge colorScheme={getTierColor(item.tier)}>
                            {item.tier}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline" colorScheme="red">Delete</Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Master;
