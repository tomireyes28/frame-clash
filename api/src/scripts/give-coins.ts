import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

async function testPort(url: string) {
  console.log('Testing URL:', url);
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const updated = await prisma.user.updateMany({
      data: {
        coins: 100000,
        stardust: 25000,
      },
    });
    console.log(`✅ SUCCESS on ${url}! Updated ${updated.count} users.`);
    return true;
  } catch (error) {
    console.log(`❌ Failed on ${url}`);
    return false;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

async function main() {
  const urls = [
    process.env.DATABASE_URL || '',
    'postgresql://admin:password123@127.0.0.1:5432/frameclash?schema=public',
    'postgresql://postgres:postgres@127.0.0.1:5432/frameclash?schema=public',
    'postgresql://postgres:password123@127.0.0.1:5432/frameclash?schema=public',
    'postgresql://postgres:admin@127.0.0.1:5432/frameclash?schema=public',
    'postgresql://postgres:@127.0.0.1:5432/frameclash?schema=public',
  ];

  for (const u of urls) {
    if (!u) continue;
    const ok = await testPort(u);
    if (ok) break;
  }
}

main();
