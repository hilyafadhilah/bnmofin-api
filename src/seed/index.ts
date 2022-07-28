import { useDataSource, useSeeders } from '@jorgebodega/typeorm-seeding';
import type { DataSource } from 'typeorm';
import { isTrueString } from '../utils/data-utils';
import { printInfo } from './seed-utils';
import { seeders } from './seeders';

const isSeed = isTrueString(process.env.SEED_DATA)
  && process.env.NODE_ENV !== 'production';

const isSeedInfo = isTrueString(process.env.SEED_INFO)
  && process.env.NODE_ENV !== 'production';

async function seed(dataSource: DataSource) {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  await dataSource.synchronize();

  await useDataSource(dataSource);

  const { logging } = dataSource.options;
  dataSource.setOptions({ logging: ['warn', 'error'] });

  await useSeeders(seeders);

  dataSource.setOptions({ logging });
}

export const seeder = {
  isSeed,
  seed,
  isSeedInfo,
  printInfo,
};
