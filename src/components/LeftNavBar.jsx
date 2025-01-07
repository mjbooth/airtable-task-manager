import React from 'react';
import { Box, VStack, Image, Text, Flex } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const LeftNavBar = () => {
  const navItems = ['Tasks', 'Deadlines'];
//   const navItems = ['Tasks', 'Deadlines', 'Contacts', 'Insights', 'Settings'];

  return (
    <Box 
      bg="gray.900" 
      width="260px"  // Updated from 200px to 260px
      height="100vh" 
      borderRight="1px" 
      borderColor="gray.300"
      p={4}
    >
      <VStack spacing={8} align="stretch">
        <Image
          src="/images/CreateTOTALLY_symbol.png"
          alt="Brand Logo"
          boxSize="50px"
          alignSelf="left"
        />
        {navItems.map((item) => (
          <Link key={item} to={`/${item.toLowerCase()}`}>
            <Text fontSize="lg" color="white">{item}</Text>
            </Link>
        ))}
      </VStack>
    </Box>
  );
};

export default LeftNavBar;