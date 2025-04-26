import { OpenAI } from 'openai';
import { supabase } from './supabase.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
          why_choose_this,
          technical_datasheet
        `);
        break;

      case CONTENT_TYPES.COMPANY_INFO:
        query = query.select('id, key, content');
        break;

      case CONTENT_TYPES.FAQ:
        query = query.select('id, question, answer, category, tags');
        break;

      case CONTENT_TYPES.REGIONAL_SUPPORT:
        query = query.select('id, name, designation, contact_number, email, regions, states, cities');
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
      return data.map(product => ({
        content: `Product: ${product.name}

        Technical Datasheet:
        ${product.technical_datasheet || 'No technical datasheet available.'}

        Product Description:
        ${product.description || 'No description available.'}

        Basic Specifications:
        - Gain: ${product.gain}
        - Material: ${product.material}
        - Surface: ${product.surface}
        - Projection Type: ${product.projection_type || 'Not specified'}

        Detailed Specifications:
        ${product.product_specs ? product.product_specs.map(spec => `- ${spec}`).join('\n') : 'No additional specifications available.'}

        Features and Benefits:
        ${product.features ? product.features.map(f => `${f.title}:
        ${Array.isArray(f.details) ? f.details.map(d => `- ${d}`).join('\n') : `- ${f.details}`}`).join('\n\n') : 'No specific features listed.'}

        Why Choose ${product.name}:
        ${product.why_choose_this ? product.why_choose_this.map(reason => `- ${reason}`).join('\n') : 'No specific reasons provided.'}`,
        type: CONTENT_TYPES.PRODUCT,
        source_id: product.id.toString(),
        metadata: {
          name: product.name.toLowerCase(),
          specs: {
            gain: product.gain,
            material: product.material.toLowerCase(),
            surface: product.surface.toLowerCase(),
            projection_type: (product.projection_type || '').toLowerCase()
          },
          keywords: [
            product.name.toLowerCase(),
            product.material.toLowerCase(),
            product.surface.toLowerCase(),
            (product.projection_type || '').toLowerCase(),
            'product',
            'screen',
            'projection screen',
            'specifications',
            'features',
            'benefits',
            'technical details',
            'datasheet',
            'technical specifications',
            'product specs',
            'gain value',
            'screen material',
            'surface type',
            'projection system',
            ...(product.features?.map(f => f.title.toLowerCase()) || []),
            ...(product.features?.flatMap(f => Array.isArray(f.details) ? f.details.map(d => d.toLowerCase()) : [f.details.toLowerCase()]) || [])
          ]
        }
      }));

    case CONTENT_TYPES.FAQ:
      return data.map(faq => ({
        content: `FAQs: Q: ${faq.question}\nA: ${faq.answer}${faq.category ? `\nCategory: ${faq.category}` : ''}${faq.tags ? `\nTags: ${faq.tags.join(', ')}` : ''}`,
        type: CONTENT_TYPES.FAQ,
          source_id: faq.id.toString(),
          metadata: {
            category: faq.category?.toLowerCase(),
            tags: faq.tags,
            keywords: [
              'faq',
              'question',
              'help',
              'support',
              ...(faq.question.toLowerCase().split(' ')),
              ...(faq.category ? [faq.category.toLowerCase()] : []),
              ...(faq.tags?.map(tag => tag.toLowerCase()) || [])
            ]
          }
      }));

    case CONTENT_TYPES.REGIONAL_SUPPORT:
      return data.map(person => ({
        content: `Regional Support / Sales Contact: ${person.name}
        Designation: ${person.designation}
        Contact: ${person.contact_number}
        Email: ${person.email}
        States: ${JSON.stringify(person.states)}
        Regions: ${JSON.stringify(person.regions)}
        Cities: ${JSON.stringify(person.cities)}`,
        type: CONTENT_TYPES.REGIONAL_SUPPORT,
          source_id: person.id.toString(),
          metadata: {
            name: person.name.toLowerCase(),
            designation: person.designation.toLowerCase(),
            regions: person.regions.map(r => r.toLowerCase()),
            states: person.states.map(s => s.toLowerCase()),
            cities: person.cities.map(c => c.toLowerCase()),
            keywords: [
              'sales',
              'support',
              'contact',
              'regional',
              'representative',
              person.name.toLowerCase(),
              person.designation.toLowerCase(),
              ...person.regions.map(r => r.toLowerCase()),
              ...person.states.map(s => s.toLowerCase()),
              ...person.cities.map(c => c.toLowerCase())
            ]
          }
      }));

    case CONTENT_TYPES.COMPANY_INFO:
      return data.map(info => ({
        content: `${info.key}: ${info.content}`,
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
export async function searchRelevantContent(query, previousMessages = []) {
  // Combine current query with weighted previous messages for context
  const contextualQuery = [
    query,
    ...previousMessages.map(msg => msg.toLowerCase())
  ].join(' ');
  try {
    // Clean and prepare queries
    const cleanQuery = query.trim().toLowerCase();
    const cleanContext = previousMessages.map(msg => msg.trim().toLowerCase());

    // Create embeddings for both query and each context message
    const [queryEmbedding, ...contextEmbeddings] = await Promise.all([
      openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: cleanQuery,
      }),
      ...cleanContext.map(ctx => 
        openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: ctx,
        })
      )
    ]);

    // Combine embeddings with weighted average
    const combinedEmbedding = queryEmbedding.data[0].embedding.map((val, i) => {
      const contextValues = contextEmbeddings.map((emb, idx) => {
        const weight = 1 / Math.pow(2, idx + 1); // Exponential decay for older context
        return emb.data[0].embedding[i] * weight;
      });
      const contextSum = contextValues.reduce((a, b) => a + b, 0);
      return (val * 0.6 + contextSum * 0.4); // 60% current query, 40% weighted context
    });

    // Extract key terms for content type detection
  const productTerms = /screen|projector|lumina|theatre|theater|projection|gain|material/i;
  const faqTerms = /faq|question|how|what|why|when/i;
  const supportTerms = /contact|support|region|city|state|location/i;
  const companyTerms = /company|about|lumina|policy|warranty/i;

  // Determine content types to prioritize based on query
  const contentWeights = {
    products: productTerms.test(contextualQuery) ? 1.2 : 1,
    faqs: faqTerms.test(contextualQuery) ? 1.2 : 1,
    regional_support: supportTerms.test(contextualQuery) ? 1.2 : 1,
    company_info: companyTerms.test(contextualQuery) ? 1.2 : 1
  };

    const { data: matches, error } = await supabase.rpc('match_embeddings', {
      query_embedding: combinedEmbedding,
      match_threshold: 0.55,
      match_count: 20
    });

    if (error) throw error;

    if (!matches || matches.length === 0) {
      return [];
    }

    // Helper function to calculate keyword relevance
    const calculateKeywordRelevance = (metadata, queryTerms, contentType) => {
      if (!metadata?.keywords) return 0;
      
      // Calculate exact and partial matches with type-specific weights
      const exactMatches = metadata.keywords.filter(keyword =>
        queryTerms.some(term => keyword === term)
      ).length;
      
      const partialMatches = metadata.keywords.filter(keyword =>
        queryTerms.some(term => keyword.includes(term) && keyword !== term)
      ).length;
      
      // Content type specific scoring
      // Base score from exact and partial matches
      let baseScore = (exactMatches * 1.5 + partialMatches) / (metadata.keywords.length * 1.5);
      
      switch(contentType) {
        case 'products':
          // Product-specific boosts
          const hasSpecs = queryTerms.some(term => 
            ['gain', 'material', 'surface', 'size', 'dimension'].includes(term));
          const hasTechnical = queryTerms.some(term => 
            ['technical', 'datasheet', 'specification'].includes(term));
          return baseScore + (hasSpecs ? 0.3 : 0) + (hasTechnical ? 0.2 : 0);

        case 'faqs':
          // FAQ-specific scoring
          const isQuestion = queryTerms.some(term => 
            ['how', 'what', 'why', 'when', 'where', 'can', 'will', 'should', 'difference', 'between', 'compare', 'vs', 'versus'].includes(term));
          const questionMatch = metadata.question ? 
            queryTerms.every(term => metadata.question.toLowerCase().includes(term)) ? 0.4 : 0 : 0;
          const categoryMatch = metadata.category && queryTerms.some(term => 
            metadata.category.toLowerCase().includes(term)) ? 0.2 : 0;
          return baseScore + (isQuestion ? 0.3 : 0) + questionMatch + categoryMatch;

        case 'regional_support':
          // Regional support scoring with enhanced location matching
          const locationMatches = [
            metadata.regions?.some(r => queryTerms.some(term => r.toLowerCase().includes(term))),
            metadata.cities?.some(c => queryTerms.some(term => c.toLowerCase().includes(term))),
            metadata.states?.some(s => queryTerms.some(term => s.toLowerCase().includes(term)))
          ].filter(Boolean).length;
          const locationScore = locationMatches * 0.2;
          const contactIntent = queryTerms.some(term => 
            ['contact', 'sales', 'support', 'purchase', 'buy'].includes(term)) ? 0.3 : 0;
          return baseScore + locationScore + contactIntent;

        default:
          return baseScore;
      }
    };

    // Extract meaningful terms and phrases
    const queryTerms = cleanQuery
      .split(/[\s,;]+/) // Split on multiple types of separators
      .filter(term => term.length > 2) // Filter out very short words
      .concat(extractPhrases(cleanQuery)); // Add potential phrases
    
    // Add context terms if they're relevant
    const contextTerms = cleanContext
      .flatMap(ctx => ctx.split(/[\s,;]+/))
      .filter(term => term.length > 2)
      .filter(term => isRelevantContextTerm(term, cleanQuery));
    
    const allTerms = [...new Set([...queryTerms, ...contextTerms])];
    
    // Detect query intent
    const queryIntent = detectQueryIntent(cleanQuery);

    // Helper functions for query analysis
    function extractPhrases(text) {
      const phrases = [];
      const words = text.split(' ');
      for (let i = 0; i < words.length - 1; i++) {
        phrases.push(words[i] + ' ' + words[i + 1]);
      }
      return phrases;
    }

    function isRelevantContextTerm(term, query) {
      const relevantTerms = ['screen', 'projector', 'gain', 'material', 'surface', 'size', 'lumens'];
      return relevantTerms.some(rt => term.includes(rt)) || query.includes(term);
    }

    function detectQueryIntent(query) {
      const intents = {
        product: /product|screen|material|gain|surface|projection|theatre|home theatre|ambient|light|viewing|lumens/i,
        support: /support|help|contact|service|regional|sales|purchase|buy|order|quote/i,
        technical: /specification|datasheet|technical|specs|details|dimensions|size/i,
        location: /location|city|region|state|area|address|office|branch/i,
        faq: /how|what|why|when|where|can|will|should|difference|between|compare|vs|versus/i
      };
      return Object.entries(intents)
        .filter(([_, pattern]) => pattern.test(query))
        .map(([intent]) => intent);
    }

    // Process and score matches with intent-based boosting
    const scoredMatches = matches.map(match => {
      const contentType = match.metadata?.type;
      const keywordScore = calculateKeywordRelevance(match.metadata, allTerms, contentType);
      
      // Calculate intent alignment
      const intentAlignment = queryIntent.some(intent => {
        switch(intent) {
          case 'product':
            return contentType === 'products';
          case 'support':
            return contentType === 'regional_support';
          case 'technical':
            return contentType === 'products' && 
              (match.content.toLowerCase().includes('technical') || 
               match.content.toLowerCase().includes('datasheet') || 
               match.content.toLowerCase().includes('specifications'));
          case 'location':
            return contentType === 'regional_support' && 
              (match.metadata?.regions?.length > 0 || 
               match.metadata?.cities?.length > 0 || 
               match.metadata?.states?.length > 0);
          case 'faq':
            return contentType === 'faqs';
          default:
            return false;
        }
      }) ? 0.15 : 0;

      const contentWeight = contentWeights[contentType] || 1;

      return {
        ...match,
        score: (
          match.similarity * contentWeight * 0.40 +    // 40% weight to embedding similarity
          keywordScore * 0.35 +        // 35% weight to keyword matching
          intentAlignment * 0.15 +     // 15% for intent alignment
          (contentType === 'products' ? 0.05 : 0) +        // 5% boost for products
          (contentType === 'regional_support' ? 0.03 : 0) + // 3% boost for support
          (contentType === 'faqs' ? 0.02 : 0)              // 2% boost for FAQs
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
