import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App'
import theme from './theme'
import { StatusProvider } from './contexts/StatusContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StatusProvider>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </StatusProvider>
  </React.StrictMode>
)