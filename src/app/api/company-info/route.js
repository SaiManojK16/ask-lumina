import { supabase } from '@/utils/supabase';
import { NextResponse } from 'next/server';
import { createAndStoreEmbeddings, deleteEmbeddings } from '@/utils/embeddings';

const CONTENT_TYPE = 'company_info';

// GET all company info or a specific one by ID
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    let query = supabase.from(CONTENT_TYPE).select('*');
    
    if (id) {
      query = query.eq('id', id);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST new company info
export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Creating new company info with body:', body);
    
    // Insert into company_info table
    const { data, error } = await supabase
      .from(CONTENT_TYPE)
      .insert(body)
      .select();
    
    if (error) throw error;
    
    console.log('Successfully inserted company info:', data);
    
    // Create embeddings for the new company info
    if (data && data.length > 0) {
      const ids = data.map(item => item.id);
      console.log('Creating embeddings for ids:', ids);
      try {
        await createAndStoreEmbeddings({ 
          type: CONTENT_TYPE, 
          ids
        });
        console.log('Successfully created embeddings for company info');
      } catch (embeddingError) {
        console.error('Error creating embeddings:', embeddingError);
        // Continue execution even if embedding creation fails
      }
    } else {
      console.warn('No data returned after insert, skipping embedding creation');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Company info created successfully',
      data
    });
  } catch (error) {
    console.error('Error creating company info:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT/update company info
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required for updates' },
        { status: 400 }
      );
    }
    
    // Update in company_info table
    const { data, error } = await supabase
      .from(CONTENT_TYPE)
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    // Update embeddings for the modified company info
    if (data && data.length > 0) {
      // Delete existing embeddings for this ID
      await deleteEmbeddings({ 
        type: CONTENT_TYPE, 
        ids: [id]
      });
      
      // Create new embeddings
      await createAndStoreEmbeddings({ 
        type: CONTENT_TYPE, 
        ids: [id]
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Company info updated successfully',
      data
    });
  } catch (error) {
    console.error('Error updating company info:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE company info
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required for deletion' },
        { status: 400 }
      );
    }
    
    // Delete from company_info table
    const { error } = await supabase
      .from(CONTENT_TYPE)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Delete embeddings for this company info
    await deleteEmbeddings({ 
      type: CONTENT_TYPE, 
      ids: [id]
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Company info deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting company info:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
