import path from 'path';
import os from 'os';
import type { Options } from 'multer';

export namespace IdCardUploadConfig {
  export const acceptedTypes = [
    'image/png',
    'image/jpeg',
    'image/gif',
  ];

  export const dirname = process.env.GOOGLE_STORAGE_PREFIX ?? 'IdCards';

  export const options: Options = {
    dest: path.join(os.tmpdir(), dirname),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5 MB
    },
    fileFilter(req, file, callback) {
      callback(null, acceptedTypes.includes(file.mimetype));
    },
  };
}
