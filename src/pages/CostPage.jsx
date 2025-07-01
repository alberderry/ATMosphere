import { 
  Box, 
  Text, 
  VStack,
  Card,
  CardBody,
  Grid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  HStack,
  Button,
  Select,
  Input,
  Stat,
  StatLabel,
  StatNumber,
  Badge
} from '@chakra-ui/react'
import { useState } from 'react'

const CostPage = () => {
  const [timeRange, setTimeRange] = useState('monthly')
  const [costType, setCostType] = useState('all')

  const costData = [
    {
      category: 'Operational Cost',
      monthly: 'Rp 25.5M',
      quarterly: 'Rp 76.5M',
      yearly: 'Rp 306M',
      percentage: '55.7%'
    },
    {
      category: 'Maintenance Cost',
      monthly: 'Rp 12.3M',
      quarterly: 'Rp 36.9M',
      yearly: 'Rp 147.6M',
      percentage: '26.8%'
    },
    {
      category: 'Infrastructure Cost',
      monthly: 'Rp 5.8M',
      quarterly: 'Rp 17.4M',
      yearly: 'Rp 69.6M',
      percentage: '12.7%'
    },
    {
      category: 'Personnel Cost',
      monthly: 'Rp 2.2M',
      quarterly: 'Rp 6.6M',
      yearly: 'Rp 26.4M',
      percentage: '4.8%'
    }
  ]

  const detailedCosts = [
    { item: 'Electricity', cost: 'Rp 8.5M', type: 'Operational', status: 'Regular' },
    { item: 'Internet & Communication', cost: 'Rp 3.2M', type: 'Operational', status: 'Regular' },
    { item: 'Security Services', cost: 'Rp 6.8M', type: 'Operational', status: 'Regular' },
    { item: 'Hardware Maintenance', cost: 'Rp 7.5M', type: 'Maintenance', status: 'Scheduled' },
    { item: 'Software Updates', cost: 'Rp 2.8M', type: 'Maintenance', status: 'Regular' },
    { item: 'Emergency Repairs', cost: 'Rp 2.0M', type: 'Maintenance', status: 'As Needed' },
    { item: 'Rent & Utilities', cost: 'Rp 4.2M', type: 'Infrastructure', status: 'Regular' },
    { item: 'Equipment Depreciation', cost: 'Rp 1.6M', type: 'Infrastructure', status: 'Regular' },
  ]

  const getStatusColor = (status) => {
    switch(status) {
      case 'Regular': return 'green'
      case 'Scheduled': return 'blue'
      case 'As Needed': return 'orange'
      default: return 'gray'
    }
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">Cost Analysis</Text>
          <HStack spacing={4}>
            <Select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              w="150px"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </Select>
            <Button colorScheme="blue">Export Report</Button>
          </HStack>
        </HStack>
        
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Cost</StatLabel>
                <StatNumber color="red.500">Rp 45.8M</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Revenue</StatLabel>
                <StatNumber color="green.500">Rp 227.4M</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Profit Margin</StatLabel>
                <StatNumber color="blue.500">79.9%</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Cost per Unit</StatLabel>
                <StatNumber>Rp 23.5K</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="lg" fontWeight="semibold">Cost Breakdown by Category</Text>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Category</Th>
                      <Th>Monthly</Th>
                      <Th>Quarterly</Th>
                      <Th>Yearly</Th>
                      <Th>Percentage</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {costData.map((item, index) => (
                      <Tr key={index}>
                        <Td fontWeight="semibold">{item.category}</Td>
                        <Td>{item.monthly}</Td>
                        <Td>{item.quarterly}</Td>
                        <Td>{item.yearly}</Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle">
                            {item.percentage}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="semibold">Detailed Cost Items</Text>
                <HStack spacing={4}>
                  <Input placeholder="Search cost items..." maxW="200px" />
                  <Select 
                    value={costType} 
                    onChange={(e) => setCostType(e.target.value)}
                    maxW="150px"
                  >
                    <option value="all">All Types</option>
                    <option value="operational">Operational</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="infrastructure">Infrastructure</option>
                  </Select>
                </HStack>
              </HStack>
              
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Cost Item</Th>
                      <Th>Monthly Cost</Th>
                      <Th>Type</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {detailedCosts.map((item, index) => (
                      <Tr key={index}>
                        <Td>{item.item}</Td>
                        <Td fontWeight="semibold">{item.cost}</Td>
                        <Td>
                          <Badge 
                            colorScheme={
                              item.type === 'Operational' ? 'blue' :
                              item.type === 'Maintenance' ? 'green' : 'purple'
                            }
                          >
                            {item.type}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline" colorScheme="blue">
                              Details
                            </Button>
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
  )
}

export default CostPage
