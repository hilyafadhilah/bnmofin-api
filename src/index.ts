import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import { useExpressServer } from 'routing-controllers';
import { middlewares } from './middlewares';
import { authorizationChecker, currentUserChecker } from './middlewares/auth-middleware';
import { controllers } from './controllers';
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

dataSource.initialize()
  .then(() => {
    logger.info('Connected to DB');
    app.listen(process.env.APP_PORT ?? 3000);
  })
  .catch((err) => {
    logger.error('Failed to connect to db!', { err });
  });
