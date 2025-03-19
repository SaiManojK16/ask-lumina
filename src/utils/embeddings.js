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
