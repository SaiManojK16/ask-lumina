import { OpenAI } from 'openai';
import { supabase } from './supabase.js';
import { luminaInfo } from '@/data/luminaInfo.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to clean and format text
function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

// Function to chunk content into meaningful sections
function chunkContent() {
  const chunks = [];

  // Consolidate all product information into single, comprehensive chunks
  luminaInfo.products.forEach(product => {
    const productChunk = {
      content: cleanText(`
        Product Overview: ${product.name}
        
        Basic Specifications:
        - Gain: ${product.gain}
        - Material: ${product.material}
        - Surface: ${product.surface}
        - Projection Type: ${product.projectionType || 'Not specified'}
        
        Detailed Description:
        ${product.description || 'No detailed description available'}
        
        Key Features:
        ${product.keyFeatures ? product.keyFeatures.map(feature => `- ${feature}`).join('\n') : 'No specific features listed'}
        
        Product Specifications:
        ${product.productSpecs ? product.productSpecs.map(spec => `- ${spec}`).join('\n') : 'No additional specifications'}
        
        Unique Selling Points:
        ${product.features ? product.features.map(feature => 
          `${feature.title}: ${Array.isArray(feature.details) ? feature.details.join(', ') : feature.details}`
        ).join('\n') : 'No specific unique selling points'}
        
        Why Choose This Product:
        ${product.whyChooseThis ? 
          (Array.isArray(product.whyChooseThis) ? 
            product.whyChooseThis.map(point => `- ${point}`).join('\n') : 
            product.whyChooseThis
          ) : 'No specific reasons provided'}
      `),
      metadata: { 
        type: 'product_comprehensive',
        name: product.name,
        sections: ['overview', 'specs', 'features', 'usp']
      }
    };

    chunks.push(productChunk);
  });

  // Keep other existing chunks for context
  // Company Overview and Basic Information
  chunks.push({
    content: cleanText(`
      Company Overview: ${luminaInfo.companyOverview}
      About Us: ${luminaInfo.aboutUs}
      Our Journey: ${luminaInfo.ourJourney}
      Vision: ${luminaInfo.vision}
      Mission: ${luminaInfo.mission}
    `),
    metadata: { 
      type: 'company_info',
      sections: ['overview', 'about', 'journey', 'vision', 'mission']
    }
  });

  // Innovation and Legacy
  chunks.push({
    content: cleanText(`
      Commitment to Innovation: ${luminaInfo.commitmentToInnovation}
      Our Legacy: ${luminaInfo.ourLegacy}
      Product Introduction: ${luminaInfo.productIntroduction}
    `),
    metadata: { 
      type: 'company_values',
      sections: ['innovation', 'legacy', 'products_intro']
    }
  });

  // Unique Selling Points
  luminaInfo.uniqueSellingPoints.forEach(usp => {
    chunks.push({
      content: cleanText(`
        USP: ${usp.title}
        Details: ${Array.isArray(usp.details) ? 
          usp.details.map(detail => 
            Array.isArray(detail) ? detail.join('\n') : detail
          ).join('\n') 
          : usp.details}
      `),
      metadata: { 
        type: 'usp',
        title: usp.title
      }
    });
  });

  // Key Features
  chunks.push({
    content: cleanText(`
      Key Features of Lumina Screens:
      ${luminaInfo.keyFeatures.join('\n')}
    `),
    metadata: { 
      type: 'features',
      sections: ['key_features']
    }
  });

  // Market Presence
  luminaInfo.marketPresence.forEach(market => {
    chunks.push({
      content: cleanText(`
        Market Aspect: ${market.title}
        Details: ${Array.isArray(market.details) ? market.details.map(detail => 
          Array.isArray(detail) ? detail.join('\n') : detail
        ).join('\n') : market.details}
      `),
      metadata: { 
        type: 'market_presence',
        aspect: market.title
      }
    });
  });

  // Warranty and Support Information
  chunks.push({
    content: cleanText(`
      Warranty Information:
      ${luminaInfo.warrantyInfo}

      Training and Support:
      ${luminaInfo.trainingAndSupport}
    `),
    metadata: { 
      type: 'support',
      sections: ['warranty', 'training']
    }
  });

  // Benefits and Technical Specs
  chunks.push({
    content: cleanText(`
      Benefits:
      ${luminaInfo.benefits.join('\n')}
      Technical Specifications:
      ${luminaInfo.technicalSpecs.join('\n')}
    `),
    metadata: { 
      type: 'benefits_and_specs',
      sections: ['benefits', 'technical_specs']
    }
  });

  // Contact Information
  chunks.push({
    content: cleanText(`
      Lumina Screens - Contact Information

      Company Headquarters:
      Address: ${luminaInfo.contactInformation.address}
      
      Communication Channels:
      - Email: ${luminaInfo.contactInformation.email}
      - Phone: ${luminaInfo.contactInformation.phone}
      - Website: ${luminaInfo.contactInformation.website}

      Social Media Presence:
      - Facebook: ${luminaInfo.contactInformation.facebook}
      - Instagram: ${luminaInfo.contactInformation.instagram}
      - LinkedIn: ${luminaInfo.contactInformation.linkein}
      - YouTube: ${luminaInfo.contactInformation.youtube}

      Customer Support:
      - For product inquiries and support, please use the contact details above
      - Business Hours: ${luminaInfo.businessHours || ''}

      Additional Contact Notes:
      - Global Reach: Headquartered in Mumbai, India
      - International Presence: Serving customers worldwide
    `),
    metadata: { 
      type: 'contact',
      sections: ['headquarters', 'communication', 'social_media', 'support']
    }
  });

  return chunks;
}

// Function to create and store embeddings
export async function createAndStoreEmbeddings() {
  try {
    // Clear existing embeddings
    await supabase
      .from('lumina_embeddings')
      .delete()
      .neq('id', 0); // Delete all records

    const chunks = chunkContent();
    console.log(`Created ${chunks.length} chunks of content`);

    for (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunk.content,
      });

      await supabase
        .from('lumina_embeddings')
        .insert({
          content: chunk.content,
          embedding: embedding.data[0].embedding,
          metadata: chunk.metadata
        });
    }

    console.log('Successfully stored all embeddings');
  } catch (error) {
    console.error('Error in createAndStoreEmbeddings:', error);
    throw error;
  }
}

// Function to search relevant content
export async function searchRelevantContent(query) {
  try {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    });

    const { data: matches, error } = await supabase.rpc('match_embeddings', {
      query_embedding: embedding.data[0].embedding,
      match_threshold: 0.5, // Lowered threshold to include more matches
      match_count: 70 // Increased to retrieve more content
    });

    if (error) throw error;

    // Filter and prioritize matches
    const productMatches = matches.filter(match => 
      match.metadata && 
      (match.metadata.type === 'product_comprehensive' || 
       match.metadata.type === 'product_feature' ||
       match.metadata.type === 'contact')
    );

    // If no product matches, return all matches
    const finalMatches = productMatches.length > 0 ? productMatches : matches;

    // Ensure contact information is always included if available
    const contactMatches = matches.filter(match => 
      match.metadata && match.metadata.type === 'contact'
    );

    // Combine matches, prioritizing product and contact information
    const combinedMatches = [
      ...productMatches,
      ...(contactMatches.length > 0 ? contactMatches : [])
    ];

    return combinedMatches.map(match => ({
      content: match.content,
      similarity: match.similarity,
      metadata: match.metadata
    })).slice(0, 10); // Limit to top 10 matches
  } catch (error) {
    console.error('Error in searchRelevantContent:', error);
    throw error;
  }
}

// Function to get content by type
export async function getContentByType(type) {
  const { data, error } = await supabase
    .from('lumina_embeddings')
    .select('*')
    .eq('metadata->>type', type);

  if (error) throw error;
  return data;
}
