import { Inject, Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import type { OrderRepository } from '../repository/order.repository';
import { ORDER_REPOSITORY } from '../repository/order.tokens';
import { CacheService } from '../../../infra/redis/cache.service';

type CachedOrder = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  merchant: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
};

type CachedNotFound = { notFound: true };

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_REPOSITORY) private repo: OrderRepository,
    private cache: CacheService,
  ) {}

  async getOrderById(id: string) {
    const key = this.cacheKeyOrder(id);

    const cached = await this.cache.getJson<CachedOrder | CachedNotFound>(key);
    if (cached) {
      if ('notFound' in cached) {
        return { source: 'CACHE' as const, order: null };
      }

      return {
        source: 'CACHE' as const,
        order: {
          ...cached,
          createdAt: new Date(cached.createdAt),
          updatedAt: new Date(cached.updatedAt),
        },
      };
    }


    const order = await this.repo.findById(id);
    if (!order) {
      await this.cache.setJson(key, { notFound: true }, 15);
      return { source: 'DB' as const, order: null };
    }

    const mapped = {
      ...order,
      amount: this.decimalToNumber(order.amount),
    };


    await this.cache.setJson(key, {
      ...mapped,
      createdAt: mapped.createdAt.toISOString(),
      updatedAt: mapped.updatedAt.toISOString(),
    });

    return { source: 'DB' as const, order: mapped };
  }

  async listOrders(limit = 5) {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const orders = await this.repo.findMany(safeLimit);

    return orders.map((o) => ({
      ...o,
      amount: this.decimalToNumber(o.amount),
    }));
  }

  private cacheKeyOrder(id: string) {
    return `order:${id}`;
  }

  private decimalToNumber(value: unknown): number {
    if (value && typeof value === 'object' && (value as Decimal).toNumber) {
      return (value as Decimal).toNumber();
    }
    return Number(value);
  }
}
