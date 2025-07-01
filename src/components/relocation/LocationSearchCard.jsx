// src/components/LocationSearchCard.jsx

import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Input,
  Button,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  List,
  ListItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Spinner,
  HStack,
} from "@chakra-ui/react"
import { SearchIcon, CheckIcon } from "@chakra-ui/icons"
import { useRef } from "react"

const LocationSearchCard = ({
  cardBg,
  locationName,
  handleLocationChange,
  isLoadingSuggestions,
  showSuggestions,
  locationSuggestions,
  handleLocationSelect,
  selectedLocation,
  handleAnalyze,
  isAnalyzing,
}) => {
  const inputRef = useRef(null) // Tetap gunakan useRef lokal jika hanya digunakan di sini

  return (
    <Card bg={cardBg} shadow="sm">
      <CardHeader>
        <Heading size="md" color="gray.700">
          Pencarian Lokasi Target
        </Heading>
        <Text fontSize="sm" color="gray.500" mt={1}>
          Cari dan pilih lokasi yang akan dianalisis untuk relokasi ATM/CRM
        </Text>
      </CardHeader>
      <CardBody pt={0}>
        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4} alignItems="end">
          <GridItem>
            <FormControl position="relative">
              <FormLabel fontSize="sm" fontWeight="medium">
                Nama Lokasi
              </FormLabel>
              <Input
                ref={inputRef}
                placeholder="Contoh: Mall Taman Anggrek Jakarta"
                value={locationName}
                onChange={handleLocationChange}
                size="md"
                autoComplete="off"
              />
              {isLoadingSuggestions && (
                <Box position="absolute" right={3} top="50%" transform="translateY(-50%)">
                  <Spinner size="sm" color="blue.500" />
                </Box>
              )}

              {/* Location Suggestions */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <Box
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  zIndex={10}
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  boxShadow="lg"
                  mt={1}
                  maxH="200px"
                  overflowY="auto"
                >
                  <List spacing={0}>
                    {locationSuggestions.map((suggestion, index) => (
                      <ListItem
                        key={suggestion.place_id}
                        p={3}
                        cursor="pointer"
                        _hover={{ bg: "gray.50" }}
                        borderBottom={index < locationSuggestions.length - 1 ? "1px solid" : "none"}
                        borderBottomColor="gray.100"
                        onClick={() => handleLocationSelect(suggestion)}
                      >
                        <Text fontSize="sm" fontWeight="medium">
                          {suggestion.structured_formatting?.main_text || suggestion.description}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {suggestion.structured_formatting?.secondary_text || ""}
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </FormControl>
          </GridItem>
          <GridItem>
            <Button
              colorScheme="blue"
              leftIcon={<SearchIcon />}
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              loadingText="Menganalisis..."
              isDisabled={!selectedLocation}
              w="full"
              size="md"
            >
              Analisis Lokasi
            </Button>
          </GridItem>
        </Grid>

        {/* Selected Location Info */}
        {selectedLocation && (
          <Alert status="success" mt={4} borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle fontSize="sm">Lokasi Terpilih:</AlertTitle>
              <AlertDescription fontSize="sm">
                {selectedLocation.name} - {selectedLocation.formatted_address}
              </AlertDescription>
            </Box>
            <Badge colorScheme="green" variant="subtle">
              <CheckIcon mr={1} />
              Siap Analisis
            </Badge>
          </Alert>
        )}
      </CardBody>
    </Card>
  )
}

export default LocationSearchCard
