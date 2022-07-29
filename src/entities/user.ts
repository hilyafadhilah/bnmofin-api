import {
  IsEnum,
  IsInt, IsPositive, Length, Matches,
} from 'class-validator';
import {
  Column, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityConfig } from '../config/entity-config';

export enum UserRole {
  Admin = 'admin',
  Customer = 'customer',
}

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('identity')
  @IsInt()
  @IsPositive()
  id!: number;

  @Column()
  @Index('uq_username', { unique: true })
  @Length(5, 25, {
    groups: ['register'],
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    groups: ['register'],
  })
  username!: string;

  @Column()
  @Length(5, 30, {
    groups: ['register'],
  })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Customer,
  })
  @IsEnum(UserRole, {
    groups: ['query'],
  })
  role!: UserRole;

  @Column(EntityConfig.createdColumnOptions)
  created!: Date;
}
