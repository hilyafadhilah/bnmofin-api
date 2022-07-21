import axios from 'axios';
import { decache, encache } from '../cacher';
import { ErrorName } from '../errors';
import { AppError } from '../models/error';
import { ExchangeApi, ExchangeApiResponse } from '../models/exchange';

export const cacheKeys = {
  symbols: 'currency_symbols',
  convert(from: string, to: string) {
    return `from:${from};to:${to}`;
  },
};

export const axiosInstance = axios.create({
  baseURL: 'https://api.apilayer.com/exchangerates_data',
  headers: {
    apikey: process.env.APILAYER_KEY!,
  },
});

export async function getSymbols() {
  let symbols = await decache<ExchangeApi.Symbols>(cacheKeys.symbols);

  if (symbols == null) {
    const response = await axiosInstance.get('/symbols');
    if (!response.data.success) {
      throw new AppError(ErrorName.ServerError, response);
    }

    symbols = response.data.symbols;
    await encache(cacheKeys.symbols, symbols);
  }

  return symbols!;
}

export async function convert(amount: number, from: string, to: string) {
  const symbols = await getSymbols();

  if (!(from in symbols) || !(to in symbols)) {
    throw new AppError(ErrorName.InvalidInput);
  }

  const key = cacheKeys.convert(from, to);
  let info = await decache<ExchangeApi.ConvertInfo>(key);

  if (info == null) {
    const response = await axiosInstance.get<ExchangeApiResponse.Convert>('/convert', {
      params: {
        from,
        to,
        amount: 1.0,
      },
    });

    if (!response.data.success) {
      throw new AppError(ErrorName.ServerError, response);
    }

    info = response.data.info;
    await encache(key, info);
  }

  return amount * info!.rate;
}
