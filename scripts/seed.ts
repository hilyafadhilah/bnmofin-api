import { dataSource } from '../src/data-source';
import { seeder } from '../src/seed';

(async () => {
  if (!process.argv.includes('--info-only')) {
    console.info('Seeding...');
  
    dataSource.setOptions({
      dropSchema: true,
      synchronize: false,
    });
    await seeder.seed(dataSource);

    console.info('Seeder finished.');
  }

  await seeder.printInfo(dataSource);
})();
