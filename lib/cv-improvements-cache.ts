// Cache for storing CV improvement suggestions to avoid regenerating the same suggestions
import { CVImprovement } from "@/lib/cv-improvement-prompt";

// Define the cached CV improvements data type
export interface CachedCVImprovementsData {
  improvements: CVImprovement[];
  createdAt: number; // timestamp
}

// Use global object for server-side persistence
declare global {
  var _cvImprovementsCache: Map<string, CachedCVImprovementsData>;
}

// Initialize the global cache if it doesn't exist
if (!global._cvImprovementsCache) {
  global._cvImprovementsCache = new Map<string, CachedCVImprovementsData>();
  console.log("Initialized global CV improvements cache");
}

// Create a simple cache key from assessment ID
export function createCVImprovementsCacheKey(assessmentId: string): string {
  return `${assessmentId}`;
}

// Export functions to interact with the cache
export const cvImprovementsCache = {
  // Store CV improvements with assessment ID as key
  set: (assessmentId: string, improvements: CVImprovement[]) => {
    const cacheKey = createCVImprovementsCacheKey(assessmentId);
    global._cvImprovementsCache.set(cacheKey, {
      improvements,
      createdAt: Date.now(),
    });
    console.log(`Cached CV improvements for Assessment ID: ${assessmentId}`);
    console.log(`Total CV improvements in cache: ${global._cvImprovementsCache.size}`);
  },

  // Get CV improvements by assessment ID
  get: (assessmentId: string): CVImprovement[] | undefined => {
    const cacheKey = createCVImprovementsCacheKey(assessmentId);
    const data = global._cvImprovementsCache.get(cacheKey);
    if (data) {
      console.log(`Retrieved cached CV improvements for Assessment ID: ${assessmentId}`);
      return data.improvements;
    }
    return undefined;
  },

  // Check if CV improvements exist in the cache
  has: (assessmentId: string): boolean => {
    const cacheKey = createCVImprovementsCacheKey(assessmentId);
    return global._cvImprovementsCache.has(cacheKey);
  },

  // Debug function to see cache statistics
  debug: (): { count: number; keys: string[] } => {
    return {
      count: global._cvImprovementsCache.size,
      keys: Array.from(global._cvImprovementsCache.keys()),
    };
  },
}; 