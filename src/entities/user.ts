import {
  IsEnum,
  IsInt, IsNotEmpty, IsPositive, Length, Matches,
} from 'class-validator';
import {
  Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';

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
    groups: ['register', 'login', 'query'],
  })
  @Matches(/^[a-zA-Z0-9_]+$/)
  username!: string;

  @Column()
  @IsNotEmpty({
    groups: ['login'],
  })
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

  @CreateDateColumn()
  created!: Date;
}
