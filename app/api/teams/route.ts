import { NextRequest, NextResponse } from 'next/server';
import { getAllTeams, testConnection } from '@/lib/supabase-engineer';

export async function GET(request: NextRequest) {
  try {
    // Check if Engineer Supabase is available
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.warn('Engineer Supabase not available, returning default teams');
      // Return fallback teams if database is not available
      return NextResponse.json([
        { equipe_id: 1, nom_equipe: 'Core Engineering' },
        { equipe_id: 2, nom_equipe: 'Frontend Specialists' },
        { equipe_id: 3, nom_equipe: 'Data & AI' },
        { equipe_id: 4, nom_equipe: 'Cloud & DevOps' }
      ]);
    }

    // Fetch teams from database
    const teams = await getAllTeams();
    
    return NextResponse.json(teams);

  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
