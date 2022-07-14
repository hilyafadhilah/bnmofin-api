import 'reflect-metadata';
import dataSource from './data-source';
import logger from './logger';

dataSource.initialize()
  .then(() => {
    logger.info('Connected to DB');
  })
  .catch((err) => {
    logger.error('Failed to connect to db!', { err });
  });
