import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Row = { treeJson: string };

@Injectable()
export class TreeService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getTree(userId: string) {
    const rows = await this.prisma.$queryRaw<Row[]>`
      SELECT "treeJson"
      FROM "UserTree"
      WHERE "userId" = ${userId}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    return JSON.parse(row.treeJson);
  }

  async saveTree(userId: string, tree: unknown) {
    const treeJson = JSON.stringify(tree);
    await this.prisma.$executeRaw`
      INSERT INTO "UserTree" ("userId", "treeJson", "updatedAt")
      VALUES (${userId}, ${treeJson}, CURRENT_TIMESTAMP)
      ON CONFLICT ("userId") DO UPDATE
      SET "treeJson" = excluded."treeJson",
          "updatedAt" = CURRENT_TIMESTAMP
    `;
  }
}
