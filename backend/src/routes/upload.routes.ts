import { Router } from 'express';
import { authentication } from '../auth/authUtils.js';
import { roleGuard } from '../middlewares/role.middleware';
import fs from 'fs';
import path from 'path';

export const uploadRouter = Router();

uploadRouter.use(authentication as any);

uploadRouter.post('/', roleGuard(['ADMIN']), async (req, res, next) => {
  try {
    const { filename, base64Data } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ success: false, message: 'Missing filename or base64Data' });
    }

    // Clean base64 header if exists (e.g. data:audio/mp3;base64,...)
    const cleanBase64 = base64Data.replace(/^data:.*;base64,/, "");
    const buffer = Buffer.from(cleanBase64, 'base64');

    const uploadsDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Append timestamp to prevent filename collisions
    const fileExt = path.extname(filename) || '.mp3';
    const baseName = path.basename(filename, fileExt).replace(/[^a-zA-Z0-9]/g, '_');
    const finalFilename = `${baseName}-${Date.now()}${fileExt}`;
    const filePath = path.join(uploadsDir, finalFilename);

    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${finalFilename}`;

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        filename: finalFilename
      }
    });
  } catch (err: any) {
    next(err);
  }
});
