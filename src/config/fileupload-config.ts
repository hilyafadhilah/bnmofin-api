import path from 'path';
import os from 'os';
import type { Options } from 'multer';

export namespace IdCardUploadConfig {
  export const acceptedTypes = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/bmp',
  ];

  export const multerOptions: Options = {
    dest: path.join(os.tmpdir(), 'IdCards'),
    fileFilter(req, file, callback) {
      callback(null, acceptedTypes.includes(file.mimetype));
    },
  };
}
