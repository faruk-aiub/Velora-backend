const { Client } = require('pg');
const crypto = require('crypto');

async function main() {
  const client = new Client({
    connectionString: "postgresql://md.omarfaruk@localhost:5432/veloradb?schema=public"
  });
  
  await client.connect();

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await client.query(
    'UPDATE "User" SET is_email_verified = false, verification_token = $1, verification_expires = $2 WHERE email = $3', 
    [verificationToken, verificationExpires, 'test@example.com']
  );
  
  console.log(verificationToken);

  await client.end();
}

main();
