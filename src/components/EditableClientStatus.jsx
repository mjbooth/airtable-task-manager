import React, { useState } from 'react';
import {
  Text,
  Textarea,
  Button,
  Flex,
  Box,
} from '@chakra-ui/react';

const EditableClientStatus = ({ status, onStatusUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState(status);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onStatusUpdate(editedStatus);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedStatus(status);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Box>
        <Textarea
          value={editedStatus}
          onChange={(e) => setEditedStatus(e.target.value)}
          mb={2}
        />
        <Flex justifyContent="flex-end">
          <Button size="sm" onClick={handleSave} colorScheme="blue" mr={2}>
            Save
          </Button>
          <Button size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Text>{status || 'No status available'}</Text>
      <Button size="sm" onClick={handleEdit}>
        Edit
      </Button>
    </Flex>
  );
};

export default EditableClientStatus;