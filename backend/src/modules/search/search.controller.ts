import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { SearchService } from './search.service';

function isValidSearch(value: unknown): value is { arrayInput: string; target: number } {
  if (!value || typeof value !== 'object') return false;
  const v = value as any;
  return typeof v.arrayInput === 'string' && Number.isInteger(v.target);
}

@UseGuards(AuthGuard)
@Controller('/search')
export class SearchController {
  constructor(@Inject(SearchService) private readonly searches: SearchService) {}

  @Get()
  async get(@Req() req: any) {
    const userId = String(req.user?.sub ?? '');
    const search = await this.searches.getSearch(userId);
    return { search };
  }

  @Post()
  async save(@Req() req: any, @Body() body: any) {
    const userId = String(req.user?.sub ?? '');
    const search = body?.search;
    if (!isValidSearch(search)) {
      return { ok: false, reason: 'invalid_search' };
    }
    await this.searches.saveSearch(userId, search);
    return { ok: true };
  }
}
