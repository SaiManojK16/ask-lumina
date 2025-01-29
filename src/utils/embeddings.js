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

  // Process each product separately
  luminaInfo.products.forEach(product => {
    // Main product information
    chunks.push({
      content: cleanText(`
        Product: ${product.name}
        Gain: ${product.gain}
        Material: ${product.material}
        Surface: ${product.surface}
        Projection Type: ${product.projectionType}
        Description: ${product.description}
        ${product.keyFeatures ? `Key Features:\n${product.keyFeatures.join('\n')}` : ''}
        ${product.productSpecs ? `Product Specifications:\n${product.productSpecs.join('\n')}` : ''}
      `),
      metadata: { 
        type: 'product',
        name: product.name,
        sections: ['basic_info', 'features', 'specs']
      }
    });

    // Detailed features if available
    if (product.features && product.features.length > 0) {
      product.features.forEach(feature => {
        chunks.push({
          content: cleanText(`
            Product: ${product.name}
            Feature: ${feature.title}
            Details: ${Array.isArray(feature.details) ? feature.details.map(detail => 
              Array.isArray(detail) ? detail.join('\n') : detail
            ).join('\n') : feature.details}
          `),
          metadata: { 
            type: 'product_feature',
            product: product.name,
            feature: feature.title
          }
        });
      });
    }

    // Why Choose This section if available
    if (product.whyChooseThis && product.whyChooseThis.length > 0) {
      chunks.push({
        content: cleanText(`
          Product: ${product.name}
          Why Choose This Product:
          ${Array.isArray(product.whyChooseThis) ? product.whyChooseThis.map(detail => 
            Array.isArray(detail) ? detail.join('\n') : detail
          ).join('\n') : product.whyChooseThis}
        `),
        metadata: { 
          type: 'product_benefits',
          product: product.name
        }
      });
    }
  });

  // Process Unique Selling Points
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
      Contact Information:
      Address: ${luminaInfo.contactInformation.address}
      Email: ${luminaInfo.contactInformation.email}
      Phone: ${luminaInfo.contactInformation.phone}
      Website: ${luminaInfo.contactInformation.website}
      Social Media:
      Facebook: ${luminaInfo.contactInformation.facebook}
      Instagram: ${luminaInfo.contactInformation.instagram}
      LinkedIn: ${luminaInfo.contactInformation.linkein}
      YouTube: ${luminaInfo.contactInformation.youtube}
    `),
    metadata: { 
      type: 'contact',
      sections: ['contact_info', 'social_media']
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
      match_threshold: 0.7, // Adjust this threshold as needed
      match_count: 5 // Adjust the number of matches as needed
    });

    if (error) throw error;

    return matches.map(match => ({
      content: match.content,
      similarity: match.similarity,
      metadata: match.metadata
    }));
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
