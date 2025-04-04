import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import StatusSelect from './StatusSelect';
import ClientSelect from './ClientSelect';
import { useStatusConfig } from '../contexts/StatusContext';
import OwnerSelect from './OwnerSelect';
import axios from 'axios';
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
  Text,
  Flex,
  Spinner,
  Center,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  Select,
  useToast,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import { updateTask, createTask } from '../airtableConfig';

const TaskModal = ({ isOpen, onClose, task, onOpenClientModal, onTasksUpdate, isNewTask = false }) => {
  const toast = useToast();
  const statusConfig = useStatusConfig();
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState(task || {});
  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (field, value) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
    setIsChanged(true);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    handleChange('DueDate', newDate);
  };

  const handleNameChange = (e) => {
    handleChange('Name', e.target.value);
  };

  const handleDescriptionChange = (e) => {
    handleChange('Description', e.target.value);
  };

  const handleStatusChange = (newStatus) => {
    handleChange('Status', newStatus);
  };

  const handleClientChange = (newClient) => {
    const clientName = typeof newClient === 'object' ? newClient.target.value : newClient;
    handleChange('Client', clientName);
  };

  const handleSave = async () => {
    try {
      // Create a new object with only the fields that Airtable expects
      const taskToSave = {
        id: editedTask.id,
        Name: editedTask.Name,
        Description: editedTask.Description,
        Status: editedTask.Status,
        DueDate: editedTask.DueDate,
        Client: editedTask.Client,
        Priority: editedTask.Priority,
        // Only include AssignedOwner if it exists and is not empty
        ...(editedTask.AssignedOwner && editedTask.AssignedOwner.length > 0
          ? { AssignedOwner: editedTask.AssignedOwner }
          : {})
      };

      let updatedTask;
      if (isNewTask) {
        updatedTask = await createTask(taskToSave);
      } else {
        updatedTask = await updateTask(taskToSave);
      }

      const updatedTaskData = {
        ...editedTask,  // Include any local changes
        ...updatedTask.fields,  // Overwrite with the response from Airtable
        id: updatedTask.id
      };

      if (updatedTaskData.AssignedOwner && updatedTaskData.AssignedOwner.length > 0) {
        await fetchOwnerName(updatedTaskData.AssignedOwner[0]);
      }

      toast({
        title: isNewTask ? "Task created" : "Task updated",
        description: isNewTask ? "The new task has been created." : "The task has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setIsChanged(false);

      setEditedTask(updatedTaskData); // Ensure local state is up-to-date
      if (onTasksUpdate) {
        onTasksUpdate(updatedTaskData); // Pass updated data to parent
      }

      // Reset the edit mode
      setEditMode(false);

      // Force a re-render of the component
      setEditedTask({ ...updatedTaskData });
    } catch (error) {
      console.error(isNewTask ? 'Error creating task:' : 'Error updating task:', error);
      // Log the error response if available
      if (error.response) {
        console.error('Error response:', JSON.stringify(error.response.data, null, 2));
      }
      toast({
        title: isNewTask ? "Error creating task" : "Error updating task",
        description: "There was an error. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (isNewTask) {
      const currentDate = new Date();
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      setEditedTask({
        Name: '',
        Description: '',
        Status: 'Planned',
        Client: '',
        DueDate: formattedDate,
        AssignedOwner: []
      });
      setEditMode(true);
    } else if (task) {
      setEditedTask({
        ...task,
        DueDate: task.DueDate || format(new Date(), "yyyy-MM-dd")
      });
      setEditMode(false);
    }
    setIsChanged(false);
  }, [task, isNewTask, isOpen]); // Include `isOpen` to reinitialize on open  

  const [clients, setClients] = useState([]);

  const fetchClients = async () => {
    try {
      const response = await axios.get(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${import.meta.env.VITE_AIRTABLE_CLIENT_TABLE_ID}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_PAT}`,
          },
        }
      );
      setClients(response.data.records.map(record => record.fields.Client));
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date available';
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };

  const [ownerName, setOwnerName] = useState('');

  const handleTaskModalClose = () => {
    onClose();
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const [currentStatus, setCurrentStatus] = useState(task ? task.Status : '');

  const updateExistingTaskStatus = async (newStatus) => {
    try {
      const updatedTask = await updateTask({ ...task, Status: newStatus });
      toast({
        title: "Status updated",
        description: `Task status changed to ${newStatus}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (onTasksUpdate) onTasksUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error updating status",
        description: "There was an error updating the task status.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchOwnerName = async (ownerId) => {
    if (!ownerId) {
      setOwnerName('Unassigned');
      return;
    }

    try {
      const url = `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${import.meta.env.VITE_AIRTABLE_TEAM_TABLE_ID}/${ownerId}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_PAT}`,
        },
      });

      if (response.data && response.data.fields && response.data.fields.Name) {
        setOwnerName(response.data.fields.Name);
      } else {
        setOwnerName('Unknown');
      }
    } catch (error) {
      console.error('Error fetching owner name:', error);
      console.error('Error details:', error.response ? error.response.data : 'No response data');
      setOwnerName('Error');
    }
  };

  useEffect(() => {
    fetchOwners();
    fetchClients();

    if (task && task.AssignedOwner && task.AssignedOwner.length > 0 && task.AssignedOwner[0] !== ownerName) {
      fetchOwnerName(task.AssignedOwner[0]);
    } else if (!task || !task.AssignedOwner || task.AssignedOwner.length === 0) {
      setOwnerName('Unassigned');
    }

    return () => {
      document.body.style.overflow = '';
      setOwnerName(''); // Reset owner name when component unmounts
    };
  }, [task]);

  const [owners, setOwners] = useState([]);

  const fetchOwners = async () => {
    try {
      const response = await axios.get(
        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${import.meta.env.VITE_AIRTABLE_TEAM_TABLE_ID}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_PAT}`,
          },
        }
      );
      setOwners(response.data.records.map(record => ({
        id: record.id,
        name: record.fields.Name
      })));
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const handleOwnerChange = (newOwnerId) => {
    // Check if newOwnerId is an object (event) or a string (ID)
    const ownerId = typeof newOwnerId === 'object' ? newOwnerId.target.value : newOwnerId;

    setEditedTask(prev => ({ ...prev, AssignedOwner: ownerId ? [ownerId] : [] }));
    setIsChanged(true);

    // Fetch and update the owner name
    if (ownerId) {
      fetchOwnerName(ownerId);
    } else {
      setOwnerName('Unassigned');
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleTaskModalClose}
      size="5xl"
      closeOnOverlayClick={true}
      onOverlayClick={handleTaskModalClose}
    >
      <ModalOverlay />
      <ModalContent maxHeight="80vh">
        {task ? (
          <>
            <ModalHeader>
              {isNewTask ? "Create New Task" : (
                <Breadcrumb spacing='8px' separator={<ChevronRightIcon color='gray.500' />}>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => onOpenClientModal(editedTask.Client)}>{editedTask.Client}</BreadcrumbLink>
                  </BreadcrumbItem>
                </Breadcrumb>
              )}
            </ModalHeader>
            <ModalCloseButton onClick={handleTaskModalClose} />
            <ModalBody overflowY="auto">
              <Flex>
                {/* Left column (2/3 width) */}
                <Box flex="2" pr={5}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      {editMode ? (
                        <Input
                          value={editedTask.Name || ''}
                          onChange={handleNameChange}
                          placeholder="Enter task name"
                          size="lg"
                          fontWeight="bold"
                          mb={2}
                        />
                      ) : (
                        <Heading as="h2" size="lg" mb={2}>{task.Name}</Heading>
                      )}
                    </Box>
                    <Box>
                      <Heading as="h4" size="md" mb={2}>Description</Heading>
                      {editMode ? (
                        <Textarea
                          value={editedTask.Description || ''}
                          onChange={handleDescriptionChange}
                          placeholder="Enter task description"
                          rows={5}
                          resize="vertical"
                        />
                      ) : (
                        <Text>{task.Description}</Text>
                      )}
                    </Box>
                    <Box>
                      <Heading as="h4" size="sm" mb={2}>Due Date</Heading>
                      {editMode ? (
                        <Input
                          type="date"
                          value={editedTask.DueDate || ''}
                          onChange={handleDateChange}
                        />
                      ) : (
                        <Text>{formatDate(editedTask.DueDate)}</Text>
                      )}
                    </Box>
                  </VStack>
                </Box>
                {/* Right column (1/3 width) */}
                <Box flex="1" pl={4} borderLeft="1px" borderColor="gray.200">
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <StatusSelect
                        value={editMode ? editedTask.Status : currentStatus}
                        onChange={handleStatusChange}
                      />
                    </Box>
                    <Box>
                      <Heading as="h4" size="sm" mb={2}>Client: </Heading>
                      <ClientSelect
                        value={editedTask.Client || ''}
                        onChange={handleClientChange}
                        clients={clients}
                        isEditable={editMode}
                      />
                    </Box>
                    <Box>
                      <Heading as="h4" size="sm" mb={2}>Owner: </Heading>
                      <OwnerSelect
                        value={editedTask.AssignedOwner ? editedTask.AssignedOwner[0] : ''}
                        onChange={handleOwnerChange}
                        owners={owners}
                        isEditable={editMode}
                      />
                    </Box>
                  </VStack>
                </Box>
              </Flex>
            </ModalBody>
            <ModalFooter>
              {!editMode && (
                <Button leftIcon={<EditIcon />} onClick={handleEditClick} mr={3}>
                  Edit
                </Button>
              )}
              {editMode && (
                <Button colorScheme="blue" mr={3} onClick={handleSave} isDisabled={!isChanged && !isNewTask}>
                  {isNewTask ? "Create Task" : "Save Changes"}
                </Button>
              )}
              <Button onClick={onClose}>Close</Button>
            </ModalFooter>
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