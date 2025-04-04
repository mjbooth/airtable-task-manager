import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Box,
  Heading,
  Badge,
  Divider,
  Flex,
  Text,
  useToast,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import EditableClientStatus from './EditableClientStatus';
import TaskModal from './TaskModal';
import { useStatusConfig } from '../contexts/StatusContext';
import { updateClientPinnedStatus } from '../airtableConfig';
import { StarIcon } from '@chakra-ui/icons';

const convertNewlinesToBreaks = (text) => {
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index !== text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

const ClientModal = ({ isOpen, onClose, client, tasks, onStatusUpdate, onPinUpdate }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(isOpen);
  const [localClient, setLocalClient] = useState(client);
  const toast = useToast();
  const [activeStatuses, setActiveStatuses] = useState(() => {
    if (tasks) {
      const allStatuses = [...new Set(tasks.map(task => task.Status))];
      return allStatuses.filter(status => !['Completed', 'Cancelled', 'Blocked'].includes(status));
    }
    return [];
  });
  const [filteredTasks, setFilteredTasks] = useState([]);
  const statusConfig = useStatusConfig();

  useEffect(() => {
  }, [isOpen, onClose, client, tasks, onStatusUpdate]);

  useEffect(() => {
    if (tasks) {
      const filtered = tasks.filter(task => activeStatuses.includes(task.Status));
      setFilteredTasks(sortTasksByDueDate(filtered));
    }
  }, [tasks, activeStatuses]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No update time available';
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy 'at' h:mm a");
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsClientModalOpen(false);
    setIsTaskModalOpen(true);
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
    setIsClientModalOpen(true);
  };

  const handleClientModalClose = () => {
    setIsClientModalOpen(false);
    onClose();
  };

  const handleStatusUpdate = async (newStatus) => {
    console.log('Attempting to update status to:', newStatus);
    if (typeof onStatusUpdate === 'function') {
      try {
        console.log('Calling onStatusUpdate with:', client.id, newStatus);
        const updatedClient = await onStatusUpdate(client.id, newStatus);
        console.log('Received updated client:', updatedClient);
  
        // Update local state with the response from Airtable
        setLocalClient(prevClient => ({ ...prevClient, ...updatedClient }));
  
        toast({
          title: "Status Updated",
          description: `The client status has been successfully updated.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        // Notify parent component of the update with the latest data
        if (typeof onClose === 'function') {
          onClose(updatedClient);
        }
      } catch (error) {
        console.error('Error updating client status:', error);
        toast({
          title: "Error",
          description: "Failed to update client status. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      console.error('onStatusUpdate is not a function', onStatusUpdate);
      toast({
        title: "Error",
        description: "Unable to update status. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePinToggle = async () => {
    try {
      // Call the updateClientPinnedStatus function with the current client ID and the new pinned status
      const updatedClient = await updateClientPinnedStatus(localClient.id, !localClient.isPinned);
      
      // Update the local state with the response from Airtable
      setLocalClient(prevClient => ({ ...prevClient, isPinned: updatedClient.isPinned }));
      
      // Notify the parent component of the update
      if (onPinUpdate) {
        onPinUpdate(updatedClient);
      }
      
      // Show a success toast
      toast({
        title: updatedClient.isPinned ? "Client Pinned" : "Client Unpinned",
        description: `${localClient.name} has been ${updatedClient.isPinned ? "pinned" : "unpinned"}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // If there's an onClose function (which might refresh the main view), call it
      if (typeof onClose === 'function') {
        onClose(updatedClient);
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
      toast({
        title: "Error",
        description: "Failed to update pin status. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleStatusFilter = (status) => {
    setActiveStatuses(prevActiveStatuses => {
      if (prevActiveStatuses.includes(status)) {
        return prevActiveStatuses.filter(s => s !== status);
      } else {
        const newActiveStatuses = [...prevActiveStatuses, status];
        // If 'Completed' or 'Cancelled' is being added, remove it from the inactive list
        if (['Completed', 'Cancelled', 'Blocked'].includes(status)) {
          return newActiveStatuses;
        }
        return newActiveStatuses;
      }
    });
  };

  // Function to get the hex color for a given status
  const getStatusHexColor = (statusName) => {
    if (!statusConfig) {
      console.warn('StatusConfig is not available');
      return 'gray.200';
    }
    const statusEntry = Object.values(statusConfig).find(entry => entry.status.toLowerCase() === statusName.toLowerCase());
    if (!statusEntry || !statusEntry.hexColor) {
      console.warn(`No valid color found for status: ${statusName}`);
      return 'gray.200';
    }
    // Ensure the hexColor is a valid color string
    return statusEntry.hexColor.startsWith('#') ? statusEntry.hexColor : `#${statusEntry.hexColor}`;
  };

  const sortTasksByDueDate = (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
      if (!a.DueDate) return 1;  // Tasks without due date go to the end
      if (!b.DueDate) return -1; // Tasks without due date go to the end
      return new Date(a.DueDate) - new Date(b.DueDate);
    });
  };

  if (!localClient) {
    return null;
  }

  return (
    <>
      <Modal
        isOpen={isClientModalOpen}
        onClose={handleClientModalClose}
        size="5xl"
        closeOnOverlayClick={true}
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent maxHeight="80vh">
          <ModalHeader>
            <Flex justifyContent="space-between" alignItems="center">
              {client.name}

            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            <VStack align="stretch" spacing={4}>
              <Box>
                <Flex justifyContent="space-between" alignItems="center" mb={2}>
                  <Heading as="h4" size="md">Client Status</Heading>
                  <Text fontSize="sm" color="gray.600">Last update: {formatDate(client.lastUpdated)}</Text>
                </Flex>
                <Flex justifyContent="space-between" alignItems="center">
                  <Box flex="1">
                    <EditableClientStatus
                      status={localClient.Status}
                      displayStatus={localClient.Status}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  </Box>
                  <Button
                    onClick={handlePinToggle}
                    leftIcon={<StarIcon />}
                    variant={localClient.isPinned ? "solid" : "outline"}
                    colorScheme="gray"
                    size="sm"
                    ml={2}
                  >
                    {localClient.isPinned ? "Unpin" : "Pin"}
                  </Button>
                </Flex>
              </Box>
              <Divider orientation='horizontal' />
              <Box>
                <Heading as="h4" size="md" mb={2}>Tasks</Heading>
                <HStack spacing={2} mb={4} wrap="wrap">
                  {tasks && (
                    <>
                      {['Completed', 'Cancelled', 'Blocked'].map(status =>
                        tasks.some(task => task.Status === status) && (
                          <Tag
                            key={status}
                            size="md"
                            borderRadius="full"
                            variant={activeStatuses.includes(status) ? "solid" : "outline"}
                            bg={activeStatuses.includes(status) 
                              ? getStatusHexColor(status) : "transparent"}
                            color={activeStatuses.includes(status) 
                              ? "black" : getStatusHexColor(status)}
                            borderColor={getStatusHexColor(status)}
                            cursor="pointer"
                            onClick={() => handleStatusFilter(status)}
                            boxShadow={activeStatuses.includes(status) 
                              ? `0 0 0 2px ${getStatusHexColor(status)}100` 
                              : `0 0 0 2px ${getStatusHexColor(status)}50`  
                            }
                          >
                            <TagLabel>{status}</TagLabel>
                          </Tag>
                        )
                      )}
                      {[...new Set(tasks.map(task => task.Status))]
                        .filter(status => !['Completed', 'Cancelled', 'Blocked'].includes(status))
                        .map(status => (
                          <Tag
                            key={status}
                            size="md"
                            borderRadius="full"
                            variant={activeStatuses.includes(status) 
                              ? "solid" : "outline"}
                            bg={activeStatuses.includes(status) 
                              ? getStatusHexColor(status) : "transparent"}
                            color={activeStatuses.includes(status) 
                              ? "black" : getStatusHexColor(status)}
                            borderColor="transparent"
                            cursor="pointer"
                            onClick={() => handleStatusFilter(status)}
                            boxShadow={activeStatuses.includes(status) 
                              ? `0 0 0 2px ${getStatusHexColor(status)}100`  // Active state: more opaque shadow
                              : `0 0 0 2px ${getStatusHexColor(status)}50`  // Inactive state: less opaque, thinner shadow
                            }
                          >
                            <TagLabel>{status}</TagLabel>
                          </Tag>
                        ))
                      }
                    </>
                  )}
                </HStack>
                <VStack align="stretch" spacing={4}>
                  {filteredTasks && filteredTasks.length > 0 ? sortTasksByDueDate(filteredTasks).map(task => (
                    <Box
                      key={task.id}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      bg="gray.50"
                      cursor="pointer"
                      onClick={() => handleTaskClick(task)}
                    >
                      <Flex justifyContent="space-between" alignItems="center">
                        <Text fontWeight="bold">{task.Name}</Text>
                        <Badge
                          bg={getStatusHexColor(task.Status)}
                          color="black"
                          fontSize="sm"
                          fontWeight="medium"
                          px={2}
                          py={1}
                          ml={1}
                          borderRadius="full"
                          textTransform="none"
                        >
                          {task.Status}
                        </Badge>
                      </Flex>
                      <Text fontSize="sm" color="gray.600">
                        Due: {task.DueDate ? format(new Date(task.DueDate), 'MMM d, yyyy') : 'No due date'}
                      </Text>
                    </Box>
                  )) : (
                    <Text>No tasks available</Text>
                  )}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
      {selectedTask && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={handleTaskModalClose}
          task={selectedTask}
          onTasksUpdate={() => {
          }}
        />
      )}
    </>
  );
};

export default ClientModal;