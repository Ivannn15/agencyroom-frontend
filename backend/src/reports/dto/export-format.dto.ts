import { IsIn, IsOptional, IsString } from 'class-validator';

export class ExportFormatDto {
  @IsOptional()
  @IsString()
  @IsIn(['pdf', 'docx'])
  format?: 'pdf' | 'docx';
}
