import { createLogger, format, transports } from 'winston';
import type TransportStream from 'winston-transport';
import { isFalseString, isTrueString } from './utils/data-utils';

const jsonStringify = (obj: any, padding: string = ' ') => {
  const str = JSON.stringify(obj);
  return str === '{}' ? '' : padding + str;
};

const fileTransports: TransportStream[] = [];

if (!isFalseString(process.env.LOGFILE_ERROR)) {
  fileTransports.push(
    new transports.File({
      filename: process.env.LOGFILE_ERROR && !isTrueString(process.env.LOGFILE_ERROR)
        ? process.env.LOGFILE_ALL
        : 'logs/errors.log',
      level: 'error',
    }),
  );
}

if (process.env.LOGFILE_ALL && !isFalseString(process.env.LOGFILE_ALL)) {
  fileTransports.push(
    new transports.File({
      filename: process.env.LOGFILE_ALL && !isTrueString(process.env.LOGFILE_ALL)
        ? process.env.LOGFILE_ALL
        : 'logs/logs.log',
    }),
  );
}

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({
      level, message, timestamp, ...rest
    }) => `[${timestamp}][${level.toUpperCase()}] ${message}${jsonStringify(rest)}`),
  ),
  transports: [
    ...fileTransports,
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.label({ label: 'app' }),
        format.timestamp(),
        format.printf(({
          level, message, label, timestamp, ...rest
        }) => `${timestamp} [${label}] ${level}: ${message}${jsonStringify(rest)}`),
      ),
    }),
  ],
});
