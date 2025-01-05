import React from 'react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Menu, MenuButton, MenuList, MenuItem, Button, Avatar, Text, Flex, Box } from '@chakra-ui/react';

const OwnerDisplay = ({ owner }) => (
  <Flex align="center" width="100%" p={2} borderWidth={1} borderRadius="md">
    <Avatar size="xs" name={owner.name} src={owner.avatar} mr={2} />
    <Text>{owner.name}</Text>
  </Flex>
);

const OwnerSelect = ({ value, onChange, owners, isEditable = true }) => {
  const selectedOwner = owners.find(owner => owner.id === value) || { name: 'Unassigned', avatar: null };

  if (!isEditable) {
    return <OwnerDisplay owner={selectedOwner} />;
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
          <Avatar size="xs" name={selectedOwner.name} src={selectedOwner.avatar} mr={2} />
          <Text>{selectedOwner.name}</Text>
        </Flex>
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => onChange({ target: { value: '' } })}>
          <Flex align="center">
            <Avatar size="sm" name="Unassigned" mr={2} />
            <Text>Unassigned</Text>
          </Flex>
        </MenuItem>
        {owners.map((owner) => (
          <MenuItem 
            key={owner.id} 
            onClick={() => onChange({ target: { value: owner.id } })}
          >
            <Flex align="center">
              <Avatar size="sm" name={owner.name} src={owner.avatar} mr={2} />
              <Text>{owner.name}</Text>
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default OwnerSelect;
