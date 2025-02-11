import React, { useState, Suspense, lazy } from 'react';
import { ChakraProvider, Flex, Box, Button, Text, Spinner } from '@chakra-ui/react';
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
  const handleNewTask = () => {
    setIsTaskModalOpen(true);
  };

  const handleTaskModalClose = () => {
    setIsTaskModalOpen(false);
  };

  const handleTaskSubmit = (taskData) => {
    // Implement logic to save the new task
    console.log('New task data:', taskData);
    setIsTaskModalOpen(false);
  };
  const handleRefresh = () => {
    // Implement refresh logic
    console.log('Refreshing data');
  };

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
                      <Route path="/" element={<TaskList />} />
                      <Route path="/tasks" element={<TaskList />} />
                      <Route path="/deadlines" element={<DeadlinesPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      {/* Add other routes for Deadlines, Contacts, Insights, and Settings */}
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
          />
        </Suspense>
      </ErrorBoundary>
    </ChakraProvider>
  );
}

export default App;