import { Injectable } from '@nestjs/common';
import type { Order } from '@prisma/client';
import { PrismaService } from '../../../infra/db/prisma.service';
import type { OrderRepository } from './order.repository';

@Injectable()
export class PgOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaService) {}

  findById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({ where: { id } });
  }

  findMany(limit: number): Promise<Order[]> {
    return this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}