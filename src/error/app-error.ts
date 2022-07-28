import { toTitleCase } from '../utils/data-utils';
import { ErrorResponseInfo } from './errors';

export class AppError extends Error {
  public readonly meta: {
    timestamp: Date
  };

  constructor(
    public readonly info: ErrorResponseInfo,
    public data?: any,
    private hideDataOnProduction = false,
  ) {
    super(info.message);
    this.name = info.name;
    this.meta = { timestamp: new Date() };
  }

  get httpCode() {
    return this.info.code;
  }

  toResponse() {
    let { data } = this;
    if (this.hideDataOnProduction && process.env.NODE_ENV === 'production') {
      data = undefined;
    }

    return {
      error: {
        name: this.info.name,
        title: toTitleCase(this.info.title),
        message: this.info.message,
      },
      meta: this.meta,
      data,
    };
  }
}
