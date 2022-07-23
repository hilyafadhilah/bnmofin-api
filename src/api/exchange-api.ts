import axios from 'axios';
import { decache, encache } from '../cacher';
import { ErrorName } from '../errors';
import { AppError } from '../models/error';
import { ExchangeApi, ExchangeApiResponse } from '../models/exchange';

console.assert(process.env.APILAYER_KEY, 'ApiLayer key is not set.');

const axiosInstance = axios.create({
  baseURL: 'https://api.apilayer.com/exchangerates_data',
  headers: {
    apikey: process.env.APILAYER_KEY!,
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      return Promise.reject(new AppError(ErrorName.IdrOnly));
    }

    return Promise.reject(error);
  },
);

export const cacheKeys = {
  symbols: 'currency_symbols',
  convert(from: string, to: string) {
    return `from:${from};to:${to}`;
  },
};

/**
 * List of symbols
 *
 * While yes we are using redis cache, it is still extremely
 * faster to keep the list of supported symbols in memory
 * because everytime we convert we are going to check whether
 * the symbol is supported or not.
 *
 * @see convert()
 */
const symbolsList: string[] = [];

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

  symbolsList.splice(0);
  Object.keys(symbols!).forEach((sym) => symbolsList.push(sym));

  return symbols;
}

export async function getSymbolsList() {
  if (symbolsList.length === 0) {
    await getSymbols();
  }

  return symbolsList;
}

export async function convert(amount: number, from: string, to: string) {
  const symbols = await getSymbolsList();

  if (!symbols.includes(from) || !symbols.includes(to)) {
    throw new AppError(ErrorName.InvalidInput);
  }

  let rate = 1.0;

  if (from !== to) {
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

    rate = info.rate;
  }

  return amount * rate;
}
