import React from 'react';
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

const TopNavBar = ({ onNewClient, onNewTask }) => {
  return (
    <Box bg="white" boxShadow="sm" py={2} px={4}>
      <Flex alignItems="center">
        {/* Brand logo */}
        <Image
          src="/src/img/CreateTOTALLY_symbol.png" // Replace with your actual logo path
          alt="Brand Logo"
          boxSize="30px"
          mr={4}
        />

        {/* Home Icon */}
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
            <MenuItem onClick={onNewClient}>New Client</MenuItem>
            <MenuItem onClick={onNewTask}>New Task</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );
};

export default TopNavBar;