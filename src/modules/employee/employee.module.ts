import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { EmployeeCommandHandlers } from './command/handler';
import { EmployeeController } from './controller/employee.controller';
import { EmployeeQueryHandlers } from './query/handler';

@Module({

    imports:[PrismaModule],
    providers:[
        ...EmployeeCommandHandlers,
        ...EmployeeQueryHandlers
    ],
    controllers: [
        EmployeeController,
    ]
})
export class EmployeeModule {}
