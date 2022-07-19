import {
  IsEnum,
  IsInt, IsNotEmpty, IsPositive, Length, Matches,
} from 'class-validator';
import {
  Column, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn('identity')
  @IsInt()
  @IsPositive()
  id!: number;

  @Column()
  @Index({ unique: true })
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
    default: UserRole.CUSTOMER,
  })
  @IsEnum(UserRole, {
    groups: ['query'],
  })
  role!: UserRole;
}
