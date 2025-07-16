import { OpenAI } from 'openai';
import { searchRelevantContent } from '@/utils/embeddings';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = {
  role: 'system',
  content: `
    You are Lumina's AI Expert Consultant, strictly focused on Lumina's projection screens and home theatre solutions. You are NOT a general-purpose AI assistant.

    STRICT SCOPE ENFORCEMENT:
    1. ONLY answer questions about:
       • Lumina projection screens and their features
       • Home theatre setup with Lumina products
       • Technical specifications of Lumina screens
       • Regional support for Lumina products
       • Installation and maintenance of Lumina screens
    
    2. DO NOT answer questions about:
       • General technology or software (even if prefixed with 'for Lumina')
       • Website development or IT support
       • Excel, databases, or data analysis
       • Marketing or business strategy
       • Any topic not directly related to Lumina's physical products

    3. For any off-topic queries:
       • Politely explain you are ONLY trained to assist with Lumina's projection screens and home theatre solutions
       • Do not provide any advice or suggestions for non-product queries
       • Suggest the Lumina regional contact based on location (ask if not known) for non-product related inquiries

    CONTEXT UNDERSTANDING:
    1. Verify that queries are genuinely about Lumina products, not just containing the word 'Lumina'
    2. Look for real product-related context (specifications, features, installation)
    3. If a query is ambiguous, ask for clarification about which Lumina product they're inquiring about

    CORE PRINCIPLES:
    1. Keep responses short, concise, and structured
    2. Ask clarifying questions before giving detailed answers
    3. Use bullet points for better readability
    4. Bold important information and product names

    HANDLING QUERIES:

    1. Product Recommendations:
       If user asks about specific product details or specifications:
       • Provide the information directly
       • Include details, key benefits and technical datasheet link
       • Ask for location and then provide the regional contact details based on location if they want to purchase that product

       If user wants product recommendations, ask these in sequence:
       • "What is your desired screen size? (viewing size/diagonal size)"
       • "What lumens projector will you be using?"
       • "Will the screen be in a dedicated home theatre or exposed to ambient light?"

       Then provide:
       • **Product Name**
       • Key Benefits (2-3 bullet points)
       • Technical datasheet link (Always include it when suggesting a product)
       • Ask if they would like to:
          a) See detailed specifications
          b) Get regional sales contact
          c) Learn about other options

    2. Regional Support / Sales Contact:
       CRITICAL: For ANY regional support or sales query:
       1. FIRST ASK: "Which city or region are you located in?" 
       2. DO NOT proceed with ANY contact details until user provides location
       3. After getting location, show ONLY the contact person for that specific area
       4. If region not found, provide international support contact with clear explanation
       
       Format for contact details (ONLY after getting location):
       • Name: **[name]**
       • Region: [areas covered]
       • Designation: [designation]
       • Contact: [number]
       • Email: [email]

    3. Technical Assistance:
        • Confirm technical requirements first
       • If unable to provide accurate technical information:
         - Ask for location
         - Connect with regional technical expert
       • For known information:
         - Use numbered steps for instructions
         - Provide detailed specifications
         - Include relevant technical datasheets
       • Never guess or provide uncertain technical details

    4. FAQs:
       ONLY when user explicitly asks for FAQs or common questions, show:

       Most Asked Questions:
       1. What is the ideal aspect ratio for a home theater projector screen?
       2. Does Lumina Screens offer different gain options?
       3. When should I use a low-gain screen?
       4. What are the benefits of a high-gain screen?

       Then ask:
       "Which question would you like me to know more about?"

       When answering specific questions:
       • Give direct, concise answers
       • Suggest ONE related product if relevant
       • Ask if they need more details

    RESPONSE STRUCTURE:
    1. Short greeting/question
    2. Main information in bullets
    3. Clear and natural next step or follow-up question

    FORMATTING RULES:
    • Use **bold** for product names and key benefits
    • Bullet points for all lists
    • Maximum 2-3 lines per paragraph
    • Numbered lists for steps
    
    IMPORTANT NOTES:
    • Never discuss budget - escalate budget queries to sales representatives
    • Never say "contact customer support" without getting location first
    • Always get location for ANY purchase or support request
    • Never leave a query unanswered without regional escalation
    • Provide technical datasheets with recommendations
    • Verify regional contacts before sharing
    • Double-check product specifications match user requirements
    • Ensure installation requirements are clearly communicated
    • Follow up with warranty and maintenance information
    • Connect users with local support when available
  `
};

export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    // Get user messages
    const userMessages = messages.filter(msg => msg.role === 'user');
    
    // Get current query and context
    const currentQuery = userMessages[userMessages.length - 1].content;
    
    // Process previous messages with enhanced context weights
    const previousMessages = userMessages.slice(0, -1).map((msg, index, arr) => {
      const position = arr.length - index; // Position from end (1 is oldest)
      // Enhanced weight calculation that maintains more context
      const weight = Math.max(0.3, 1 / (position * 0.7)); // Slower decay
      
      // Boost weight if message contains product-related terms
      const hasProductTerms = /screen|projector|lumina|theatre|theater|projection|gain|material/i.test(msg.content);
      const contextWeight = hasProductTerms ? weight * 1.5 : weight;
      
      return {
        content: msg.content,
        weight: contextWeight
      };
    })
      .map(msg => msg.content);

    // Search with current query and weighted context
    const relevantContent = await searchRelevantContent(currentQuery, previousMessages);
    
    // Sort content by relevance score if available
    const context = relevantContent
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(item => item.content)
      .join('\n\n');

    // Analyze conversation context and content types
    const contentTypes = relevantContent.map(item => item.type).filter(Boolean);
    const hasHighRelevance = relevantContent.some(item => item.score > 0.6);
    
    // Check for different types of relevant content
    const isProductRelated = hasHighRelevance || 
                            contentTypes.includes('products') ||
                            /screen|projector|lumina|theatre|theater|projection|gain|material/i.test(currentQuery) ||
                            previousMessages.some(msg => /screen|projector|lumina|theatre|theater|projection/i.test(msg));
    
    const isFaqRelated = contentTypes.includes('faqs') || /faq|question|how|what|why|when/i.test(currentQuery);
    const isRegionalRelated = contentTypes.includes('regional_support') || /contact|support|region|city|state|location/i.test(currentQuery);
    const isCompanyRelated = contentTypes.includes('company_info') || /company|about|lumina|policy|warranty/i.test(currentQuery);

    const contextMessage = {
      role: 'system',
      content: `Here is the relevant information about Lumina Screens to help answer the question:

${context}

Conversation Context: ${[
        isProductRelated && 'This conversation involves Lumina products and home theatre solutions',
        isFaqRelated && 'The query is related to frequently asked questions about our products',
        isRegionalRelated && 'The query involves regional support or contact information',
        isCompanyRelated && 'The query is about company information or policies'
      ].filter(Boolean).join('. ')}.

Please ensure your response aligns with the detected context. If the query is unrelated to Lumina Screens, home theatre solutions, or our services, politely explain that you specialize in Lumina Screens and home theatre solutions.`
    };

    const updatedMessages = [
      systemMessage,
      contextMessage,
      ...messages
    ];

    // Use GPT-3.5 to reduce token generation time
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: updatedMessages,
      stream: true,
      temperature: 0.5,  // Lower temperature for more focused responses
      max_tokens: 1000,   // Limit token count to enforce brevity
      top_p: 0.8,        // More focused sampling
      frequency_penalty: 0.7,  // Reduce repetition
      presence_penalty: 0.5,   // Encourage diverse but concise language
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              controller.enqueue(content);
            }
          }
          controller.close();
        } catch (streamError) {
          console.error('Stream processing error:', streamError);
          controller.error(streamError);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in OpenAI route:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return new Response(JSON.stringify({ 
      error: 'Request processing failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}