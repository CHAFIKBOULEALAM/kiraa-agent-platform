const { Client } = require('pg');

async function checkDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://kiraa:kiraa@localhost:5432/kiraa',
  });
  await client.connect();
  const res = await client.query(`
    SELECT thread_id, COUNT(*) as count 
    FROM checkpoints 
    GROUP BY thread_id 
    ORDER BY count DESC 
    LIMIT 10
  `);
  console.table(res.rows);
  await client.end();
}

checkDb().catch(console.error);
