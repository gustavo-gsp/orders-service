import { Module } from '@nestjs/common';
import { OrderResolver } from './presentation/order.resolver';
import { OrderService } from './application/order.service';
import { PgOrderRepository } from './repository/order.repository.pg';
import { ORDER_REPOSITORY } from './repository/order.tokens';

@Module({
  providers: [
    OrderResolver,
    OrderService,
    PgOrderRepository,
    {
      provide: ORDER_REPOSITORY,
      useExisting: PgOrderRepository,
    },
  ],
})
export class OrderModule {}