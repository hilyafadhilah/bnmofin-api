import {
  IsEnum,
  IsInt, IsPositive, IsString, Length, Matches,
} from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
  @IsString()
  @Length(5, 25)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username!: string;

  @Column()
  @IsString()
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  @IsEnum(UserRole)
  role!: UserRole;
}
