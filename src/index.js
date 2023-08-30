import React from "react";
import ReactDOM from "react-dom/client";
import { Box, ChakraProvider, Text } from "@chakra-ui/react";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
