import { Module } from '@nestjs/common';
// import { HealthModule } from '../health/health.module';
import { HealthModule } from '../health/health.module';
// import { AuthModule } from '../auth/auth.module';
import { AuthModule } from '../auth/auth.module';
// import { PrismaModule } from '../prisma/prisma.module';
import { PrismaModule } from '../prisma/prisma.module';
import { GraphModule } from '../graph/graph.module';
import { TreeModule } from '../tree/tree.module';
import { SearchModule } from '../search/search.module';
import { SortModule } from '../sort/sort.module';

@Module({
  imports: [HealthModule, PrismaModule, AuthModule, GraphModule, TreeModule, SearchModule, SortModule],
})
export class AppModule { }
