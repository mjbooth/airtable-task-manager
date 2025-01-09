import React, { useState, useEffect } from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel, Box, VStack, HStack, Text, Badge } from '@chakra-ui/react';
import { fetchStatusConfig } from '../airtableConfig'; 

const SettingsPage = () => {
  const [statusConfig, setStatusConfig] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = await fetchStatusConfig();
        setStatusConfig(Array.isArray(config) ? config : []);
      } catch (error) {
        console.error("Error fetching status configuration:", error);
        setStatusConfig([]); // Set to an empty array on error
      }
    };

    fetchData();
  }, []);

  return (
    <Box p={4}>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Tasks Statuses</Tab>
          {/* Add more tabs here as needed */}
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack align="start" spacing={4}>
              {statusConfig.map((status) => (
                <HStack key={status.id} spacing={4}>
                  <Badge bg={status.color} color="white" px={2} py={1} borderRadius="md">
                    {status.status}
                  </Badge>
                  <Text>{status.description || 'No description available'}</Text>
                </HStack>
              ))}
            </VStack>
          </TabPanel>
          {/* Add more TabPanels for additional tabs */}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default SettingsPage;