import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SortService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getSort(userId: string) {
    const row = await this.prisma.userSort.findUnique({ where: { userId } });
    if (!row) return null;
    return JSON.parse(row.sortJson);
  }

  async saveSort(userId: string, sort: unknown) {
    const sortJson = JSON.stringify(sort);
    await this.prisma.userSort.upsert({
      where: { userId },
      create: { userId, sortJson },
      update: { sortJson },
      select: { userId: true },
    });
  }
}
