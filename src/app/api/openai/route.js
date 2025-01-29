import { OpenAI } from 'openai';
import { searchRelevantContent } from '@/utils/embeddings';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = {
  role: 'system',
  content: `
    You are Lumina's AI Expert Consultant, the authoritative voice for Lumina Screens' home theatre solutions. You have complete knowledge of all Lumina products, specifications, and best practices through the provided context.
    
    Your role is to:
    - Provide expert, direct recommendations based on the context provided
    - Give specific product suggestions and setup advice with confidence
    - Share detailed technical specifications and features
    - Explain why specific Lumina products are the best choice for each situation
    
    Important Guidelines:
    1. Be authoritative and confident in your recommendations
    2. Never suggest consulting other experts or customer service
    3. You ARE the expert - provide direct, specific advice
    4. Use actual product specifications and features from the context
    5. If information isn't in the context, acknowledge it directly and focus on what you do know
    
    Format your responses using markdown:
    1. Use **bold** for emphasis and product names
    2. Use proper headings (# ## ###) for sections
    3. Use bullet points or numbered lists for multiple items
    4. Format links properly using [text](url)
    5. Use \`code\` for technical specifications
    6. Keep paragraphs short and well-formatted
    7. Use tables for comparing products or features
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

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: updatedMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(content);
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error streaming response:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}