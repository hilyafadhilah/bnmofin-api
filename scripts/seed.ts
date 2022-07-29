import { initializeUploader } from '../src/uploader';
import { seeder } from '../src/seed';

(async () => {
  if (!process.argv.includes('--info-only')) {
    console.info('Seeding...');

    initializeUploader();
    await seeder.seed();

    console.info('Seeder finished.');
  }

  await seeder.printInfo();
})();
