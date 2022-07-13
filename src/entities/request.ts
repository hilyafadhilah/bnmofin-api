import {
  IsEnum, IsInt, IsNumber, IsPositive,
} from 'class-validator';
import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './customer';

export enum RequestStatus {
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  AWAITING = 'awaiting',
}

@Entity({ name: 'Request' })
export class Request {
  @PrimaryGeneratedColumn('identity')
  @IsInt()
  @IsPositive()
  id!: number;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customerId' })
  customer!: Customer;

  @Column()
  @IsInt()
  @IsPositive()
  customerId!: number;

  @Column({
    type: 'numeric',
    precision: 2,
  })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  amount!: number;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.AWAITING,
  })
  @IsEnum(RequestStatus)
  status!: RequestStatus;
}
