export namespace ExchangeApi {
  export type Symbols = Record<string, string>;
  export type ConvertInfo = {
    rate: number
    timestamp: number
  };
}

export namespace ExchangeApiResponse {
  export interface Symbols {
    success: boolean
    symbols: ExchangeApi.Symbols
  }

  export interface Convert {
    date: string
    historical: string
    success: boolean
    result: number
    info: ExchangeApi.ConvertInfo
    query: {
      amount: number
      from: string
      to: string
    }
  }
}
