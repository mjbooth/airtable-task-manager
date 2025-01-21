import React, { useState, useEffect, useCallback } from 'react';
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
import { BsThreeDots } from 'react-icons/bs';
import { fetchTasks, fetchClients, updateClientStatus, updateTask } from '../airtableConfig';
import ClientModal from './ClientModal';
import TaskModal from './TaskModal';
import { useTheme } from '@chakra-ui/react';

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
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const theme = useTheme();

  const getData = useCallback(async () => {
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
  }, []);

  const handleTaskUpdate = useCallback((updatedTask) => {
    console.log('handleTaskUpdate called with:', updatedTask);

    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      );
      console.log('Updated tasks:', newTasks);
      return newTasks;
    });

    // Update the selectedTask to reflect changes
    setSelectedTask(prev => (prev && prev.id === updatedTask.id ? { ...prev, ...updatedTask } : prev));

    // Force a re-render by updating the updateTrigger
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const handleClientStatusUpdate = useCallback(async (clientId, newStatus) => {
    try {
      const updatedClient = await updateClientStatus(clientId, newStatus);
      setClients(prevClients =>
        prevClients.map(client =>
          client.id === clientId ? updatedClient : client
        )
      );
      return updatedClient;
    } catch (error) {
      console.error('Error updating client status:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData, updateTrigger]);

  useEffect(() => {
    if (!isClientModalOpen) {
      setSelectedClient(null);
    }
  }, [isClientModalOpen]);

  useEffect(() => {
    if (!isTaskModalOpen) {
      setSelectedTask(null);
    }
  }, [isTaskModalOpen]);

  const getStatusColor = (status) => {
    if (!status) return theme.colors.gray[200];
    return theme.colors.status[status] || theme.colors.gray[200];
  };

  const getClientInfo = (clientName) => {
    const client = clients.find(c => c.name === clientName);
    return client ? { name: client.name, lifecycleStage: client.lifecycleStage } : { name: clientName, lifecycleStage: 'Unknown' };
  };

  const groupTasksByLifecycleStageAndClient = (tasks) => {
    const grouped = tasks.reduce((acc, task) => {
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

    // Sort clients alphabetically within each lifecycle stage
    Object.keys(grouped).forEach(stage => {
      grouped[stage] = Object.entries(grouped[stage])
        .sort(([a], [b]) => a.localeCompare(b))
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    });

    return grouped;
  };

  const filteredTasks = showCompleted
    ? tasks
    : tasks.filter(task => !['completed', 'cancelled'].includes(task.Status?.toLowerCase()));

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
    if (isTaskModalOpen) {
      setIsTaskModalOpen(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
    if (isClientModalOpen) {
      setIsClientModalOpen(false);
    }
  };

  const handleOpenClientModal = (clientName) => {
    const client = clients.find(c => c.name === clientName);
    setSelectedClient(client);
    setIsClientModalOpen(true);
    setIsTaskModalOpen(false);
  };

  const sortedGroupedTasks = Object.entries(groupedTasks).sort((a, b) => {
    return lifecycleStageOrder.indexOf(a[0]) - lifecycleStageOrder.indexOf(b[0]);
  });

  if (loading) {
    return (
      <Flex width="100%" height="80vh" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Flex>
    );
  }
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box width="100%" maxWidth="100%" height="calc(100vh - 104px)">
      <Flex justify="space-between" align="center" mb={4}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="show-completed" mb="0">
          Show Closed Tasks
          </FormLabel>
          <Switch
            id="show-completed"
            isChecked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
        </FormControl>
      </Flex>
      <Box
        height="calc(100vh - 144px)" // Adjusted for top nav and padding
        width="calc(100vw - 260px)" // Adjusted for left nav
        position="absolute"
        right="0"
        paddingLeft="20px" // Add some padding on the left
        overflowX="auto"
        overflowY="hidden"
      >
        <HStack
          spacing={4}
          alignItems="stretch"
          height="100%"
        >
          {sortedGroupedTasks.map(([lifecycleStage, clientTasks]) => (
            <Box
              key={lifecycleStage}
              width="460px"
              bg="gray.50"
              p={4}
              borderRadius="lg"
              height="100%"
              overflowY="auto" // This enables vertical scrolling for each column
              flexShrink={0} // Prevents the box from shrinking
            >
              <Heading as="h3" size="md" mb={4} textAlign="left">{lifecycleStage}</Heading>
              <VStack spacing={4} align="stretch">
                {Object.entries(clientTasks).map(([clientName, tasks]) => (
                  <Box key={clientName} borderWidth="1px" borderRadius="lg" overflow="hidden" bg="white" boxShadow="sm">
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
                          <VStack spacing={4} align="stretch">
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
                                <VStack align="start" spacing={4}>
                                  <Flex justify="space-between" width="100%" alignItems="center">
                                    <Heading textAlign="left" as="h5" size="xs">{task.Name}</Heading>
                                    <Badge
                                      bg={getStatusColor(task.Status)}
                                      color="black"  // Add this line to set the text color
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                      ml={1}
                                      borderRadius="full"
                                      textTransform="none" // Add this line to prevent uppercase transformation
                                    >
                                      {task.Status}
                                    </Badge>
                                  </Flex>
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
      </Box>
      {selectedClient && (
        <ClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          client={clients.find(c => c.id === selectedClient.id)}
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
          onOpenClientModal={handleOpenClientModal}
          onTasksUpdate={handleTaskUpdate}
        />
      )}
    </Box>
  );
};

export default TaskList;