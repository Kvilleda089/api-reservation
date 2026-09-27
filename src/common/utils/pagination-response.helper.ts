import {  ResponseDto, ResponsePagination } from "../dto";


export function buildPaginationResponse<T>(
    data: T[],
    pagination: ResponsePagination,
    message = 'Resultados obtenidos',
): ResponseDto<T[]> {

    const { page, limit, totalRecords } = pagination;

    return {
        statusCode: 200,
        data,
        message,
        pagination: {
            page,
            limit,
            totalRecords,
            lastPage: Math.ceil(totalRecords / limit),
        },
    };
}