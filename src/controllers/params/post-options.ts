import { IsEnum, IsOptional } from 'class-validator';

export enum PostIntent {
  Persist = 'persist',
  Preload = 'preload',
}

export class PostOptions {
  @IsOptional()
  @IsEnum(PostIntent)
  intent!: PostIntent;
}
