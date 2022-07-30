import { useDataSource, useSeeders } from '@jorgebodega/typeorm-seeding';
import { dataSource } from '../data-source';
import { isTrueString } from '../utils/data-utils';
import { printInfo } from './seed-utils';
import { seeders } from './seeders';

const isSeed = isTrueString(process.env.SEED_DATA)
  && process.env.NODE_ENV !== 'production';

const isSeedInfo = isTrueString(process.env.SEED_INFO);

async function seed() {
  await dataSource.synchronize(true);
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
