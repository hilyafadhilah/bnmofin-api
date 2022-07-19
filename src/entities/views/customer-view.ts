import { Expose } from 'class-transformer';
import {
  IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString,
} from 'class-validator';
import { ViewColumn, ViewEntity } from 'typeorm';
import { Customer, CustomerStatus } from '../customer';
import { User } from '../user';

/**
 * Created for returning customer data
 * that doesn't contain user password
 */
@ViewEntity({
  name: 'CustomerView',
  expression: (dataSource) => dataSource
    .createQueryBuilder()
    .select('*')
    .addSelect('User.username')
    .from(Customer, 'Customer')
    .innerJoin(User, 'User', 'Customer.userId = User.id'),
})
export class CustomerView {
  @ViewColumn()
  @IsPositive({
    groups: ['query'],
  })
  @Expose()
  userId!: number;

  @ViewColumn()
  @IsNotEmpty({
    groups: ['query'],
  })
  @Expose()
  fullname!: string;

  @ViewColumn()
  @Expose()
  idCardImage!: string;

  @ViewColumn()
  @IsEnum(CustomerStatus, {
    groups: ['query'],
  })
  @Expose()
  status!: CustomerStatus;

  @ViewColumn()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { groups: ['query'] },
  )
  @Expose()
    balance!: number;

  @ViewColumn()
  @IsString({
    groups: ['query'],
  })
  @Expose()
  username!: string;
}
