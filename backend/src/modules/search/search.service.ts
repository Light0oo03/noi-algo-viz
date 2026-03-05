import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getSearch(userId: string) {
    const row = await this.prisma.userSearch.findUnique({ where: { userId } });
    if (!row) return null;
    return JSON.parse(row.searchJson);
  }

  async saveSearch(userId: string, search: unknown) {
    const searchJson = JSON.stringify(search);
    await this.prisma.userSearch.upsert({
      where: { userId },
      create: { userId, searchJson },
      update: { searchJson },
      select: { userId: true },
    });
  }
}
