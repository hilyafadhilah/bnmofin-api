export namespace MoneyConfig {
  export const defaultCurrency = {
    symbol: 'IDR',
    name: 'Indonesian Rupiah',
  };

  export const limit = {
    request: {
      min: -2000000,
      max: 2000000,
    },
    transfer: {
      min: 0.000001,
      max: 2000000,
    },
  };
}
