import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    SimpleGrid,
    HStack,
    Tag,
    TagLabel,
    VStack,
    Text,
    Avatar,
    Badge,
    Flex,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Button,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { format, isToday, isThisWeek, isThisMonth, isBefore, startOfDay } from 'date-fns';
import { fetchTasks, fetchClients } from '../airtableConfig';
import axios from 'axios';
import TaskModal from './TaskModal';

const DeadlinesPage = () => {
    const [tasks, setTasks] = useState([]);
    const [clients, setClients] = useState([]);
    const [activeOwners, setActiveOwners] = useState([]);
    const [owners, setOwners] = useState([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [focusedOwner, setFocusedOwner] = useState(null);
    const [dateFilter, setDateFilter] = useState('All');

    useEffect(() => {
        fetchTasksData();
        fetchClientsData();
    }, []);

    const fetchTasksData = async () => {
        try {
            const fetchedTasks = await fetchTasks();
            const filteredAndSortedTasks = fetchedTasks
                .filter(task => task.Status !== 'Completed')
                .sort((a, b) => new Date(a.DueDate) - new Date(b.DueDate));
            setTasks(filteredAndSortedTasks);

            const uniqueOwnerIds = [...new Set(filteredAndSortedTasks
                .flatMap(task => task.AssignedOwner || [])
                .filter(owner => owner))];

            const ownersDetails = await Promise.all(uniqueOwnerIds.map(async (ownerId) => {
                try {
                    const response = await axios.get(
                        `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${import.meta.env.VITE_AIRTABLE_TEAM_TABLE_ID}/${ownerId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_PAT}`,
                            },
                        }
                    );
                    return {
                        id: ownerId,
                        name: response.data.fields.Name,
                        avatar: response.data.fields.Avatar ? response.data.fields.Avatar[0].url : ''
                    };
                } catch (error) {
                    console.error(`Error fetching owner details for ID ${ownerId}:`, error);
                    return { id: ownerId, name: 'Unknown', avatar: '' };
                }
            }));

            setOwners(ownersDetails);
            setActiveOwners(ownersDetails.map(owner => owner.id));
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const fetchClientsData = async () => {
        try {
            const fetchedClients = await fetchClients();
            setClients(fetchedClients);
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    const handleOwnerFilter = (ownerId) => {
        if (focusedOwner === ownerId) {
            setFocusedOwner(null);
        } else {
            setFocusedOwner(ownerId);
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    const handleTaskModalClose = () => {
        setIsTaskModalOpen(false);
        setSelectedTask(null);
    };

    const handleTaskUpdate = (updatedTask) => {
        setTasks(prevTasks => prevTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
        ));
        handleTaskModalClose();
    };

    const handleDateFilter = (filter) => {
        setDateFilter(filter);
    };

    const filterTasksByDate = (tasks) => {
        const today = startOfDay(new Date());
        switch (dateFilter) {
            case 'Today':
                return tasks.filter(task => isToday(new Date(task.DueDate)));
            case 'Week':
                return tasks.filter(task => isThisWeek(new Date(task.DueDate)));
            case 'Month':
                return tasks.filter(task => isThisMonth(new Date(task.DueDate)));
            case 'Overdue':
                return tasks.filter(task => isBefore(new Date(task.DueDate), today));
            default:
                return tasks;
        }
    };

    const filteredTasks = filterTasksByDate(
        focusedOwner
            ? tasks.filter(task => task.AssignedOwner && task.AssignedOwner.includes(focusedOwner))
            : tasks
    );

    const getStatusColor = (status) => {
        const statusColors = {
            planned: "blue.100",
            "awaiting approval": "yellow.100",
            "in progress": "green.100",
            reviewing: "purple.100",
            completed: "teal.100",
            "on hold": "orange.100",
            cancelled: "red.100",
            blocked: "gray.100"
        };
        return statusColors[status.toLowerCase()] || "gray.100";
    };
    return (
        <Flex height="calc(100vh - 104px)" direction="column">
            <Box p={5} bg="white" zIndex={1}>
                <Heading as="h1" size="xl" mb={5}>Deadlines</Heading>
                <Flex justify="space-between" align="center" mb={5}>
                    <HStack spacing={2} wrap="wrap">
                        {owners.map(owner => (
                            <Tag
                                key={owner.id}
                                size="md"
                                borderRadius="full"
                                variant={focusedOwner === owner.id ? "solid" : "outline"}
                                colorScheme={focusedOwner === owner.id ? "blue" : "gray"}
                                cursor="pointer"
                                onClick={() => handleOwnerFilter(owner.id)}
                                p={1}
                            >
                                <Avatar size="xs" src={owner.avatar} name={owner.name} mr={2} />
                                <TagLabel pr={2}>
                                    {owner.name}
                                </TagLabel>
                            </Tag>
                        ))}
                    </HStack>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            {dateFilter === 'All' ? 'Date Filter' : dateFilter}
                        </MenuButton>
                        <MenuList>
                            <MenuItem onClick={() => handleDateFilter('All')}>All</MenuItem>
                            <MenuItem onClick={() => handleDateFilter('Today')}>Today</MenuItem>
                            <MenuItem onClick={() => handleDateFilter('Week')}>This Week</MenuItem>
                            <MenuItem onClick={() => handleDateFilter('Month')}>This Month</MenuItem>
                            <MenuItem onClick={() => handleDateFilter('Overdue')}>Overdue</MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            </Box>
            <Box flex={1} overflow="auto" px={5} pb={5}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                    {filteredTasks.map(task => (
                        <Box
                            key={task.id}
                            borderWidth="1px"
                            borderRadius="lg"
                            p={4}
                            boxShadow="md"
                            cursor="pointer"
                            onClick={() => handleTaskClick(task)}
                            _hover={{ boxShadow: "lg" }}
                        >
                            <Flex direction="column" justify="space-between" height="100%">
                                <VStack align="stretch" spacing={2}>
                                    <Flex justify="space-between" align="flex-start">
                                        <Heading as="h4" size="md" mb={2} textAlign="left">{task.Name}</Heading>
                                        <Badge
                                            bg={getStatusColor(task.Status)}
                                            color="black"
                                            fontSize="xs"
                                            px={2}
                                            py={1}
                                            borderRadius="full"
                                        >
                                            {task.Status}
                                        </Badge>
                                    </Flex>
                                    <Text fontSize="sm" color="gray.600">{task.Client}</Text>
                                </VStack>
                                <Flex justify="space-between" align="center" mt="auto" pt={4}>
                                    <HStack spacing={2}>
                                        {task.AssignedOwner && task.AssignedOwner.map(ownerId => {
                                            const owner = owners.find(o => o.id === ownerId);
                                            return owner ? (
                                                <Avatar key={ownerId} size="xs" src={owner.avatar} name={owner.name} />
                                            ) : null;
                                        })}
                                    </HStack>
                                    <Text fontSize="sm" fontWeight="bold">
                                        Due: {task.DueDate ? format(new Date(task.DueDate), 'MMM d, yyyy') : 'No due date'}
                                    </Text>
                                </Flex>
                            </Flex>
                        </Box>
                    ))}
                </SimpleGrid>
            </Box>
            {selectedTask && (
                <TaskModal
                    isOpen={isTaskModalOpen}
                    onClose={handleTaskModalClose}
                    task={selectedTask}
                    onSave={handleTaskUpdate}
                    isNewTask={false}
                />
            )}
        </Flex>
    );
};

export default DeadlinesPage;