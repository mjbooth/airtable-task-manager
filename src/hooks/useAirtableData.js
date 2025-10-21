import useSWR from 'swr';
import { fetchTasks, fetchClients, fetchLifecycleStages, fetchOwners } from '../airtableConfig';

// Cache configuration
const CACHE_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000, // Dedupe requests within 5 seconds
  refreshInterval: 30000, // Auto-refresh every 30 seconds (optional)
};

// Hook for fetching tasks with caching
export const useTasks = (options = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    'tasks',
    fetchTasks,
    { ...CACHE_OPTIONS, ...options }
  );

  return {
    tasks: data || [],
    isLoading,
    isError: error,
    mutate, // Allows manual cache updates
  };
};

// Hook for fetching clients with caching
export const useClients = (options = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    'clients',
    fetchClients,
    { ...CACHE_OPTIONS, ...options }
  );

  return {
    clients: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for fetching lifecycle stages with caching
export const useLifecycleStages = (options = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    'lifecycleStages',
    fetchLifecycleStages,
    { ...CACHE_OPTIONS, ...options }
  );

  return {
    lifecycleStages: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Hook for fetching owners with caching
export const useOwners = (options = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    'owners',
    fetchOwners,
    { ...CACHE_OPTIONS, ...options }
  );

  return {
    owners: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Combined hook for fetching all data at once
export const useAllAirtableData = () => {
  const tasksResult = useTasks();
  const clientsResult = useClients();
  const lifecycleStagesResult = useLifecycleStages();
  const ownersResult = useOwners();

  const isLoading = tasksResult.isLoading || clientsResult.isLoading ||
                    lifecycleStagesResult.isLoading || ownersResult.isLoading;

  const isError = tasksResult.isError || clientsResult.isError ||
                  lifecycleStagesResult.isError || ownersResult.isError;

  return {
    tasks: tasksResult.tasks,
    clients: clientsResult.clients,
    lifecycleStages: lifecycleStagesResult.lifecycleStages,
    owners: ownersResult.owners,
    isLoading,
    isError,
    mutate: {
      tasks: tasksResult.mutate,
      clients: clientsResult.mutate,
      lifecycleStages: lifecycleStagesResult.mutate,
      owners: ownersResult.mutate,
    },
  };
};

// Optimistic update helper
export const optimisticUpdate = (mutate, updatedItem, updateFn) => {
  mutate(
    (currentData) => {
      if (!currentData) return currentData;
      return updateFn(currentData, updatedItem);
    },
    { revalidate: false }
  );
};
