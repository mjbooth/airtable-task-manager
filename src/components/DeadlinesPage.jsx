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
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { fetchTasks, fetchClients } from '../airtableConfig';
import axios from 'axios';

const DeadlinesPage = () => {
    const [tasks, setTasks] = useState([]);
    const [clients, setClients] = useState([]);
    const [activeOwners, setActiveOwners] = useState([]);
    const [owners, setOwners] = useState([]);

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
        setActiveOwners(prev =>
            prev.includes(ownerId)
                ? prev.filter(id => id !== ownerId)
                : [...prev, ownerId]
        );
    };

    const filteredTasks = activeOwners.length > 0
        ? tasks.filter(task => task.AssignedOwner && task.AssignedOwner.some(owner => activeOwners.includes(owner)))
        : tasks;

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
                <HStack spacing={2} mb={5} wrap="wrap">
                    {owners.map(owner => (
                        <Tag
                            key={owner.id}
                            size="md"
                            borderRadius="full"
                            variant={activeOwners.includes(owner.id) ? "solid" : "solid"}
                            colorScheme="gray"
                            cursor="pointer"
                            onClick={() => handleOwnerFilter(owner.id)}
                            p={1}
                            bg="transparent"
                            border={activeOwners.includes(owner.id) ? "1px solid" : "1px solid"}
                            borderColor={activeOwners.includes(owner.id) ? "gray.800" : "gray.200"}
                        >
                            <Avatar size="xs" src={owner.avatar} name={owner.name} mr={2} />
                            <TagLabel pr={2} color={activeOwners.includes(owner.id) ? "gray.800" : "gray.200"}>
                                {owner.name}
                            </TagLabel>
                        </Tag>
                    ))}
                </HStack>
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
        </Flex>
    );
};

export default DeadlinesPage;