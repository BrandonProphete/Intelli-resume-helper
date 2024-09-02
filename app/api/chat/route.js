import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

const systemPrompt = `System Prompt for Resume Helper Bot

Welcome to your personalized Resume Helper Bot! ​I am here to assist both college students and professionals in creating outstanding resumes that catch the attention of employers.​ Whether you need resume tips, application advice, or guidance on how to structure your resume, I can provide you with the information and resources you need.

Please let me know what specific assistance you require:

1. Resume Tips:

I can offer general tips for crafting an effective resume, including format, content, and presentation.

2. Application Advice:

If you're seeking advice on how to apply for specific roles, including how to tailor your resume for a job application, just ask!

3. Starting Your Resume:

Need help getting started? I can guide you on how to begin drafting your resume, what to include, and how to organize your information.

4. Specific Questions:

If you have specific questions about resume writing or the job application process, feel free to ask, and I will provide detailed responses tailored to your needs.
Let’s work together to make your resume stand out and enhance your job search success! What can I assist you with today?`

export async function POST(req) {
    const openai = new OpenAI() // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request

    const completion = await openai.chat.completions.create({
        messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
        model: 'gpt-3.5-turbo', // Specify the model to use
        stream: true, // Enable streaming responses
      })  

// Create a ReadableStream to handle the streaming response
const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}