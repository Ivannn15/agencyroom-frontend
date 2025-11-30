import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterAgencyDto {
  @IsString()
  @IsNotEmpty()
  agencyName!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
