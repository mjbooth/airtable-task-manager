import React, { useState, useEffect } from 'react';
import { Box, Table, Thead, Tbody, Tfoot, Tr, Th, Td, Text, Spinner, IconButton, Select, Input, Button, Flex } from '@chakra-ui/react';
import { TriangleUpIcon, TriangleDownIcon, AddIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { fetchClients, fetchLifecycleStages, updateClientLifecycleStage, createClient, fetchUsers, updateClientAssignedOwner } from '../../airtableConfig';

const SettingsClientList = () => {
  const [clients, setClients] = useState([]);
  const [lifecycleStages, setLifecycleStages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [newClient, setNewClient] = useState({ name: '', lifecycleStageId: '' });
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedClients, fetchedLifecycleStages, fetchedUsers] = await Promise.all([
          fetchClients(),
          fetchLifecycleStages(),
          fetchUsers()
        ]);
        console.log('Fetched Clients:', fetchedClients);
        console.log('Fetched Lifecycle Stages:', fetchedLifecycleStages);
        console.log('Fetched Users:', fetchedUsers);

        setClients(fetchedClients);
        setLifecycleStages(fetchedLifecycleStages);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelect = (clientId) => {
    setSelectedClient(clientId === selectedClient ? null : clientId);
  };

  const handleDoubleClick = (clientId, field, value) => {
    setEditingCell({ clientId, field });
    setEditValue(field === 'clientLifecycleStage' ? (value[0] || '') : value);
  };

  const handleEdit = (e) => {
    setEditValue(e.target.value);
  };

  const handleAddClient = async () => {
    if (newClient.name && newClient.lifecycleStageId) {
      try {
        const createdClient = await createClient(newClient);
        setClients([...clients, createdClient]);
        setNewClient({ name: '', lifecycleStageId: '' });
        setShowNewClientForm(false); // Hide the form after adding
      } catch (error) {
        console.error("Error creating new client:", error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleLifecycleStageChange = async (clientId, newStageId) => {
    try {
      await updateClientLifecycleStage(clientId, newStageId);
      const updatedStage = lifecycleStages.find(stage => stage.id === newStageId);
      setClients(clients.map(client =>
        client.id === clientId ? { ...client, lifecycleStageId: newStageId, lifecycleStageName: updatedStage.name } : client
      ));
    } catch (err) {
      console.error("Error updating client lifecycle stage:", err);
      // You might want to show an error message to the user here
    }
  };

  const handleAssignedOwnerChange = async (clientId, newOwnerId) => {
    try {
      await updateClientAssignedOwner(clientId, newOwnerId);
      setClients(clients.map(client =>
        client.id === clientId ? { ...client, AssignedOwner: newOwnerId ? [newOwnerId] : null } : client
      ));
    } catch (err) {
      console.error("Error updating client assigned owner:", err);
      // You might want to show an error message to the user here
    }
  };

  const getAssignedOwnerName = (assignedOwner) => {
    if (!assignedOwner || assignedOwner.length === 0) return 'Unassigned';
    const user = users.find(u => u.id === assignedOwner[0]);
    return user ? user.name : 'Unknown User';
  };

  const handleSave = async (clientId, field) => {
    try {
      let updatedValue = editValue;
      if (field === 'lifecycleStage') {
        await updateClientLifecycleStage(clientId, editValue);
        const updatedStage = lifecycleStages.find(stage => stage.id === editValue);
        updatedValue = updatedStage ? [updatedStage.name] : [];
      } else {
        // Handle other fields if necessary
        // await updateClient(clientId, { [field]: editValue });
      }
      setClients(clients.map(client =>
        client.id === clientId ? { ...client, clientLifecycleStage: updatedValue } : client
      ));
      setEditingCell(null);
      console.log('Updated client:', clients.find(c => c.id === clientId));
    } catch (err) {
      console.error("Error updating client:", err);
      // You might want to show an error message to the user here
    }
  };

  const handleKeyDown = (e, clientId, field) => {
    if (e.key === 'Enter') {
      handleSave(clientId, field);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const sortedClients = React.useMemo(() => {
    let sortableClients = [...clients];
    if (sortConfig.key !== null) {
      sortableClients.sort((a, b) => {
        if (sortConfig.key === 'lifecycleStage') {
          const stageA = a.clientLifecycleStage && a.clientLifecycleStage.length > 0 ? a.clientLifecycleStage[0] : '';
          const stageB = b.clientLifecycleStage && b.clientLifecycleStage.length > 0 ? b.clientLifecycleStage[0] : '';
          return sortConfig.direction === 'ascending'
            ? stageA.localeCompare(stageB)
            : stageB.localeCompare(stageA);
        }
        if (sortConfig.key === 'AssignedOwner') {
          const ownerA = getAssignedOwnerName(a.AssignedOwner);
          const ownerB = getAssignedOwnerName(b.AssignedOwner);
          return sortConfig.direction === 'ascending'
            ? ownerA.localeCompare(ownerB)
            : ownerB.localeCompare(ownerA);
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableClients;
  }, [clients, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (loading) return <Spinner />;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th 
              onClick={() => requestSort('name')} 
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              userSelect="none"
            >
              <Flex align="center" justify="space-between">
                <Text>Client Name</Text>
                <IconButton
                  icon={
                    sortConfig.key === 'name' 
                      ? (sortConfig.direction === 'ascending' ? <TriangleUpIcon /> : <TriangleDownIcon />)
                      : <TriangleUpIcon />
                  }
                  size="xs"
                  variant="ghost"
                  opacity={sortConfig.key === 'name' ? 1 : 0.3}
                  aria-label={`Sort by name ${sortConfig.direction}`}
                  pointerEvents="none"
                />
              </Flex>
            </Th>
            <Th 
              onClick={() => requestSort('lifecycleStage')} 
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              userSelect="none"
            >
              <Flex align="center" justify="space-between">
                <Text>Lifecycle Stage</Text>
                <IconButton
                  icon={
                    sortConfig.key === 'lifecycleStage' 
                      ? (sortConfig.direction === 'ascending' ? <TriangleUpIcon /> : <TriangleDownIcon />)
                      : <TriangleUpIcon />
                  }
                  size="xs"
                  variant="ghost"
                  opacity={sortConfig.key === 'lifecycleStage' ? 1 : 0.3}
                  aria-label={`Sort by lifecycle stage ${sortConfig.direction}`}
                  pointerEvents="none"
                />
              </Flex>
            </Th>
            <Th 
              onClick={() => requestSort('AssignedOwner')} 
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              userSelect="none"
            >
              <Flex align="center" justify="space-between">
                <Text>Assigned Owner</Text>
                <IconButton
                  icon={
                    sortConfig.key === 'AssignedOwner' 
                      ? (sortConfig.direction === 'ascending' ? <TriangleUpIcon /> : <TriangleDownIcon />)
                      : <TriangleUpIcon />
                  }
                  size="xs"
                  variant="ghost"
                  opacity={sortConfig.key === 'AssignedOwner' ? 1 : 0.3}
                  aria-label={`Sort by assigned owner ${sortConfig.direction}`}
                  pointerEvents="none"
                />
              </Flex>
            </Th>
            <Th 
              onClick={() => requestSort('lastUpdated')} 
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              userSelect="none"
            >
              <Flex align="center" justify="space-between">
                <Text>Last Updated</Text>
                <IconButton
                  icon={
                    sortConfig.key === 'lastUpdated' 
                      ? (sortConfig.direction === 'ascending' ? <TriangleUpIcon /> : <TriangleDownIcon />)
                      : <TriangleUpIcon />
                  }
                  size="xs"
                  variant="ghost"
                  opacity={sortConfig.key === 'lastUpdated' ? 1 : 0.3}
                  aria-label={`Sort by last updated ${sortConfig.direction}`}
                  pointerEvents="none"
                />
              </Flex>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedClients.map((client) => (
            <Tr key={client.id}>
              <Td>{client.name}</Td>
              <Td>
                <Select
                  value={client.lifecycleStageId || ''}
                  onChange={(e) => handleLifecycleStageChange(client.id, e.target.value)}
                  size="sm"
                >
                  {lifecycleStages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </Select>
              </Td>
              <Td>
                <Select
                  value={client.AssignedOwner?.[0] || ''}
                  onChange={(e) => handleAssignedOwnerChange(client.id, e.target.value)}
                  size="sm"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </Select>
              </Td>
              <Td>{new Date(client.lastUpdated).toLocaleDateString()}</Td>
            </Tr>
          ))}
          {showNewClientForm && (
            <Tr>
              <Td>
                <Input
                  placeholder="New client name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  size="sm"
                />
              </Td>
              <Td>
                <Select
                  placeholder="Select lifecycle stage"
                  value={newClient.lifecycleStageId}
                  onChange={(e) => setNewClient({ ...newClient, lifecycleStageId: e.target.value })}
                  size="sm"
                >
                  {lifecycleStages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </Select>
              </Td>
              <Td>
                <Select
                  placeholder="Select owner"
                  value=""
                  onChange={() => {}}
                  size="sm"
                  disabled
                >
                  <option value="">Assign after creation</option>
                </Select>
              </Td>
              <Td>
                <IconButton
                  icon={<CheckIcon />}
                  colorScheme="green"
                  size="sm"
                  onClick={handleAddClient}
                  mr={2}
                  aria-label="Confirm new client"
                />
                <IconButton
                  icon={<CloseIcon />}
                  colorScheme="red"
                  size="sm"
                  onClick={() => setShowNewClientForm(false)}
                  aria-label="Cancel new client"
                />
              </Td>
            </Tr>
          )}
        </Tbody>
        <Tfoot>
          <Tr>
            <Td colSpan={4}>
              <IconButton
                icon={<AddIcon />}
                aria-label="Add new client"
                size="sm"
                onClick={() => setShowNewClientForm(!showNewClientForm)}
              />
            </Td>
          </Tr>
        </Tfoot>
      </Table>
    </Box>
  );
};

export default SettingsClientList;