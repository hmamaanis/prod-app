import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req, { params }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('scenes')
    .select('*')
    .eq('project_id', id)
    .order('sort_order')
    .order('scene_number');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const {
    scene_number, synopsis, location, int_ext, day_night,
    pages, cast_ids, props, wardrobe, sfx, notes, sort_order,
  } = body;

  const { data, error } = await supabase
    .from('scenes')
    .insert({
      project_id: id,
      scene_number, synopsis, location, int_ext, day_night,
      pages, cast_ids, props, wardrobe, sfx, notes, sort_order,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
