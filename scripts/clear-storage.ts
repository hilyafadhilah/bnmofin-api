import { getStorage } from 'firebase-admin/storage';
import { initializeUploader } from '../src/uploader';
import { IdCardUploadConfig } from '../src/config/fileupload-config';

;(async () => {
  await initializeUploader();
  const bucket = getStorage().bucket();
  const prefix = `${IdCardUploadConfig.dirname}/`;

  console.log(`Deleting all files with prefix ${prefix} ...`)
  await bucket.deleteFiles({ prefix, force: true });

  console.log(`Deleting ${IdCardUploadConfig.dirname} ...`)
  await bucket.file(IdCardUploadConfig.dirname).delete({ ignoreNotFound: true })
})()
