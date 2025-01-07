import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
  colors: {
    status: {
      planned: "#D5C8F6",
      awaitingresponse: "#B3E2DF",
      awaitingapproval: "#B3E2DF",
      inprogress: "#A3C4F3",
      reviewing: "#F8ECC1",
      completed: "#B8E8C1",
      onhold: "#F9D3B4",
      cancelled: "#F7B4B7",
      blocked: "#F9B7B3",
    },
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

export default theme;