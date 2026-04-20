import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req, { params }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('schedule_days')
    .select('*')
    .eq('project_id', id)
    .order('day_number');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const { shoot_date, day_number, scene_ids, call_time, wrap_time, location, notes } = body;

  const { data, error } = await supabase
    .from('schedule_days')
    .insert({ project_id: id, shoot_date, day_number, scene_ids, call_time, wrap_time, location, notes })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
