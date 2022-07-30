import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { useExpressServer } from 'routing-controllers';
import { controllers } from './controllers';
import {
  interceptors, middlewares, authorizationChecker, currentUserChecker,
} from './middlewares';
import { initializeDataSource } from './data-source';
import { logger } from './logger';
import { initializeCacher } from './cacher';
import { initializeUploader } from './uploader';
import { seeder } from './seed';

const app = express();
const appPort = process.env.PORT ?? 3030;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.disable('x-powered-by');

useExpressServer(app, {
  controllers,
  middlewares,
  interceptors,
  authorizationChecker,
  currentUserChecker,
  validation: false,
  defaultErrorHandler: false,
  defaults: {
    nullResultCode: 404,
    undefinedResultCode: 204,
  },
});

const bootstrap = async () => {
  try {
    logger.info('Initializing firebase.');
    initializeUploader();
    logger.info('Connected to firebase.');

    logger.info('Initializing DB.');
    await initializeDataSource();
    logger.info('Connected to DB.');

    logger.info('Initializing redis.');
    await initializeCacher();
    logger.info('Connected to redis.');

    if (seeder.isSeed) {
      logger.info('Initializing seeder.');
      await seeder.seed();
      logger.info('Seeder finished.');
    }

    if (seeder.isSeedInfo) {
      await seeder.printInfo();
    }

    app.listen(appPort);
    logger.info(`Server ready on port ${appPort}.`);
  } catch (err: any) {
    logger.error('Initialization failed.', err);
    process.exitCode = 1;
  }
};

bootstrap();
