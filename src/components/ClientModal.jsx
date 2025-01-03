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
} from '@chakra-ui/react';
import { format } from 'date-fns';
import EditableClientStatus from './EditableClientStatus';
import TaskModal from './TaskModal';

const ClientModal = ({ isOpen, onClose, client, tasks, getStatusColor, onStatusUpdate }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(isOpen);

  useEffect(() => {
    setIsClientModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    console.log('ClientModal rendered', { isOpen, client, tasks });
  }, [isOpen, client, tasks]);

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

  if (!client) {
    console.log('No client data provided to ClientModal');
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
                  status={client.status}
                  onStatusUpdate={(newStatus) => onStatusUpdate(client.id, newStatus)}
                />
              </Box>
              <Divider orientation='horizontal' />
              <Box>
                <Heading as="h4" size="md" mb={2}>Tasks</Heading>
                <VStack align="stretch" spacing={2}>
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
                      <VStack align="start" spacing={2}>
                        <Heading as="h5" size="sm">{task.Name}</Heading>
                        <Badge
                          colorScheme={getStatusColor(task.Status)}
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