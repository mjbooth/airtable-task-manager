import { ChevronDownIcon } from '@chakra-ui/icons';
import { Menu, MenuButton, MenuList, MenuItem, Button, Box, useTheme } from '@chakra-ui/react';
import { useStatusConfig } from '../contexts/StatusContext';

const StatusSelect = ({ value, onChange }) => {
  const theme = useTheme();
  const statusConfig = useStatusConfig();

  console.log('Status config in StatusSelect:', statusConfig); // Debug log

  const options = Object.values(statusConfig).map(status => status.status);

  const getStatusColor = (status) => {
    return theme.colors.status[status] || theme.colors.gray[200];
  };

  const getStatusTextColor = (status) => {
    // For now, we'll use black for all text colors
    return 'black';
  };

  return (
    <Menu>
      <MenuButton 
        as={Button} 
        rightIcon={<ChevronDownIcon />} 
        bg={getStatusColor(value)} 
        color={getStatusTextColor(value)}
        _hover={{ bg: `${getStatusColor(value)}80` }}
        _active={{ bg: `${getStatusColor(value)}90` }}
        fontWeight="bold"
        borderRadius="md"
        px={4}
        py={2}
      >
        {value || 'Select Status'}
      </MenuButton>
      <MenuList borderRadius="md" boxShadow="lg">
        {options.map((option) => (
          <MenuItem 
            key={option} 
            onClick={() => onChange(option)}
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