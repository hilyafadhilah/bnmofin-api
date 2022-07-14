import {
  IsEnum,
  IsInt, IsNotEmpty, IsPositive, IsString, Length, Matches,
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
  @IsString()
  @Length(5, 25, {
    groups: ['register', 'login'],
  })
  @Matches(/^[a-zA-Z0-9_]+$/)
  username!: string;

  @Column()
  @IsString({
    groups: ['register', 'login'],
  })
  @IsNotEmpty({
    groups: ['register', 'login'],
  })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  @IsEnum(UserRole)
  role!: UserRole;
}
