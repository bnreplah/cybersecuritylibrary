#!/usr/bin/env node
// Merge curated proposals into RESOURCES_DB.js in place.
//
// Reads proposals.json (output of `python -m resource_finder.discover`),
// keeps only entries that pass verification (reachable + no missing
// fields), formats them in the same single-quote JS style as existing
// entries, and inserts them before the closing `]` of the target
// category's array. Everything outside that array is preserved verbatim,
// including comments and original formatting.
//
// Usage:
//   node scripts/merge_curated.js proposals.json [--db RESOURCES_DB.js] \
//        [--include-unreachable] [--dry-run]

'use strict';

const fs = require('fs');
const path = require('path');

function arg(name, def) {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  return process.argv[i + 1];
}
function flag(name) {
  return process.argv.includes(name);
}

const proposalsPath = process.argv[2];
if (!proposalsPath || proposalsPath.startsWith('--')) {
  console.error(
    'Usage: merge_curated.js <proposals.json> [--db <path>] ' +
    '[--include-unreachable] [--dry-run]'
  );
  process.exit(2);
}

const dbPath = arg('--db', path.join(process.cwd(), 'RESOURCES_DB.js'));
const includeUnreachable = flag('--include-unreachable');
const dryRun = flag('--dry-run');

const payload = JSON.parse(fs.readFileSync(proposalsPath, 'utf8'));
const category = payload.category;
const proposals = payload.proposals || [];
if (!category) {
  console.error('proposals.json missing "category"');
  process.exit(1);
}

const eligible = proposals.filter((p) => {
  const v = p.verification || {};
  if (Array.isArray(v.missing_fields) && v.missing_fields.length > 0) {
    return false;
  }
  if (!includeUnreachable && !v.reachable) return false;
  return true;
});

if (eligible.length === 0) {
  console.error(
    `No eligible proposals in ${proposalsPath} ` +
    `(${proposals.length} total, after filtering).`
  );
  process.exit(0);
}

// ---- formatter: match existing single-quote JS style --------------------
function escapeSingle(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
function quote(v) {
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) return '[' + v.map(quote).join(',') + ']';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return "'" + escapeSingle(v) + "'";
}
function formatEntry(entry) {
  const parts = [];
  for (const [k, v] of Object.entries(entry)) {
    if (v === null || v === undefined) continue;
    parts.push(`${k}:${quote(v)}`);
  }
  return `  { ${parts.join(', ')} },`;
}

// ---- locate <category>: [ ... ] in the source ---------------------------
const src = fs.readFileSync(dbPath, 'utf8');
const headerRe = new RegExp(`(?:^|[\\s,{])${category}\\s*:\\s*\\[`, 'm');
const headerMatch = headerRe.exec(src);
if (!headerMatch) {
  console.error(`Could not find category "${category}" in ${dbPath}`);
  process.exit(1);
}
const arrayStart = src.indexOf('[', headerMatch.index);

// Walk the array to find the matching `]`, tracking string state so that
// brackets inside string literals don't confuse the depth counter.
let depth = 0;
let inString = false;
let stringQuote = '';
let endIdx = -1;
for (let i = arrayStart; i < src.length; i++) {
  const c = src[i];
  if (inString) {
    if (c === '\\') { i++; continue; }
    if (c === stringQuote) inString = false;
    continue;
  }
  if (c === '"' || c === "'") {
    inString = true;
    stringQuote = c;
    continue;
  }
  if (c === '[') depth++;
  else if (c === ']') {
    depth--;
    if (depth === 0) { endIdx = i; break; }
  }
}
if (endIdx === -1) {
  console.error(`Could not find matching ] for ${category} in ${dbPath}`);
  process.exit(1);
}

// ---- splice new entries in just before the closing ] -------------------
const arrayBody = src.slice(arrayStart + 1, endIdx);
const trimmedBody = arrayBody.replace(/\s+$/, '');
const needsComma = trimmedBody.length > 0 && !trimmedBody.endsWith(',');
const stamp = new Date().toISOString().slice(0, 10);
const topic = payload.topic ? ` (topic: ${payload.topic})` : '';
const block =
  trimmedBody +
  (needsComma ? ',' : '') +
  `\n  // --- auto-curated ${stamp}${topic} ---\n` +
  eligible.map((p) => formatEntry(p.entry)).join('\n') +
  '\n';

const newSrc = src.slice(0, arrayStart + 1) + block + src.slice(endIdx);

if (dryRun) {
  console.log(
    `[dry-run] Would insert ${eligible.length} entries into ${category}.`
  );
  console.log('--- diff preview (inserted block) ---');
  console.log(block.slice(trimmedBody.length));
  process.exit(0);
}

fs.writeFileSync(dbPath, newSrc);
console.log(
  `Inserted ${eligible.length} new ${category} entries into ${dbPath}.`
);
