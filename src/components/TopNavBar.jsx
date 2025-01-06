import React, { useState } from 'react';
import {
  Box,
  Flex,
  Image,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spacer,
} from '@chakra-ui/react';
import { FaHome, FaPlus } from 'react-icons/fa';
import TaskModal from './TaskModal';

const TopNavBar = ({ onNewClient, onNewTask }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleNewTask = () => {
    setIsTaskModalOpen(true);
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
  };

  const handleTaskSubmit = (taskData) => {
    onNewTask(taskData);
    setIsTaskModalOpen(false);
  };

  return (
    <Box bg="white" boxShadow="sm" py={2} px={4}>
      <Flex alignItems="center">
        <Image
          src="/images/CreateTOTALLY_symbol.png" // Replace with your actual logo path
          alt="Brand Logo"
          boxSize="30px"
          mr={4}
        />
        <IconButton
          icon={<FaHome />}
          aria-label="Home"
          variant="ghost"
          fontSize="20px"
        />
        <Spacer />

        {/* Create Button */}
        <Menu>
          <MenuButton as={Button} rightIcon={<FaPlus />} colorScheme="blue">
            Create
          </MenuButton>
          <MenuList>
            {/* <MenuItem onClick={onNewClient}>New Client</MenuItem> */}
            <MenuItem onClick={handleNewTask}>New Task</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleTaskModalClose}
        onSave={handleTaskSubmit}
        isNewTask={true}
        task={{}} // Pass an empty object for a new task
      />
    </Box>
  );
};

export default TopNavBar;