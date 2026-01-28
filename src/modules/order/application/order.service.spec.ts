import { Test } from '@nestjs/testing';
import { OrderService } from './order.service';
import { ORDER_REPOSITORY } from '../repository/order.tokens';
import type { OrderRepository } from '../repository/order.repository';
import { CacheService } from '../../../infra/redis/cache.service';

describe('OrderService', () => {
  let service: OrderService;

  const repoMock: jest.Mocked<OrderRepository> = {
    findById: jest.fn(),
    findMany: jest.fn(),
  };

  const cacheMock = {
    getJson: jest.fn(),
    setJson: jest.fn(),
  } as unknown as jest.Mocked<CacheService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: ORDER_REPOSITORY, useValue: repoMock },
        { provide: CacheService, useValue: cacheMock },
      ],
    }).compile();

    service = moduleRef.get(OrderService);

    jest.resetAllMocks();
  });

  it('should return CACHE when cache hit', async () => {
    cacheMock.getJson.mockResolvedValueOnce({
      id: 'uuid',
      status: 'PAID',
      amount: 10,
      currency: 'BRL',
      merchant: 'X',
      customerId: 'cust',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await service.getOrderById('uuid');

    expect(res.source).toBe('CACHE');
    expect(repoMock.findById).not.toHaveBeenCalled();
  });

  it('should return DB and set cache when cache miss and found in DB', async () => {
    cacheMock.getJson.mockResolvedValueOnce(null);

    repoMock.findById.mockResolvedValueOnce({
      id: 'uuid',
      status: 'PAID',
      amount: '10.00' as any,
      currency: 'BRL',
      merchant: 'X',
      customerId: 'cust',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const res = await service.getOrderById('uuid');

    expect(res.source).toBe('DB');
    expect(cacheMock.setJson).toHaveBeenCalled();
  });

  it('should negative-cache when not found', async () => {
    cacheMock.getJson.mockResolvedValueOnce(null);
    repoMock.findById.mockResolvedValueOnce(null);

    const res = await service.getOrderById('missing');

    expect(res.order).toBeNull();
    expect(cacheMock.setJson).toHaveBeenCalled(); // negative cache
  });
});