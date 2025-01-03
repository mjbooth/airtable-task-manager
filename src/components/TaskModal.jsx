import React, { useEffect } from 'react';
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';

const TaskModal = ({ isOpen, onClose, task, getStatusColor }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };

  const handleTaskModalClose = () => {
    onClose();
  };

  useEffect(() => {
    return () => {
      // Clean up function to reset any state when the modal is unmounted
      // This ensures that closing the TaskModal doesn't affect other components
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleTaskModalClose}
      size="5xl"
      closeOnOverlayClick={true}
      onOverlayClick={handleTaskModalClose}
    >
      <ModalOverlay />
      <ModalContent>
        {task ? (
          <>
            <ModalHeader>
              <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.500' />}>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => onOpenClientModal(task.Client)}>
                    {task.Client}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            </ModalHeader>
            <ModalCloseButton onClick={handleTaskModalClose} />
            <ModalBody>
              <Flex>
                {/* Left column (2/3 width) */}
                <Box flex="2" pr={5}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Heading as="h2" size="lg" mb={2}>{task.Name}</Heading>
                    </Box>
                    <Box>
                      <Heading as="h4" size="md" mb={2}>Description</Heading>
                      <Text>{task.Description}</Text>
                    </Box>
                    <Box>
                      <Heading as="h4" size="sm" mb={2}>Due Date</Heading>
                      <Text>{formatDate(task.DueDate)}</Text>
                    </Box>
                  </VStack>
                </Box>
                {/* Right column (1/3 width) */}
                <Box flex="1" pl={4} borderLeft="1px" borderColor="gray.200">
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Badge
                        colorScheme={getStatusColor(task.Status)}
                        fontSize="sm"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {task.Status}
                      </Badge>
                    </Box>
                    <Box>
                      <Heading as="h4" size="sm" mb={2}>Client: {task.Client}</Heading>
                      <Heading as="h4" size="sm" mb={2}>Owner: {task.AssignedOwner ? task.AssignedOwner[0] : 'Unassigned'}</Heading>
                      <Text></Text>
                    </Box>
                  </VStack>
                </Box>
              </Flex>

            </ModalBody>
            <ModalFooter></ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader>Loading Task...</ModalHeader>
            <ModalCloseButton onClick={handleTaskModalClose} />
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