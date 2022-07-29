import { dataSource } from '../src/data-source';
import { initializeUploader } from '../src/uploader';
import { seeder } from '../src/seed';

(async () => {
  await dataSource.initialize();

  if (!process.argv.includes('--info-only')) {
    console.info('Seeding...');

    initializeUploader();
    dataSource.setOptions({
      dropSchema: true,
      synchronize: false,
    });
    await seeder.seed(dataSource);

    console.info('Seeder finished.');
  }

  await seeder.printInfo(dataSource);
})();
