import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Northbridge Immigration Partners' })
  @IsString()
  @MinLength(2)
  organizationName!: string;

  @ApiProperty({ example: 'Priya Nathan' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'priya@northbridge.example' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'at-least-8-characters' })
  @IsString()
  @MinLength(8)
  password!: string;
}
