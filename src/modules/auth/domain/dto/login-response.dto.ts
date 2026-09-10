import { RoleEnum } from "src/modules/employee/domain/enum/role.enum";


export class LoginResponseDto {
    
    accessToken: string;
    employee: EmployeeAuth;
}


export class EmployeeAuth {
    id: string;
    username: string;
    firstName: string;
    surname: string;
    role: RoleEnum;
}