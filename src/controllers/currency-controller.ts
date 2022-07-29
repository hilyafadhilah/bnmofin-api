import {
  Get, JsonController, QueryParams, UseBefore,
} from 'routing-controllers';
import { getSymbols, convert } from '../api/exchange-api';
import { MoneyConfig } from '../config/money-config';
import { nameMiddleware } from '../middlewares/name-middleware';
import { Money } from '../models/money';

@JsonController('/currency')
@UseBefore(nameMiddleware('currency'))
export class CurrencyController {
  @Get('/symbols')
  async getSymbols() {
    return getSymbols();
  }

  @Get('/convert/from')
  async convertFrom(

    @QueryParams({ required: true, validate: true })
    { amount, currency }: Money,

  ) {
    return convert(amount, currency, MoneyConfig.defaultCurrency.symbol);
  }

  @Get('/convert/to')
  async convertTo(

    @QueryParams({ required: true, validate: true })
    { amount, currency }: Money,

  ) {
    return convert(amount, MoneyConfig.defaultCurrency.symbol, currency);
  }
}
