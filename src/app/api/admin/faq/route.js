import { supabase } from '@/utils/supabase';
import { NextResponse } from 'next/server';

// GET all FAQs
export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('id');

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching FAQs' },
      { status: 500 }
    );
  }
}

// POST new FAQ
export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('faqs')
      .insert([body])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating FAQ' },
      { status: 500 }
    );
  }
}

// PUT update FAQ
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data, error } = await supabase
      .from('faqs')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating FAQ' },
      { status: 500 }
    );
  }
}

// DELETE FAQ
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting FAQ' },
      { status: 500 }
    );
  }
}
