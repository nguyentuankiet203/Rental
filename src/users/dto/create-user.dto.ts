import { IsEmail, IsString, IsEnum, MinLength, IsOptional } from 'class-validator';
import { Role } from '../../common/enum/role.enum';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(Role)
  role!: Role;
  
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
}