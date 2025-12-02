import { Logger } from '@nestjs/common';

try {
  Logger.overrideLogger(false);
} catch {
  // ignore
}

const noop = () => undefined;
try {
  const globalAny = global as unknown as { jest?: unknown };
  if ('jest' in globalAny && typeof globalAny.jest === 'object') {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(noop);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(noop);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(noop);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(noop);
  } else {
    Logger.prototype.error = noop;
    Logger.prototype.warn = noop;
    Logger.prototype.log = noop;
    Logger.prototype.debug = noop;
  }
} catch {
  // swallow any error to not break tests
}
