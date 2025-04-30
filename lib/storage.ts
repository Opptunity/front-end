// Create a more persistent storage solution for Next.js API routes
// In a production environment, this would be replaced with a database

// Define the assessment data type
export interface AssessmentData {
  text: string;
  assessment: any | null;
  createdAt: number; // timestamp
  latestTestResults?: any; // Store the latest test results
}

// Use global object for server-side persistence
declare global {
  var _assessmentStore: Map<string, AssessmentData>;
}

// Initialize the global store if it doesn't exist
if (!global._assessmentStore) {
  global._assessmentStore = new Map<string, AssessmentData>();
  console.log("Initialized global assessment store");
}

// Export functions to interact with the store
export const assessmentStorage = {
  // Store data with ID
  set: (id: string, data: Omit<AssessmentData, "createdAt">) => {
    global._assessmentStore.set(id, {
      ...data,
      createdAt: Date.now(),
    });
    console.log(`Stored data for ID: ${id}`);
    console.log(`Total items in store: ${global._assessmentStore.size}`);
  },

  // Get data by ID
  get: (id: string): AssessmentData | undefined => {
    const data = global._assessmentStore.get(id);
    console.log(`Retrieved data for ID: ${id}, exists: ${!!data}`);
    return data;
  },

  // List all IDs in the store
  listIds: (): string[] => {
    return Array.from(global._assessmentStore.keys());
  },

  // Debug function to see all data
  debug: (): { count: number; ids: string[] } => {
    return {
      count: global._assessmentStore.size,
      ids: Array.from(global._assessmentStore.keys()),
    };
  },
}; 