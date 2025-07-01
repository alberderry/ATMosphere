// src/pages/PerformanceReportsPage.jsx

import { Box } from "@chakra-ui/react";
import PerformanceReports from "../components/PerformanceReports/PerformanceReports"; // Corrected import to PerformanceReports

// PerformanceReportsPage now receives selectedPeriod as a prop from App.jsx
const PerformanceReportsPage = ({ selectedPeriod }) => {
  return (
    <Box>
      {/* Passing the selectedPeriod received from the prop to PerformanceReports component */}
      <PerformanceReports selectedPeriod={selectedPeriod} />
    </Box>
  );
};

export default PerformanceReportsPage;
