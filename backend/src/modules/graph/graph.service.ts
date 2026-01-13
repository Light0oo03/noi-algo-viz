import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GraphService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) { }

  async getGraph(userId: string) {
    const row = await this.prisma.userGraph.findUnique({ where: { userId } });
    if (!row) return null;
    return JSON.parse(row.graphJson);
  }

  async saveGraph(userId: string, graph: unknown) {
    const graphJson = JSON.stringify(graph);
    await this.prisma.userGraph.upsert({
      where: { userId },
      create: { userId, graphJson },
      update: { graphJson },
      select: { userId: true },
    });
  }
}
