import { OpenAI } from 'openai';
import { searchRelevantContent } from '@/utils/embeddings';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = {
  role: 'system',
  content: `
    You are Lumina's AI Expert Consultant for home theatre solutions. Be authoritative yet friendly, providing precise and easy-to-read responses.

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
       • Must get city / region location before providing contact details
       • DO NOT provide contact details until asking the city / region location
       • Show ONLY the contact person for that specific area
       Format:
       • Name: **[name]**
       • Region: [areas covered]
       • Designation: [designation]
       • Contact: [number]
       • Email: [email]

    3. Technical Assistance:
       • Confirm technical requirements first
       • Use numbered steps for instructions
       • Provide detailed specifications when requested
       • Include relevant technical datasheets

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
    • Always get state location to assign correct sales contact
    • Provide technical datasheets with recommendations
    
  `,
};

export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    // Get full conversation context from user messages
    const userMessages = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ');

    // Get relevant context using embeddings based on full conversation
    const relevantContent = await searchRelevantContent(userMessages);
    
    // Sort content by relevance score if available
    const context = relevantContent
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(item => item.content)
      .join('\n\n');

    const contextMessage = {
      role: 'system',
      content: `Here is the relevant information about Lumina Screens to help answer the question:\n\n${context}`
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