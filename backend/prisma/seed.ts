import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@example.com',
      passwordHash,
    },
  });

  const categoryNames = ['Groceries', 'Rent', 'Transport', 'Entertainment', 'Utilities'];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { userId_name: { userId: user.id, name } },
        update: {},
        create: { userId: user.id, name },
      })
    )
  );

  const now = new Date();

  await Promise.all(
    categories.map((category) =>
      prisma.budget.upsert({
        where: {
          userId_categoryId_month_year_currency: {
            userId: user.id,
            categoryId: category.id,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            currency: 'USD',
          },
        },
        update: {},
        create: {
          userId: user.id,
          categoryId: category.id,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          limitAmount: 300,
        },
      })
    )
  );

  await prisma.expense.createMany({
    data: [
      { userId: user.id, categoryId: categories[0].id, amount: 45.5, description: 'Weekly groceries', date: now },
      { userId: user.id, categoryId: categories[1].id, amount: 950, description: 'Monthly rent', date: now },
      { userId: user.id, categoryId: categories[2].id, amount: 22.3, description: 'Bus pass', date: now },
    ],
  });

  console.log(`Seeded demo user: demo@example.com / Password123!`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
