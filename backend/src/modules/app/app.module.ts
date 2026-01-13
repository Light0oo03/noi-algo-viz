import { Module } from '@nestjs/common';
// import { HealthModule } from '../health/health.module';
import { HealthModule } from '../health/health.module';
// import { AuthModule } from '../auth/auth.module';
import { AuthModule } from '../auth/auth.module';
// import { PrismaModule } from '../prisma/prisma.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GraphModule } from '../graph/graph.module';

@Module({
  imports: [HealthModule, PrismaModule, AuthModule, GraphModule],
})
export class AppModule { }
