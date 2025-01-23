import React, { useState } from 'react';
import { ChakraProvider, Flex, Box, Button, Text } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LeftNavBar from './components/LeftNavBar';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import { FaPlus, FaSync } from 'react-icons/fa';
import theme from './theme';
import { ErrorBoundary } from 'react-error-boundary';
import DeadlinesPage from './components/DeadlinesPage';
import { StatusProvider } from './contexts/StatusContext';
import SettingsPage from './components/settings/SettingsPage';

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
                  <Routes>
                    <Route path="/" element={<TaskList />} />
                    <Route path="/tasks" element={<TaskList />} />
                    <Route path="/deadlines" element={<DeadlinesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    {/* Add other routes for Deadlines, Contacts, Insights, and Settings */}
                  </Routes>
                </Box>
              </Box>
            </Flex>
          </Router>
        </StatusProvider>
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={handleTaskModalClose}
          onSave={handleTaskSubmit}
          isNewTask={true}
          task={{}}  // Pass an empty object for a new task
        />
      </ErrorBoundary>
    </ChakraProvider>
  );
}

export default App;