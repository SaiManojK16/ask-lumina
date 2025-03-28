import { OpenAI } from 'openai';
import { supabase } from './supabase.js';
import { luminaInfo } from '@/data/luminaInfo.js';
import { faqs } from '@/data/faq.js';
import { regionalSupport } from '@/data/regionalSupport.js';

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

  // Regional Support Information
  regionalSupport.forEach((person) => {
    const allRegions = Object.values(person.regions).flat();
    const allCities = Object.values(person.cities)
      .flatMap(regionCities => Object.values(regionCities))
      .flat();

    chunks.push({
      content: cleanText(`
        Regional Support Contact

        Name: ${person.name}
        Designation: ${person.designation}
        Contact Number: ${person.contact_number}
        Email: ${person.email}

        Regions Covered:
        ${Object.entries(person.regions)
          .map(([region, areas]) => `${region}: ${areas.join(', ')}`)
          .join('\n')}

        Major Cities:
        ${Object.entries(person.cities)
          .map(([region, cityObj]) => 
            Object.entries(cityObj)
              .map(([state, cities]) => `${state}: ${cities.join(', ')}`)
              .join('\n')
          )
          .join('\n')}
      `),
      metadata: {
        type: 'regional_support',
        name: person.name,
        designation: person.designation,
        regions: allRegions,
        cities: allCities,
        keywords: [
          'regional support',
          'contact',
          person.name.toLowerCase(),
          ...allRegions.map(r => r.toLowerCase()),
          ...allCities.map(c => c.toLowerCase())
        ]
      }
    });
  });

  // Complete Product Overview
  chunks.push({
    content: cleanText(`
      LUMINA SCREENS - COMPLETE PRODUCT LINEUP

      Product Introduction:
      ${luminaInfo.productIntroduction}

      Available Products:
      ${luminaInfo.products.map(product => `
        ${product.name}
        - Gain: ${product.gain}
        - Material: ${product.material}
        - Surface: ${product.surface}
        - Projection Type: ${product.projectionType || 'Not specified'}
        - Brief Overview: ${product.description ? product.description.split('.')[0] + '.' : 'No description available'}
      `).join('\n\n')}
    `),
    metadata: {
      type: 'product_overview',
      sections: ['overview', 'all_products', 'introduction'],
      keywords: [
        'all products',
        'product lineup',
        'available products',
        'product range',
        'screens',
        'projection screens',
        ...luminaInfo.products.map(p => p.name.toLowerCase()),
        ...luminaInfo.products.map(p => p.material.toLowerCase()),
        ...luminaInfo.products.map(p => p.surface.toLowerCase())
      ]
    }
  });

  // FAQ Content
  faqs.forEach((faq, index) => {
    chunks.push({
      content: cleanText(`
        Question: ${faq.question}
        Answer: ${faq.answer}
      `),
      metadata: {
        type: 'faq',
        index: index,
        sections: ['faq', 'questions', 'support'],
        keywords: faq.question.toLowerCase().split(' ')
      }
    });
  });

  // Individual Product Information
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
        sections: ['overview', 'specs', 'features', 'usp'],
        keywords: [
          product.name.toLowerCase(),
          product.gain,
          product.material,
          product.surface,
          product.projectionType,
          'product',
          'screen',
          'specifications',
          'features',
          'technical details',
          'product information'
        ]
      }
    };

    chunks.push(productChunk);
  });

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
      sections: ['overview', 'about', 'journey', 'vision', 'mission'],
      keywords: ['company', 'about', 'overview', 'journey', 'vision', 'mission', 'lumina', 'screens', 'about us']
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
      sections: ['innovation', 'legacy', 'products_intro'],
      keywords: ['innovation', 'legacy', 'technology', 'commitment', 'introduction', 'products']
    }
  });

  // Consolidated Unique Selling Points
  chunks.push({
    content: cleanText(`
      UNIQUE SELLING POINTS OF LUMINA SCREENS

      ${luminaInfo.uniqueSellingPoints.map(usp => `
        ${usp.title}:
        ${Array.isArray(usp.details) ? 
          usp.details.map(detail => `- ${detail}`).join('\n') 
          : usp.details}
      `).join('\n\n')}
    `),
    metadata: { 
      type: 'unique_selling_points',
      sections: ['usp'],
      keywords: [
        'unique selling points',
        'usp',
        'advantages',
        'benefits',
        ...luminaInfo.uniqueSellingPoints.map(usp => usp.title.toLowerCase())
      ]
    }
  });

  // Consolidated Market Presence
  chunks.push({
    content: cleanText(`
      MARKET PRESENCE AND REACH

      ${luminaInfo.marketPresence.map(market => `
        ${market.title}:
        ${Array.isArray(market.details) ? 
          market.details.map(detail => `- ${detail}`).join('\n') 
          : market.details}
      `).join('\n\n')}
    `),
    metadata: { 
      type: 'market_presence',
      sections: ['market', 'presence', 'reach'],
      keywords: [
        'market presence',
        'global reach',
        'distribution',
        'availability',
        'market coverage',
        ...luminaInfo.marketPresence.map(market => market.title.toLowerCase())
      ]
    }
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
      type: 'warranty_and_support',
      sections: ['warranty', 'training'],
      keywords: ['warranty', 'guarantee', 'support', 'training', 'assistance', 'help']
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
      sections: ['benefits', 'technical_specs'],
      keywords: ['benefits', 'advantages', 'technical', 'specifications', 'specs', 'features']
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
      sections: ['headquarters', 'communication', 'social_media', 'support'],
      keywords: ['contact', 'email', 'phone', 'address', 'social media', 'support', 'business hours', 'headquarters', 'global']
    }
  });

  return chunks;
}

// Content types enum for consistency
const CONTENT_TYPES = {
  PRODUCT: 'products',
  FAQ: 'faqs',
  REGIONAL_SUPPORT: 'regional_support',
  COMPANY_INFO: 'company_info'
};
// Function to create and store embeddings
async function fetchDataFromSource(type, ids = null) {
  try {
    let query = supabase.from(type);
    
    // Handle specific queries for different tables
    switch(type) {
      case CONTENT_TYPES.PRODUCT:
        query = query.select(`
          id,
          name,
          gain,
          material,
          surface,
          projection_type,
          description,
          product_specs,
          features,
          why_choose_this
        `);
        break;

      case CONTENT_TYPES.COMPANY_INFO:
        query = query.select('id, key, content');
        break;

      case CONTENT_TYPES.FAQ:
        query = query.select('id, question, answer, category, tags');
        break;

      case CONTENT_TYPES.REGIONAL_SUPPORT:
        query = query.select('id, name, designation, contact_number, email, regions, cities');
        break;

      default:
        throw new Error(`Unsupported content type: ${type}`);
    }
    
    if (ids) {
      query = query.in('id', ids);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${type}:`, error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn(`No data found for type: ${type}`);
      return [];
    }

    return data;
  } catch (error) {
    console.error(`Error in fetchDataFromSource for ${type}:`, error);
    throw error;
  }
}

/**
 * Process data into chunks with embeddings-friendly format
 */
async function processContentToChunks(data, type) {
  switch (type) {
    case CONTENT_TYPES.PRODUCT:
      return data.flatMap(product => [
        // Basic info chunk
        {
          content: `Product: ${product.name}

          ${product.description}

          Specifications:
          - Gain: ${product.gain}
          - Material: ${product.material}
          - Surface: ${product.surface}
          - Projection Type: ${product.projection_type || 'Not specified'}`,
          type: CONTENT_TYPES.PRODUCT,
          source_id: product.id.toString(),
          metadata: {
            name: product.name,
            specs: {
              gain: product.gain,
              material: product.material,
              surface: product.surface
            },
            field: 'basic_info'
          }
        },
        // Product specs chunk
        ...(product.product_specs ? [{
          content: `Product Specifications for ${product.name}:\n${product.product_specs.join('\n')}`,
          type: CONTENT_TYPES.PRODUCT,
          source_id: product.id.toString(),
          metadata: {
            name: product.name,
            field: 'product_specs'
          }
        }] : []),
        // Features chunk
        ...(product.features ? [{
          content: `Features of ${product.name}:\n${product.features.map(f => `${f.title}: ${f.details}`).join('\n')}`,
          type: CONTENT_TYPES.PRODUCT,
          source_id: product.id.toString(),
          metadata: {
            name: product.name,
            field: 'features'
          }
        }] : []),
        // Why choose this chunk
        ...(product.why_choose_this ? [{
          content: `Why Choose ${product.name}:\n${product.why_choose_this.join('\n')}`,
          type: CONTENT_TYPES.PRODUCT,
          source_id: product.id.toString(),
          metadata: {
            name: product.name,
            field: 'why_choose_this'
          }
        }] : [])
      ]);

    case CONTENT_TYPES.FAQ:
      return data.map(faq => ({
        content: `Q: ${faq.question}\nA: ${faq.answer}${faq.category ? `\nCategory: ${faq.category}` : ''}${faq.tags ? `\nTags: ${faq.tags.join(', ')}` : ''}`,
        type: CONTENT_TYPES.FAQ,
          source_id: faq.id.toString(),
          metadata: {
            category: faq.category,
            tags: faq.tags
          }
      }));

    case CONTENT_TYPES.REGIONAL_SUPPORT:
      return data.map(person => ({
        content: `${person.name} - ${person.designation}\nContact: ${person.contact_number}\nEmail: ${person.email}\n\nRegions: ${JSON.stringify(person.regions)}\nCities: ${JSON.stringify(person.cities)}`,
        type: CONTENT_TYPES.REGIONAL_SUPPORT,
          source_id: person.id.toString(),
          metadata: {
            name: person.name,
            designation: person.designation,
            regions: person.regions,
            cities: person.cities
          }
      }));

    case CONTENT_TYPES.COMPANY_INFO:
      return data.map(info => ({
        content: info.content,
        type: CONTENT_TYPES.COMPANY_INFO,
          source_id: info.id.toString(),
          metadata: {
            key: info.key
          }
      }));

    default:
      throw new Error(`Unsupported content type: ${type}`);
  }
}

export async function createAndStoreEmbeddings({ type, ids = null, rebuild = false }) {
  try {
    const BATCH_SIZE = 100;
    const MODEL_VERSION = 'ada-002-v1';
    
    // If rebuilding, delete existing embeddings for the type
    if (rebuild) {
      await supabase
        .from('lumina_embeddings')
        .delete()
        .eq('type', type);
    } else if (ids) {
      // Delete specific embeddings that need updating
      await supabase
        .from('lumina_embeddings')
        .delete()
        .eq('type', type)
        .in('source_id', ids.map(id => id.toString()));
    }

    // Fetch data from source table
    const sourceData = await fetchDataFromSource(type, ids);
    console.log(`Fetched ${sourceData.length} records from ${type}`);
    
    const chunks = await processContentToChunks(sourceData, type);
    console.log('Sample chunk:', chunks[0]);
    
    console.log(`Processing ${chunks.length} chunks for ${type}`);

    // Process in batches
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (chunk) => {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: chunk.content,
        });

        return {
          content: chunk.content,
          embedding: embedding.data[0].embedding,
          type: chunk.type,
          source_id: chunk.source_id,
          metadata: {
            ...chunk.metadata,
            model_version: MODEL_VERSION,
            created_at: new Date().toISOString(),
            token_count: chunk.content.split(' ').length
          }
        };
      });

      const batchResults = await Promise.all(batchPromises);
      // Transform batch results to include type as a top-level column
      // No need to transform since we already have the correct structure
      const transformedResults = batchResults;

      console.log('Inserting batch with sample:', transformedResults[0]);
      const { data, error } = await supabase.from('lumina_embeddings').insert(transformedResults);
      if (error) {
        console.error('Error inserting embeddings:', error);
        throw error;
      }
      console.log('Successfully inserted batch');
      
      console.log(`Processed batch ${i / BATCH_SIZE + 1} of ${Math.ceil(chunks.length / BATCH_SIZE)}`);
    }

    console.log('Successfully stored all embeddings');
  } catch (error) {
    console.error('Error in createAndStoreEmbeddings:', error);
    throw error;
  }
}

export async function deleteEmbeddings({ type, ids }) {
  try {
    const query = supabase.from('lumina_embeddings').delete().eq('metadata->>type', type);
    
    if (ids) {
      query.in('metadata->>id', ids);
    }
    
    const { error } = await query;
    if (error) throw error;
    
    console.log(`Successfully deleted embeddings for ${type}${ids ? ` with ids: ${ids.join(', ')}` : ''}`);
  } catch (error) {
    console.error('Error in deleteEmbeddings:', error);
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
      match_threshold: 0.6,
      match_count: 15
    });

    if (error) throw error;

    if (!matches || matches.length === 0) {
      return [];
    }

    // Helper function to calculate keyword relevance
    const calculateKeywordRelevance = (metadata, queryTerms) => {
      if (!metadata?.keywords) return 0;
      
      const keywordMatches = metadata.keywords.filter(keyword =>
        queryTerms.some(term => keyword.toLowerCase().includes(term))
      ).length;
      
      return keywordMatches / metadata.keywords.length;
    };

    const queryTerms = query.toLowerCase().split(/\s+/);

    // Process and score matches
    const scoredMatches = matches.map(match => {
      const keywordScore = calculateKeywordRelevance(match.metadata, queryTerms);
      const isProduct = match.metadata?.type === 'product_comprehensive';
      const isContact = match.metadata?.type === 'contact';

      return {
        ...match,
        score: (
          match.similarity * 0.6 +     // 60% weight to embedding similarity
          keywordScore * 0.4 +         // 40% weight to keyword matching
          (isProduct ? 0.2 : 0) +      // Boost for product information
          (isContact ? 0.1 : 0)        // Small boost for contact information
        )
      };
    });

    // Sort by combined score
    const sortedMatches = scoredMatches.sort((a, b) => b.score - a.score);

    // Remove duplicates and limit results
    const uniqueMatches = Array.from(new Set(sortedMatches.map(m => m.content)))
      .map(content => sortedMatches.find(m => m.content === content))
      .filter(Boolean)
      .slice(0, 10);

    return uniqueMatches.map(match => ({
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
