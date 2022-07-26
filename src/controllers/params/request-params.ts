/* eslint-disable max-classes-per-file */
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInstance, ValidateNested } from 'class-validator';
import { ResponseStatus } from '../../entities/response';
import { Money } from '../../models/money';

export class NewRequestParams {
  @IsInstance(Money)
  @ValidateNested()
  @Expose()
  @Type(() => Money)
  money!: Money;
}

export class ResponseParams {
  @IsEnum(ResponseStatus)
  @Expose()
  status!: ResponseStatus;
}
