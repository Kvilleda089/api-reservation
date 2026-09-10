import { GetAllEmployeeHandler } from "./get-all-employee.handler";
import { GetOneEmployeeByFiltersHandler } from "./get-one-employee-by-filters.handler";



export const EmployeeQueryHandlers = [
    GetAllEmployeeHandler,
    GetOneEmployeeByFiltersHandler,
]