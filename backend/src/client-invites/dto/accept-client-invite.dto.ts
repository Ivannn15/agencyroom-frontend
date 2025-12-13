import { IsOptional, IsString, MinLength } from 'class-validator';

export class AcceptClientInviteDto {
  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
