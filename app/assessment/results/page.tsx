"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AssessmentResults from "@/components/assessment/assessment-results";
import { assessSkills } from "@/lib/skills-assessment";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchAssessment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching assessment with ID:", id);
      const response = await fetch(`/api/assessment-report/${id}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to fetch assessment: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Assessment data received:", {
        hasData: !!data,
        dataType: typeof data,
        dataKeys: data ? Object.keys(data) : [],
        hasSummary: data?.summary ? true : false,
        hasTechnicalSkills: data?.technicalSkills ? true : false,
        summary: data?.summary?.substring(0, 50)
      });
      setAssessment(data);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      setError("Failed to load assessment data. Please try again.");
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    // Get userId from localStorage
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      setError("User not authenticated. Please log in again.");
      setRetrying(false);
      return;
    }
    
    try {
      // First get the assessment to get the cvText
      const response = await fetch(`/api/assessment-report/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch assessment details");
      }
      
      const data = await response.json();

      console.log("Retrieved assessment for retry:", {
        hasData: !!data,
        hasCvText: !!data.cvText,
        cvTextLength: data.cvText ? data.cvText.length : 0
      });
      
      if (!data.cvText) {
        setError("CV text not found in the assessment. Please upload your CV again.");
        setRetrying(false);
        return;
      }
      
      // Make a POST request to the assess API to regenerate the assessment
      const regenerateResponse = await fetch(`/api/assess/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      
      if (!regenerateResponse.ok) {
        throw new Error("Failed to regenerate assessment");
      }
      
      const regenerateResult = await regenerateResponse.json();
      
      if (regenerateResult.success) {
        // Refresh the assessment data
        fetchAssessment();
      } else {
        throw new Error(regenerateResult.error || "Failed to regenerate assessment");
      }
    } catch (error) {
      console.error("Error retrying assessment:", error);
      setError("Failed to retry assessment. Please try again.");
      setRetrying(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAssessment();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-semibold">Loading assessment results...</h2>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto p-6">
        <div className="w-full p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Assessment not found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The requested assessment could not be found or may have expired."}
          </p>
          <Button
            onClick={handleRetry}
            disabled={retrying}
            className="flex items-center gap-2"
          >
            {retrying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Retrying Assessment...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Retry Assessment
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Skills Assessment Results</h1>
      <h2 className="text-xl text-gray-600 mb-8 text-center">
        AI-powered analysis of your professional profile
      </h2>
      
      {assessment && (
        <>
          <AssessmentResults data={assessment} />
          
          {/* Debug Info Panel */}
          <Card className="mt-6 border-dashed border-red-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                Debug Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs overflow-auto max-h-96">
              <div>
                <h3 className="font-bold mb-1">Raw Skill Gaps:</h3>
                <pre className="bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(assessment.skillGapAnalysis?.criticalGaps, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-bold mb-1">Technical Skills:</h3>
                <pre className="bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(assessment.technicalSkills, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-bold mb-1">All Assessment Data Keys:</h3>
                <pre className="bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(Object.keys(assessment), null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-bold mb-1">All Assessment Data:</h3>
                <pre className="bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(assessment, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 