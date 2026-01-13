import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { GraphService } from './graph.service';

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isGraph(value: unknown): value is { nodes: { id: number; x: number; y: number }[]; edges: { u: number; v: number; w: number }[] } {
  if (!value || typeof value !== 'object') return false;
  const g = value as any;
  if (!Array.isArray(g.nodes) || !Array.isArray(g.edges)) return false;
  for (const n of g.nodes) {
    if (!n || typeof n !== 'object') return false;
    if (!isFiniteNumber(n.id) || !isFiniteNumber(n.x) || !isFiniteNumber(n.y)) return false;
  }
  for (const e of g.edges) {
    if (!e || typeof e !== 'object') return false;
    if (!isFiniteNumber(e.u) || !isFiniteNumber(e.v) || !isFiniteNumber(e.w)) return false;
  }
  return true;
}

@UseGuards(AuthGuard)
@Controller('/graph')
export class GraphController {
  constructor(@Inject(GraphService) private readonly graphs: GraphService) { }

  @Get()
  async get(@Req() req: any) {
    const userId = String(req.user?.sub ?? '');
    const graph = await this.graphs.getGraph(userId);
    return { graph };
  }

  @Post()
  async save(@Req() req: any, @Body() body: any) {
    const userId = String(req.user?.sub ?? '');
    const graph = body?.graph;
    if (!isGraph(graph)) {
      return { ok: false, reason: 'invalid_graph' };
    }
    await this.graphs.saveGraph(userId, graph);
    return { ok: true };
  }
}
