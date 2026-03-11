import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Row = { sortJson: string };

@Injectable()
export class SortService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private async ensureTable() {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserSort" (
        "userId" TEXT NOT NULL PRIMARY KEY,
        "sortJson" TEXT NOT NULL,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UserSort_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User" ("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
  }

  async getSort(userId: string) {
    await this.ensureTable();
    const rows = await this.prisma.$queryRaw<Row[]>`
      SELECT "sortJson"
      FROM "UserSort"
      WHERE "userId" = ${userId}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    return JSON.parse(row.sortJson);
  }

  async saveSort(userId: string, sort: unknown) {
    await this.ensureTable();
    const sortJson = JSON.stringify(sort);
    await this.prisma.$executeRaw`
      INSERT INTO "UserSort" ("userId", "sortJson", "updatedAt")
      VALUES (${userId}, ${sortJson}, CURRENT_TIMESTAMP)
      ON CONFLICT ("userId") DO UPDATE
      SET "sortJson" = excluded."sortJson",
          "updatedAt" = CURRENT_TIMESTAMP
    `;
  }
}
