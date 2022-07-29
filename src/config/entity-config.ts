import type { ColumnOptions } from 'typeorm';
import type { ColumnCommonOptions } from 'typeorm/decorator/options/ColumnCommonOptions';
import type { ColumnNumericOptions } from 'typeorm/decorator/options/ColumnNumericOptions';

export namespace EntityConfig {
  export const currencyColumnOptions: ColumnCommonOptions & ColumnNumericOptions = {
    precision: 21,
    scale: 6,
    transformer: {
      from: (value: any) => parseFloat(value),
      to: (value: any) => value,
    },
  };

  export const createdColumnOptions: ColumnOptions = {
    type: 'timestamptz',
    default: () => 'now()',
  };
}
