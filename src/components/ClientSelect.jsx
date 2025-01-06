import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CloseIcon } from '@chakra-ui/icons';
import { Input, Text, Flex, InputGroup, InputRightElement, Box, VStack, IconButton } from '@chakra-ui/react';

const ClientDisplay = ({ client }) => (
  <Flex align="center" width="100%" p={2} borderWidth={1} borderRadius="md">
    <Text>{client || 'Unassigned'}</Text>
  </Flex>
);

const ClientSelect = ({ value, onChange, clients, isEditable = true }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSearchQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

   if (!isEditable) {
    return <ClientDisplay client={value || 'Unassigned'} />;
  }

  const filteredClients = clients
  .filter(client => client.toLowerCase().includes(searchQuery.toLowerCase()))
  .sort((a, b) => a.localeCompare(b));

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelectClient = (client) => {
    onChange({ target: { value: client } });
    setSearchQuery(client);
    setIsOpen(false);
  };

  const handleClearInput = () => {
    setSearchQuery('');
    onChange({ target: { value: '' } });
    inputRef.current.focus();
  };

  return (
    <Box position="relative" width="100%" ref={dropdownRef}>
      <InputGroup onClick={() => setIsOpen(!isOpen)}>
        <Input
          ref={inputRef}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Select or search client"
          pr="4.5rem"
          bg="gray.100"
          _hover={{ bg: "gray.200" }}
          transition="background-color 0.2s"
          border="none"
        />
        <InputRightElement width="4.5rem">
          {searchQuery && (
            <IconButton
              icon={<CloseIcon />}
              size="sm"
              aria-label="Clear input"
              onClick={handleClearInput}
              mr={1}
              bg="none"
              _hover={{ bg: "gray.50" }}
            />
          )}
          <ChevronDownIcon />
        </InputRightElement>
      </InputGroup>
      {isOpen && (
        <Box
          position="fixed"
          top={inputRef.current ? inputRef.current.getBoundingClientRect().bottom + window.scrollY : 0}
          left={inputRef.current ? inputRef.current.getBoundingClientRect().left + window.scrollX : 0}
          width={inputRef.current ? inputRef.current.offsetWidth : '100%'}
          zIndex={9999}
          borderRadius="md"
          bg="white"
          maxHeight="400px"
          overflowY="auto"
          boxShadow="md"
          border="none"
        >
          <VStack align="stretch" spacing={0}>
            {filteredClients.map((client) => (
              <Box 
                key={client}
                as="button" 
                w="100%" 
                textAlign="left" 
                px={4} 
                py={2} 
                _hover={{ bg: "gray.100" }}
                onClick={() => handleSelectClient(client)}
              >
                <Text>{client}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default ClientSelect;