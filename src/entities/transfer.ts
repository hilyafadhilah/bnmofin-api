import { Expose, Type } from 'class-transformer';
import {
  IsInstance, IsInt, IsNumber, IsPositive, ValidateNested,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId,
} from 'typeorm';
import { EntityConfig } from '../config/entity-config';
import { Customer } from './customer';

@Entity({ name: 'Transfer' })
export class Transfer {
  @PrimaryGeneratedColumn('identity')
  @IsInt({ groups: ['query'] })
  @IsPositive({ groups: ['query'] })
  @Expose()
  @Type(() => Number)
  id!: number;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({
    name: 'senderId',
    foreignKeyConstraintName: 'FK_TransferSender',
  })
  @IsInstance(Customer, { groups: ['query'] })
  @ValidateNested({ groups: ['query'] })
  @Expose()
  @Type(() => Customer)
  sender!: Customer;

  @Column()
  @RelationId((transfer: Transfer) => transfer.sender)
  @IsInt()
  @IsPositive()
  @Expose()
  @Type(() => Number)
  senderId!: number;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({
    name: 'receiverId',
    foreignKeyConstraintName: 'FK_TransferReceiver',
  })
  @IsInstance(Customer, { groups: ['query'] })
  @ValidateNested({ groups: ['query'] })
  @Expose()
  @Type(() => Customer)
  receiver!: Customer;

  @Column()
  @RelationId((transfer: Transfer) => transfer.receiver)
  @IsInt({ groups: ['issue'] })
  @IsPositive({ groups: ['issue'] })
  @Expose()
  @Type(() => Number)
  receiverId!: number;

  @Column('numeric', EntityConfig.currencyColumnOptions)
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { groups: ['issue', 'query'] },
  )
  @IsPositive({ groups: ['issue', 'query'] })
  @Expose()
  @Type(() => Number)
  amount!: number;

  @CreateDateColumn()
  created!: Date;
}
