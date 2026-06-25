const { Client } = require('pg');
const crypto = require('crypto');

async function main() {
  const client = new Client({
    connectionString: "postgresql://md.omarfaruk@localhost:5432/veloradb?schema=public"
  });
  
  await client.connect();

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hr

  await client.query(
    'UPDATE "User" SET reset_token = $1, reset_token_expires = $2 WHERE email = $3', 
    [hashedToken, resetExpires, 'test@example.com']
  );
  
  console.log(resetToken);

  await client.end();
}

main();
