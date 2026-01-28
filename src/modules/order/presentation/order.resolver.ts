import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { OrderService } from '../application/order.service';
import { OrderResultType, OrderType } from './order.types';

@Resolver()
export class OrderResolver {
  constructor(private service: OrderService) {}

  @Query(() => OrderResultType)
    order(@Args('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.getOrderById(id);
  }

  @Query(() => [OrderType])
  orders(@Args('limit', { type: () => Int, nullable: true }) limit?: number) {
    return this.service.listOrders(limit ?? 5);
  }
}