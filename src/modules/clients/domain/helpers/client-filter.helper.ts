import { ClientFilterDto } from 'src/modules/clients/domain/dto';

export function getClientFilterMessage(
    filter: ClientFilterDto,
): string {

    if (filter.id) {
        return `ID: ${filter.id}`;
    }

    if (filter.firstName) {
        return `nombre: ${filter.firstName}`;
    }

    if (filter.surName) {
        return `apellido: ${filter.surName}`;
    }

    if (filter.email) {
        return `correo: ${filter.email}`;
    }

    if (filter.phoneNumber) {
        return `teléfono: ${filter.phoneNumber}`;
    }

    return 'parámetro de búsqueda';
}