import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, RelationId,
} from 'typeorm';
import { Request } from './request';
import { User } from './user';

export enum ResponseStatus {
  Declined = 'declined',
  Accepted = 'accepted',
}

@Entity({ name: 'response' })
export class Response {
  @PrimaryColumn({ name: 'request_id' })
  @RelationId((response: Response) => response.request)
  requestId!: number;

  @Column({
    type: 'enum',
    enum: ResponseStatus,
  })
  status!: ResponseStatus;

  @Column({ name: 'responder_id' })
  @RelationId((response: Response) => response.responder)
  responderId!: number;

  @OneToOne(() => Request, { cascade: true })
  @JoinColumn({
    name: 'request_id',
    foreignKeyConstraintName: 'fk_response_request',
  })
  request!: Request;

  @ManyToOne(() => User, { cascade: true })
  @JoinColumn({
    name: 'responder_id',
    foreignKeyConstraintName: 'fk_response_responder',
  })
  responder!: User;

  @CreateDateColumn()
  created!: Date;
}
