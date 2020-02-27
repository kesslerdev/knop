import pino, { Logger } from "pino";

export const createLogger = (name: string): Logger => {
  const logger = pino({
    name,
    level: process.env.LOGGER_LEVEL || "info",
    redact: {
      paths: ['key', 'password', 'secret'],
      censor: '**GDPR COMPLIANT**'
    },
    prettyPrint: process.env.NODE_ENV === 'production' ?
      false
      : {
        translateTime: true,
        ignore: 'pid,hostname'
      }
  })

  process.on('warning', error => {
    logger.warn(error.name, error.message)
  });

  return logger;
}
