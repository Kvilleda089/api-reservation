import { ChangePasswordHandler } from "./change-password.handler";
import { CreateEmployeeHandler } from "./create-employee.handler";
import { UpdateEmployeeHandler } from "./update-employee.handler";


export const EmployeeCommandHandlers = [
    CreateEmployeeHandler,
    UpdateEmployeeHandler,
    ChangePasswordHandler,
]