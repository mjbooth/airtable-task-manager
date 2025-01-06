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

  useEffect(() => {
    setIsClientModalOpen(isOpen);
    setLocalClient(client);
  }, [isOpen, client]);

  useEffect(() => {
    console.log('ClientModal props:', { isOpen, onClose, client, tasks, getStatusColor, onStatusUpdate });
  }, [isOpen, onClose, client, tasks, getStatusColor, onStatusUpdate]);

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

  const sortTasks = (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
      switch (sortMethod) {
        case 'dueDate':
          return new Date(a.DueDate) - new Date(b.DueDate);
        case 'status':
          return a.Status.localeCompare(b.Status);
        case 'name':
          return a.Name.localeCompare(b.Name);
        default:
          return 0;
      }
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
                <VStack align="stretch" spacing={4}>
                  {tasks && tasks.length > 0 ? tasks.map(task => (
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