import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELED = 'CANCELED',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@ObjectType()
export class OrderType {
  @Field(() => ID)
  id!: string;

  @Field(() => OrderStatus)
  status!: OrderStatus;

  @Field(() => Number)
  amount!: number;

  @Field(() => String)
  currency!: string;

  @Field(() => String)
  merchant!: string;

  @Field(() => String)
  customerId!: string;

  @Field(() => Date)
  createdAt!: Date;

  @Field(() => Date)
  updatedAt!: Date;
}

@ObjectType()
export class OrderResultType {
  @Field(() => String)
  source!: 'DB' | 'CACHE';

  @Field(() => OrderType, { nullable: true })
  order!: OrderType | null;
}