import {
  Container,
  Flex,
  Box,
  Button,
  VStack,
  useToast,
  Text,
  Center,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import "react-dropzone/examples/theme.css";
import Arweave from "arweave";
import ArDB from "ardb";
import { createTransaction } from "arweavekit/transaction";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

const ardb = new ArDB(arweave);

function App() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [files, setFiles] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] }, // Accept all image files
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const thumbs = files.map((file) => (
    <Box
      key={file.name}
      display="inline-flex"
      borderRadius={2}
      border="1px solid #eaeaea"
      marginBottom={8}
      marginRight={8}
      width={100}
      height={100}
      padding={2}
      boxSizing="border-box"
    >
      <Flex minWidth={0} overflow="hidden">
        <img
          src={file.preview}
          alt={file.name}
          style={{
            display: "block",
            width: "auto",
            height: "100%",
          }}
          // Revoke data URI after the image is loaded
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </Flex>
    </Box>
  ));

  function getErrorMessage(error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    )
      return error.message;

    try {
      return new Error(JSON.stringify(error)).message;
    } catch {
      return String(error);
    }
  }

  async function upload(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const txs = [];
      const promises = files.map(async (file) => {
        try {
          const data = Buffer.from(await new Response(file).arrayBuffer());
          const { transaction, postedTransaction } = await createTransaction({
            type: "data",
            environment: "mainnet",
            options: {
              tags: [
                { name: "App-Name", value: "ArweaveKit-Demo" },
                { name: "Content-Type", value: file.type },
              ],
              useBundlr: true,
              signAndPost: true,
            },
            data,
          });
          const txID = postedTransaction.id ?? transaction.id;
          console.log(transaction, postedTransaction);
          console.log(txID);

          if (txID && postedTransaction?.status !== 400) {
            txs.push(txID);
            setUploadedUrls((prev) => [
              ...prev,
              `https://arweave.net/${transaction.id}`,
            ]);
          }
        } catch (error) {
          console.log(error);
        }
      });
      await Promise.all(promises);
      if (txs.length > 0) {
        toast({
          title: "Success",
          description: "Uploaded sucessfully.",
          status: "success",
          duration: 9000,
          position: "top-right",
          isClosable: true,
        });
        setFiles([]);
      } else {
        toast({
          title: "Error",
          description: "Upload failed",
          status: "error",
          position: "top-right",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        status: "error",
        position: "top-right",
        duration: 9000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  }

  async function fetchAllImages() {
    try {
      const txs = await ardb
        .search("transactions")
        .tag("App-Name", "ArweaveKit-Demo")
        .only("id")
        .findAll();

      setUploadedUrls(txs.map((tx) => `https://arweave.net/${tx.id}`));
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    // Make sure to revoke the data URIs to avoid memory leaks, this will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  useEffect(() => {
    void fetchAllImages();
  }, []);

  return (
    <Container py={8} maxW="6xl">
      <form onSubmit={upload}>
        <VStack w="100%">
          <Box className="container" w="full">
            <Box
              {...getRootProps({ className: "dropzone" })}
              p={24}
              w="full"
              cursor="pointer"
            >
              <input {...getInputProps()} />
              <p>Drag 'n' drop some images here, or click to select images</p>
            </Box>
            <Flex flexDirection="row" flexWrap="wrap" marginTop={16}>
              {thumbs}
            </Flex>
          </Box>
          <Button
            colorScheme="blue"
            isDisabled={files.length === 0}
            isLoading={isLoading}
            loadingText="Uploading"
            type="submit"
          >
            Upload
          </Button>
        </VStack>
      </form>
      {uploadedUrls.length > 0 && (
        <Box mt={8}>
          <Center mb={4}>
            <Text fontSize="xl" fontWeight="bold">
              Uploaded Images
            </Text>
          </Center>
          {uploadedUrls.map((url, index) => (
            <Box
              key={index}
              display="inline-flex"
              borderRadius={2}
              border="1px solid #eaeaea"
              marginBottom={8}
              marginRight={8}
              width={100}
              height={100}
              padding={2}
              boxSizing="border-box"
            >
              <Flex minWidth={0} overflow="hidden">
                <img
                  src={url}
                  alt={""}
                  style={{
                    display: "block",
                    width: "auto",
                    height: "100%",
                  }}
                />
              </Flex>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default App;
