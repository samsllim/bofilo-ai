import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse, streamText } from "ai";

import { NextResponse } from "next/server";
import { OramaManager } from "@/lib/orama";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";

// export const runtime = "edge";

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messages, accountId } = await req.json();
        const lastMessage = messages[messages.length - 1]

        const extractKeyword = async (lastMessage: string): Promise<string> => {
            try {
                const response = await openai.createChatCompletion({
                    model: "gpt-4o-mini",
                    messages: [
                    {
                        role: "system",
                        content: "You are an AI assistant specialized in extracting keywords from messages. Your task is to identify and extract the most relevant words that capture the core intent or subject of the given message. Provide only the extracted keyword without any additional explanation or formatting."
                    },
                    {
                        role: "user",
                        content: `
                            You are tasked with extracting the keyword text from a given message. This keyword will be used for vector search engine search. Your goal is to identify and extract the most relevant words or phrases that capture the core intent or subject of the message.

                            Here is the message:
                            <message>
                            ${lastMessage}
                            </message>

                            To extract the keyword:
                            1. Identify the main topic or action requested in the message.
                            2. Focus on nouns, verbs, and time-related phrases that are central to the request.
                            3. Exclude general conversational elements (e.g., greetings, "can you help me").

                            Your response should be just the extracted keyword or phrase, without any additional explanation or formatting.

                            For example:
                            If the message is "Hi, can you help me summarize my emails for the past 3 days?"
                            The extracted keyword would be: emails

                            Now, please extract the keyword from the given message and provide it as a simple string output.
                        `
                    }
                    ],
                    temperature: 0.3,
                    max_tokens: 60
                })
            
                if (!response.ok) {
                    throw new Error(`OpenAI API error: ${response.statusText}`)
                }
            
                const data = await response.json()
                return data.choices[0].message.content.trim()
            } catch (error) {
                console.error("Error in extractKeyword:", error)
                throw error
            }
        }
        
        const oramaManager = new OramaManager(accountId)
        await oramaManager.initialize()
        const keyword = await extractKeyword(lastMessage.content)
        console.log(`Keyword extracted: ${keyword}`)

        const context = await oramaManager.vectorSearch({ prompt: keyword })
        console.log(context.hits.length + ' hits found')
        // console.log(context.hits.map(hit => hit.document))

        const prompt = {
            role: "system",
            content: `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
            THE TIME NOW IS ${new Date().toLocaleString()}
      
      START CONTEXT BLOCK
      ${context.hits.map((hit) => JSON.stringify(hit.document)).join('\n')}
      END OF CONTEXT BLOCK
      
      When responding, please keep in mind:
      - Be helpful, clever, and articulate.
      - Rely on the provided email context to inform your responses.
      - If the context does not contain enough information to answer a question, politely say you don't have enough information.
      - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
      - Do not invent or speculate about anything that is not directly supported by the email context.
      - Keep your responses concise and relevant to the user's questions or the email being composed.`
        };


        const response = await openai.createChatCompletion({
            model: "gpt-4o-mini",
            messages: [
                prompt,
                ...messages.filter((message: Message) => message.role === "user"),
            ],
            stream: true,
        });
        const stream = OpenAIStream(response, {
            onStart: async () => {
            },
            onCompletion: async (completion) => {
                // console.log("completion", completion)
            },
        });
        return new StreamingTextResponse(stream);
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "error" }, { status: 500 });
    }
}
