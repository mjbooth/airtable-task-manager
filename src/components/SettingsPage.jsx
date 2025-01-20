import React, { useState, useEffect } from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel, Box, Table, Thead, Tbody, Tr, Th, Td, Input, HStack, Text, IconButton, Container, Button } from '@chakra-ui/react';
import { EditIcon, CheckIcon } from '@chakra-ui/icons';
import { fetchStatusConfig } from '../airtableConfig';

const SettingsPage = () => {
  const [statusConfig, setStatusConfig] = useState({});
  const [editingStatus, setEditingStatus] = useState(null);
  const [tempColor, setTempColor] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = await fetchStatusConfig();
        setStatusConfig(config);
      } catch (error) {
        console.error("Error fetching status configuration:", error);
        setStatusConfig({});
      }
    };

    fetchData();
  }, []);

  const handleColorChange = (statusId, newColor) => {
    setTempColor({ ...tempColor, [statusId]: newColor });
  };

  const handleEditClick = (statusId) => {
    setEditingStatus(statusId);
    setTempColor({ ...tempColor, [statusId]: statusConfig[statusId].hexColor });
  };

  const handleSaveClick = (statusId) => {
    setStatusConfig(prevConfig => ({
      ...prevConfig,
      [statusId]: {
        ...prevConfig[statusId],
        hexColor: tempColor[statusId] || prevConfig[statusId].hexColor
      }
    }));
    setEditingStatus(null);
    // TODO: Implement function to update color in Airtable
  };

  return (
    <Box p={4}>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Status Colours</Tab>
          {/* Add more tabs here as needed */}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Container maxW="container.sm" px={0}>
              <Table variant="simple" size="sm" width="100%">
                <Thead>
                  <Tr>
                    <Th>Status</Th>
                    <Th>Edit</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(statusConfig).map(([statusId, { status, hexColor }]) => (
                    <Tr key={statusId}>
                      <Td>
                        <HStack spacing={2}>
                          <Box w="20px" h="20px" borderRadius="md" bg={tempColor[statusId] || hexColor} />
                          <Text>{status}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Box position="relative">
                          {editingStatus === statusId ? (
                            <HStack>
                              <Input
                                type="color"
                                value={tempColor[statusId] || hexColor}
                                onChange={(e) => handleColorChange(statusId, e.target.value)}
                                size="sm"
                                w="60px"
                                p={0}
                                border="none"
                              />
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleSaveClick(statusId)}
                                p={0}
                                minW="32px"
                              >
                                <CheckIcon />
                              </Button>
                            </HStack>
                          ) : (
                            <IconButton
                              icon={<EditIcon />}
                              size="sm"
                              aria-label="Edit color"
                              onClick={() => handleEditClick(statusId)}
                            />
                          )}
                        </Box>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Container>
          </TabPanel>
          {/* Add more TabPanels for additional tabs */}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default SettingsPage;