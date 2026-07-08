import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const audioBytes = Buffer.from('1A45DFA3', 'hex').toString('base64');
    
    const prompt = "Please transcribe";
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "audio/webm",
          data: audioBytes
        }
      }
    ]);
    console.log(result.response.text());
  } catch (e: any) {
    console.error("ERROR:", e.message);
  }
}
test();
