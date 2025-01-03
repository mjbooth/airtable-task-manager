import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  Box,
  Heading,
  Badge,
  Divider,
  Flex,
} from '@chakra-ui/react';
import { format } from 'date-fns';

const ClientModal = ({ isOpen, onClose, client, tasks, getStatusColor }) => {
    const formatDate = (dateString) => {
      if (!dateString) return 'No update time available';
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy 'at' h:mm a");
    };
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{client.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Flex justifyContent="space-between" alignItems="center" mb={2}>
                <Heading as="h4" size="md" mb={2}>Client Status</Heading>
                <Text fontSize="sm" color="gray.600">Last update: {formatDate(client.lastUpdated)}</Text>
              </Flex>
              <Text>{client.status || 'No status available'}</Text>
            </Box>
            <Divider orientation='horizontal' />
            <Box>
              <Heading as="h4" size="md" mb={2}>Tasks</Heading>
              <VStack align="stretch" spacing={2}>
                {tasks.map(task => (
                  <Box key={task.id} p={3} borderWidth="1px" borderRadius="md" bg="gray.50">
                    <VStack align="start" spacing={2}>
                      <Heading as="h5" size="sm">{task.Name}</Heading>
                      <Badge colorScheme={getStatusColor(task.Status)}>
                        {task.Status}
                      </Badge>
                      <Text fontSize="sm">{task.Description}</Text>
                      {task.DueDate && (
                        <Text fontSize="sm">Due: {new Date(task.DueDate).toLocaleDateString()}</Text>
                      )}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>
          </VStack>
          </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClientModal;