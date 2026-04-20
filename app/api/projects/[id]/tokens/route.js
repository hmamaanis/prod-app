import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req, { params }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('crew_access_tokens')
    .select('*')
    .eq('project_id', id)
    .order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const { crew_member_id, crew_type, name, role, visible_tabs } = body;

  const { data, error } = await supabase
    .from('crew_access_tokens')
    .insert({ project_id: id, crew_member_id, crew_type, name, role, visible_tabs })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
