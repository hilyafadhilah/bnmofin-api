export type ErrorDescriptor = {
  code: number,
  title: string,
  message: (data: any) => string,
};

export enum ErrorName {
  ServerError = 'ServerError',
  InvalidInput = 'InvalidInput',
  NotFound = 'NotFound',
  AlreadyExists = 'AlreadyExists',

  // auth
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  TokenExpired = 'TokenExpired',
  InvalidToken = 'InvalidToken',

  // login
  WrongPassword = 'WrongPassword',
  UnverifiedAccount = 'UnverifiedAccount',

  // register
  UsernameTaken = 'UsernameTaken',

  // transfer
  InsufficientBalance = 'InsufficientBalance',

  // monetary (Exchange API)
  IdrOnly = 'IdrOnly',
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
    message: (custom?: string) => custom ?? 'The input provided was invalid.',
  },
  [ErrorName.NotFound]: {
    code: 404,
    title: 'Not Found',
    message: (resource?: string) => (resource
      ? `${resource} was ndot found.`
      : 'The requested resource was not found.'
    ),
  },
  [ErrorName.AlreadyExists]: {
    code: 409,
    title: 'Already Exists',
    message: (resource?: string) => (resource
      ? `${resource} already exists.`
      : 'The requested resource already exists.'
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
  [ErrorName.UnverifiedAccount]: {
    code: 401,
    title: 'Account Not Verified',
    message: () => 'Your account has not been verified yet.',
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
  [ErrorName.IdrOnly]: {
    code: 500,
    title: 'Please Use IDR',
    message: () => 'Server is currently unable to do currency data fetching and conversion. Please use IDR (Indonesian Rupiah).',
  },
};
