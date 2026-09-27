import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { StatisticsController } from './controllers/statistics.controller';
import { GetStatisticsByPeriodHandler } from './query/handler/get-statistics-by-period.handler';

@Module({
    imports: [PrismaModule,],
    controllers:[StatisticsController],
    providers:[
        GetStatisticsByPeriodHandler
    ]
})
export class StatisticsModule {}
