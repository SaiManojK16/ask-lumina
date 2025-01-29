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
    6. Do not give incomplete responses - always complete the request    
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

    // Recursive function to generate complete responses
    async function generateCompleteResponse(currentMessages, maxAttempts = 3) {
      if (maxAttempts <= 0) {
        throw new Error('Unable to generate a complete response');
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: currentMessages,
        stream: false,  // Use non-streaming for full response
        temperature: 0.7,
        max_tokens: 4096,  // Maximum allowed tokens
        top_p: 0.95,  // More deterministic sampling
      });

      const fullResponse = response.choices[0].message.content;

      // Check if response seems incomplete
      const isComplete = checkResponseCompleteness(fullResponse, userMessage);

      if (!isComplete) {
        // If incomplete, add a prompt to continue
        const continuationPrompt = {
          role: 'user',
          content: `Please continue the previous response. The last response seemed incomplete. Continue from where you left off, providing a comprehensive answer to the original query: "${userMessage}"`
        };

        return generateCompleteResponse([...currentMessages, 
          { role: 'assistant', content: fullResponse },
          continuationPrompt
        ], maxAttempts - 1);
      }

      return fullResponse;
    }

    // Function to check response completeness
    function checkResponseCompleteness(response, originalQuery) {
      // Implement sophisticated checks
      const minResponseLength = 500;  // Minimum characters
      const keywordCoverage = [
        'Lumina',
        'screen',
        'projection',
        'home theatre',
        ...originalQuery.split(/\s+/)
      ];

      const hasMinLength = response.length >= minResponseLength;
      const hasKeywordCoverage = keywordCoverage.every(keyword => 
        response.toLowerCase().includes(keyword.toLowerCase())
      );

      return hasMinLength && hasKeywordCoverage;
    }

    // Generate the complete response
    const completeResponse = await generateCompleteResponse(updatedMessages);

    // Stream the complete response
    const stream = new ReadableStream({
      start(controller) {
        // Chunk the response to simulate streaming
        const chunks = chunkString(completeResponse, 50);
        chunks.forEach(chunk => controller.enqueue(chunk));
        controller.close();
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
    console.error('Error generating response:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate a complete response', 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Utility function to chunk string for streaming
function chunkString(str, length) {
  const chunks = [];
  for (let i = 0; i < str.length; i += length) {
    chunks.push(str.slice(i, i + length));
  }
  return chunks;
}