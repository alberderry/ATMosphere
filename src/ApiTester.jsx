import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, Spinner, Alert, AlertIcon, Code, Heading, Flex } from '@chakra-ui/react'; // Tambahkan Flex di sini

const ApiTester = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token autentikasi yang sama
  const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJyb2xlIjoidXNlciIsImlzcyI6InRoZS1pc3N1ZXIiLCJleHAiOjE3NDk2MDcyNzMsImlhdCI6MTc0OTUyMDg3M30.h4sb9QBeWy6jDLN3VcJcOvm__faSqDnSE9HLg5fXPJ4';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://saving-quietly-buffalo.ngrok-free.app/api/atms?branch_id&limit=20&page&search&sortDir', {
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Response was not OK:", response.status, response.statusText, errorText);
          throw new Error(`Failed to fetch: Server responded with status ${response.status} ${response.statusText}. Response: ${errorText.substring(0, 200)}...`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const rawText = await response.text();
          console.error("API Response is not JSON. Content-Type:", contentType, "Raw response:", rawText);
          throw new Error(`Failed to fetch: Expected JSON, but received ${contentType || 'no content type'}. Raw response starts with: ${rawText.substring(0, 100)}...`);
        }
        
        const result = await response.json();
        setData(result); // Simpan seluruh hasil
      } catch (e) {
        console.error("Error fetching data:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [AUTH_TOKEN]);

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={4} align="stretch">
        <Heading size="lg" color="blue.700">API Tester for ATM Data</Heading>
        {loading && (
          <Flex justifyContent="center" alignItems="center" height="200px">
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text ml={4} fontSize="lg">Memuat data...</Text>
          </Flex>
        )}

        {error && (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            <VStack align="flex-start">
              <Text fontWeight="bold">Error fetching data:</Text>
              <Text>{error}</Text>
            </VStack>
          </Alert>
        )}

        {data && !loading && !error && (
          <Box p={4} bg="white" borderRadius="md" boxShadow="md">
            <Text fontSize="md" fontWeight="bold" mb={2} color="green.600">Data berhasil diambil:</Text>
            <Code p={2} overflowX="auto" whiteSpace="pre-wrap" display="block">
              {JSON.stringify(data, null, 2)}
            </Code>
            {data.data && Array.isArray(data.data.atms) && (
              <Text mt={4}>Jumlah ATM yang ditemukan: <Text as="span" fontWeight="bold">{data.data.atms.length}</Text></Text>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ApiTester;
