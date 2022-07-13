import { createLogger, format, transports } from 'winston';

const jsonStringify = (obj: any, padding: string = ' ') => {
  const str = JSON.stringify(obj);
  return str === '{}' ? '' : padding + str;
};

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({
      level, message, timestamp, ...rest
    }) => `[${timestamp}][${level.toUpperCase()}] ${message}${jsonStringify(rest)}`),
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.label({ label: 'app' }),
      format.timestamp(),
      format.printf(({
        level, message, label, timestamp, ...rest
      }) => `${timestamp} [${label}] ${level}: ${message}${jsonStringify(rest)}`),
    ),
  }));
}

export default logger;
