import { applicationDefault, initializeApp } from 'firebase-admin/app';

console.assert(process.env.GOOGLE_STORAGE_BUCKET, 'Google storage bucket is not set.');

export function initializeUploader() {
  initializeApp({
    credential: applicationDefault(),
    storageBucket: process.env.GOOGLE_STORAGE_BUCKET,
  });
}
