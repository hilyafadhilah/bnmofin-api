import { Expose, Type } from 'class-transformer';
import {
  IsEnum, IsIn, IsInstance, IsInt, IsNumber, IsPositive, ValidateNested,
} from 'class-validator';
import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId,
} from 'typeorm';
import { EntityConfig } from '../config/entity-config';
import { Customer } from './customer';

export enum RequestStatus {
  Accepted = 'accepted',
  Declined = 'declined',
  Awaiting = 'awaiting',
}

@Entity({ name: 'Request' })
export class Request {
  @PrimaryGeneratedColumn('identity')
  @IsInt()
  @IsPositive()
  @Expose()
  @Type(() => Number)
  id!: number;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({
    name: 'customerId',
    foreignKeyConstraintName: 'FK_RequestCustomer',
  })
  @IsInstance(Customer, { groups: ['query'] })
  @ValidateNested({ groups: ['query'] })
  @Expose()
  @Type(() => Customer)
  customer!: Customer;

  @Column()
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

  // @Column({
  //   type: 'enum',
  //   enum: RequestStatus,
  //   default: RequestStatus.Awaiting,
  // })
  // @IsEnum(RequestStatus, {
  //   groups: ['updateStatus', 'query'],
  // })
  // @IsIn(
  //   [RequestStatus.Accepted, RequestStatus.Declined],
  //   { groups: ['updateStatus'] },
  // )
  // @Expose()
  // status!: RequestStatus;

  @CreateDateColumn()
  created!: Date;
}
