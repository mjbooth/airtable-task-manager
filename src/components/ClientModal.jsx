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

const convertNewlinesToBreaks = (text) => {
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index !== text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

const ClientModal = ({ isOpen, onClose, client, tasks, getStatusColor, onStatusUpdate }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(isOpen);
  const [localClient, setLocalClient] = useState(client);
  const toast = useToast();
  const [activeStatuses, setActiveStatuses] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    setIsClientModalOpen(isOpen);
    setLocalClient(client);
  }, [isOpen, client]);

  useEffect(() => {
    console.log('ClientModal props:', { isOpen, onClose, client, tasks, getStatusColor, onStatusUpdate });
  }, [isOpen, onClose, client, tasks, getStatusColor, onStatusUpdate]);

  useEffect(() => {
    if (tasks) {
      const statuses = [...new Set(tasks.map(task => task.Status))];
      setActiveStatuses(statuses.filter(status => status !== "Completed"));
      const filteredAndSortedTasks = sortTasksByDueDate(tasks.filter(task => task.Status !== "Completed"));
      setFilteredTasks(filteredAndSortedTasks);
    }
  }, [tasks]);

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
    if (typeof onStatusUpdate === 'function') {
      try {
        const updatedClient = await onStatusUpdate(localClient.id, newStatus);
        setLocalClient(updatedClient);
        toast({
          title: "Status Updated",
          description: "The client status has been successfully updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
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
  
  const handleStatusFilter = (status) => {
    let newActiveStatuses;
    if (activeStatuses.includes(status)) {
      newActiveStatuses = activeStatuses.filter(s => s !== status);
    } else {
      newActiveStatuses = [...activeStatuses, status];
    }
    setActiveStatuses(newActiveStatuses);
    
    const newFilteredTasks = sortTasksByDueDate(tasks.filter(task => newActiveStatuses.includes(task.Status)));
    setFilteredTasks(newFilteredTasks);
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
          <ModalHeader>{client.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            <VStack align="stretch" spacing={4}>
              <Box>
                <Flex justifyContent="space-between" alignItems="center" mb={2}>
                  <Heading as="h4" size="md" mb={2}>Client Status</Heading>
                  <Text fontSize="sm" color="gray.600">Last update: {formatDate(client.lastUpdated)}</Text>
                </Flex>
                <EditableClientStatus
                  status={localClient.Status}
                  displayStatus={localClient.Status}
                  onStatusUpdate={handleStatusUpdate}
                />
              </Box>
              <Divider orientation='horizontal' />
              <Box>
                <Heading as="h4" size="md" mb={2}>Tasks</Heading>
                <HStack spacing={2} mb={4} wrap="wrap">
                  {/* Completed status tag (always first) */}
                  <Tag
                    key="Completed"
                    size="md"
                    borderRadius="full"
                    variant={activeStatuses.includes("Completed") ? "solid" : "outline"}
                    bg={activeStatuses.includes("Completed") ? `status.completed` : "transparent"}
                    color={activeStatuses.includes("Completed") ? "black" : `status.completed`}
                    borderColor={`status.completed`}
                    cursor="pointer"
                    onClick={() => handleStatusFilter("Completed")}
                  >
                    <TagLabel>Completed</TagLabel>
                  </Tag>

                  {/* Other status tags */}
                  {tasks && [...new Set(tasks.map(task => task.Status))]
                    .filter(status => status !== "Completed")
                    .map(status => (
                      <Tag
                        key={status}
                        size="md"
                        borderRadius="full"
                        variant={activeStatuses.includes(status) ? "solid" : "outline"}
                        bg={activeStatuses.includes(status) ? `status.${status.toLowerCase().replace(/\s+/g, '')}` : "transparent"}
                        color={activeStatuses.includes(status) ? "black" : `status.${status.toLowerCase().replace(/\s+/g, '')}`}
                        borderColor={`status.${status.toLowerCase().replace(/\s+/g, '')}`}
                        cursor="pointer"
                        onClick={() => handleStatusFilter(status)}
                      >
                        <TagLabel>{status}</TagLabel>
                      </Tag>
                    ))}
                </HStack>
                <VStack align="stretch" spacing={4}> 
                  {filteredTasks && filteredTasks.length > 0 ? filteredTasks.map(task => (
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
                        <Heading as="h5" size="sm">{task.Name}</Heading>
                        <Badge
                          bg={getStatusColor(task.Status)} 
                          color="black"
                          fontSize="x-small"
                          px={2}
                          py={1}
                          borderRadius="full"
                        >
                          {task.Status}
                        </Badge>
                        <Text fontSize="sm" noOfLines={2}>{task.Description}</Text>
                        {task.DueDate && (
                          <Text fontSize="sm">Due: {new Date(task.DueDate).toLocaleDateString()}</Text>
                        )}
                      </VStack>
                    </Box>
                  )) : (
                    <Text>No tasks available for this client.</Text>
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
          onClose={() => setIsTaskModalOpen(false)}
          task={selectedTask}
          getStatusColor={getStatusColor}
        />
      )}
    </>
  );
};

export default ClientModal;