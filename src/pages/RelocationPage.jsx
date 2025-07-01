import { Box, Center, Spinner, Text } from "@chakra-ui/react";
import { useParams } from "react-router-dom"; // Import useParams
import LocationAnalysis from "../components/relocation2/LocationAnalysis"; // Pastikan path ini benar

const RelocationPage = () => {
  const { relocationId } = useParams(); // Dapatkan relocationId dari URL

  // Anda mungkin ingin menambahkan logika loading atau error handling di sini
  // jika LocationAnalysis bergantung pada relocationId untuk memuat datanya.
  // Namun, untuk saat ini, kita hanya meneruskannya.

  return (
    <Box>
      {/* Teruskan relocationId sebagai prop ke LocationAnalysis */}
      <LocationAnalysis relocationId={relocationId} />
    </Box>
  );
};

export default RelocationPage;
