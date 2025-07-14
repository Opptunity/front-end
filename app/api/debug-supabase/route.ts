import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log("=== SUPABASE CONFIGURATION CHECK ===");
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Supabase URL:", supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "MISSING");
    console.log("Supabase Anon Key:", supabaseAnonKey ? `${supabaseAnonKey.substring(0, 30)}...` : "MISSING");
    console.log("URL exists:", !!supabaseUrl);
    console.log("Key exists:", !!supabaseAnonKey);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseAnonKey: !!supabaseAnonKey,
          environment: process.env.NODE_ENV
        }
      }, { status: 500 });
    }
    
    // Test basic connectivity
    console.log("Testing Supabase connectivity...");
    const { data, error } = await supabase
      .from('Assessments')
      .select('id')
      .limit(1);
    
    console.log("Connection test result:");
    console.log("- Data:", data);
    console.log("- Error:", error);
    
    if (error) {
      console.log("Connection error details:");
      console.log("- Message:", error.message);
      console.log("- Code:", error.code);
      console.log("- Details:", error.details);
      
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        errorDetails: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        },
        config: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
          urlDomain: supabaseUrl?.split('.')[0] || 'unknown'
        }
      }, { status: 500 });
    }
    
    // Test insert capability
    console.log("Testing insert capability...");
    const testData = {
      userId: null,
      name: 'Test Assessment',
      summary: 'Test summary',
      industry: 'Test',
      score: 85,
      cv_text: 'Test CV text'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('Assessments')
      .insert(testData)
      .select()
      .single();
    
    // Clean up test record if successful
    if (insertData && !insertError) {
      await supabase
        .from('Assessments')
        .delete()
        .eq('id', insertData.id);
    }
    
    return NextResponse.json({
      success: true,
      message: "Supabase configuration is working correctly",
      details: {
        environment: process.env.NODE_ENV,
        connectionTest: "PASSED",
        insertTest: insertError ? "FAILED" : "PASSED",
        insertError: insertError || null,
        tableExists: true,
        config: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
          urlDomain: supabaseUrl?.split('.')[0] || 'unknown'
        }
      }
    });
    
  } catch (error) {
    console.error("Diagnostic endpoint error:", error);
    return NextResponse.json({
      success: false,
      error: "Diagnostic test failed",
      details: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : "Unknown error"
    }, { status: 500 });
  }
} 