const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://md.omarfaruk@localhost:5432/veloradb?schema=public"
  });
  
  await client.connect();

  const hash = "$argon2id$v=19$m=65536,t=3,p=4$HqTS81I+4U8lNhPhLYoxZw$7Xyq3yPvZomiKxPIIOFnfId6d6onE7B/QS7VT5kOvo0";

  await client.query('UPDATE "User" SET password_hash = $1 WHERE email = $2', [hash, 'faruk.ahmed@gmail.com']);
  
  console.log("Password hash updated successfully");

  await client.end();
}

main();
