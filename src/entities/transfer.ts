import { IsInt, IsNumber, IsPositive } from 'class-validator';
import {
  Column,
  Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from './customer';

@Entity({ name: 'Transfer' })
export class Transfer {
  @PrimaryGeneratedColumn('identity')
  id!: number;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'senderId' })
  sender!: Customer;

  @Column()
  @IsInt()
  @IsPositive()
  senderId!: number;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'receiverId' })
  receiver!: Customer;

  @Column()
  @IsInt()
  @IsPositive()
  receiverId!: number;

  @Column({
    type: 'numeric',
    precision: 2,
  })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsPositive()
  amount!: number;
}
