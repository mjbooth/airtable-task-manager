import React from 'react';
import { Box, Flex, Skeleton, SkeletonCircle } from '@chakra-ui/react';

const SkeletonTaskCard = () => (
  <Box borderWidth="1px" borderRadius="lg" p={4} boxShadow="md">
    <Flex direction="column" justify="space-between" height="100%">
      <Flex justify="space-between" align="flex-start" mb={2}>
        <Skeleton height="20px" width="70%" />
        <Skeleton height="20px" width="20%" />
      </Flex>
      <Skeleton height="16px" width="40%" mb={4} />
      <Flex justify="space-between" align="center" mt="auto">
        <Flex>
          <SkeletonCircle size="6" />
        </Flex>
        <Skeleton height="16px" width="30%" />
      </Flex>
    </Flex>
  </Box>
);

export default SkeletonTaskCard;