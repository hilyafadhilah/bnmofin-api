import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, RelationId,
} from 'typeorm';
import { Request } from './request';
import { User } from './user';

export enum ResponseStatus {
  Declined = 'declined',
  Accepted = 'accepted',
}

@Entity({ name: 'Response' })
export class Response {
  @PrimaryColumn()
  @RelationId((response: Response) => response.request)
  requestId!: number;

  @Column({
    type: 'enum',
    enum: ResponseStatus,
  })
  status!: ResponseStatus;

  @Column()
  @RelationId((response: Response) => response.responder)
  responderId!: number;

  @OneToOne(() => Request, { cascade: true })
  @JoinColumn({
    name: 'requestId',
    foreignKeyConstraintName: 'FK_ResponseRequest',
  })
  request!: Request;

  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({
    name: 'responderId',
    foreignKeyConstraintName: 'FK_ResponseResponder',
  })
  responder!: User;

  @CreateDateColumn()
  created!: Date;
}
