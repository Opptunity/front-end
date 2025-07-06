import { NextResponse } from 'next/server';
import { 
  engineerSupabase, 
  testConnection 
} from '@/lib/supabase-engineer';

export async function GET() {
  try {
    console.log('Fetching all engineers list');

    // Check if Engineer Supabase is available
    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    // Fetch all engineers with basic info
    const { data: engineersData, error: engineersError } = await engineerSupabase
      .from('ingenieurs')
      .select('ingenieur_id, prenom, nom, email, equipe_id')
      .order('ingenieur_id', { ascending: false });

    if (engineersError) {
      console.error('Error fetching engineers:', engineersError);
      return NextResponse.json(
        { error: 'Failed to fetch engineers' },
        { status: 500 }
      );
    }

    // Format the response
    const engineers = engineersData?.map(engineer => ({
      id: engineer.ingenieur_id,
      name: `${engineer.prenom} ${engineer.nom}`.trim(),
      email: engineer.email,
      equipe_id: engineer.equipe_id
    })) || [];

    return NextResponse.json({
      engineers,
      total: engineers.length
    });

  } catch (error) {
    console.error('Error in engineers list endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch engineers list', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 