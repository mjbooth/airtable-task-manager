import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
  colors: {
    status: {},
  },
  components: {
    StatusSelect: {
      baseStyle: {
        field: {
          borderRadius: 'md',
          fontSize: 'md',
          fontWeight: 'semibold',
          transition: 'all 0.2s',
          cursor: 'pointer',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
        },
      },
    },
    Toast: {
      defaultProps: {
        position: 'bottom-left',
        isClosable: true,
        duration: 3000,
      },
    },
  },
});

export const updateThemeColors = (statusConfig) => {
  console.log('Updating theme colors with:', statusConfig); // Debug log
  Object.values(statusConfig).forEach((status) => {
    if (status && status.hexColor) {
      console.log(`Setting color for status ${status.status}:`, status.hexColor); // Debug log
      theme.colors.status[status.status] = status.hexColor;
    } else {
      console.warn(`Missing color for status: ${status.status}`);
    }
  });
  console.log('Updated theme colors:', theme.colors.status); // Debug log
};

export default theme;