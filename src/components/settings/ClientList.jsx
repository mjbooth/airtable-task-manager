import React, { useState, useEffect } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Text, Spinner, Input, IconButton } from '@chakra-ui/react';
import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { fetchClients } from '../../airtableConfig';

const SettingsClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const getClients = async () => {
      try {
        const fetchedClients = await fetchClients();
        setClients(fetchedClients);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError("Failed to fetch clients. Please try again.");
        setLoading(false);
      }
    };

    getClients();
  }, []);

  const handleSelect = (clientId) => {
    setSelectedClient(clientId === selectedClient ? null : clientId);
  };

  const handleDoubleClick = (clientId, field, value) => {
    setEditingCell({ clientId, field });
    setEditValue(value);
  };

  const handleEdit = (e) => {
    setEditValue(e.target.value);
  };

  const handleSave = async (clientId, field) => {
    try {
      await updateClient(clientId, { [field]: editValue });
      setClients(clients.map(client =>
        client.id === clientId ? { ...client, [field]: editValue } : client
      ));
      setEditingCell(null);
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
            <Th onClick={() => requestSort('name')} cursor="pointer">
              Client Name
              {sortConfig.key === 'name' && (
                <IconButton
                  icon={sortConfig.direction === 'ascending' ? <TriangleUpIcon /> : <TriangleDownIcon />}
                  size="xs"
                  ml={2}
                  aria-label={`Sort by name ${sortConfig.direction}`}
                />
              )}
            </Th>
            <Th onClick={() => requestSort('lifecycleStage')} cursor="pointer">
              Lifecycle Stage
              {sortConfig.key === 'lifecycleStage' && (
                <IconButton
                  icon={sortConfig.direction === 'ascending' ? <TriangleUpIcon /> : <TriangleDownIcon />}
                  size="xs"
                  ml={2}
                  aria-label={`Sort by lifecycle stage ${sortConfig.direction}`}
                />
              )}
            </Th>
            <Th onClick={() => requestSort('lastUpdated')} cursor="pointer">
              Last Updated
              {sortConfig.key === 'lastUpdated' && (
                <IconButton
                  icon={sortConfig.direction === 'ascending' ? <TriangleUpIcon /> : <TriangleDownIcon />}
                  size="xs"
                  ml={2}
                  aria-label={`Sort by last updated ${sortConfig.direction}`}
                />
              )}
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedClients.map((client) => (
            <Tr
              key={client.id}
              onClick={() => handleSelect(client.id)}
              bg={selectedClient === client.id ? "blue.100" : "transparent"}
              _hover={{ bg: selectedClient === client.id ? "blue.200" : "gray.100" }}
              transition="background-color 0.2s"
            >
              <Td onDoubleClick={() => handleDoubleClick(client.id, 'name', client.name)}>
                {editingCell?.clientId === client.id && editingCell?.field === 'name' ? (
                  <Input
                    value={editValue}
                    onChange={handleEdit}
                    onBlur={() => handleSave(client.id, 'name')}
                    onKeyDown={(e) => handleKeyDown(e, client.id, 'name')}
                    size="sm"
                    autoFocus
                  />
                ) : (
                  client.name
                )}
              </Td>
              <Td onDoubleClick={() => handleDoubleClick(client.id, 'lifecycleStage', client.lifecycleStage)}>
                {editingCell?.clientId === client.id && editingCell?.field === 'lifecycleStage' ? (
                  <Input
                    value={editValue}
                    onChange={handleEdit}
                    onBlur={() => handleSave(client.id, 'lifecycleStage')}
                    onKeyDown={(e) => handleKeyDown(e, client.id, 'lifecycleStage')}
                    size="sm"
                    autoFocus
                  />
                ) : (
                  client.lifecycleStage
                )}
              </Td>
              <Td>{new Date(client.lastUpdated).toLocaleDateString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default SettingsClientList;