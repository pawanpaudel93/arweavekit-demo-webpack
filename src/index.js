import React from "react";
import ReactDOM from "react-dom/client";
import { Box, ChakraProvider, Text } from "@chakra-ui/react";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <Box display="flex" justifyContent="center" alignItems="center" p="4">
        <Text fontWeight="bold" fontSize="2xl">
          ArweaveKit Demo
        </Text>
      </Box>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
