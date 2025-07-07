import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { assessmentStorage } from "@/lib/storage";
import { learningPathwayCache } from "@/lib/learning-pathway-cache";

/**
 * Endpoint to test learning pathway functionality
 * Used for debugging issues with the learning pathway system
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const assessmentId = searchParams.get("id");
  const selectedRole = searchParams.get("role");
  
  try {
    // If both assessment ID and role provided, perform specific tests
    if (assessmentId && selectedRole) {
      // Check memory cache for the assessment
      const inMemoryData = assessmentStorage.get(assessmentId);
      
      // Check cache for the learning pathway
      const cachedPathway = learningPathwayCache.has(assessmentId, selectedRole, 3); // Check for standard 3-step pathway
      
      // Check Supabase for the assessment
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('Assessments')
        .select('id, assessmentData')
        .eq('id', assessmentId)
        .single();
      
      // Test the userProfile creation
      let userProfileStatus = "Not tested";
      let industryStatus = "Unknown";
      let careerLevelStatus = "Unknown";
      
      if (inMemoryData?.assessment || supabaseData?.assessmentData) {
        const assessment = inMemoryData?.assessment || supabaseData?.assessmentData;
        try {
          // Check if we can access the required fields for userProfile
          industryStatus = assessment.industryAnalysis?.industry ? "OK" : "Missing";
          careerLevelStatus = assessment.careerTrajectory?.currentLevel ? "OK" : "Missing";
          
          // If we got this far without errors, the profile creation should work
          userProfileStatus = "OK";
        } catch (error) {
          userProfileStatus = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
      }
      
      return NextResponse.json({
        success: true,
        assessmentId,
        selectedRole,
        results: {
          inMemoryCache: {
            exists: !!inMemoryData,
            hasAssessment: inMemoryData ? !!inMemoryData.assessment : false
          },
          learningPathwayCache: {
            hasPathway: cachedPathway
          },
          supabaseQuery: {
            exists: !supabaseError && !!supabaseData,
            error: supabaseError ? supabaseError.message : null
          },
          userProfileCreation: {
            status: userProfileStatus,
            industryField: industryStatus,
            careerLevelField: careerLevelStatus
          }
        }
      });
    }
    
    // Return general cache stats if no specific parameters
    const inMemoryStats = assessmentStorage.debug();
    const pathwayStats = learningPathwayCache.debug();
    
    return NextResponse.json({
      success: true,
      stats: {
        assessmentStorage: inMemoryStats,
        learningPathwayCache: pathwayStats
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 