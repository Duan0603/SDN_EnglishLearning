import fs from 'fs';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) 
  : null;

export class STTService {
  static async transcribeAudio(filePath: string, audioBase64Data?: string, mimeType: string = 'audio/m4a'): Promise<string> {
    if (openai) {
      try {
        console.log(`[STT Service] Transcribing audio file using OpenAI Whisper...`);
        const response = await openai.audio.transcriptions.create({
          file: fs.createReadStream(filePath),
          model: 'whisper-1',
          language: 'en',
        });
        console.log('[STT Service] OpenAI Transcription successful.');
        return response.text;
      } catch (error) {
        console.error('[STT Service] OpenAI Transcription failed:', error);
        throw new Error('Failed to transcribe audio using Whisper API');
      }
    } else if (genAI) {
      try {
        console.log(`[STT Service] Transcribing audio file using Gemini 2.5 Flash... MimeType: ${mimeType}`);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        let audioBase64 = audioBase64Data;
        if (!audioBase64) {
          const audioBuffer = fs.readFileSync(filePath);
          audioBase64 = audioBuffer.toString('base64');
        }
        const prompt = "You are a highly accurate audio transcription AI. Transcribe the spoken English words. CRITICAL RULES:\n1. If the audio is silent, contains only background noise, or has no human speech, you MUST output EXACTLY the word '[SILENCE]'.\n2. Do NOT hallucinate or invent text (like 'Thank you' or random chants) if you cannot hear clearly.\n3. Return ONLY the raw transcribed text. No introductions.";
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [
            { text: prompt },
            { inlineData: { data: audioBase64, mimeType: mimeType } }
          ]}],
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.1,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT" as any, threshold: "BLOCK_NONE" as any },
            { category: "HARM_CATEGORY_HATE_SPEECH" as any, threshold: "BLOCK_NONE" as any },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any, threshold: "BLOCK_NONE" as any },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any, threshold: "BLOCK_NONE" as any }
          ]
        });
        const text = result.response.text();
        console.log('[STT Service] Gemini Transcription successful.');
        return text;
      } catch (error: any) {
        console.error('[STT Service] Gemini Transcription failed:', error?.message);
        throw new Error('Failed to transcribe audio using Gemini API. Your API key might be invalid.');
      }
    } else {
      console.warn('[STT Service] Neither OPENAI_API_KEY nor GEMINI_API_KEY provided. Returning mock transcription.');
      // Simulate delay for mock
      await new Promise(resolve => setTimeout(resolve, 2000));
      return "Well, to be honest, I would like to talk about this topic because it is very interesting. In my opinion, there are several reasons why this is important. First of all, it helps people to improve their skills and knowledge. Secondly, it is a great way to connect with others and share experiences. Overall, I think it is a very positive thing and I highly recommend it.";
    }
  }
}
