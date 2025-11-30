import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  spend?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  revenue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  leads?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cpa?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  roas?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whatWasDone?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nextPlan?: string[];
}
