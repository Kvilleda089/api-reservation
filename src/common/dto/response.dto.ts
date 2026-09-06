

export class ResponseDto<T>{
    statusCode: number;
    data: T;
    message: string;
    pagination?: ResponsePagination
}

export class ResponsePagination {
    page: number;
    limit: number;
    totalRecords: number;
    lastPage: number;
}