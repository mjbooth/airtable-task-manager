import React, { useState, useEffect } from 'react';
import {
  Text,
  Textarea,
  Button,
  Flex,
  Box,
  useToast,
} from '@chakra-ui/react';

const convertNewlinesToBreaks = (text) => {
  if (typeof text !== 'string' || text.trim() === '') {
    return null;
  }
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index !== text.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

const EditableClientStatus = ({ status, displayStatus, onStatusUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState(status || '');
  const toast = useToast();

  useEffect(() => {
    setEditedStatus(status || '');
  }, [status]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (typeof onStatusUpdate === 'function') {
      try {
        await onStatusUpdate(editedStatus);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update status. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      console.error('onStatusUpdate is not a function');
      toast({
        title: "Error",
        description: "Unable to update status. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setEditedStatus(status || '');
    setIsEditing(false);
  };

  return (
    <Box>
      {isEditing ? (
        <Flex direction="column">
          <Textarea
            value={editedStatus}
            onChange={(e) => setEditedStatus(e.target.value)}
            mb={2}
          />
          <Flex>
            <Button onClick={handleSave} colorScheme="blue" mr={2}>
              Save
            </Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </Flex>
        </Flex>
      ) : (
        <Flex justify="space-between" align="center">
          <Text>{convertNewlinesToBreaks(displayStatus) || 'No status just yet. Check back soon.'}</Text>
          <Button onClick={handleEdit} size="sm" ml={4}>
            Edit
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default EditableClientStatus;