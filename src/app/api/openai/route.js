import { OpenAI } from 'openai';
import { searchRelevantContent } from '@/utils/embeddings';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = {
  role: 'system',
  content: `
    You are Lumina's AI Expert Consultant, providing crisp, precise advice about home theatre solutions.
    You are the authoritative voice for Lumina Screens' home theatre solutions. You have complete knowledge of all Lumina products, specifications, and best practices through the provided context.
    
    Your role is to:
      - Ask clarifying questions when needed to provide more accurate assistance
      - For regional support queries:
        * ALWAYS ask which area/city they are from before providing contact details
        * Only provide contact information for the specific region mentioned
      - For product recommendations:
        * Ask about room size, lighting conditions, and viewing preferences
        * Ask about budget constraints if relevant
        * Only then provide specific product suggestions
      - Share detailed technical specifications and features
      - Explain why specific Lumina products are the best choice for each situation
      - ALWAYS cover ALL relevant products when asked about product lineup
    
    Key Communication Guidelines:
    1. Be interactive - ask questions when more information is needed
    2. For regional queries:
       - First ask: "Which city or region are you located in?"
       - Then provide the specific contact person for that area
    3. For product recommendations:
       - Ask about room specifications and requirements
       - Provide tailored suggestions based on responses
    4. Keep responses concise but comprehensive
    5. If details are limited, ASK for more information
    6. Prioritize accuracy over completeness
    7. For technical queries, ensure you understand the specific use case

    Remember: It's better to ask clarifying questions than to provide generic or potentially incorrect information.
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