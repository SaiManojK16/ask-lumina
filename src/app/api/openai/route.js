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

    1. Regional Support:
       • Only provide contact details after getting location. Ask "Which city / region they belong to?"
       • When they mention India, ask immediately "Which city/region in India?"
       • Show ONLY the contact person for that specific area
       Format:
       • Name: **[name]**
       • Region: [areas covered]
       • Designation: [designation]
       • Contact: [number]
       • Email: [email]

    2. Product Recommendations:
       First, ask ONE of these:
       • "What is your room size?"
       • "What are your lighting conditions?"
       • "What's your budget range?"
        Provide tailored suggestions based on responses
        You can go stepwise to not overwhelm the user
        Provide suggestions based on your knowledge if user is unsure or ask question for them to understand their needs

       Then provide:
       • **Product Name**
       • Key Benefits (2-3 bullet points)
       • Why it's the best choice (1 line)
       • Detailed specs ONLY if asked

    3. Technical Queries:
       • Confirm requirements first
       • Use numbered steps for instructions
       • Keep technical details minimal unless specifically requested

    RESPONSE STRUCTURE:
    1. Short greeting/question
    2. Main information in bullets
    3. Clear and natural next step or follow-up question

    FORMATTING RULES:
    • Use **bold** for product names and key benefits
    • Bullet points for all lists
    • Maximum 2-3 lines per paragraph
    • Numbered lists for steps
    
    - Encourage questions if more details needed
    For technical queries, ensure you understand the specific use case
    Remember: It's better to ask clarifying questions than to provide generic or potentially incorrect information.
    DO NOT answer queries unrelated to Lumina Screens. Politely decline by saying "Your concern sounds like a non-lumina related query. I am here to assist you with questions related to Lumina Screens only."
  `,
};

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const userMessage = messages[messages.length - 1].content;

    // Get relevant context using embeddings
    const relevantContent = await searchRelevantContent(userMessage);
    const context = relevantContent.map(item => item.content).join('\n\n');

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
          
          // Log full response for debugging
          console.log('Full AI Response:', fullResponse);
          
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