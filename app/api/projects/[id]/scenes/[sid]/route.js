import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(req, { params }) {
  const { sid } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from('scenes')
    .update(body)
    .eq('id', sid)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req, { params }) {
  const { sid } = await params;
  const { error } = await supabase
    .from('scenes')
    .delete()
    .eq('id', sid);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
