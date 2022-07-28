import { Get, JsonController, UseBefore } from 'routing-controllers';
import { getSymbols } from '../api/exchange-api';
import { nameMiddleware } from '../middlewares/name-middleware';

@JsonController('/currency')
@UseBefore(nameMiddleware('currency'))
export class CurrencyController {
  @Get('/symbols')
  async getSymbols() {
    return getSymbols();
  }
}
