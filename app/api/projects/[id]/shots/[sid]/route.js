import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  const body = await req.json();
  const { data, error } = await supabase
    .from('shots')
    .update(body)
    .eq('id', params.sid)
    .eq('project_id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_, { params }) {
  const { error } = await supabase
    .from('shots')
    .delete()
    .eq('id', params.sid)
    .eq('project_id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
