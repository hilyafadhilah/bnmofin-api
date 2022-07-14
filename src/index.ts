import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import { useExpressServer } from 'routing-controllers';
import { AuthMiddleware, authorizationChecker, currentUserChecker } from './middlewares/auth-middleware';
import { controllers } from './controllers';
import dataSource from './data-source';
import logger from './logger';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

useExpressServer(app, {
  controllers,
  middlewares: [AuthMiddleware],
  authorizationChecker,
  currentUserChecker,
});

dataSource.initialize()
  .then(() => {
    logger.info('Connected to DB');
    app.listen(3000);
  })
  .catch((err) => {
    logger.error('Failed to connect to db!', { err });
  });
