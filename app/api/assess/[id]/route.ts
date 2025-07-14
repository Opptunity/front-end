import { type NextRequest, NextResponse } from "next/server"
import { assessmentStorage } from "@/lib/storage"
import { assessSkills } from "@/lib/skills-assessment"
import { updateAssessmentResults, getSupabaseId, supabase, getCVDataById } from "@/lib/supabase"
import { getApiUrl } from "@/utils/api-client"

// Track currently processing assessments
const processingAssessments = new Set();

// Helper function to safely parse JSON
function safeJsonParse(jsonStr: string | null | undefined, defaultValue: any = []) {
  if (!jsonStr) return defaultValue
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Error parsing JSON:", e, jsonStr);
    return defaultValue;
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id.trim()
    console.log("Assessment requested for ID:", id)

    // Log the exact query we're about to run
    console.log(`Querying Assessments table with id = '${id}'`)
    
    try {
      // Use a simple direct query first
      const { data, error } = await supabase
        .from('Assessments')
        .select('assessmentData, cvText')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching assessment:", error.message);
        
        // Try as text search as fallback
        console.log("Trying text search as fallback");
        const { data: textData, error: textError } = await supabase
          .from('Assessments')
          .select('assessmentData, cvText')
          .filter('id', 'ilike', `%${id}%`)
          .limit(1)
          .single();
        
        if (textError) {
          console.error("Text search also failed:", textError.message);
          
          // Try raw SQL as a last resort
          console.log("Trying raw SQL query as final attempt");
          const { data: rawData, error: rawError } = await supabase
            .rpc('get_assessment_by_text_id', { id_text: id });
            
          if (rawError || !rawData) {
            console.error("Raw SQL query failed:", rawError?.message);
            return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
          }
          
          console.log("Found assessment using raw SQL");
          return processResponse(rawData);
        }
        
        console.log("Found assessment using text search");
        return processResponse(textData);
      }
      
      console.log("Found assessment using direct query");
      return processResponse(data);
    } catch (error) {
      console.error("Error fetching from Supabase:", error);
      return NextResponse.json({ 
        error: "Failed to fetch assessment",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Assessment retrieval error:", error);
    return NextResponse.json({ error: "Failed to process assessment request" }, { status: 500 });
  }
}

// Helper function to process the response
function processResponse(data: any) {
  // Check if we have assessmentData
  if (!data || !data.assessmentData) {
    console.log("No assessmentData found in record:", data);
    return NextResponse.json({ error: "Assessment data not available" }, { status: 404 });
  }

  console.log("Successfully processed assessmentData, keys:", 
    Object.keys(data.assessmentData),
    "cvText length:", data.cvText ? data.cvText.length : 0);

  // Return the raw assessmentData with success flag
  return NextResponse.json({
    success: true,
    assessment: data.assessmentData
  });
}

// Helper function for the assessment processing logic
async function processAssessment(id: string, storedData: any, request: NextRequest) {
  // This contains the assessment generation logic from your current route handler
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get('email') || request.cookies.get('userEmail')?.value;
  
  const assessment = await assessSkills(storedData.text, email)
  
  const assessmentWithCVText = {
    ...assessment,
    cvText: storedData.text,
  };
  
  assessmentStorage.set(id, { ...storedData, assessment: assessmentWithCVText })
  
  return NextResponse.json({
    success: true,
    assessment: assessmentWithCVText,
    backendAssessmentId: assessment.backendAssessmentId
  })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id.trim();
    const body = await request.json();
    const userId = body.userId;
    
    // Fetch the CV text directly from Supabase using multiple approaches
    console.log(`Trying to fetch CV text for assessment ID: ${id}`);
    
    let cvText = null;
    
    // Try direct query first
    const { data: directData, error: directError } = await supabase
      .from('Assessments')
      .select('cvText')
      .eq('id', id)
      .single();
    
    if (!directError && directData && directData.cvText) {
      cvText = directData.cvText;
    }
    
    // If that fails, try with text search
    if (!cvText) {
      const { data: textData, error: textError } = await supabase
        .from('Assessments')
        .select('cvText')
        .filter('id', 'ilike', `%${id}%`)
        .single();
      
      if (!textError && textData && textData.cvText) {
        cvText = textData.cvText;
      }
    }
    
    if (!cvText) {
      return NextResponse.json({ error: "CV text not found for this assessment" }, { status: 404 });
    }
    
    console.log("Successfully retrieved CV text, length:", cvText.length);
    
    // Generate assessment using the CV text from Supabase
    const assessment = await assessSkills(cvText, userId);
    
    return NextResponse.json({
      success: true,
      assessment: { ...assessment, cvText },
      backendAssessmentId: assessment.backendAssessmentId
    });
  } catch (error) {
    console.error("Assessment error:", error);
    return NextResponse.json({ error: "Assessment failed" }, { status: 500 });
  }
}
