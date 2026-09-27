import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationDto } from 'src/common/dto';
import { ClientFilterDto } from '../../domain/dto';

export class GetOneClientDto extends IntersectionType(
    ClientFilterDto,
    PaginationDto,
) {}