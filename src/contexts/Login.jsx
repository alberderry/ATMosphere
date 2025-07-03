// src/contexts/Login.jsx

"use client"

import { useState } from "react"
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  Image,
  Text,
  useToast,
  InputGroup,
  InputLeftElement,
  Flex,
  Icon,
} from "@chakra-ui/react"
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { MdEmail, MdLock } from 'react-icons/md';

// Import gambar background
import bjbBackground from '../assets/img/bg-bjb.jpg';

// Buat komponen Chakra UI yang bisa dianimasikan dengan Framer Motion
const MotionBox = motion(Box);
const MotionImage = motion(Image);
const MotionVStack = motion(VStack);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionFormControl = motion(FormControl);
const MotionButton = motion(Button);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading: authLoading, error: authError } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [showLoginForm, setShowLoginForm] = useState(false);

  // Fungsi handleLogin yang akan memanggil fungsi login dari AuthContext
  const handleLogin = async () => {
    const success = await login(email, password);

    if (success) {
      toast({
        title: "Login Berhasil",
        description: "Selamat datang di ATMosphere!",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      console.log("Login successful, redirecting to dashboard...");
      navigate('/');
    } else {
      toast({
        title: "Login Gagal",
        description: authError || "Email atau password salah. Silakan coba lagi.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // Fungsi untuk menangani submit form (dipanggil oleh form onSubmit atau onKeyDown)
  const handleSubmit = async (event) => {
    event.preventDefault(); // Mencegah reload halaman default
    await handleLogin();
  };

  // Fungsi baru untuk menangani penekanan tombol pada input
  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit(event); // Panggil fungsi submit form jika Enter ditekan
    }
  };

  const handleLogoClick = () => {
    setShowLoginForm(true);
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      backgroundImage={`url(${bjbBackground})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      p={4}
      position="relative"
      overflow="hidden"
    >
      {/* Logo Awal di Tengah - Hanya Tampil Jika Form Belum Muncul */}
      {!showLoginForm && (
        <MotionImage
          src=".\src\assets\img\Atmos-logo.png"
          alt="ATMosphere Logo"
          boxSize={{ base: "200px", md: "300px" }}
          objectFit="contain"
          cursor="pointer"
          onClick={handleLogoClick}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.7 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
        />
      )}

      {/* Card Login yang Muncul Setelah Logo Diklik */}
      {showLoginForm && (
        <MotionBox
          key="loginForm"
          bg="whiteAlpha.600"
          p={{ base: 6, md: 10 }}
          borderRadius="2xl"
          boxShadow="xl"
          maxW="md"
          w="full"
          textAlign="center"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8, transition: { duration: 0.5, ease: "easeInOut" } }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          position="absolute"
        >
          {/* Bungkus seluruh elemen form dalam tag <form> */}
          <form onSubmit={handleSubmit}>
            <MotionVStack spacing={6}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {/* Logo kecil di dalam card */}
              <MotionImage
                src=".\src\assets\img\Atmos-logo.png"
                alt="ATMosphere Logo"
                boxSize={{ base: "80px", md: "120px" }}
                objectFit="contain"
                mb={2}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.6 }}
              />

              <MotionFormControl id="email" textAlign="left"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.9 }}
              >
                <FormLabel color={"gray.600"} fontWeight="bold" fontSize="sm" mb={1}>Email Address</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdEmail} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="misal: user@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    variant="filled"
                    borderRadius="xl"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)"
                    }}
                    onKeyDown={handleInputKeyDown} // <-- Tambahkan ini
                  />
                </InputGroup>
              </MotionFormControl>

              <MotionFormControl id="password" textAlign="left"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 1.0 }}
              >
                <FormLabel color={"gray.600"} fontWeight="bold" fontSize="sm" mb={1}>Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdLock} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Masukkan kata sandi Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="lg"
                    variant="filled"
                    borderRadius="xl"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)"
                    }}
                    mb={4}
                    onKeyDown={handleInputKeyDown} // <-- Tambahkan ini
                  />
                </InputGroup>
              </MotionFormControl>

              {/* Tampilkan pesan error jika ada */}
              {authError && (
                <Text color="red.500" fontSize="sm" mt={-2}>
                  {authError}
                </Text>
              )}

              <MotionButton
                type="submit" // Pastikan ini tetap "submit"
                colorScheme="blue"
                size="lg"
                width={{ base: "full", md: "200px" }}
                isLoading={authLoading}
                // onClick={handleLogin} // Biarkan ini tetap dikomentari atau dihapus
                borderRadius="full"
                fontSize="xl"
                py={6}
                mt={4}
                boxShadow="md"
                _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 1.1 }}
              >
                Masuk
              </MotionButton>

              <MotionText fontSize="sm" color="gray.500" mt={4}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 1.2 }}
              >
                Lupa password? <Text as="u" cursor="pointer" _hover={{ color: "blue.500" }}>Reset di sini</Text>
              </MotionText>
            </MotionVStack>
          </form>
        </MotionBox>
      )}
    </Flex>
  );
};

export default Login;