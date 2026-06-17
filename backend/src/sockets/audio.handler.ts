import { Server, Socket } from 'socket.io';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { STTService } from '../services/stt.service';
import { GeminiService } from '../services/gemini.service';
import SpeakingSubmission from '../models/speakingSubmission.model.js';

const TEMP_DIR = path.join(__dirname, '../../temp-audio');
fs.ensureDirSync(TEMP_DIR);

export const registerAudioHandlers = (io: Server, socket: Socket) => {
  let fileStream: fs.WriteStream | null = null;
  let currentFilePath: string = '';

  socket.on('audio:start', () => {
    const filename = `${uuidv4()}.m4a`;
    currentFilePath = path.join(TEMP_DIR, filename);
    fileStream = fs.createWriteStream(currentFilePath);
    console.log(`[Audio] Started receiving audio to ${filename}`);
  });

  socket.on('audio:chunk', (data: Buffer | string) => {
    if (fileStream) {
      if (typeof data === 'string') {
        fileStream.write(Buffer.from(data, 'base64'));
      } else {
        fileStream.write(data);
      }
    }
  });

  socket.on('audio:stop', async (payload?: { userId?: string, testId?: string, prompt?: string }) => {
    if (fileStream) {
      fileStream.end();
      fileStream = null;
      console.log(`[Audio] Finished receiving audio at ${currentFilePath}`);
      
      try {
        // 1. STT Phase
        const transcript = await STTService.transcribeAudio(currentFilePath);
        socket.emit('audio:transcript', { success: true, transcript });
        
        // 2. Gemini Scoring Phase
        if (transcript && transcript.trim().length > 0) {
          const scoreData = await GeminiService.scoreSpeaking(transcript, payload?.prompt);
          socket.emit('audio:score', { success: true, score: scoreData });
          
          // 3. Save to DB
          if (payload?.userId) {
            const submission = new SpeakingSubmission({
              userId: payload.userId,
              testId: payload.testId || null,
              prompt: payload.prompt || '',
              audioUrl: 'local-temp', // In real app, upload to S3/Cloudinary first
              transcription: transcript,
              bandScore: scoreData.bandScore,
              fluencyCoherence: scoreData.fluencyCoherence,
              lexicalResource: scoreData.lexicalResource,
              grammarAccuracy: scoreData.grammarAccuracy,
              pronunciation: scoreData.pronunciation,
              aiFeedback: scoreData.aiFeedback
            });
            await submission.save();
            console.log(`[Audio] Saved speaking submission for user ${payload.userId}`);
          }
        } else {
          socket.emit('audio:score', { success: false, error: 'Transcript is empty, cannot score' });
        }
      } catch (error) {
        console.error('[Audio] Process Error:', error);
        socket.emit('audio:error', { success: false, error: 'Failed to process audio' });
      } finally {
        // Cleanup after STT or after 15 mins
        setTimeout(() => {
          fs.remove(currentFilePath).catch(err => console.error('[Audio] Cleanup error:', err));
        }, 15 * 60 * 1000); // 15 mins TTL
      }
    }
  });
};

