import React from 'react';
import { Box, VStack, Image, Text, Flex, Spacer, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';

const LeftNavBar = () => {
  const navItems = ['Tasks', 'Deadlines'];
  return (
    <Box 
      bg="gray.900" 
      width="260px"
      height="100vh"
      borderRight="1px"
      borderColor="gray.300"
      p={4}
      display="flex"
      flexDirection="column"
    >
      <VStack spacing={4} align="stretch"> {/* Reduced spacing */}
        <Image
          src="/images/CreateTOTALLY_symbol.png"
          alt="Brand Logo"
          boxSize="50px"
          alignSelf="left"
          mb={4}
        />
        {navItems.map((item) => (
          <Link key={item} to={`/${item.toLowerCase()}`}>
            <Button
              as="div"
              variant="ghost"
              justifyContent="flex-start"
              _hover={{ bg: 'gray.800' }}
              width="100%"
              px={2} // Increased horizontal padding
              py={7} // Increased vertical padding
            >
              <Text fontSize="lg" color="white">{item}</Text>
            </Button>
          </Link>
        ))}
      </VStack>
      <Spacer />
      <Box mt={4}>
        <Link to="/settings">
          <Button
            as="div"
            variant="ghost"
            justifyContent="flex-start"
            _hover={{ bg: 'gray.800' }}
            width="100%"
            px={2} // Increased horizontal padding
            py={7} // Increased vertical padding
          >
            <Flex align="center">
              <FaCog color="white" style={{ marginRight: '8px' }} />
              <Text fontSize="lg" color="white">Settings</Text>
            </Flex>
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default LeftNavBar;