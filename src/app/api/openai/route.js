import { OpenAI } from 'openai';
import { searchRelevantContent } from '@/utils/embeddings';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = {
  role: 'system',
  content: `
    You are Lumina's AI Expert Consultant providing crisp, precise advice about home theatre solutions. Keep responses friendly, natural, and easy to read.
    You are the authoritative voice for Lumina Screens' home theatre solutions. You have complete knowledge of all Lumina products, specifications, and best practices through the provided context.

    Response Style:
    1. Format ALL responses using these rules:
       • Use bullet points for ALL lists and features
       • Put product names in **bold**
       • Keep paragraphs to 2-3 lines max
       • Use numbered lists for steps

    2. For India-related queries:
       • If user mentions India, IMMEDIATELY ask: "Which city or region in India are you located in?"
       • Wait for city/region before providing contact details
       • Only show the contact person responsible for that specific area

    3. For Product Recommendations:
       • Start with ONE clear question about their needs
       • List key features as bullet points
       • Put specifications in a clean list format
       • Provide detailed information only when asked
       • Highlight main benefits in **bold**

    4. Keep responses structured:
       • Responses should be shorted to the point where the user can quickly understand the information provided.
       • Question or greeting
       • Bullet points for main information
       • Clear call to action or follow-up

    Remember:
    - Be conversational
    - Keep technical details minimal unless asked
    - Encourage questions if more details needed
    For technical queries, ensure you understand the specific use case
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