import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.order.createMany({
    data: [
      {
        status: OrderStatus.PENDING,
        amount: '199.90',
        currency: 'BRL',
        merchant: 'ACME Payments',
        customerId: '11111111-1111-1111-1111-111111111111',
      },
      {
        status: OrderStatus.PAID,
        amount: '49.90',
        currency: 'BRL',
        merchant: 'Loja Exemplo',
        customerId: '22222222-2222-2222-2222-222222222222',
      },
    ],
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
