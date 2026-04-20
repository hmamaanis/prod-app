import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req, { params }) {
  const { token } = await params;

  const { data: tokenRow, error: tokenError } = await supabase
    .from('crew_access_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (tokenError || !tokenRow) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title, kind, day_current, day_total, status')
    .eq('id', tokenRow.project_id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({
    token: tokenRow.token,
    name: tokenRow.name,
    role: tokenRow.role,
    visible_tabs: tokenRow.visible_tabs,
    crew_member_id: tokenRow.crew_member_id,
    crew_type: tokenRow.crew_type,
    project,
  });
}
