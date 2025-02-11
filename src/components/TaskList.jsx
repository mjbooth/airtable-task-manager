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
import { fetchTasks, fetchTaskDetails, fetchClients, updateClientStatus, updateTask, updateClientPinnedStatus, fetchLifecycleStages } from '../airtableConfig';
import ClientModal from './ClientModal';
import TaskModal from './TaskModal';
import { useTheme } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { useStatusConfig } from '../contexts/StatusContext';

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
  const [pinnedClients, setPinnedClients] = useState([]);
  const statusConfig = useStatusConfig();
  const [lifecycleStages, setLifecycleStages] = useState([]);

  const theme = useTheme();

  const getData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedTasks, fetchedClients, fetchedLifecycleStages] = await Promise.all([
        fetchTasks(),
        fetchClients(),
        fetchLifecycleStages()
      ]);
      setTasks(fetchedTasks);
      setClients(fetchedClients);
      setLifecycleStages(fetchedLifecycleStages);
      setPinnedClients(fetchedClients.filter(client => client.isPinned).map(client => client.name));
      setError(null);

      // Debugging logs
      console.log('Fetched tasks:', fetchedTasks);
      console.log('Fetched clients:', fetchedClients);
      console.log('Fetched lifecycle stages:', fetchedLifecycleStages);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please check your Airtable configuration.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData, updateTrigger]);

  const togglePinnedClient = async (clientId) => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (!client) return;

      const newPinnedStatus = !client.isPinned;
      await updateClientPinnedStatus(clientId, newPinnedStatus);

      setClients(prevClients =>
        prevClients.map(c =>
          c.id === clientId ? { ...c, isPinned: newPinnedStatus } : c
        )
      );

      setPinnedClients(prev =>
        newPinnedStatus
          ? [...prev, client.name]
          : prev.filter(name => name !== client.name)
      );

    } catch (error) {
      console.error('Error toggling pinned status:', error);
    }
  };

  const onTasksUpdate = useCallback((updatedTask) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      );
      return newTasks;
    });

    // Update the selectedTask to reflect changes
    setSelectedTask(prev => (prev && prev.id === updatedTask.id ? { ...prev, ...updatedTask } : prev));

    // Force a re-render by updating the updateTrigger
    setUpdateTrigger(prev => prev + 1);
  }, []);

  const handleTaskUpdate = useCallback((updatedTask) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      );
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
          client.id === clientId ? { ...client, ...updatedClient } : client
        )
      );
      // Fetch updated data
      await getData();
      return updatedClient;
    } catch (error) {
      console.error('Error updating client status:', error);
      throw error;
    }
  }, [getData]);

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
    if (client) {
      console.log('Client info:', client);
      let lifecycleStageName = 'Unknown';
      if (client.lifecycleStage && client.lifecycleStage.length > 0) {
        const lifecycleStage = lifecycleStages.find(stage => stage.id === client.lifecycleStage[0]);
        lifecycleStageName = lifecycleStage ? lifecycleStage.name : 'Unknown';
      } else if (client.clientLifecycleStage && client.clientLifecycleStage.length > 0) {
        lifecycleStageName = client.clientLifecycleStage[0];
      }
      return {
        name: client.name,
        lifecycleStageId: client.lifecycleStage ? client.lifecycleStage[0] : null,
        lifecycleStageName: lifecycleStageName
      };
    } else {
      console.log('Client not found:', clientName);
      return { name: clientName, lifecycleStageId: null, lifecycleStageName: 'Unknown' };
    }
  };

  const groupTasksByLifecycleStageAndClient = (tasks) => {
    const grouped = tasks.reduce((acc, task) => {
      const { name: clientName, lifecycleStageName } = getClientInfo(task.Client);
      const stageName = lifecycleStageName || 'Unknown';

      if (!acc[stageName]) {
        acc[stageName] = {};
      }
      if (!acc[stageName][clientName]) {
        acc[stageName][clientName] = [];
      }
      acc[stageName][clientName].push(task);

      // Add pinned clients with no tasks
      pinnedClients.forEach(pinnedClientName => {
        const { lifecycleStageName: pinnedStageName } = getClientInfo(pinnedClientName);
        const pinnedStage = pinnedStageName || 'Unknown';
        if (!acc[pinnedStage]) {
          acc[pinnedStage] = {};
        }
        if (!acc[pinnedStage][pinnedClientName]) {
          acc[pinnedStage][pinnedClientName] = [];
        }
      });

      return acc;
    }, {});

    // Debugging log
    console.log('Grouped tasks:', grouped);

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

  const lifecycleStageOrder = lifecycleStages.map(stage => stage.name);

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
        height="calc(100vh - 144px)"
        width="calc(100vw - 260px)"
        position="absolute"
        right="0"
        paddingLeft="20px"
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
              overflowY="auto"
              flexShrink={0}
            >
              <Heading as="h3" size="md" mb={4} textAlign="left">{lifecycleStage}</Heading>
              <VStack spacing={4} align="stretch">
                {Object.entries(clientTasks)
                  .concat(
                    pinnedClients
                      .filter(clientName => {
                        const client = clients.find(c => c.name === clientName);
                        return client && client.lifecycleStage === lifecycleStage && !clientTasks[clientName];
                      })
                      .map(clientName => [clientName, []])
                  )
                  .sort(([a], [b]) => {
                    if (pinnedClients.includes(a) && !pinnedClients.includes(b)) return -1;
                    if (!pinnedClients.includes(a) && pinnedClients.includes(b)) return 1;
                    return a.localeCompare(b);
                  })
                  .map(([clientName, tasks]) => (
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
                              aria-label="Pin client"
                              icon={<StarIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                const client = clients.find(c => c.name === clientName);
                                if (client) {
                                  togglePinnedClient(client.id);
                                }
                              }}
                              mr={1}
                              color={pinnedClients.includes(clientName) ? "#CA3FC0" : "gray.300"}
                            />
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
                              {tasks.length > 0 ? (
                                tasks.map(task => (
                                  <Box
                                    key={task.id}
                                    p={3}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    bg="gray.50"
                                    onClick={() => handleTaskClick(task)}
                                  >
                                    <VStack align="start" spacing={4}>
                                      <Flex justify="space-between" width="100%" alignItems="center">
                                        <Heading textAlign="left" as="h5" size="xs">{task.Name}</Heading>
                                        <Badge
                                          bg={getStatusColor(task.Status)}
                                          color="black"
                                          fontSize="xs"
                                          px={2}
                                          py={1}
                                          ml={1}
                                          borderRadius="full"
                                          textTransform="none"
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
                                ))
                              ) : (
                                <Text color="gray.500">No tasks for this client</Text>
                              )}
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
          client={selectedClient}
          onOpenTaskModal={handleTaskClick}
          tasks={tasks.filter(task => task.Client === selectedClient.name)}
          statusConfig={statusConfig}
          onStatusUpdate={handleClientStatusUpdate}
          onPinUpdate={togglePinnedClient}
        />
      )}
      {selectedTask && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          task={selectedTask}
          onOpenClientModal={handleOpenClientModal}
          onTasksUpdate={onTasksUpdate}
        />
      )}
    </Box>
  );
};

export default TaskList;