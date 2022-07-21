export type ErrorDescriptor = {
  code: number,
  title: string,
  message: (data: any) => string,
};

export enum ErrorName {
  ServerError = 'ServerError',
  InvalidInput = 'InvalidInput',
  NotFound = 'NotFound',

  // auth
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  TokenExpired = 'TokenExpired',
  InvalidToken = 'InvalidToken',

  // login
  WrongPassword = 'WrongPassword',

  // register
  UsernameTaken = 'UsernameTaken',

  // transfer
  InsufficientBalance = 'InsufficientBalance',
}

export const errorMapping: Record<ErrorName, ErrorDescriptor> = {
  [ErrorName.ServerError]: {
    code: 500,
    title: 'Internal Server Error',
    message: () => 'An error occured. Please try again later.',
  },
  [ErrorName.InvalidInput]: {
    code: 400,
    title: 'Invalid Input',
    message: () => 'The input provided was invalid.',
  },
  [ErrorName.NotFound]: {
    code: 404,
    title: 'Not Found',
    message: (resource?: string) => (resource
      ? `${resource} was not found.`
      : 'The requested resource was not found.'
    ),
  },
  [ErrorName.Unauthorized]: {
    code: 401,
    title: 'Unauthorized',
    message: () => 'You are unauthorized to access this resource.',
  },
  [ErrorName.Forbidden]: {
    code: 403,
    title: 'Forbidden',
    message: () => 'Insufficient permission.',
  },
  [ErrorName.TokenExpired]: {
    code: 401,
    title: 'Token Expired',
    message: () => 'Your token has expired. Please log in again.',
  },
  [ErrorName.InvalidToken]: {
    code: 401,
    title: 'Token Invalid',
    message: () => 'The token provided is invalid.',
  },
  [ErrorName.WrongPassword]: {
    code: 401,
    title: 'Wrong Password',
    message: () => 'Password does not match.',
  },
  [ErrorName.UsernameTaken]: {
    code: 409,
    title: 'Username Taken',
    message: ({ username }) => `Username "${username}" already exist.`,
  },
  [ErrorName.InsufficientBalance]: {
    code: 403,
    title: 'Not Enough Balance',
    message: () => 'Your balance is not enough.',
  },
};
