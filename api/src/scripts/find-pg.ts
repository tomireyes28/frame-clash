import { Client } from 'pg';

async function testPassword(password: string, user = 'postgres') {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user,
    password,
    database: 'postgres',
  });
  try {
    await client.connect();
    console.log(`🎉 SUCCESS! user="${user}", password="${password}"`);
    const res = await client.query('SELECT datname FROM pg_database');
    console.log('Databases:', res.rows.map(r => r.datname));
    await client.end();
    return true;
  } catch (err: any) {
    // console.log(`Failed user=${user} pass=${password}:`, err.message);
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  const passwords = [
    'postgres',
    'admin',
    'password123',
    'password',
    '1234',
    '123456',
    'root',
    'frameclash',
    '',
  ];

  for (const p of passwords) {
    if (await testPassword(p, 'postgres')) break;
    if (await testPassword(p, 'admin')) break;
  }
}

main();
