import { 
  Box, 
  Text, 
  VStack,
  Card,
  CardBody,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  HStack,
  Progress,
  Divider
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

const ATMCRMPage = () => {
  const navigate = useNavigate()

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">ATM/CRM Management</Text>
          <Button colorScheme="blue" onClick={() => navigate('/atm-crm/cost')}>
            View Cost Analysis
          </Button>
        </HStack>
        
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total ATM Revenue</StatLabel>
                <StatNumber>Rp 195.2M</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  18.5% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total CRM Revenue</StatLabel>
                <StatNumber>Rp 32.2M</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  12.3% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Average Transaction</StatLabel>
                <StatNumber>1,318</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  5.2% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Operational Cost</StatLabel>
                <StatNumber>Rp 45.8M</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  3.1% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="lg" fontWeight="semibold">ATM Performance by Tier</Text>
                <VStack spacing={3}>
                  <HStack w="full" justify="space-between">
                    <Text>Tier 1 (124 units)</Text>
                    <Text fontWeight="bold">Rp 91.0M</Text>
                  </HStack>
                  <Progress value={40} colorScheme="blue" w="full" />
                  
                  <HStack w="full" justify="space-between">
                    <Text>Tier 2 (170 units)</Text>
                    <Text fontWeight="bold">Rp 77.0M</Text>
                  </HStack>
                  <Progress value={35} colorScheme="green" w="full" />
                  
                  <HStack w="full" justify="space-between">
                    <Text>Tier 3 (145 units)</Text>
                    <Text fontWeight="bold">Rp 43.4M</Text>
                  </HStack>
                  <Progress value={20} colorScheme="yellow" w="full" />
                  
                  <HStack w="full" justify="space-between">
                    <Text>Tier 4 (112 units)</Text>
                    <Text fontWeight="bold">Rp 16.9M</Text>
                  </HStack>
                  <Progress value={8} colorScheme="red" w="full" />
                </VStack>
              </VStack>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Text fontSize="lg" fontWeight="semibold">Monthly Targets</Text>
                <VStack spacing={4}>
                  <Box w="full">
                    <HStack justify="space-between" mb={2}>
                      <Text>Revenue Target</Text>
                      <Text>85% achieved</Text>
                    </HStack>
                    <Progress value={85} colorScheme="green" />
                  </Box>
                  
                  <Box w="full">
                    <HStack justify="space-between" mb={2}>
                      <Text>Transaction Target</Text>
                      <Text>92% achieved</Text>
                    </HStack>
                    <Progress value={92} colorScheme="blue" />
                  </Box>
                  
                  <Box w="full">
                    <HStack justify="space-between" mb={2}>
                      <Text>Uptime Target</Text>
                      <Text>98% achieved</Text>
                    </HStack>
                    <Progress value={98} colorScheme="purple" />
                  </Box>
                  
                  <Divider />
                  
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Overall Performance</Text>
                    <Text fontWeight="bold" color="green.500">91.7%</Text>
                  </HStack>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="lg" fontWeight="semibold">Quick Actions</Text>
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                <Button colorScheme="blue" h="60px">
                  <VStack spacing={1}>
                    <Text fontWeight="bold">Machine Status</Text>
                    <Text fontSize="sm">View all machines</Text>
                  </VStack>
                </Button>
                <Button colorScheme="green" h="60px">
                  <VStack spacing={1}>
                    <Text fontWeight="bold">Maintenance</Text>
                    <Text fontSize="sm">Schedule maintenance</Text>
                  </VStack>
                </Button>
                <Button colorScheme="purple" h="60px">
                  <VStack spacing={1}>
                    <Text fontWeight="bold">Reports</Text>
                    <Text fontSize="sm">Generate reports</Text>
                  </VStack>
                </Button>
                <Button colorScheme="orange" h="60px">
                  <VStack spacing={1}>
                    <Text fontWeight="bold">Analytics</Text>
                    <Text fontSize="sm">View detailed analytics</Text>
                  </VStack>
                </Button>
              </Grid>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}

export default ATMCRMPage
