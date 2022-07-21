import { Expose, Type } from 'class-transformer';
import {
  IsEnum, IsInt, IsNotEmpty, IsNumber, IsObject, IsPositive, IsUrl, ValidateNested,
} from 'class-validator';
import {
  Column, Entity, JoinColumn, OneToOne, PrimaryColumn, RelationId,
} from 'typeorm';
import { EntityConfig } from '../config/entity-config';
import { User } from './user';

export enum CustomerStatus {
  Verified = 'verified',
  Unverified = 'unverified',
}

@Entity({ name: 'Customer' })
export class Customer {
  @PrimaryColumn()
  @RelationId((customer: Customer) => customer.user)
  @IsInt()
  @IsPositive()
  @Expose()
  userId!: number;

  @Column()
  @IsNotEmpty({
    groups: ['register', 'query'],
  })
  fullname!: string;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  idCardImage!: string;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.Unverified,
  })
  @IsEnum(CustomerStatus, {
    groups: ['query'],
  })
  status!: CustomerStatus;

  @Column('numeric', EntityConfig.currencyColumnOptions)
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { groups: ['query'] },
  )
  balance!: number;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_CustomerUser',
  })
  @Type(() => User)
  @IsObject({
    groups: ['register', 'query'],
  })
  @ValidateNested({
    groups: ['register', 'query'],
  })
  user!: User;
}
