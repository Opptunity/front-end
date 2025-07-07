import { NextRequest, NextResponse } from 'next/server';
import { assessmentStorage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    // First try to get from local assessment storage
    const localData = assessmentStorage.get(id);
    if (localData && localData.text) {
      return NextResponse.json({ 
        text: localData.text,
        source: 'local_storage'
      });
    }

    // If not found locally, try to get from Supabase
    const { data, error } = await supabase
      .from('cv_data')
      .select('original_text')
      .eq('id', id)
      .single();

    if (error) {
      // If not found by primary ID, try looking up by local_id
      const { data: dataByLocalId, error: localIdError } = await supabase
        .from('cv_data')
        .select('original_text')
        .eq('local_id', id)
        .single();

      if (localIdError) {
        return NextResponse.json(
          { error: 'Text not found for the provided ID' },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        text: dataByLocalId.original_text,
        source: 'supabase_by_local_id'
      });
    }

    return NextResponse.json({ 
      text: data.original_text,
      source: 'supabase' 
    });
  } catch (error) {
    console.error('Error retrieving text:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve text' },
      { status: 500 }
    );
  }
} 