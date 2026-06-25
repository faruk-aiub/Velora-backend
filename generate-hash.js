const argon2 = require('argon2');

async function main() {
  const password = 'password123';
  const hashedPassword = await argon2.hash(password);
  console.log(hashedPassword);
}

main();
