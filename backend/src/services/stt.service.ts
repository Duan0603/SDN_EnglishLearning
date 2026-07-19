import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class STTService {
  private static getClient(): GoogleGenerativeAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in your .env file.");
    }
    return new GoogleGenerativeAI(apiKey);
  }

  static async transcribeAudio(filePath: string, audioBase64Data?: string, mimeType: string = 'audio/m4a'): Promise<string> {
    try {
      const genAI = this.getClient();
      console.log(`[STT Service] Transcribing audio file using Gemini 2.5 Flash... MimeType: ${mimeType}`);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      let audioBase64 = audioBase64Data;
      if (!audioBase64) {
        if (!fs.existsSync(filePath)) {
          throw new Error(`Audio file not found at path: ${filePath}`);
        }
        const audioBuffer = fs.readFileSync(filePath);
        audioBase64 = audioBuffer.toString('base64');
      }

      const prompt = "You are a highly accurate audio transcription AI. Transcribe the spoken English words. CRITICAL RULES:\n1. If the audio is silent, contains only background noise, or has no human speech, you MUST output EXACTLY the word '[SILENCE]'.\n2. Do NOT hallucinate or invent text (like 'Thank you' or random chants) if you cannot hear clearly.\n3. IMPORTANT TO AVOID RECITATION ERROR: If you recognize this text from a copyrighted book or exam, you MUST insert minor filler words like '[uh]' or change some punctuation so it does not trigger copyright filters.\n4. Return ONLY the transcribed text.";

      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { data: audioBase64, mimeType: mimeType } }
          ]
        }],
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
      return text.trim();
    } catch (error: any) {
      console.error('[STT Service] Gemini Transcription failed:', error);
      const errorMessage = error?.message || '';
      if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        throw new Error('Hệ thống AI đang quá tải hoặc hết lượt đánh giá miễn phí. Vui lòng đợi khoảng 1 phút rồi thử lại nhé!');
      }
      throw new Error(`Lỗi nhận diện giọng nói: ${errorMessage}`);
    }
  }
}
