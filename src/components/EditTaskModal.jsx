import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Box,
  List,
  ListItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  Text,
} from '@chakra-ui/react';
import { fetchClients, fetchOwners, updateTask, createTask } from '../airtableConfig';

const EditTaskModal = ({ isOpen, onClose, task, onSave, isNewTask }) => {
  const [editedTask, setEditedTask] = useState(task || {});
  const [clients, setClients] = useState([]);
  const [owners, setOwners] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showClientList, setShowClientList] = useState(false);
  const [clientInput, setClientInput] = useState('');

  useEffect(() => {
    console.log('EditTaskModal useEffect triggered', { task, isNewTask });
    setEditedTask(task || {});
    fetchClients().then(fetchedClients => {
      console.log('Clients fetched:', fetchedClients);
      setClients(fetchedClients.map(client => client.name));
    });
    fetchOwners().then(fetchedOwners => {
      console.log('Owners fetched:', fetchedOwners);
      setOwners(fetchedOwners);
    });
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange called', { name, value });
    if (name === 'AssignedOwner') {
      console.log('Assigning owner:', value);
      setEditedTask(prevTask => {
        const newTask = { ...prevTask, AssignedOwner: value ? [value] : [] };
        console.log('Updated task after assigning owner:', newTask);
        return newTask;
      });
    } else {
      setEditedTask(prevTask => {
        const newTask = { ...prevTask, [name]: value };
        console.log('Updated task:', newTask);
        return newTask;
      });
    }
  };

  const handleClientSelect = (client) => {
    setEditedTask(prevTask => ({ ...prevTask, Client: client }));
    setClientInput('');
    setShowClientList(false);
  };

  const handleAddNewClient = () => {
    const newClient = clientInput.trim();
    if (newClient) {
      setEditedTask(prevTask => ({ ...prevTask, Client: newClient }));
      setClientInput('');
      setShowClientList(false);
      setClients(prevClients => [...prevClients, newClient]);
    }
  };

  const handleRemoveClient = () => {
    setEditedTask(prevTask => ({ ...prevTask, Client: '' }));
  };

  const handleSave = async () => {
    console.log('handleSave called', { editedTask, isNewTask });
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
        AssignedOwner: editedTask.AssignedOwner ? [editedTask.AssignedOwner] : []
      };

      console.log('Task to save:', taskToSave);
      let savedTask;
      if (isNewTask) {
        console.log('Creating new task');
        savedTask = await createTask(taskToSave);
      } else {
        console.log('Updating existing task', {
          taskId: taskToSave.id,
          taskFields: taskToSave
        });
        savedTask = await updateTask(taskToSave);
      }
      console.log('Task saved successfully:', savedTask);
      onSave(savedTask);
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        errorObject: error
      });
      // Show an error message to the user
      alert(`Failed to save task: ${error.message}`);
    }
  };

  console.log('Rendering EditTaskModal', { editedTask, owners });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isNewTask ? 'Add New Task' : 'Edit Task'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Client</FormLabel>
            <Flex alignItems="center">
              {editedTask.Client ? (
                <Tag size="lg" colorScheme="blue" borderRadius="full" mr={2}>
                  <TagLabel>{editedTask.Client}</TagLabel>
                  <TagCloseButton onClick={handleRemoveClient} />
                </Tag>
              ) : (
                <Input 
                  name="Client" 
                  value={clientInput} 
                  onChange={handleChange}
                  onFocus={() => setShowClientList(true)}
                  placeholder="Search for a client or enter a new one"
                />
              )}
            </Flex>
            {showClientList && !editedTask.Client && (
              <Box 
                mt={1} 
                border="1px" 
                borderColor="gray.200" 
                borderRadius="md" 
                maxHeight="200px" 
                overflowY="auto"
              >
                <List spacing={2}>
                  {filteredClients.map((client, index) => (
                    <ListItem 
                      key={index} 
                      p={2} 
                      cursor="pointer" 
                      _hover={{ bg: "gray.100" }}
                      onClick={() => handleClientSelect(client)}
                    >
                      {client}
                    </ListItem>
                  ))}
                  {clientInput && !filteredClients.includes(clientInput) && (
                    <ListItem 
                      p={2} 
                      cursor="pointer" 
                      _hover={{ bg: "gray.100" }}
                      onClick={handleAddNewClient}
                    >
                      <Text color="blue.500">Add new client: {clientInput}</Text>
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Task Name</FormLabel>
            <Input 
              name="Name" 
              value={editedTask.Name || ''} 
              onChange={handleChange}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Description</FormLabel>
            <Textarea 
              name="Description" 
              value={editedTask.Description || ''} 
              onChange={handleChange}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Status</FormLabel>
            <Select 
              name="Status" 
              value={editedTask.Status || ''} 
              onChange={handleChange}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Planned">Planned</option>
              <option value="On Hold">On Hold</option>
            </Select>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Due Date</FormLabel>
            <Input 
              name="DueDate" 
              type="date" 
              value={editedTask.DueDate || ''} 
              onChange={handleChange}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Assigned Owner</FormLabel>
            <Select 
              name="AssignedOwner" 
              value={editedTask.AssignedOwner || ''}
              onChange={handleChange}
            >
              <option value="">Select an owner</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            {isNewTask ? 'Create' : 'Save'}
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditTaskModal;