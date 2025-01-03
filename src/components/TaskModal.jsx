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
  VStack,
  Box,
  Heading,
  Badge,
  Text,
  Flex,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { format } from 'date-fns';

const TaskModal = ({ isOpen, onClose, task, getStatusColor }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent>
        {task ? (
          <>
            <ModalHeader>{task.Name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Heading as="h4" size="sm" mb={2}>Status</Heading>
                  <Badge 
                    colorScheme={getStatusColor(task.Status)} 
                    fontSize="x-small"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {task.Status}</Badge>
                </Box>
                <Box>
                  <Heading as="h4" size="sm" mb={2}>Description</Heading>
                  <Text>{task.Description}</Text>
                </Box>
                <Flex justifyContent="space-between">
                  <Box>
                    <Heading as="h4" size="sm" mb={2}>Due Date</Heading>
                    <Text>{formatDate(task.DueDate)}</Text>
                  </Box>
                  <Box>
                    <Heading as="h4" size="sm" mb={2}>Client</Heading>
                    <Text>{task.Client}</Text>
                  </Box>
                </Flex>
                <Box>
                  <Heading as="h4" size="sm" mb={2}>Assigned Owner</Heading>
                  <Text>{task.AssignedOwner ? task.AssignedOwner[0] : 'Unassigned'}</Text>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader>Loading Task...</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Center h="200px">
                <Spinner size="xl" />
              </Center>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TaskModal;