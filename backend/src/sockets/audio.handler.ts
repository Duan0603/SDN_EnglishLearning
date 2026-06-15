import { Server, Socket } from 'socket.io';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { STTService } from '../services/stt.service';

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

  socket.on('audio:stop', async () => {
    if (fileStream) {
      fileStream.end();
      fileStream = null;
      console.log(`[Audio] Finished receiving audio at ${currentFilePath}`);
      
      try {
        const transcript = await STTService.transcribeAudio(currentFilePath);
        socket.emit('audio:transcript', { success: true, transcript });
      } catch (error) {
        console.error('[Audio] STT Error:', error);
        socket.emit('audio:transcript', { success: false, error: 'Failed to transcribe audio' });
      } finally {
        // Cleanup after STT or after 15 mins
        setTimeout(() => {
          fs.remove(currentFilePath).catch(err => console.error('[Audio] Cleanup error:', err));
        }, 15 * 60 * 1000); // 15 mins TTL
      }
    }
  });
};
