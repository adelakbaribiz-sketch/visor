import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'priya@northbridge.example' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'at-least-8-characters' })
  @IsString()
  @MinLength(8)
  password!: string;
}
