import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(_, { params }) {
  const { data, error } = await supabase
    .from('lighting_setups')
    .select('*')
    .eq('project_id', params.id)
    .order('label_id');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req, { params }) {
  const body = await req.json();
  const { data, error } = await supabase
    .from('lighting_setups')
    .insert({ ...body, project_id: params.id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
