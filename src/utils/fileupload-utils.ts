import { getStorage } from 'firebase-admin/storage';

export const fileExt = (fname: string) => (
  fname.slice((Math.max(0, fname.lastIndexOf('.')) || Infinity) + 1)
);

export const replaceFilename = (base: string, replacement: string) => (
  `${replacement}.${fileExt(base)}`
);

export async function uploadFile(src: string, dst: string) {
  const bucket = getStorage().bucket();
  const file = await bucket.upload(src, {
    destination: dst,
  });

  return file[0];
}

export const mimeExt = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
};
