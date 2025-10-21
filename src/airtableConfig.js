import Airtable from 'airtable';

const pat = import.meta.env.VITE_AIRTABLE_PAT;
const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
const taskTableId = import.meta.env.VITE_AIRTABLE_TABLE_ID;
const clientTableId = import.meta.env.VITE_AIRTABLE_CLIENT_TABLE_ID;
const statusConfigTableId = import.meta.env.VITE_AIRTABLE_CONFIG_STATUS_COLOURS;
const lifecycleStagesTableId = import.meta.env.VITE_AIRTABLE_LIFECYCLE_STAGES_TABLE_ID;
const teamTableId = import.meta.env.VITE_AIRTABLE_TEAM_TABLE_ID;

if (!pat || !baseId || !taskTableId || !clientTableId || !lifecycleStagesTableId || !teamTableId) {
  console.error('Missing Airtable configuration. Please check your .env file.');
  if (!pat) console.error('VITE_AIRTABLE_PAT is missing');
  if (!baseId) console.error('VITE_AIRTABLE_BASE_ID is missing');
  if (!taskTableId) console.error('VITE_AIRTABLE_TABLE_ID is missing');
  if (!clientTableId) console.error('VITE_AIRTABLE_CLIENT_TABLE_ID is missing');
  if (!lifecycleStagesTableId) console.error('VITE_AIRTABLE_LIFECYCLE_STAGES_TABLE_ID is missing');
  if (!teamTableId) console.error('VITE_AIRTABLE_TEAM_TABLE_ID is missing');
}

Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: pat });

const base = Airtable.base(baseId);
const taskTable = taskTableId ? base(taskTableId) : null;
const clientTable = clientTableId ? base(clientTableId) : null;
const lifecycleStagesTable = lifecycleStagesTableId ? base(lifecycleStagesTableId) : null;

export const fetchTasks = async () => {
  if (!taskTable) {
    console.error('Task table is not configured properly.');
    throw new Error('Task table is not configured properly.');
  }

  try {
    const records = await taskTable.select().all();
    return records.map(record => ({
      id: record.id,
      ...record.fields,
      Client: record.fields.Client || 'Unassigned', // Ensure Client is always a string
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const fetchTaskDetails = async (taskId) => {
  if (!taskTable) {
    console.error('Task table is not configured properly.');
    throw new Error('Task table is not configured properly.');
  }

  try {
    const record = await taskTable.find(taskId);
    return {
      id: record.id,
      ...record.fields,
      Client: record.fields.Client || 'Unassigned',
    };
  } catch (error) {
    console.error("Error fetching task details:", error);
    throw error;
  }
};

export const createClient = async (clientData) => {
  if (!clientTable) {
    console.error('Client table is not configured properly.');
    throw new Error('Client table is not configured properly.');
  }

  try {
    const createdRecord = await clientTable.create({
      Client: clientData.name,
      lifecycleStage: clientData.lifecycleStageId ? [clientData.lifecycleStageId] : undefined,
      Status: clientData.status || 'New',
      pinnedClient: false,
    });

    console.log('Client created successfully:', createdRecord);

    return {
      id: createdRecord.id,
      name: createdRecord.fields.Client,
      lifecycleStageId: createdRecord.fields.lifecycleStage ? createdRecord.fields.lifecycleStage[0] : null,
      status: createdRecord.fields.Status,
      lastUpdated: createdRecord.fields['Last Modified'],
      isPinned: createdRecord.fields.pinnedClient || false,
    };
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

export const fetchLifecycleStages = async () => {
  if (!lifecycleStagesTable) {
    console.error('Lifecycle stages table is not configured properly.');
    throw new Error('Lifecycle stages table is not configured properly.');
  }

  try {
    const records = await lifecycleStagesTable.select().all();
    const stages = records.map(record => ({
      id: record.id,
      name: record.fields.stageName,
      order: record.fields.order || 0, // Default to 0 if order is not set
    }));

    // Sort the stages based on the order field
    return stages.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error("Error fetching lifecycle stages:", error);
    throw error;
  }
};

export const fetchClients = async () => {
  if (!clientTable || !lifecycleStagesTable) {
    console.error('Client table or Lifecycle Stages table is not configured properly.');
    throw new Error('Client table or Lifecycle Stages table is not configured properly.');
  }

  try {
    // First, fetch all lifecycle stages
    const lifecycleStages = await fetchLifecycleStages();
    const stagesMap = new Map(lifecycleStages.map(stage => [stage.id, { name: stage.name, order: stage.order }]));

    // Now fetch clients
    const records = await clientTable.select().all();
    return records.map(record => {
      const lifecycleStageId = record.fields.lifecycleStage && record.fields.lifecycleStage[0];
      const lifecycleStage = lifecycleStageId ? stagesMap.get(lifecycleStageId) : null;
      return {
        id: record.id,
        name: record.fields.Client,
        lifecycleStageId: lifecycleStageId,
        lifecycleStageName: lifecycleStage ? lifecycleStage.name : null,
        lifecycleStageOrder: lifecycleStage ? lifecycleStage.order : null,
        status: record.fields.Status,
        lastUpdated: record.fields['Last Updated'],
        isPinned: record.fields.pinnedClient || false,
        ...record.fields,
      };
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};
// Add a function to update the client's lifecycle stage
export const updateClientLifecycleStage = async (clientId, lifecycleStageId) => {
  if (!clientTable) {
    console.error('Client table is not configured properly.');
    throw new Error('Client table is not configured properly.');
  }

  try {
    // Log the update attempt
    console.log(`Attempting to update client ${clientId} with lifecycle stage ${lifecycleStageId}`);

    const updatedRecord = await clientTable.update(clientId, {
      'lifecycleStage': [lifecycleStageId], // Corrected field name
    });

    console.log('Updated record:', updatedRecord);

    return {
      id: updatedRecord.id,
      name: updatedRecord.fields.Client,
      lifecycleStageId: updatedRecord.fields.lifecycleStage ? updatedRecord.fields.lifecycleStage[0] : null,
      status: updatedRecord.fields.Status,
      lastUpdated: updatedRecord.fields['Last Modified'],
      isPinned: updatedRecord.fields.pinnedClient || false,
    };
  } catch (error) {
    console.error('Error updating client lifecycle stage:', error);
    console.error('Error details:', error.message, error.response?.data);
    throw error;
  }
};

export const updateClientPinnedStatus = async (clientId, newPinnedStatus) => {
  if (!clientTable) {
    console.error('Client table is not configured properly.');
    throw new Error('Client table is not configured properly.');
  }

  try {
    const updatedRecord = await clientTable.update(clientId, {
      pinnedClient: newPinnedStatus,
    });
    return {
      id: updatedRecord.id,
      name: updatedRecord.fields.Client,
      status: updatedRecord.fields.Status,
      lastUpdated: updatedRecord.fields['Last Modified'],
      isPinned: updatedRecord.fields.pinnedClient || false,
      lifecycleStage: updatedRecord.fields['Lifecycle Stage'] || 'Unknown',
    };
  } catch (error) {
    console.error('Error updating client pinned status:', error);
    throw error;
  }
};

export const updateClientStatus = async (clientId, newStatus) => {
  if (!clientTable) {
    console.error('Client table is not configured properly.');
    throw new Error('Client table is not configured properly.');
  }

  try {
    const updatedRecord = await clientTable.update(clientId, {
      Status: newStatus,
    });
    return {
      id: updatedRecord.id,
      name: updatedRecord.fields.Client,
      status: updatedRecord.fields.Status,
      lastUpdated: updatedRecord.fields['Last Modified'],
      isPinned: updatedRecord.fields.pinnedClient || false,
      lifecycleStage: updatedRecord.fields['Lifecycle Stage'] || 'Unknown',
    };
  } catch (error) {
    console.error('Error updating client status:', error);
    throw error;
  }
};

export const updateTask = async (task) => {
  if (!taskTable) {
    console.error('Task table is not configured properly.');
    throw new Error('Task table is not configured properly.');
  }

  try {
    const updatedRecord = await taskTable.update(task.id, {
      Name: task.Name,
      Description: task.Description,
      Status: task.Status,
      DueDate: task.DueDate,
      Client: task.Client,
      Priority: task.Priority,
      AssignedOwner: task.AssignedOwner
    });

    return {
      id: updatedRecord.id,
      ...updatedRecord.fields
    };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const createTask = async (task) => {
  if (!taskTable) {
    console.error('Task table is not configured properly.');
    throw new Error('Task table is not configured properly.');
  }

  try {
    const createdRecord = await taskTable.create({
      Name: task.Name,
      Description: task.Description,
      Status: task.Status,
      DueDate: task.DueDate,
      Client: task.Client,
      Priority: task.Priority,
      AssignedOwner: task.AssignedOwner
    });

    console.log('Task created successfully:', createdRecord);

    return {
      id: createdRecord.id,
      ...createdRecord.fields
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

const teamTable = teamTableId ? base(teamTableId) : null;
const statusConfigTable = statusConfigTableId ? base(statusConfigTableId) : null;

export const fetchUsers = async () => {
  if (!teamTable) {
    console.error('Team table is not configured properly.');
    throw new Error('Team table is not configured properly.');
  }

  try {
    const records = await teamTable.select().all();
    return records.map(record => ({
      id: record.id,
      name: record.fields.Name,
      avatar: record.fields.Avatar?.[0]?.url
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Alias for consistency - fetchOwners is the same as fetchUsers
export const fetchOwners = fetchUsers;

// Optimized function to fetch specific owners by ID (batch)
export const fetchOwnersByIds = async (ownerIds) => {
  if (!teamTable) {
    console.error('Team table is not configured properly.');
    throw new Error('Team table is not configured properly.');
  }

  if (!ownerIds || ownerIds.length === 0) {
    return [];
  }

  try {
    // Remove duplicates
    const uniqueIds = [...new Set(ownerIds)];

    // Batch fetch all owners at once
    const ownerRecords = await Promise.all(
      uniqueIds.map(id => teamTable.find(id).catch(err => {
        console.error(`Error fetching owner ${id}:`, err);
        return null;
      }))
    );

    return ownerRecords
      .filter(record => record !== null)
      .map(record => ({
        id: record.id,
        name: record.fields.Name,
        avatar: record.fields.Avatar?.[0]?.url
      }));
  } catch (error) {
    console.error("Error fetching owners by IDs:", error);
    throw error;
  }
};

export const updateClientAssignedOwner = async (clientId, ownerId) => {
  if (!clientTable) {
    console.error('Client table is not configured properly.');
    throw new Error('Client table is not configured properly.');
  }

  try {
    const updatedRecord = await clientTable.update(clientId, {
      AssignedOwner: ownerId ? [ownerId] : null,
    });

    return {
      id: updatedRecord.id,
      name: updatedRecord.fields.Client,
      status: updatedRecord.fields.Status,
      lastUpdated: updatedRecord.fields['Last Modified'],
      isPinned: updatedRecord.fields.pinnedClient || false,
      lifecycleStage: updatedRecord.fields.lifecycleStage,
      AssignedOwner: updatedRecord.fields.AssignedOwner,
    };
  } catch (error) {
    console.error('Error updating client assigned owner:', error);
    throw error;
  }
};

export const fetchStatusConfig = async () => {
  if (!statusConfigTable) {
    throw new Error('Status config table is not properly configured');
  }

  return new Promise((resolve, reject) => {
    const statusConfig = {};
    statusConfigTable.select({
      view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
      records.forEach(function (record) {
        statusConfig[record.get('statusId')] = {
          status: record.get('status'),
          hexColor: record.get('hexColour')
        };
      });
      fetchNextPage();
    }, function done(err) {
      if (err) {
        reject(err);
      } else {
        resolve(statusConfig);
      }
    });
  });
};