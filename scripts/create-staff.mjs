#!/usr/bin/env node
// Create or reset a staff account in D1.
//
// Pass flags, or run with no flags and it'll prompt you. Note that with `npm
// run` you need a literal `--` separator, otherwise npm eats the flags:
//
//   npm run create-staff                                              # interactive
//   npm run create-staff -- --email you@jimmys.com --name "You"        # flags via npm
//   node scripts/create-staff.mjs --email you@jimmys.com --remote     # flags via node

import { spawn } from 'node:child_process';
import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const PBKDF2_ITERS = 100_000;
const PBKDF2_KEYLEN_BYTES = 32;

function parseArgs() {
  const args = { role: 'staff', remote: null };
  const arr = process.argv.slice(2);
  for (let i = 0; i < arr.length; i++) {
    const a = arr[i];
    if (a === '--email') args.email = arr[++i];
    else if (a === '--name') args.name = arr[++i];
    else if (a === '--password') args.password = arr[++i];
    else if (a === '--role') args.role = arr[++i];
    else if (a === '--remote') args.remote = true;
    else if (a === '--local') args.remote = false;
    else if (a === '-h' || a === '--help') {
      console.log(`Usage: node scripts/create-staff.mjs [flags]
  --email <email>       staff email (lowercased)
  --name <name>         display name
  --password <pw>       plaintext password (PBKDF2-hashed before storage)
  --role <role>         'admin' or 'staff' (default: staff)
  --remote              target production D1
  --local               target the local D1 file (default)

Run with no flags to be prompted for each field interactively.

With npm, remember the "--" separator or npm will eat the flags:
  npm run create-staff -- --email ... --name ...`);
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${a}`);
      console.error('Run with --help for usage.');
      process.exit(1);
    }
  }
  return args;
}

const CTRL_C = '\x03';
const BACKSPACE = '\x7f';
const BACKSPACE_ALT = '\b';

async function promptHidden(label) {
  if (!stdin.isTTY) {
    // No TTY (piped input, CI, etc) — fall back to visible input via readline.
    const rl = createInterface({ input: stdin, output: stdout });
    const v = await rl.question(`${label} (visible — not a terminal): `);
    rl.close();
    return v;
  }
  return new Promise((resolve) => {
    stdout.write(`${label}: `);
    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let buf = '';
    const onData = (ch) => {
      if (ch === CTRL_C) {
        stdin.setRawMode(wasRaw);
        stdout.write('\n');
        process.exit(130);
      }
      if (ch === '\r' || ch === '\n') {
        stdin.removeListener('data', onData);
        stdin.setRawMode(wasRaw);
        stdin.pause();
        stdout.write('\n');
        resolve(buf);
        return;
      }
      if (ch === BACKSPACE || ch === BACKSPACE_ALT) {
        buf = buf.slice(0, -1);
        return;
      }
      buf += ch;
    };
    stdin.on('data', onData);
  });
}

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
  const args = ['wrangler', 'd1', 'execute', 'jimmys', remote ? '--remote' : '--local', '--command', sql];
  // On Windows, `npx` ships as `npx.cmd`; node's spawn won't resolve the shim
  // without help. Either point at the right binary or run through the shell.
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? 'npx.cmd' : 'npx';
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: isWindows });
    p.on('error', (err) => reject(err));
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`wrangler exited ${code}`))));
  });
}

async function main() {
  const args = parseArgs();

  const needsPrompts = !args.email || !args.name || !args.password || args.remote == null;
  if (needsPrompts) {
    console.log("Creating a staff account. Press Ctrl-C to bail.\n");
    const rl = createInterface({ input: stdin, output: stdout });
    try {
      if (!args.email) {
        args.email = (await rl.question('Email: ')).trim();
      }
      if (!args.name) {
        args.name = (await rl.question('Display name: ')).trim();
      }
      if (!process.argv.includes('--role')) {
        const r = (await rl.question("Role ('admin' or 'staff') [staff]: ")).trim().toLowerCase();
        args.role = r === 'admin' ? 'admin' : 'staff';
      }
      if (args.remote == null) {
        const r = (await rl.question('Target production D1? (y/N): ')).trim().toLowerCase();
        args.remote = r === 'y' || r === 'yes';
      }
      // Close the readline before grabbing stdin for the silent prompt.
      rl.close();
      if (!args.password) {
        args.password = await promptHidden('Password (hidden)');
      }
    } catch (err) {
      try { rl.close(); } catch {}
      throw err;
    }
  }

  args.email = (args.email || '').toLowerCase().trim();
  args.name = (args.name || '').trim();

  if (!args.email || !args.email.includes('@')) {
    console.error('A valid email is required.');
    process.exit(1);
  }
  if (!args.name) {
    console.error('A display name is required.');
    process.exit(1);
  }
  if (!args.password || args.password.length < 6) {
    console.error('Password must be at least 6 characters.');
    process.exit(1);
  }

  const salt = generateSalt();
  const hash = hashPassword(args.password, salt);

  const sql = `
    INSERT INTO users (email, password_hash, password_salt, name, role)
    VALUES (${sqlEscape(args.email)}, ${sqlEscape(hash)}, ${sqlEscape(salt)}, ${sqlEscape(args.name)}, ${sqlEscape(args.role)})
    ON CONFLICT(email) DO UPDATE SET
      password_hash = excluded.password_hash,
      password_salt = excluded.password_salt,
      name          = excluded.name,
      role          = excluded.role;
  `.replace(/\s+/g, ' ').trim();

  console.log(`\n→ Upserting ${args.email} (${args.role}) in D1 (${args.remote ? 'remote' : 'local'})…`);
  await runWrangler(sql, args.remote);
  console.log('Done. Sign in at /admin.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
