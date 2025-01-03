import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text,
  Spinner, 
  Badge,
  Flex,
  Button,
  Avatar,
  Tooltip,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { Switch, FormControl, FormLabel } from '@chakra-ui/react';
import { InfoIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { BsThreeDots } from 'react-icons/bs';
import { fetchTasks, fetchClients, updateClientStatus } from '../airtableConfig';
import ClientModal from './ClientModal';
import TaskModal from './TaskModal';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getData = async () => {
    setLoading(true);
    try {
      const [fetchedTasks, fetchedClients] = await Promise.all([fetchTasks(), fetchClients()]);
      console.log('Fetched tasks:', fetchedTasks);
      console.log('Fetched clients:', fetchedClients);
      setTasks(fetchedTasks);
      setClients(fetchedClients);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please check your Airtable configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'green';
      case 'in progress': return 'yellow';
      case 'not started': return 'red';
      default: return 'gray';
    }
  };

  const getClientInfo = (clientName) => {
    const client = clients.find(c => c.name === clientName);
    return client ? { name: client.name, lifecycleStage: client.lifecycleStage } : { name: clientName, lifecycleStage: 'Unknown' };
  };

  const groupTasksByLifecycleStageAndClient = (tasks) => {
    return tasks.reduce((acc, task) => {
      const { name: clientName, lifecycleStage } = getClientInfo(task.Client);

      if (!acc[lifecycleStage]) {
        acc[lifecycleStage] = {};
      }
      if (!acc[lifecycleStage][clientName]) {
        acc[lifecycleStage][clientName] = [];
      }
      acc[lifecycleStage][clientName].push(task);
      return acc;
    }, {});
  };

  const filteredTasks = showCompleted 
    ? tasks 
    : tasks.filter(task => task.Status?.toLowerCase() !== 'completed');

  const groupedTasks = groupTasksByLifecycleStageAndClient(filteredTasks);

  const lifecycleStageOrder = [
    'Live Client',
    'Active Opportunity',
    'Prospect',
    'Closed Opportunity',
    'Unknown'
  ];

  const handleClientClick = (clientName) => {
    const client = clients.find(c => c.name === clientName);
    setSelectedClient(client);
    setIsClientModalOpen(true);
  };

  const sortedGroupedTasks = Object.entries(groupedTasks).sort((a, b) => {
    return lifecycleStageOrder.indexOf(a[0]) - lifecycleStageOrder.indexOf(b[0]);
  });

  if (loading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">{error}</Text>;

  const handleClientStatusUpdate = async (clientId, newStatus) => {
    try {
      const updatedRecord = await updateClientStatus(clientId, newStatus);
      // Update the local state
      setClients(prevClients =>
        prevClients.map(client =>
          client.id === clientId ? { ...client, status: newStatus } : client
        )
      );
      // If the selected client is the one being updated, update it as well
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient(prevClient => ({ ...prevClient, status: newStatus }));
      }
    } catch (error) {
      console.error('Failed to update client status:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <Box width="100%" maxWidth="100%">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="xl">Task Board</Heading>
        <Button onClick={getData} colorScheme="blue">Refresh</Button>
      </Flex>
      <Flex justify="space-between" align="center" mb={4}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="show-completed" mb="0">
            Show Completed Tasks
          </FormLabel>
          <Switch 
            id="show-completed" 
            isChecked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
        </FormControl>
      </Flex>
      <HStack spacing={4} overflowX="auto" alignItems="flex-start" pb={4}>
        {sortedGroupedTasks.map(([lifecycleStage, clientTasks]) => (
          <Box key={lifecycleStage} width="400px">
            <Heading as="h3" size="md" mb={4} textAlign="left">{lifecycleStage}</Heading>
            <VStack spacing={4} align="stretch">
              {Object.entries(clientTasks).map(([clientName, tasks]) => (
                <Box key={clientName} borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" boxShadow="md">
                  <Accordion allowMultiple>
                    <AccordionItem border="none">
                      <Flex alignItems="center">
                        <AccordionButton flex="1">
                          <Box flex="1" textAlign="left">
                            <Heading as="h4" size="sm">{clientName}</Heading>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <IconButton
                          aria-label="Open client details"
                          icon={<BsThreeDots />}
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClientClick(clientName);
                          }}
                          mr={2}
                        />
                      </Flex>
                      <AccordionPanel pb={4}>
                        <VStack spacing={2} align="stretch">
                          {tasks.map(task => (
                            <Box 
                              key={task.id}
                              p={3}
                              borderWidth="1px"
                              borderRadius="md"
                              bg="gray.50"
                              onClick={() => handleTaskClick(task)}
                              cursor="pointer"
                              _hover={{ bg: "gray.100" }}
                            >
                              <VStack align="start" spacing={2}>
                                <Flex justify="space-between" width="100%" alignItems="center">
                                  <Heading textAlign="left" as="h5" size="xs">{task.Name}</Heading>
                                  <Badge 
                                    colorScheme={getStatusColor(task.Status)} 
                                    fontSize="x-small"
                                    px={2}
                                    py={1}
                                    borderRadius="full"
                                  >
                                    {task.Status}
                                  </Badge>
                                </Flex>
                                <Text fontSize="xs" noOfLines={2}>{task.Description}</Text>
                                <Flex align="left" justify="space-between" width="100%">
                                  <Tooltip label={task.Owner || 'Unassigned'}>
                                    <Avatar 
                                      size="xs" 
                                      name={task.Owner || 'Unassigned'} 
                                      bg={task.Owner ? "blue.500" : "gray.500"}
                                      color="white"
                                    />
                                  </Tooltip>
                                  {task.DueDate && (
                                    <Text fontSize="small">Due: {new Date(task.DueDate).toLocaleDateString()}</Text>
                                  )}
                                </Flex>
                              </VStack>
                            </Box>
                          ))}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </Box>
              ))}
            </VStack>
          </Box>
        ))}
      </HStack>
      {selectedClient && (
        <ClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          client={selectedClient}
          tasks={tasks.filter(task => task.Client === selectedClient.name)}
          getStatusColor={getStatusColor}
          onStatusUpdate={handleClientStatusUpdate}
        />
      )}
      {selectedTask && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          task={selectedTask}
          getStatusColor={getStatusColor}
        />
      )}
    </Box>
  );
};

export default TaskList;