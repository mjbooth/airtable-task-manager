import React from 'react';
import { Box, VStack, Grid } from '@chakra-ui/react';
import { ErrorBoundary } from 'react-error-boundary';
import TaskList from './components/TaskList';

function ErrorFallback({error}) {
  return (
    <Box role="alert">
      <Text>Something went wrong:</Text>
      <Text color="red.500">{error.message}</Text>
    </Box>
  )
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <VStack spacing={8}>
            <TaskList />
          </VStack>
        </Grid>
      </Box>
    </ErrorBoundary>
  );
}

export default App;