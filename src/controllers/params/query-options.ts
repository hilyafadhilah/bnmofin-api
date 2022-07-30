import { Expose } from 'class-transformer';
import { isEmpty, IsNotEmpty, ValidateIf } from 'class-validator';

export class QueryStringOptions {
  @ValidateIf((o) => isEmpty(o.startsWith) && isEmpty(o.endsWith))
  @IsNotEmpty()
  @Expose()
  is?: string;

  @ValidateIf((o) => isEmpty(o.is) && isEmpty(o.endsWith))
  @IsNotEmpty()
  @Expose()
  startsWith?: string;

  @ValidateIf((o) => isEmpty(o.is) && isEmpty(o.startsWith))
  @IsNotEmpty()
  @Expose()
  endsWith?: string;
}
