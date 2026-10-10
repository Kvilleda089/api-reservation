import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from 'src/modules/auth/decorator/roles.decorator';

/** Roles declarados con @Roles() en una clase o método. */
export const rolesOf = (target: object): string[] | undefined =>
  Reflect.getMetadata(ROLES_KEY, target);

/** Guards declarados con @UseGuards() en una clase o método. */
export const guardsOf = (target: object): unknown[] =>
  Reflect.getMetadata(GUARDS_METADATA, target) ?? [];
