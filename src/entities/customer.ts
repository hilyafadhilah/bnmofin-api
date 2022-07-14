import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt, IsNotEmpty, IsNumber, IsObject, IsPositive, IsUrl, ValidateNested,
} from 'class-validator';
import {
  Column, Entity, JoinColumn, OneToOne, PrimaryColumn,
} from 'typeorm';
import { User } from './user';

export enum CustomerStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
}

@Entity({ name: 'Customer' })
export class Customer {
  @PrimaryColumn()
  @IsInt()
  @IsPositive()
  userId!: number;

  @Column()
  @IsNotEmpty({
    groups: ['register'],
  })
  fullname!: string;

  @Column()
  @IsNotEmpty()
  @IsUrl()
  idCardImage!: string;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.UNVERIFIED,
  })
  @IsEnum(CustomerStatus)
  status!: CustomerStatus;

  @Column({
    type: 'numeric',
    precision: 2,
  })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  balance!: number;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn({ name: 'userId' })
  @Type(() => User)
  @IsObject({
    groups: ['register'],
  })
  @ValidateNested({
    groups: ['register'],
  })
  user!: User;
}
