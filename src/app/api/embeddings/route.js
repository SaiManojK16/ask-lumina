import { createAndStoreEmbeddings } from '@/utils/embeddings';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, action } = body;
    
    if (!type && action === 'rebuild-all') {
      // Process all content types
      console.log('Starting full embeddings rebuild...');
      const types = ['products', 'faqs', 'regional_support', 'company_info'];
      
      for (const contentType of types) {
        console.log(`Processing ${contentType}...`);
        await createAndStoreEmbeddings({ type: contentType, rebuild: true });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'All embeddings rebuilt successfully' 
      });
    }
    
    if (!type) {
      throw new Error('Type is required unless performing rebuild-all');
    }
    
    console.log(`Starting embeddings ${action} for ${type}...`);
    
    switch (action) {
      case 'create':
      case 'update':
      case 'rebuild':
        await createAndStoreEmbeddings({ type, rebuild: action === 'rebuild' });
        break;
      case 'delete':
        await deleteEmbeddings({ type });
        break;
      default:
        throw new Error('Invalid action specified');
    }

    console.log('Successfully processed embeddings!');
    return NextResponse.json({ 
      success: true, 
      message: `Embeddings ${action} successful for ${type}` 
    });
  } catch (error) {
    console.error('Error creating embeddings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
