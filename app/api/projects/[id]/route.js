import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(_, { params }) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req, { params }) {
  const body = await req.json();
  const { data, error } = await supabase
    .from('projects')
    .update(body)
    .eq('id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_, { params }) {
  const { error } = await supabase.from('projects').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
