/* eslint-disable max-classes-per-file */
import { Expose, Type } from 'class-transformer';
import {
  IsInstance, IsInt, IsNumber, IsPositive, ValidateNested,
} from 'class-validator';
import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, PrimaryGeneratedColumn, RelationId,
} from 'typeorm';
import { EntityConfig } from '../config/entity-config';
import { Customer } from './customer';

@Entity({ name: 'request' })
export class Request {
  @PrimaryGeneratedColumn('identity')
  @IsInt()
  @IsPositive()
  @Expose()
  @Type(() => Number)
  id!: number;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({
    name: 'customer_id',
    foreignKeyConstraintName: 'fk_request_customer',
  })
  @IsInstance(Customer, { groups: ['query'] })
  @ValidateNested({ groups: ['query'] })
  @Expose()
  @Type(() => Customer)
  customer!: Customer;

  @Column({ name: 'customer_id' })
  @RelationId((request: Request) => request.customer)
  @IsInt()
  @IsPositive()
  @Expose()
  @Type(() => Number)
  customerId!: number;

  @Column('numeric', EntityConfig.currencyColumnOptions)
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { groups: ['post', 'query'] },
  )
  @Expose()
  @Type(() => Number)
  amount!: number;

  @CreateDateColumn()
  created!: Date;
}
