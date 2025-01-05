import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, Button, Box, useTheme } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

const StatusSelect = ({ value, onChange }) => {
  const theme = useTheme();
  const statusColors = theme.colors.status;

  const options = [
    "Planned",
    "Awaiting Approval",
    "In Progress",
    "Reviewing",
    "Completed",
    "On Hold",
    "Cancelled",
    "Blocked"
  ];

  const getStatusColor = (status) => {
    const key = status.toLowerCase().replace(/\s+/g, '');
    return statusColors[key] || theme.colors.gray[200];
  };

  return (
    <Menu>
      <MenuButton 
        as={Button} 
        rightIcon={<ChevronDownIcon />} 
        bg={getStatusColor(value)} 
        color="black"
        _hover={{ bg: `${getStatusColor(value)}80` }}
        _active={{ bg: `${getStatusColor(value)}90` }}
        fontWeight="bold"
        borderRadius="md"
        px={4}
        py={2}
      >
        {value}
      </MenuButton>
      <MenuList borderRadius="md" boxShadow="lg">
        {options.map((option) => (
          <MenuItem 
            key={option} 
            onClick={() => onChange({ target: { value: option } })}
            bg={option === value ? `${getStatusColor(option)}40` : 'white'}
            _hover={{ bg: `${getStatusColor(option)}20` }}
            fontWeight={option === value ? "bold" : "normal"}
          >
            <Box as="span" w="3" h="3" borderRadius="full" bg={getStatusColor(option)} mr={2} />
            {option}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default StatusSelect;