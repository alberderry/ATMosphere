import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Divider,
  Collapse,
  useDisclosure,
  Button,
  Icon
} from '@chakra-ui/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FiHome,
  FiBarChart2,
  FiMap,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isOpen: isAnalyticsOpen, onToggle: onAnalyticsToggle } = useDisclosure({
    defaultIsOpen: location.pathname.includes('analytics')
  })
  const { isOpen: isMasterOpen, onToggle: onMasterToggle } = useDisclosure({
    defaultIsOpen: location.pathname.includes('master')
  })
  const { isOpen: isATMCRMOpen, onToggle: onATMCRMToggle } = useDisclosure({
    defaultIsOpen: location.pathname.includes('atm-crm')
  })

  // Width of the sidebar
  const SIDEBAR_WIDTH = 280; // Ensure this matches w="280px" on the main Sidebar Box

  const MenuItem = ({ to, icon, children, isActive, onClick, hasSubmenu, isOpen, onToggle }) => {
    const isDirectlyActiveLeaf = location.pathname === to && !hasSubmenu;
    const isParentActive = isActive && hasSubmenu;

    const activeTextColor = 'blue.600';    // Contoh: teks dan ikon jadi biru kalau aktif

    return (
      <Box w="full" position="relative" zIndex={isDirectlyActiveLeaf || isParentActive ? 2 : 1}>
        <HStack
          as={hasSubmenu ? Button : Link}
          to={!hasSubmenu ? to : undefined}
          onClick={hasSubmenu ? onToggle : onClick}
          w="full"
          ml={0}
          p={3}
          pl={4}
          borderRadius="md" // radius standar kecil semua sisi
          bg="transparent" // TIDAK ADA background, selalu transparan
          color={isDirectlyActiveLeaf || isParentActive ? activeTextColor : 'gray.700'}
          _hover={{ bg: 'gray.100' }}
          justify="flex-start"
          variant="ghost"
          position="relative"
        >
          <Icon as={icon} color={isDirectlyActiveLeaf || isParentActive ? activeTextColor : 'gray.700'} />
          <Text flex="1" textAlign="left">{children}</Text>
          {hasSubmenu && (
            <Icon as={isOpen ? FiChevronDown : FiChevronRight} color={isDirectlyActiveLeaf || isParentActive ? activeTextColor : 'gray.700'} />
          )}
        </HStack>
      </Box>
    );
  };

  const SubMenuItem = ({ to, children, isActive }) => {
    const subActiveBgColor = 'blue.50';
    const subActiveTextColor = 'blue.700';

    return (
      <Box position="relative" w="full">
        {/* Curved extension above */}
        {isActive && (
          <Box
            position="absolute"
            top="-12px"
            right="0"
            width="20px"
            height="12px"
            bg={subActiveBgColor}
            _after={{
              content: '""',
              position: 'absolute',
              top: '0',
              right: '0',
              width: '20px',
              height: '12px',
              bg: 'white',
              borderBottomRightRadius: '10px',
            }}
            zIndex={1}
          />
        )}

        {/* Curved extension below */}
        {isActive && (
          <Box
            position="absolute"
            bottom="-12px"
            right="0"
            width="20px"
            height="12px"
            bg={subActiveBgColor}
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '20px',
              height: '12px',
              bg: 'white',
              borderTopRightRadius: '20px',
            }}
            zIndex={1}
          />
        )}

        <HStack
          as={Link}
          to={to}
          w={isActive ? "calc(100% + 20px)" : "full"}    // Submenu melebar
          ml={0}
          p={2}
          pl={8} // Indent submenu
          pr={3}
          borderTopLeftRadius={isActive ? "2xl" : "md"}    // Bubble radius kiri besar jika aktif
          borderBottomLeftRadius={isActive ? "2xl" : "md"}
          borderTopRightRadius="none"
          borderBottomRightRadius="none"
          bg={isActive ? subActiveBgColor : 'transparent'}
          color={isActive ? subActiveTextColor : 'gray.600'}
          _hover={{ bg: isActive ? 'blue.100' : 'gray.50' }}
          position="relative"
          zIndex={isActive ? 2 : 'auto'}
        >
          <Text fontSize="sm">{children}</Text>
        </HStack>
      </Box>
    );
  };

  return (
    <Box
      w={`${SIDEBAR_WIDTH}px`}
      bg="white"
      h="100vh"
      overflow="hidden"
      // Add border-radius to the main sidebar Box for its overall white background
      borderTopRightRadius="35px" // You can adjust this value (e.g., "lg", "xl", "2xl", etc.)
    >
      {/* Administrator Header - Curved bubble */}
      <Box
        bg="blue.500"
        py={8}
        px={6}
        color="white"
        borderTopRightRadius="35px"
        borderBottomRightRadius="35px"
        mr="0px"
        // pr="70px"
        position="relative"
        zIndex={3}
        minH="140px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Avatar
          size="xl"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          mb={3}
        />
        <Text fontWeight="bold" fontSize="md">Administrator</Text>
      </Box>

      {/* Main menu container. No right padding here, as items will extend past it */}
      <Box pt={6} pb={4} pl={4} pr={0}>
        <VStack spacing={1} align="stretch">
          <MenuItem
            to="/"
            icon={FiHome}
            isActive={location.pathname === '/'}
          >
            Dashboard
          </MenuItem>

          <MenuItem
            icon={FiBarChart2}
            hasSubmenu
            isOpen={isAnalyticsOpen}
            onToggle={onAnalyticsToggle}
            isActive={location.pathname.includes('analytics')}
            to="/analytics"
          >
            Analytics
          </MenuItem>

          <Collapse in={isAnalyticsOpen}>
            <VStack spacing={1} align="stretch" py={1}>
              <SubMenuItem
                to="/analytics/map-view"
                isActive={location.pathname === '/analytics/map-view'}
              >
                Map View
              </SubMenuItem>
              <SubMenuItem
                to="/analytics/tier-fee"
                isActive={location.pathname === '/analytics/tier-fee'}
              >
                Tier Fee
              </SubMenuItem>
              <SubMenuItem
                to="/analytics/cba"
                isActive={location.pathname === '/analytics/cba'}
              >
                CBA
              </SubMenuItem>
              <SubMenuItem
                to="/analytics/cba-simulation"
                isActive={location.pathname === '/analytics/cba-simulation'}
              >
                CBA Simulation
              </SubMenuItem>
            </VStack>
          </Collapse>

          <MenuItem
            icon={FiFileText}
            hasSubmenu
            isOpen={isMasterOpen}
            onToggle={onMasterToggle}
            isActive={location.pathname.includes('master')}
            to="/master"
          >
            Master
          </MenuItem>

          <Collapse in={isMasterOpen}>
            <VStack spacing={1} align="stretch" py={1}>
              <SubMenuItem
                to="/master"
                isActive={location.pathname === '/master'}
              >
                Master Data
              </SubMenuItem>
            </VStack>
          </Collapse>

          <MenuItem
            icon={FiSettings}
            hasSubmenu
            isOpen={isATMCRMOpen}
            onToggle={onATMCRMToggle}
            isActive={location.pathname.includes('atm-crm')}
            to="/atm-crm"
          >
            ATM/CRM
          </MenuItem>

          <Collapse in={isATMCRMOpen}>
            <VStack spacing={1} align="stretch" py={1}>
              <SubMenuItem
                to="/atm-crm"
                isActive={location.pathname === '/atm-crm'}
              >
                ATM/CRM
              </SubMenuItem>
              <SubMenuItem
                to="/atm-crm/cost"
                isActive={location.pathname === '/atm-crm/cost'}
              >
                Cost
              </SubMenuItem>
            </VStack>
          </Collapse>

          <Divider my={4} />

          <MenuItem
            icon={FiLogOut}
            onClick={() => {
              console.log('Logout clicked!');
              navigate('/');
            }}
          >
            Logout
          </MenuItem>
        </VStack>
      </Box>
    </Box>
  );
};

export default Sidebar;