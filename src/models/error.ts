import { errorMapping, ErrorName } from '../errors';

export interface ErrorResponse {
  error: {
    name: string,
    title: string,
    message: string,
  },
  data: any,
}

export class AppError extends Error {
  constructor(public name: ErrorName, public data: any = undefined) {
    super();
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
      data: this.data,
    };
  }
}
