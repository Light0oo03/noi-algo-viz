import { Body, Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { TreeService } from './tree.service';

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function isTreeNode(value: unknown): value is { id: number; value: number; left: number | null; right: number | null } {
  if (!value || typeof value !== 'object') return false;
  const node = value as any;
  if (!isFiniteNumber(node.id) || !isFiniteNumber(node.value)) return false;
  const leftOk = node.left === null || isFiniteNumber(node.left);
  const rightOk = node.right === null || isFiniteNumber(node.right);
  const xOk = node.x === undefined || isFiniteNumber(node.x);
  const yOk = node.y === undefined || isFiniteNumber(node.y);
  return leftOk && rightOk && xOk && yOk;
}

function isTreeView(value: unknown): value is { id: string; label: string; nodes: unknown[]; root: number | null } {
  if (!value || typeof value !== 'object') return false;
  const tree = value as any;
  if (typeof tree.id !== 'string' || typeof tree.label !== 'string') return false;
  if (!Array.isArray(tree.nodes) || !tree.nodes.every((n: unknown) => isTreeNode(n))) return false;
  return tree.root === null || isFiniteNumber(tree.root);
}

@UseGuards(AuthGuard)
@Controller('/tree')
export class TreeController {
  constructor(@Inject(TreeService) private readonly trees: TreeService) {}

  @Get()
  async get(@Req() req: any) {
    const userId = String(req.user?.sub ?? '');
    const tree = await this.trees.getTree(userId);
    return { tree };
  }

  @Post()
  async save(@Req() req: any, @Body() body: any) {
    const userId = String(req.user?.sub ?? '');
    const tree = body?.tree;
    if (!isTreeView(tree)) {
      return { ok: false, reason: 'invalid_tree' };
    }
    await this.trees.saveTree(userId, tree);
    return { ok: true };
  }
}
