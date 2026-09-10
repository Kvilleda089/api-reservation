import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { RoleEnum } from "../enum/role.enum";
import { Type } from "class-transformer";


export class CreateEmployeeDto {

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  middleName: string;

  @IsString()
  @IsNotEmpty()
  surname: string;

  @IsString()
  @IsNotEmpty()
  secondSurname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(RoleEnum, {
    message: `Valor no valido, solo se permite valores ${RoleEnum}`
  })
  role: RoleEnum;

  @IsDate()
  @Type(() => Date)
  hireDate: Date;
}