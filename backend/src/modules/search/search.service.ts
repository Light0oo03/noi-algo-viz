import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Row = { searchJson: string };

@Injectable()
export class SearchService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private async ensureTable() {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserSearch" (
        "userId" TEXT NOT NULL PRIMARY KEY,
        "searchJson" TEXT NOT NULL,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UserSearch_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User" ("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
  }

  async getSearch(userId: string) {
    await this.ensureTable();
    const rows = await this.prisma.$queryRaw<Row[]>`
      SELECT "searchJson"
      FROM "UserSearch"
      WHERE "userId" = ${userId}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    return JSON.parse(row.searchJson);
  }

  async saveSearch(userId: string, search: unknown) {
    await this.ensureTable();
    const searchJson = JSON.stringify(search);
    await this.prisma.$executeRaw`
      INSERT INTO "UserSearch" ("userId", "searchJson", "updatedAt")
      VALUES (${userId}, ${searchJson}, CURRENT_TIMESTAMP)
      ON CONFLICT ("userId") DO UPDATE
      SET "searchJson" = excluded."searchJson",
          "updatedAt" = CURRENT_TIMESTAMP
    `;
  }
}
