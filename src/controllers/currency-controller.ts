import { Get, JsonController } from 'routing-controllers';
import { getSymbols } from '../api/exchange-api';

@JsonController('/currency')
export class CurrencyController {
  @Get('/symbols')
  async getSymbols() {
    return getSymbols();
  }
}
