import { Expose, Type } from 'class-transformer';
import {
  IsInstance, IsInt, IsNumber, IsPositive, ValidateNested,
} from 'class-validator';
import {
  Column,
  Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId,
} from 'typeorm';
import { EntityConfig } from '../config/entity-config';
import { Customer } from './customer';

@Entity({ name: 'transfer' })
export class Transfer {
  @PrimaryGeneratedColumn('identity')
  @IsInt({ groups: ['query'] })
  @IsPositive({ groups: ['query'] })
  @Expose()
  @Type(() => Number)
  id!: number;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({
    name: 'sender_id',
    foreignKeyConstraintName: 'fk_transfer_sender',
  })
  @IsInstance(Customer, { groups: ['query'] })
  @ValidateNested({ groups: ['query'] })
  @Expose()
  @Type(() => Customer)
  sender!: Customer;

  @Column({ name: 'sender_id' })
  @RelationId((transfer: Transfer) => transfer.sender)
  @IsInt()
  @IsPositive()
  @Expose()
  @Type(() => Number)
  senderId!: number;

  /**
   * BUG: Will cause error if synchronize is running while the FK still exists
   *      Typeorm will only delete 1 FK from entity A to B while there could be
   *      multiple FKs from A to B (such as this).
   *
   * @see https://github.com/typeorm/typeorm/issues/7738
   */
  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({
    name: 'receiver_id',
    foreignKeyConstraintName: 'fk_transfer_receiver',
  })
  @IsInstance(Customer, { groups: ['query'] })
  @ValidateNested({ groups: ['query'] })
  @Expose()
  @Type(() => Customer)
  receiver!: Customer;

  @Column({ name: 'receiver_id' })
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

  @Column(EntityConfig.createdColumnOptions)
  created!: Date;
}
