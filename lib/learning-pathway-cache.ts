// Cache for storing learning pathways to avoid regenerating the same pathways
import { LearningPathStep } from "@/lib/learning-pathway-types";

// Define the cached pathway data type
export interface CachedPathwayData {
  role: string;
  steps: number;
  pathway: LearningPathStep[];
  createdAt: number; // timestamp
}

// Use global object for server-side persistence
declare global {
  var _learningPathwayCache: Map<string, CachedPathwayData>;
}

// Initialize the global cache if it doesn't exist
if (!global._learningPathwayCache) {
  global._learningPathwayCache = new Map<string, CachedPathwayData>();
  console.log("Initialized global learning pathway cache");
}

// Create a cache key from assessmentId, role, and steps
export function createPathwayCacheKey(assessmentId: string, role: string, steps: number): string {
  return `${assessmentId}:${role}:${steps}`;
}

// Export functions to interact with the cache
export const learningPathwayCache = {
  // Store pathway with a composite key
  set: (assessmentId: string, role: string, steps: number, pathway: LearningPathStep[]) => {
    const cacheKey = createPathwayCacheKey(assessmentId, role, steps);
    global._learningPathwayCache.set(cacheKey, {
      role,
      steps,
      pathway,
      createdAt: Date.now(),
    });
    console.log(`Cached ${steps}-step learning pathway for ${role} (Assessment ID: ${assessmentId})`);
    console.log(`Total pathways in cache: ${global._learningPathwayCache.size}`);
  },

  // Get pathway by composite key
  get: (assessmentId: string, role: string, steps: number): LearningPathStep[] | undefined => {
    const cacheKey = createPathwayCacheKey(assessmentId, role, steps);
    const data = global._learningPathwayCache.get(cacheKey);
    if (data) {
      console.log(`Retrieved cached ${steps}-step learning pathway for ${role}`);
      return data.pathway;
    }
    return undefined;
  },

  // Check if a pathway exists in the cache
  has: (assessmentId: string, role: string, steps: number): boolean => {
    const cacheKey = createPathwayCacheKey(assessmentId, role, steps);
    return global._learningPathwayCache.has(cacheKey);
  },

  // Debug function to see cache statistics
  debug: (): { count: number; keys: string[] } => {
    return {
      count: global._learningPathwayCache.size,
      keys: Array.from(global._learningPathwayCache.keys()),
    };
  },
}; 