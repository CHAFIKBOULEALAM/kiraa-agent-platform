const { Client } = require('pg'); 
const client = new Client({ connectionString: process.env.DATABASE_URL }); 
client.connect()
  .then(() => client.query(`SELECT extname FROM pg_extension WHERE extname = 'vector';`))
  .then(res => { 
    if (res.rows.length === 0) {
      console.log('vector not found, installing...');
      return client.query('CREATE EXTENSION IF NOT EXISTS vector;').then(() => client.query(`SELECT extname FROM pg_extension WHERE extname = 'vector';`));
    }
    return res;
  })
  .then(res => {
    console.log('EXT:', res.rows);
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
