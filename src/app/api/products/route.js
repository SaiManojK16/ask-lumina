import { supabase } from '@/utils/supabase';
import { NextResponse } from 'next/server';
import { createAndStoreEmbeddings, deleteEmbeddings } from '@/utils/embeddings';

const CONTENT_TYPE = 'products';

// GET all products or a specific one by ID
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    let query = supabase.from(CONTENT_TYPE).select(`
      id,
      name,
      gain,
      material,
      surface,
      projection_type,
      description,
      product_specs,
      features,
      why_choose_this,
      technical_datasheet
    `);
    
    if (id) {
      query = query.eq('id', id);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST new product
export async function POST(req) {
  try {
    const body = await req.json();
    
    // Insert into products table
    const { data, error } = await supabase
      .from(CONTENT_TYPE)
      .insert(body)
      .select();
    
    if (error) throw error;
    
    // Create embeddings for the new product
    if (data && data.length > 0) {
      const ids = data.map(item => item.id);
      await createAndStoreEmbeddings({ 
        type: CONTENT_TYPE, 
        ids
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product created successfully',
      data
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT/update product
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
    
    // Update in products table
    const { data, error } = await supabase
      .from(CONTENT_TYPE)
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    // Update embeddings for the modified product
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
      message: 'Product updated successfully',
      data
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE product
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
    
    // Delete from products table
    const { error } = await supabase
      .from(CONTENT_TYPE)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Delete embeddings for this product
    await deleteEmbeddings({ 
      type: CONTENT_TYPE, 
      ids: [id]
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
