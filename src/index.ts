import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import { useExpressServer } from 'routing-controllers';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { controllers } from './controllers';
import { middlewares } from './middlewares';
import { authorizationChecker, currentUserChecker } from './middlewares/auth-middleware';
import dataSource from './data-source';
import logger from './logger';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

useExpressServer(app, {
  controllers,
  middlewares,
  authorizationChecker,
  currentUserChecker,
  validation: false,
  defaultErrorHandler: false,
});

const bootstrap = async () => {
  try {
    initializeApp({ credential: applicationDefault() });
    logger.info('Connected to firebase.');

    await dataSource.initialize();
    logger.info('Connected to DB');

    app.listen(process.env.APP_PORT ?? 3000);
  } catch (err: any) {
    logger.error('Initialization failed.', err);
  }
};

bootstrap();
