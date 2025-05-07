// Cache for storing course recommendations to avoid regenerating the same recommendations
import { RecommendedCourse } from "@/lib/types";

// Define the cached course data type
export interface CachedCourseData {
  recommendations: RecommendedCourse[];
  createdAt: number; // timestamp
}

// Use global object for server-side persistence
declare global {
  var _courseRecommendationsCache: Map<string, CachedCourseData>;
}

// Initialize the global cache if it doesn't exist
if (!global._courseRecommendationsCache) {
  global._courseRecommendationsCache = new Map<string, CachedCourseData>();
  console.log("Initialized global assessment store");
}

// Create a simple cache key from assessment ID
export function createCourseCacheKey(assessmentId: string): string {
  return `${assessmentId}`;
}

// Export functions to interact with the cache
export const courseRecommendationsCache = {
  // Store recommendations with assessment ID as key
  set: (assessmentId: string, recommendations: RecommendedCourse[]) => {
    const cacheKey = createCourseCacheKey(assessmentId);
    global._courseRecommendationsCache.set(cacheKey, {
      recommendations,
      createdAt: Date.now(),
    });
    console.log(`Cached course recommendations for Assessment ID: ${assessmentId}`);
    console.log(`Total course recommendations in cache: ${global._courseRecommendationsCache.size}`);
  },

  // Get recommendations by assessment ID
  get: (assessmentId: string): RecommendedCourse[] | undefined => {
    const cacheKey = createCourseCacheKey(assessmentId);
    const data = global._courseRecommendationsCache.get(cacheKey);
    if (data) {
      console.log(`Retrieved cached course recommendations for Assessment ID: ${assessmentId}`);
      return data.recommendations;
    }
    return undefined;
  },

  // Check if recommendations exist in the cache
  has: (assessmentId: string): boolean => {
    const cacheKey = createCourseCacheKey(assessmentId);
    return global._courseRecommendationsCache.has(cacheKey);
  },

  // Debug function to see cache statistics
  debug: (): { count: number; keys: string[] } => {
    return {
      count: global._courseRecommendationsCache.size,
      keys: Array.from(global._courseRecommendationsCache.keys()),
    };
  },
}; 