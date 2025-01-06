import React from 'react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Menu, MenuButton, MenuList, MenuItem, Button, Text, Flex } from '@chakra-ui/react';

const ClientDisplay = ({ client }) => (
  <Flex align="center" width="100%" p={2} borderWidth={1} borderRadius="md">
    <Text>{client || 'Unassigned'}</Text>
  </Flex>
);

const ClientSelect = ({ value, onChange, clients, isEditable = true }) => {
  const selectedClient = value || 'Unassigned';
  if (!isEditable) {
    return <ClientDisplay client={selectedClient} />;
  }

  return (
    <Menu>
      <MenuButton 
        as={Button} 
        rightIcon={<ChevronDownIcon />} 
        width="100%"
        justifyContent="space-between"
      >
        <Flex align="center">
          <Text>{selectedClient}</Text>
        </Flex>
      </MenuButton>
      <MenuList maxHeight="400px" overflowY="auto">
        <MenuItem onClick={() => onChange({ target: { value: '' } })}>
          <Flex align="center">
            <Text>Unassigned</Text>
          </Flex>
        </MenuItem>
        {clients.map((client) => (
          <MenuItem 
            key={client} 
            onClick={() => onChange({ target: { value: client } })}
          >
            <Flex align="center">
              <Text>{client}</Text>
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ClientSelect;