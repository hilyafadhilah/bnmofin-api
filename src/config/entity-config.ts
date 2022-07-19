import { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions';
import type { ColumnNumericOptions } from 'typeorm/decorator/options/ColumnNumericOptions';

export namespace EntityConfig {
  export const currencyColumnOptions: ColumnCommonOptions & ColumnNumericOptions = {
    precision: 15,
    scale: 6,
    transformer: {
      from: (value: any) => parseFloat(value),
      to: (value: any) => value,
    },
  };
}
