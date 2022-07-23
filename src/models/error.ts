import { errorMapping, ErrorName } from '../errors';

export interface ErrorResponse {
  error: {
    name: string,
    title: string,
    message: string,
  },
  meta: {
    timestamp: Date,
  },
  data: any,
}

export class AppError extends Error {
  public timestamp: Date;

  constructor(public name: ErrorName, public data: any = undefined) {
    super();
    this.timestamp = new Date();
  }

  get message() {
    return errorMapping[this.name].message(this.data);
  }

  get title() {
    return errorMapping[this.name].title;
  }

  get httpCode() {
    return errorMapping[this.name].code;
  }

  toResponse(): ErrorResponse {
    return {
      error: {
        name: this.name,
        title: this.title,
        message: this.message,
      },
      meta: {
        timestamp: this.timestamp,
      },
      data: this.data,
    };
  }
}
