import { IsEmail, IsOptional, IsString } from "class-validator";


export class ClientFilterDto {

    @IsString()
    @IsOptional()
    id?: string;

    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    surName?: string;

    @IsString()
    @IsOptional()
    email?: string;

    
    @IsString()
    @IsOptional()
    phoneNumber?: string;

}