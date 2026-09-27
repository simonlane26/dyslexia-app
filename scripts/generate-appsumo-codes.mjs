/**
 * Generates unique AppSumo redemption codes, seeds them into the
 * `appsumo_codes` Supabase table as 'unused', and writes a CSV for
 * upload to AppSumo (one column, no header, no duplicates, shuffled —
 * matches AppSumo's stated CSV requirements).
 *
 * Usage:
 *   node --env-file=.env.local scripts/generate-appsumo-codes.mjs <count>
 *
 * Example:
 *   node --env-file=.env.local scripts/generate-appsumo-codes.mjs 1000
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
 * the env file. Output CSV is gitignored — never commit redemption
 * codes to the repo.
 */

import { createClient } from '@supabase/supabase-js';
import { randomInt } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIN_COUNT = 1;
const MAX_COUNT = 10000;
const CODE_LEN = 8;
// Excludes ambiguous characters (0/O, 1/I/L) so codes are easy to
// read and type back in correctly.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateSuffix() {
  let out = '';
  for (let i = 0; i < CODE_LEN; i++) {
    out += ALPHABET[randomInt(ALPHABET.length)];
  }
  return out;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function main() {
  const count = Number(process.argv[2]);
  if (!Number.isInteger(count) || count < MIN_COUNT || count > MAX_COUNT) {
    console.error(`Usage: node --env-file=.env.local scripts/generate-appsumo-codes.mjs <count>`);
    console.error(`  <count> must be an integer between ${MIN_COUNT} and ${MAX_COUNT}.`);
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the env file.');
    process.exit(1);
  }

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });

  console.log(`Generating ${count} unique codes...`);
  const codes = new Set();
  while (codes.size < count) {
    codes.add(`DW-AS-${generateSuffix()}`);
  }
  const codeList = shuffle([...codes]);

  console.log(`Seeding ${codeList.length} codes into appsumo_codes...`);
  const BATCH_SIZE = 500;
  for (let i = 0; i < codeList.length; i += BATCH_SIZE) {
    const batch = codeList.slice(i, i + BATCH_SIZE).map((code) => ({ code }));
    const { error } = await db.from('appsumo_codes').insert(batch);
    if (error) {
      console.error(`Failed inserting batch starting at index ${i}:`, error.message);
      process.exit(1);
    }
    console.log(`  seeded ${Math.min(i + BATCH_SIZE, codeList.length)}/${codeList.length}`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(__dirname, '..', `appsumo-codes-${timestamp}.csv`);
  fs.writeFileSync(outPath, codeList.join('\n') + '\n', 'utf8');

  console.log(`\nDone. ${codeList.length} codes seeded and written to:`);
  console.log(`  ${outPath}`);
  console.log(`\nThis file is gitignored — upload it to AppSumo directly, then delete your local copy.`);
}

main();
