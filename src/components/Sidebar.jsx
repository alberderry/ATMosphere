import React, { useEffect, useState } from 'react';
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
    Icon,
    Spinner,
    useToast
} from '@chakra-ui/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FiHome,
    FiBarChart2,
    FiMap,
    FiFileText,
    FiSettings,
    FiLogOut,
    FiChevronDown,
    FiChevronRight,
    FiShuffle
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();

    // Mengambil isAuthenticated, logout, dan getUserProfile dari useAuth
    const { isAuthenticated, logout, getUserProfile, isLoading: authLoading, error: authError } = useAuth();

    // State lokal untuk user profile, yang akan diisi dari context
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState(null);

    useEffect(() => {
        // Memantau perubahan pada userProfile dari AuthContext
        const currentProfile = getUserProfile();

        if (authLoading) {
            setLoadingProfile(true);
            setProfileError(null);
        } else if (authError) {
            setLoadingProfile(false);
            setProfileError(authError);
            toast({
                title: "Error otentikasi",
                description: authError,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        } else if (isAuthenticated && currentProfile) {
            // Jika sudah terotentikasi dan profil tersedia dari context
            setUserProfile(currentProfile);
            setLoadingProfile(false);
            setProfileError(null);
        } else if (!isAuthenticated && !authLoading) {
            // Jika tidak terotentikasi setelah AuthContext selesai loading
            setLoadingProfile(false);
            setProfileError("Pengguna tidak terautentikasi.");
        }
    }, [isAuthenticated, getUserProfile, authLoading, authError, toast]); // Dependency array diperbarui

    const { isOpen: isAnalyticsOpen, onToggle: onAnalyticsToggle } = useDisclosure({
        defaultIsOpen: location.pathname.includes('analytics') && !location.pathname.includes('cba-simulation')
    });
    const { isOpen: isActionOpen, onToggle: onActionToggle } = useDisclosure({
        // Perbaiki logika defaultIsOpen agar mencakup "/action/submission"
        defaultIsOpen: location.pathname.includes('/action/') 
    });
    const { isOpen: isMasterOpen, onToggle: onMasterToggle } = useDisclosure({
        defaultIsOpen: location.pathname.includes('master')
    });

    const SIDEBAR_WIDTH = 280;

    const MenuItem = ({ to, icon, children, isActive, onClick, hasSubmenu, isOpen, onToggle }) => {
        const isDirectlyActiveLeaf = location.pathname === to && !hasSubmenu;
        const isParentActive = isActive && hasSubmenu;

        const activeTextColor = 'blue.600';

        // Enhanced onClick handler to log button presses
        const handleClick = (event) => {
            if (hasSubmenu) {
                (`Dropdown menu "${children}" toggled. New state: ${!isOpen ? 'Open' : 'Closed'}`);
                onToggle();
            } else {
                (`Menu item "${children}" clicked. Navigating to: ${to}`);
                if (onClick) { // Execute passed onClick if available (e.g., for Logout)
                    onClick(event);
                }
            }
        };

        return (
            <Box w="full" position="relative" zIndex={isDirectlyActiveLeaf || isParentActive ? 2 : 1}>
                <HStack
                    as={hasSubmenu ? Button : Link}
                    to={!hasSubmenu ? to : undefined}
                    onClick={handleClick} // Use the new handleClick
                    w="full"
                    ml={0}
                    p={3}
                    pl={4}
                    borderRadius="md"
                    bg="transparent"
                    color={isDirectlyActiveLeaf || isParentActive ? activeTextColor : 'gray.700'}
                    _hover={{ bg: 'gray.100' }}
                    justify="flex-start"
                    variant="ghost"
                    position="relative"
                    zIndex="auto"
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

        // Enhanced onClick handler for sub-menu items
        const handleSubmenuClick = () => {
            (`Sub-menu item "${children}" clicked. Navigating to: ${to}`);
        };

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
                            borderTopRightRadius: '10px',
                        }}
                        zIndex={1}
                    />
                )}

                <HStack
                    as={Link}
                    to={to}
                    onClick={handleSubmenuClick} // Use the new handleSubmenuClick
                    w={isActive ? "calc(100% + 20px)" : "full"}
                    ml={0}
                    p={2}
                    pl={8}
                    pr={3}
                    borderTopLeftRadius={isActive ? "2xl" : "md"}
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
            display="flex"
            flexDirection="column"
            borderTopRightRadius="35px"
        >
            {/* Profile Section - Curved bubble */}
            <Box
                bg="linear-gradient(135deg, #4299E1 0%, #3182CE 100%)"
                boxShadow="0 0 15px 5px rgba(66, 153, 225, 0.6), 0 0 30px 10px rgba(99, 179, 237, 0.4)"
                py={8}
                px={6}
                color="white"
                borderTopRightRadius="35px"
                borderBottomRightRadius="35px"
                mr="0px"
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
                    src={userProfile?.avatar_url || "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.svgrepo.com%2Fsvg%2F452030%2Favatar-default&psig=AOvVaw0ZCZlyl5oCzlknnQZM3eQ7&ust=1751941106452000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCMCMj8LYqY4DFQAAAAAdAAAAABAE"}
                    mb={3}
                />
                {loadingProfile ? (
                    <Spinner size="md" color="white" />
                ) : profileError ? (
                    <Text fontSize="sm" color="red.200">Error: {profileError}</Text>
                ) : (
                    <>
                        <Text fontWeight="bold" fontSize="md">
                            {userProfile?.role || 'Role Tidak Diketahui'}
                        </Text>
                        <Text fontSize="sm" color="gray.200">
                            {userProfile?.position || 'Posisi Tidak Diketahui'}
                        </Text>
                    </>
                )}
            </Box>

            {/* Main menu container. This box will now handle scrolling */}
            <Box
                pt={6}
                pb={4}
                pl={4}
                pr={0}
                flex="1"
                overflowY="auto"
                css={{
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                    'scrollbar-width': 'none',
                    '-ms-overflow-style': 'none',
                }}
            >
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
                        isActive={location.pathname.includes('analytics') && !location.pathname.includes('cba-simulation')}
                        to="/analytics" // Keep 'to' for potential direct navigation if 'hasSubmenu' was false
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
                                to="/analytics/trx-fee"
                                isActive={location.pathname === '/analytics/trx-fee'}
                            >
                                Performance Reports
                            </SubMenuItem>
                            <SubMenuItem
                                to="/analytics/cba"
                                isActive={location.pathname === '/analytics/cba'}
                            >
                                CBA ( Cost Benefit Analysis )
                            </SubMenuItem>
                        </VStack>
                    </Collapse>

                    <MenuItem
                        icon={FiShuffle}
                        hasSubmenu
                        isOpen={isActionOpen}
                        onToggle={onActionToggle}
                        isActive={location.pathname.includes('/action/')} // Perbarui kondisi aktif
                        to="/action" 
                    >
                        Action
                    </MenuItem>

                    <Collapse in={isActionOpen}>
                        <VStack spacing={1} align="stretch" py={1}>
                            <SubMenuItem
                                to="/action/cba-simulation"
                                isActive={location.pathname === '/action/cba-simulation'}
                            >
                                Relocation
                            </SubMenuItem>
                            <SubMenuItem
                                to="/action/submission" // Perbarui 'to' ke rute SubmissionPage
                                isActive={location.pathname === '/action/submission'} // Perbarui kondisi aktif
                            >
                                Submission
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
                                ATM / CRM
                            </SubMenuItem>
                        </VStack>
                    </Collapse>

                    <Divider my={4} />

                    <MenuItem
                        icon={FiLogOut}
                        onClick={() => {
                            ('Logout button clicked. Attempting to log out...');
                            logout();
                            navigate('/login');
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
