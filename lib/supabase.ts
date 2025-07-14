import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type for the cv_data table based on your schema
export type CvData = {
  id: string
  email: string
  original_text: string
  parsed_data: any
  assessment_results: any
  file_name: string
  file_type: string
  createdAt?: string
  updatedAt?: string
}

// Function to get CV data by ID
export async function getCVDataById(id: string) {
  const { data, error } = await supabase
    .from('cv_data')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching CV data:', error)
    return null
  }
  
  return data
}

// Function to update assessment results
export async function updateAssessmentResults(id: string, results: any) {
  const { error } = await supabase
    .from('cv_data')
    .update({ 
      assessment_results: results,
      updatedAt: new Date().toISOString()
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating assessment results:', error)
    return false
  }
  
  return true
}

// Function to update parsed data
export async function updateParsedData(id: string, parsedData: any) {
  const { error } = await supabase
    .from('cv_data')
    .update({ 
      parsed_data: parsedData,
      updatedAt: new Date().toISOString()
    })
    .eq('id', id)
  
  if (error) {
    console.error('Error updating parsed data:', error)
    return false
  }
  
  return true
}

// Function to update email for an assessment
export async function updateEmailForAssessment(id: string, email: string) {
  // First try to get the Supabase UUID if we were given a local ID
  const supabaseId = await getSupabaseId(id)
  const finalId = supabaseId || id
  
  // Check if the record exists first
  const { data: existingData, error: fetchError } = await supabase
    .from('cv_data')
    .select('id')
    .eq('id', finalId)
    .single()
  
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error('Error checking CV data:', fetchError)
    throw fetchError
  }
  
  // If record exists, update it
  if (existingData) {
    const { error } = await supabase
      .from('cv_data')
      .update({ 
        email: email,
        updatedAt: new Date().toISOString()
      })
      .eq('id', finalId)
    
    if (error) {
      console.error('Error updating email:', error)
      throw error
    }
  } 
  // If record doesn't exist, create it
  else {
    const { error } = await supabase
      .from('cv_data')
      .insert({ 
        id: finalId,
        local_id: id, // Store the local ID as well
        email: email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error inserting email:', error)
      throw error
    }
  }
  
  return true
}

// Function to get Supabase UUID from local ID
export async function getSupabaseId(localId: string): Promise<string | null> {
  // Try to get from localStorage first (client-side only)
  if (typeof window !== 'undefined') {
    try {
      const storedId = localStorage.getItem(`supabase_id_${localId}`)
      if (storedId) return storedId
    } catch (e) {
      console.warn("Could not retrieve Supabase ID from localStorage:", e)
    }
  }
  
  // If not in localStorage or running on server, query the database
  try {
    const { data, error } = await supabase
      .from('cv_data')
      .select('id')
      .eq('local_id', localId)
      .single()
    
    if (error) {
      console.warn("Could not retrieve Supabase ID from database:", error)
      return null
    }
    
    return data?.id || null
  } catch (e) {
    console.warn("Error retrieving Supabase ID:", e)
    return null
  }
} 