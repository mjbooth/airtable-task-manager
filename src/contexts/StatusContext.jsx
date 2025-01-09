import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchStatusConfig } from '../airtableConfig';
import { updateThemeColors } from '../theme';

const StatusContext = createContext();

export const StatusProvider = ({ children }) => {
  const [statusConfig, setStatusConfig] = useState({});

  useEffect(() => {
    fetchStatusConfig()
      .then(config => {
       setStatusConfig(config);
        updateThemeColors(config);
      })
      .catch(error => {
        console.error('Error fetching status config:', error);
      });
  }, []);

  return (
    <StatusContext.Provider value={statusConfig}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatusConfig = () => useContext(StatusContext);