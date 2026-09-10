import { Prisma } from "src/generated/prisma/client";
import { GetOneEmployeeFiltersDto } from "../../domain/dto";




export function buildEmployeeWhere(
    filters: GetOneEmployeeFiltersDto,
): Prisma.EmployeeWhereInput {
    return {
        ...(filters.firstName && {
            firstName: {
                contains: filters.firstName,
                mode: 'insensitive',
            },
        }),

        ...(filters.middleName && {
            middleName: {
                contains: filters.middleName,
                mode: 'insensitive',
            },
        }),

        ...(filters.surname && {
            surname: {
                contains: filters.surname,
                mode: 'insensitive',
            },
        }),

        ...(filters.secondSurname && {
            secondSurname: {
                contains: filters.secondSurname,
                mode: 'insensitive',
            },
        }),

        ...(filters.email && {
            email: {
                contains: filters.email,
                mode: 'insensitive',
            },
        }),

        ...(filters.username && {
            username: {
                contains: filters.username,
                mode: 'insensitive',
            },
        }),

        ...(filters.phoneNumber && {
            phoneNumber: {
                contains: filters.phoneNumber,
            },
        }),

        ...(filters.role && {
            role: filters.role,
        }),

        ...(filters.status !== undefined && {
            status: filters.status,
        }),
    };
}