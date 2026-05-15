#!/usr/bin/env node
// Create or reset a staff account in D1.
//
// Usage:
//   node scripts/create-staff.mjs --email you@jimmys.com --name "Your Name" --password "secret" [--role admin]
//   add --remote to target the production D1 instead of the local file.

import { spawn } from 'node:child_process';
import { randomBytes, pbkdf2Sync } from 'node:crypto';

function parseArgs() {
  const args = { role: 'staff', remote: false };
  const arr = process.argv.slice(2);
  for (let i = 0; i < arr.length; i++) {
    const a = arr[i];
    if (a === '--email') args.email = arr[++i];
    else if (a === '--name') args.name = arr[++i];
    else if (a === '--password') args.password = arr[++i];
    else if (a === '--role') args.role = arr[++i];
    else if (a === '--remote') args.remote = true;
  }
  return args;
}

const PBKDF2_ITERS = 100_000;
const PBKDF2_KEYLEN_BYTES = 32;

function generateSalt() {
  return randomBytes(16).toString('hex');
}

function hashPassword(password, saltHex) {
  const salt = Buffer.from(saltHex, 'hex');
  return pbkdf2Sync(password, salt, PBKDF2_ITERS, PBKDF2_KEYLEN_BYTES, 'sha256').toString('hex');
}

function sqlEscape(s) {
  if (s == null) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}

async function runWrangler(sql, remote) {
  const args = ['d1', 'execute', 'jimmys', remote ? '--remote' : '--local', '--command', sql];
  return new Promise((resolve, reject) => {
    const p = spawn('npx', ['wrangler', ...args], { stdio: 'inherit' });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`wrangler exited ${code}`))));
  });
}

async function main() {
  const args = parseArgs();
  if (!args.email || !args.name || !args.password) {
    console.error('Usage: node scripts/create-staff.mjs --email <email> --name <name> --password <pw> [--role admin] [--remote]');
    process.exit(1);
  }
  const email = args.email.toLowerCase().trim();
  const salt = generateSalt();
  const hash = hashPassword(args.password, salt);

  const sql = `
    INSERT INTO users (email, password_hash, password_salt, name, role)
    VALUES (${sqlEscape(email)}, ${sqlEscape(hash)}, ${sqlEscape(salt)}, ${sqlEscape(args.name)}, ${sqlEscape(args.role)})
    ON CONFLICT(email) DO UPDATE SET
      password_hash = excluded.password_hash,
      password_salt = excluded.password_salt,
      name          = excluded.name,
      role          = excluded.role;
  `.replace(/\s+/g, ' ').trim();

  console.log(`→ Upserting ${email} (${args.role}) in D1 (${args.remote ? 'remote' : 'local'})…`);
  await runWrangler(sql, args.remote);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
