import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
} from '@chakra-ui/react';

const ClientCardContextMenu = ({ isOpen, onClose, position, onEdit, onMoveStage, stages }) => {
  return (
    <Menu isOpen={isOpen} onClose={onClose}>
      <MenuButton style={{ position: 'absolute', top: position.y, left: position.x }} />
      <Portal>
        <MenuList>
          <MenuItem onClick={onEdit}>Edit Client</MenuItem>
          <MenuItem>Move to Stage</MenuItem>
          {stages.map((stage) => (
            <MenuItem key={stage} onClick={() => onMoveStage(stage)} ml={4}>
              {stage}
            </MenuItem>
          ))}
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default ClientCardContextMenu;