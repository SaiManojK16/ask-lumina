import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { luminaInfo } from '@/data/luminaInfo';
import { products } from '@/data/products';
import { regionalSupport } from '@/data/regionalSupport';
import { faqs } from '@/data/faq';

export async function POST(req) {
  try {

    // No need to create tables - they should be created via Supabase dashboard
    console.log('Starting data migration...');

    // Migrate company info
    const companyInfoData = [
      { key: 'company_overview', content: luminaInfo.companyOverview },
      { key: 'about_us', content: luminaInfo.aboutUs },
      { key: 'our_journey', content: luminaInfo.ourJourney },
      { key: 'vision', content: luminaInfo.vision },
      { key: 'commitment_to_innovation', content: luminaInfo.commitmentToInnovation },
      { key: 'our_legacy', content: luminaInfo.ourLegacy },
      { key: 'mission', content: luminaInfo.mission },
      { key: 'product_introduction', content: luminaInfo.productIntroduction },
      { key: 'key_features', content: JSON.stringify(luminaInfo.keyFeatures) },
      { key: 'benefits', content: JSON.stringify(luminaInfo.benefits) },
      ...luminaInfo.uniqueSellingPoints.map((usp, index) => ({
        key: `usp_${index + 1}`,
        content: JSON.stringify({
          title: usp.title,
          details: usp.details
        })
      })),
      ...luminaInfo.marketPresence.map((mp, index) => ({
        key: `market_presence_${index + 1}`,
        content: JSON.stringify({
          title: mp.title,
          details: mp.details
        })
      }))
    ];

    await supabase.from('company_info').delete().neq('id', 0);
    await supabase.from('company_info').upsert(companyInfoData);
    console.log('Migrated company info');

    // Migrate products
    const productsData = products.map(product => ({
      name: product.name,
      gain: product.gain,
      material: product.material,
      surface: product.surface,
      projection_type: product.projectionType,
      description: product.description,
      product_specs: product.productSpecs,
      features: product.features?.map(f => ({
        title: f.title,
        details: f.details
      })),
      why_choose_this: product.whyChooseThis
    }));

    await supabase.from('products').delete().neq('id', 0);
    await supabase.from('products').upsert(productsData);
    console.log('Migrated products');

    // Migrate regional support
    const regionalSupportData = regionalSupport.map(support => ({
      name: support.name,
      designation: support.designation,
      contact_number: support.contact_number,
      email: support.email,
      regions: support.regions,
      cities: support.cities
    }));

    await supabase.from('regional_support').delete().neq('id', 0);
    await supabase.from('regional_support').upsert(regionalSupportData);
    console.log('Migrated regional support');

    // Migrate FAQs
    const faqsData = faqs.map(faq => ({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      tags: faq.tags
    }));

    await supabase.from('faqs').delete().neq('id', 0);
    await supabase.from('faqs').upsert(faqsData);
    console.log('Migrated FAQs');

    return NextResponse.json({
      success: true,
      message: 'Database setup and migration completed successfully'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
