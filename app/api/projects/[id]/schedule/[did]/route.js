import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(req, { params }) {
  const { did } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from('schedule_days')
    .update(body)
    .eq('id', did)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req, { params }) {
  const { did } = await params;
  const { error } = await supabase
    .from('schedule_days')
    .delete()
    .eq('id', did);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
