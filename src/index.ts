import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import { useExpressServer } from 'routing-controllers';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { controllers } from './controllers';
import { interceptors, middlewares } from './middlewares';
import { authorizationChecker, currentUserChecker } from './middlewares/auth-middleware';
import dataSource from './data-source';
import logger from './logger';
import { startCacher } from './cacher';

const app = express();
const appPort = process.env.APP_PORT ?? 3030;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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
    initializeApp({
      credential: applicationDefault(),
      storageBucket: process.env.GOOGLE_STORAGE_BUCKET,
    });
    logger.info('Connected to firebase.');

    await dataSource.initialize();
    logger.info('Connected to DB.');

    await startCacher();
    logger.info('Connected to cacher.');

    app.listen(appPort);
    logger.info(`Server ready on port ${appPort}.`);
  } catch (err: any) {
    logger.error('Initialization failed.', err);
  }
};

bootstrap();
