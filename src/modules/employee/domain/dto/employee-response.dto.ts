import { Employee } from "src/generated/prisma/client";



export type EmployeeResponse = Omit<Employee, 'password'>;