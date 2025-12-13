import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetClientPasswordDto {
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;
}
