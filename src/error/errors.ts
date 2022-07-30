import { MoneyConfig } from '../config/money-config';
import { moneyFormat } from '../utils/data-utils';

export type ErrorResponseInfo = {
  code: number,
  name: string,
  title: string,
  message: string,
};

export function ServerError({ title, message }: {
  title?: string, message?: string } = {}): ErrorResponseInfo {
  return {
    code: 500,
    name: 'ServerError',
    title: title ?? 'Server Error',
    message: message ?? 'An error occured. Please try again later.',
  };
}

export function InvalidInput({
  thing,
  message,
}: { thing?: string, message?: string } = {}): ErrorResponseInfo {
  const m = message ?? (thing
    ? `The input provided for ${thing} is invalid.`
    : 'The input provided is invalid.');

  return {
    code: 400,
    name: 'InvalidInput',
    title: `Invalid ${thing ?? 'Input'}`,
    message: m,
  };
}

export function NotFound({
  thing,
  thingDetailed,
  message,
}: { thing?: string, thingDetailed?: string, message?: string } = {}): ErrorResponseInfo {
  return {
    code: 404,
    name: 'NotFound',
    title: thing ? `${thing} Not Found` : 'Not Found',
    message: message ?? thing
      ? `${thingDetailed ?? thing} could not be found.`
      : 'The requested thing could not be found.',
  };
}

export function AlreadyExists({
  thing,
  message,
}: { thing?: string, message?: string } = {}): ErrorResponseInfo {
  return {
    code: 409,
    name: 'AlreadyExists',
    title: thing ? `${thing} Already Exists` : 'Already Exists',
    message: message ?? (thing
      ? `${thing} already exists.`
      : 'The requested thing already exists.'),
  };
}

export function Unauthorized({
  thing = 'this resource',
  message,
}: { thing?: string, message?: string } = {}): ErrorResponseInfo {
  return {
    code: 401,
    name: 'Unauthorized',
    title: 'Unauthorized',
    message: message ?? `You are unauthorized to access ${thing}.`,
  };
}

export function Forbidden({
  action = 'perform the requested action',
  title = 'Forbidden',
  message,
}: { action?: string, title?: string, message?: string } = {}): ErrorResponseInfo {
  return {
    code: 403,
    name: 'Forbidden',
    title,
    message: message ?? `You have insufficient permission to ${action}.`,
  };
}

export function TokenExpired(): ErrorResponseInfo {
  return {
    code: 403,
    name: 'TokenExpired',
    title: 'Token Expired',
    message: 'Your token has expired. Please log in again.',
  };
}

export function InvalidToken(): ErrorResponseInfo {
  return {
    code: 401,
    name: 'InvalidToken',
    title: 'Invalid Token',
    message: 'The token provided is invalid.',
  };
}

export function InvalidCredentials({
  title,
  message,
}: { title?: string, message?: string } = {}): ErrorResponseInfo {
  return {
    code: 401,
    name: 'InvalidCredentials',
    title: title ?? 'Invalid Credentials',
    message: message ?? 'The provided credentials are invalid.',
  };
}

export function InsufficientBalance({
  balance,
  amount,
  currency = MoneyConfig.defaultCurrency.symbol,
}: { balance: number, amount: number, currency?: string }): ErrorResponseInfo {
  return Forbidden({
    title: 'Not Enough Balance',
    message: 'Not enough balance.'
      + ` Your balance is ${moneyFormat(balance, currency)}.`
      + ` Submitted amount is ${moneyFormat(amount, currency)}.`,
  });
}

export function MoneyLimit({
  amount,
  limit,
  currency = MoneyConfig.defaultCurrency.symbol,
}: { amount: number, limit: { min: number, max: number }, currency?: string }): ErrorResponseInfo {
  return InvalidInput({
    thing: 'amount',
    message: `Submitted amount is ${moneyFormat(amount, currency)}. ${
      amount > limit.max
        ? `Maximum limit is ${moneyFormat(limit.max, currency)}.`
        : `Minimum limit is ${moneyFormat(limit.min, currency)}.`}`,
  });
}

export function CurrencyLimit({ symbol, name }: {
  symbol: string,
  name: string,
} = MoneyConfig.defaultCurrency) {
  return ServerError({
    message: 'Server is currently unable to do currency data fetching and conversion.'
      + ` Please use ${symbol} (${name}).`,
  });
}
