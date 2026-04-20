import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(req, { params }) {
  const { tid } = await params;
  const body = await req.json();
  const { visible_tabs } = body;

  const { data, error } = await supabase
    .from('crew_access_tokens')
    .update({ visible_tabs })
    .eq('id', tid)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req, { params }) {
  const { tid } = await params;
  const { error } = await supabase
    .from('crew_access_tokens')
    .delete()
    .eq('id', tid);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
