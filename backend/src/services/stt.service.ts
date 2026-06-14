import fs from 'fs';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export class STTService {
  static async transcribeAudio(filePath: string): Promise<string> {
    if (!openai) {
      console.warn('[STT Service] No OPENAI_API_KEY provided. Returning mock transcription.');
      // Simulate delay for mock
      await new Promise(resolve => setTimeout(resolve, 2000));
      return "This is a mock transcription of the recorded audio for IELTS speaking assessment.";
    }

    try {
      console.log(`[STT Service] Transcribing audio file: ${filePath}`);
      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
        language: 'en',
      });
      console.log('[STT Service] Transcription successful.');
      return response.text;
    } catch (error) {
      console.error('[STT Service] Transcription failed:', error);
      throw new Error('Failed to transcribe audio using Whisper API');
    }
  }
}
