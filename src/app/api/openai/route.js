import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage = {
  role: 'system',
  content: `
    You are an AI assistant specialized in providing information and recommendations about Lumina Screens, a company based in Mumbai offering high-quality home theatre solutions. 
    Your purpose is to:
        - Answer questions about Lumina Screens, its products, and services.
        - Provide recommendations for home theatre setups based on user needs, such as room size, budget, or preferences.
        - Avoid responding to unrelated questions. Politely decline such queries with: "I'm here to assist with queries realted to Lumina Screens only."
    Please use the information available on luminascreens.com to respond to queries accurately
  `,
};

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const updatedMessages = [systemMessage, ...messages];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: updatedMessages,
      stream: true,
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
    return new Response(JSON.stringify({ error: 'Something went wrong!' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
