import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { assessmentStorage } from "@/lib/storage";
import { cvImprovementsCache } from "@/lib/cv-improvements-cache";

/**
 * Endpoint to test database connectivity and check assessment data
 * Used for debugging issues with the assessment system
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const assessmentId = searchParams.get("id");
  
  try {
    // Basic connectivity test
    const { data: connectionTest, error: connectionError } = await supabase
      .from('Assessments')
      .select('count(*)', { count: 'exact' });
    
    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: connectionError
      }, { status: 500 });
    }
    
    // If assessment ID provided, check for that specific assessment
    if (assessmentId) {
      // Try in-memory cache first
      const inMemoryData = assessmentStorage.get(assessmentId);
      
      // Check cache for CV improvements
      const cachedImprovements = cvImprovementsCache.has(assessmentId);
      
      // Check Supabase for the assessment
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('Assessments')
        .select('id, cvText, assessmentData')
        .eq('id', assessmentId)
        .single();
      
      // Try text search as fallback
      let textSearchData = null;
      let textSearchError = null;
      
      if (supabaseError) {
        const { data, error } = await supabase
          .from('Assessments')
          .select('id, cvText, assessmentData')
          .filter('id', 'ilike', `%${assessmentId}%`)
          .limit(1);
        
        textSearchData = data;
        textSearchError = error;
      }
      
      return NextResponse.json({
        success: true,
        databaseConnection: "OK",
        assessmentId,
        results: {
          inMemoryCache: {
            exists: !!inMemoryData,
            keys: inMemoryData ? Object.keys(inMemoryData) : [],
            hasAssessment: inMemoryData ? !!inMemoryData.assessment : false,
            hasCvText: inMemoryData ? !!(inMemoryData.text || (inMemoryData.assessment && inMemoryData.assessment.cvText)) : false
          },
          cvImprovementsCache: {
            exists: cachedImprovements
          },
          supabaseDirectQuery: {
            exists: !supabaseError && !!supabaseData,
            error: supabaseError ? supabaseError.message : null,
            assessmentDataKeys: supabaseData ? Object.keys(supabaseData.assessmentData || {}) : [],
            hasCvText: supabaseData ? !!supabaseData.cvText : false
          },
          supabaseTextSearch: {
            exists: !textSearchError && textSearchData && textSearchData.length > 0,
            error: textSearchError ? textSearchError.message : null,
            count: textSearchData ? textSearchData.length : 0,
            results: textSearchData ? textSearchData.map(row => ({
              id: row.id,
              hasCvText: !!row.cvText,
              assessmentDataKeys: Object.keys(row.assessmentData || {})
            })) : []
          }
        }
      });
    }
    
    // Return general database stats if no ID provided
    const { data: assessmentCount, error: countError } = await supabase
      .from('Assessments')
      .select('count(*)', { count: 'exact' });
    
    const inMemoryStats = assessmentStorage.debug();
    const cvImprovementsStats = cvImprovementsCache.debug();
    
    return NextResponse.json({
      success: true,
      databaseConnection: "OK",
      stats: {
        supabaseAssessmentCount: assessmentCount,
        inMemoryCache: inMemoryStats,
        cvImprovementsCache: cvImprovementsStats
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