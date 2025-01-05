import React from 'react';
import { Select, Text } from '@chakra-ui/react';

const ClientSelect = ({ value, onChange, clients, isEditable }) => {
  console.log('ClientSelect props:', { value, clients, isEditable });

  if (!isEditable) {
    return <Text>{value || 'Unassigned'}</Text>;
  }

  return (
    <Select value={value || ''} onChange={onChange}>
      <option value="">Select a client</option>
      {clients.map((client) => (
        <option key={client} value={client}>
          {client}
        </option>
      ))}
    </Select>
  );
};

export default ClientSelect;