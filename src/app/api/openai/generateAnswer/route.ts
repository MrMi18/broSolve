// app/api/ai-suggestion/route.ts
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { NextResponse } from 'next/server';

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

interface Data  {
  title: string;
  description: string;
  tags: string[];
}
export const POST = async (req: Request) => {
  console.log("GitHub AI model request");
    
  try {
     const data : Data = await req.json()
     const { title, description, tags } = data

    if (!token) {
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    const client = ModelClient(
      endpoint,
      new AzureKeyCredential(token),
    );

    // Create a comprehensive prompt for the AI
   const prompt = `You're helping Indian web developers stuck on bugs. 

Bug Title: ${title}
Description: ${description}
Tags: ${tags?.join(', ') || 'None'}

Give a helpful solution with:
1. Analysis of the issue (focus on common local/dev env issues)
2. Step-by-step fix (with code if possible)
3. Quick prevention tips

Keep it concise, clear, and beginner-friendly if possible.`;

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { 
            role: "system", 
            content:"You are a senior web developer experienced in debugging issues faced by Indian developers. Prioritize clarity, code samples, and practical advice."
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 800,
        model: model
      }
    });

    if (isUnexpected(response)) {
      console.error("API Error:", response.body);
      return NextResponse.json({ error: "Failed to get AI suggestion" }, { status: 500 });
    }

    const suggestion = response.body.choices[0].message.content;
    
    return NextResponse.json({ suggestion });

  } catch (err: unknown) {
    console.error("Error in AI suggestion:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
};





// import { OpenAI } from 'openai';
// import { NextResponse } from 'next/server';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export  const POST = async(req: Request) => {
//     console.log("openai")
  
//   const { prompt } = await req.json();
//   console.log(prompt)
//   try {
//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: `You're helping Indian web developers stuck on bugs. Here's the issue: ${prompt}. Suggest a solution.` }],
//     });

//     return NextResponse.json({ result: completion.choices[0].message.content });
//   } catch (err:any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }