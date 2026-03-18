import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from 'generated/prisma';

export class RegisterDto {
  @ApiProperty({
    description: 'The full name of the user',
    example: 'Jane Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'teacher@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'The password for the account (minimum 8 characters)',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    description: 'The role of the registering user (TEACHER or STUDENT)',
    enum: Role,
    example: Role.TEACHER,
  })
  @IsEnum(Role, { message: 'Role must be either TEACHER or STUDENT' })
  @IsNotEmpty({ message: 'Role is required' })
  role: Role;
}
