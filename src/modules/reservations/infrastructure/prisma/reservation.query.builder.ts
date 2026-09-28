import { Prisma } from "src/generated/prisma/client";
import { ReservationFiltersDto } from "../../domain/dto/reservation-filters.dto";


export function buildReservationWhere(filters: ReservationFiltersDto): Prisma.ReservationWhereInput {

    return {
        ...(filters.client && {
            client: {
                OR: [
                    {
                        firstName: {
                            contains: filters.client,
                            mode: "insensitive",
                        },
                    },
                    {
                        surname: {
                            contains: filters.client,
                            mode: "insensitive",
                        },
                    },
                    {
                        secondSurname: {
                            contains: filters.client,
                            mode: "insensitive",
                        },
                    },
                ],
            },
        }),

        ...(filters.status && {
            status: filters.status,
        }),
    };
}