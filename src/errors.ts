export type ErrorDescriptor = {
  code: number,
  title: string,
  message: (data: any) => string,
};

export enum ErrorName {
  SERVER_ERROR = 'SERVER_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',

  // login
  USERNAME_NOTFOUND = 'USERNAME_NOTFOUND',
  WRONG_PASSWORD = 'WRONG_PASSWORD',

  // register
  USERNAME_TAKEN = 'USERNAME_TAKEN',
}

export const errorMapping: Record<ErrorName, ErrorDescriptor> = {
  [ErrorName.SERVER_ERROR]: {
    code: 501,
    title: 'Internal Server Error',
    message: () => 'An error occured. Please try again later.',
  },
  [ErrorName.INVALID_INPUT]: {
    code: 400,
    title: 'Invalid Input',
    message: () => 'The input provided was invalid.',
  },
  [ErrorName.UNAUTHORIZED]: {
    code: 401,
    title: 'Unauthorized',
    message: () => 'You are unauthorized to access this resource.',
  },
  [ErrorName.TOKEN_EXPIRED]: {
    code: 401,
    title: 'Token Expired',
    message: () => 'Your token has expired. Please log in again.',
  },
  [ErrorName.TOKEN_INVALID]: {
    code: 401,
    title: 'Token Invalid',
    message: () => 'The token provided is invalid.',
  },
  [ErrorName.USERNAME_NOTFOUND]: {
    code: 404,
    title: 'User Not Found',
    message: ({ username }) => `Username "${username}" does not exist.`,
  },
  [ErrorName.WRONG_PASSWORD]: {
    code: 401,
    title: 'Wrong Password',
    message: () => 'Password does not match.',
  },
  [ErrorName.USERNAME_TAKEN]: {
    code: 400,
    title: 'Username Taken',
    message: ({ username }) => `Username "${username}" already exist.`,
  },
};
