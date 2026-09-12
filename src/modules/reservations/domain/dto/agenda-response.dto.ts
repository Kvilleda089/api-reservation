


export class AgendaResponseDto {

    date: string;
    resources: ResourceDto[];
}


export class ResourceDto {
    resource: string;
    reservations: ReservationDto[];
}

export class ReservationDto {
    
    hour: string;
    reservedHours: number;
    client: string;
    status: string;
}