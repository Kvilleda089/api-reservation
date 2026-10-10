import { IQuery } from '@nestjs/cqrs';
import { GetOneClientDto } from '../../domain/dto';

export class GetOneClientQuery implements IQuery {
  constructor(public readonly query: GetOneClientDto) {}
}
