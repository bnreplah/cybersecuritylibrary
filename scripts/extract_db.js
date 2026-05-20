#!/usr/bin/env node
// Export RESOURCES_DB.js as plain JSON so the autonomous-researcher's
// resource_finder module can read it.
//
// Usage:
//   node scripts/extract_db.js [src_path] [out_path]
//
// Defaults: src = ./RESOURCES_DB.js, out = stdout.
// Output is a {category: [ {title, name, url, rss, site, badge, cat, tags} ]}
// object — a slim projection of each entry sufficient for dedup + prompting.

'use strict';

const fs = require('fs');
const path = require('path');

const srcPath = process.argv[2] || path.join(process.cwd(), 'RESOURCES_DB.js');
const outPath = process.argv[3] || null;

let raw;
try {
  raw = fs.readFileSync(srcPath, 'utf8');
} catch (err) {
  console.error(`Could not read ${srcPath}: ${err.message}`);
  process.exit(1);
}

// Evaluate the JS object literal in a controlled scope. We rewrite
//   var RESOURCES_DB = { ... };
// as
//   return { ... };
// so the wrapper IIFE is valid JS.
const wrapped =
  '(function(){ ' +
  raw.replace(/var\s+RESOURCES_DB\s*=\s*/, 'return ') +
  ' })()';

let db;
try {
  // eslint-disable-next-line no-eval
  db = eval(wrapped);
} catch (err) {
  console.error(`Failed to evaluate RESOURCES_DB.js: ${err.message}`);
  process.exit(1);
}

const summary = {};
for (const [cat, value] of Object.entries(db)) {
  if (!Array.isArray(value)) continue;
  summary[cat] = value.map((e) => ({
    title: e.title || null,
    name: e.name || null,
    url: e.url || null,
    rss: e.rss || null,
    site: e.site || null,
    badge: e.badge || null,
    badgeClass: e.badgeClass || null,
    cat: e.cat || null,
    tags: Array.isArray(e.tags) ? e.tags : null,
  }));
}

const json = JSON.stringify(summary, null, 2);
if (outPath) {
  fs.writeFileSync(outPath, json);
  console.error(`Wrote ${outPath} (${Object.keys(summary).length} categories)`);
} else {
  process.stdout.write(json);
}
