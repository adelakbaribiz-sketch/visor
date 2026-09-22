import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateUpdateDto {
  @ApiProperty({ example: 'USCIS raises H-1B registration fee for FY2028 cap season' })
  @IsString()
  @MinLength(4)
  title!: string;

  @ApiProperty({ example: 'The registration fee increases ahead of the next cap season.' })
  @IsString()
  @MinLength(4)
  summary!: string;

  @ApiProperty({ example: 'https://www.federalregister.gov/documents/example' })
  @IsUrl()
  sourceUrl!: string;

  @ApiProperty({ example: 'Federal Register' })
  @IsString()
  sourceName!: string;

  @ApiProperty({ example: 'clx0000000000countryus' })
  @IsString()
  countryId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  visaTypeId?: string;

  @ApiProperty({ enum: Priority, required: false, default: Priority.MEDIUM })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ example: '2026-09-20T00:00:00.000Z' })
  @IsDateString()
  publishedAt!: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  tags?: string[];
}
