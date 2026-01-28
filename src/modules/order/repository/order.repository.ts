import type { Order } from '@prisma/client';

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findMany(limit: number): Promise<Order[]>;
}