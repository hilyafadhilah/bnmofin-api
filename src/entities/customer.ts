import {
  IsEnum,
  IsInt, IsNumber, IsPositive, IsString, IsUrl, Length,
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
  id!: number;

  @Column()
  @IsString()
  @Length(1)
  fullname!: string;

  @Column()
  @IsString()
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

  @OneToOne(() => User)
  @JoinColumn({ name: 'id' })
  user!: User;
}
