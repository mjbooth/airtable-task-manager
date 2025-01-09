import Airtable from 'airtable';

const pat = import.meta.env.VITE_AIRTABLE_PAT;
const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
const taskTableId = import.meta.env.VITE_AIRTABLE_TABLE_ID;
const clientTableId = import.meta.env.VITE_AIRTABLE_CLIENT_TABLE_ID;
const statusConfigTableId = import.meta.env.VITE_AIRTABLE_CONFIG_STATUS_COLOURS;

console.log('Environment Variables:');
console.log('PAT:', pat ? 'Set' : 'Not set');
console.log('Base ID:', baseId);
console.log('Task Table ID:', taskTableId);
console.log('Client Table ID:', clientTableId);

if (!pat || !baseId || !taskTableId || !clientTableId) {
  console.error('Missing Airtable configuration. Please check your .env file.');
  if (!pat) console.error('VITE_AIRTABLE_PAT is missing');
  if (!baseId) console.error('VITE_AIRTABLE_BASE_ID is missing');
  if (!taskTableId) console.error('VITE_AIRTABLE_TABLE_ID is missing');
  if (!clientTableId) console.error('VITE_AIRTABLE_CLIENT_TABLE_ID is missing');
}

Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: pat });

const base = Airtable.base(baseId);
const taskTable = taskTableId ? base(taskTableId) : null;
const clientTable = clientTableId ? base(clientTableId) : null;

export const fetchTasks = async () => {
  if (!taskTable) {
    console.error('Task table is not configured properly.');
    throw new Error('Task table is not configured properly.');
  }

  try {
    console.log('Fetching tasks...');
    const records = await taskTable.select().all();
    console.log(`Fetched ${records.length} tasks`);
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

export const fetchClients = async () => {
  try {
    const records = await clientTable.select().all();
    return records.map(record => ({
      id: record.id,
      name: record.fields.Client, // Assuming 'Client' is the field name for client name
      lifecycleStage: record.fields['Lifecycle Stage'] || 'Unknown', // Adjust if the field name is different
      status: record.get('Status'),
      lastUpdated: record.get('Last Updated'), // Make sure 'Last Updated' matches your Airtable column name
      ...record.fields,
    }));
  } catch (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }
};

export const updateClientStatus = async (clientId, newStatus) => {
  try {
    const updatedRecord = await clientTable.update(clientId, {
      Status: newStatus,
    });
    return {
      id: updatedRecord.id,
      name: updatedRecord.get('Name'),
      Status: updatedRecord.get('Status'),
      lastUpdated: updatedRecord.get('Last Modified'),
      // Add any other fields you need
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

const statusConfigTable = statusConfigTableId ? base(statusConfigTableId) : null;

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