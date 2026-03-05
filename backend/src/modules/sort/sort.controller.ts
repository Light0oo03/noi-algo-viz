import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { SortService } from './sort.service';

function isValidSort(value: unknown): value is { arrayInput: string } {
  if (!value || typeof value !== 'object') return false;
  const v = value as any;
  return typeof v.arrayInput === 'string';
}

@UseGuards(AuthGuard)
@Controller('/sort')
export class SortController {
  constructor(@Inject(SortService) private readonly sorts: SortService) {}

  @Get()
  async get(@Req() req: any) {
    const userId = String(req.user?.sub ?? '');
    const sort = await this.sorts.getSort(userId);
    return { sort };
  }

  @Post()
  async save(@Req() req: any, @Body() body: any) {
    const userId = String(req.user?.sub ?? '');
    const sort = body?.sort;
    if (!isValidSort(sort)) {
      return { ok: false, reason: 'invalid_sort' };
    }
    await this.sorts.saveSort(userId, sort);
    return { ok: true };
  }
}
