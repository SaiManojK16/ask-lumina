import { createAndStoreEmbeddings } from '@/utils/embeddings';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    console.log('Starting embeddings creation...');
    await createAndStoreEmbeddings();
    console.log('Successfully created embeddings!');
    return NextResponse.json({ success: true, message: 'Embeddings created successfully' });
  } catch (error) {
    console.error('Error creating embeddings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
