import React, { useState, Suspense, lazy, useCallback, useEffect } from 'react';
import { ChakraProvider, Flex, Box, Button, Text, Spinner, useToast } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LeftNavBar from './components/LeftNavBar';
import { FaPlus, FaSync } from 'react-icons/fa';
import theme from './theme';
import { ErrorBoundary } from 'react-error-boundary';
import { StatusProvider } from './contexts/StatusContext';

// Lazy load components
const TaskList = lazy(() => import('./components/TaskList'));
const TaskModal = lazy(() => import('./components/TaskModal'));
const DeadlinesPage = lazy(() => import('./components/DeadlinesPage'));
const SettingsPage = lazy(() => import('./components/settings/SettingsPage'));

function ErrorFallback({ error }) {
  return (
    <Box role="alert">
      <Text>Something went wrong:</Text>
      <Text color="red.500">{error.message}</Text>
    </Box>
  )
}

function App() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const toast = useToast();
  const handleNewTask = () => {
    console.log('Opening new task modal');
    setIsTaskModalOpen(true);
  };

  const handleTaskModalClose = () => {
    console.log('Closing task modal');
    setIsTaskModalOpen(false);
  };

  const handleTaskSubmit = (taskData) => {
    console.log('New task data:', taskData);
    setIsTaskModalOpen(false);
  };

  const handleRefresh = useCallback(() => {
    console.log('Refresh triggered');
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Refreshing data",
      description: "Fetching the latest data from Airtable",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  useEffect(() => {
  }, [refreshTrigger]);

  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <StatusProvider>
          <Router>
            <Flex h="100vh">
              <LeftNavBar />
              <Box flex={1} overflowY="auto">
                <Flex justifyContent="flex-end" p={4} position="sticky" top={0} bg="white" zIndex={1}>
                  <Button leftIcon={<FaPlus />} colorScheme="gray" mr={2} onClick={handleNewTask}>
                    Create
                  </Button>
                  <Button leftIcon={<FaSync />} colorScheme="gray" onClick={handleRefresh}>
                    Refresh
                  </Button>
                </Flex>
                <Box p={4}>
                  <Suspense fallback={<Spinner />}>
                    <Routes>
                      <Route path="/" element={<TaskList refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />} />
                      <Route path="/tasks" element={<TaskList refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />} />
                      <Route path="/deadlines" element={<DeadlinesPage refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />} />
                      <Route path="/settings" element={<SettingsPage refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />} />
                    </Routes>
                  </Suspense>
                </Box>
              </Box>
            </Flex>
          </Router>
        </StatusProvider>
        <Suspense fallback={<Spinner />}>
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={handleTaskModalClose}
            onSave={handleTaskSubmit}
            isNewTask={true}
            task={{}}  // Pass an empty object for a new task
            refreshTrigger={refreshTrigger} 
            onRefresh={handleRefresh} 
          />
        </Suspense>
      </ErrorBoundary>
    </ChakraProvider>
  );
}

export default App;