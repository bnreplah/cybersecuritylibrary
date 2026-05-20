# scripts/

Node utilities used by the auto-curation workflows.

## `extract_db.js`

Exports `RESOURCES_DB.js` as plain JSON for the autonomous-researcher's
`resource_finder` to read (it deduplicates against existing entries and
shows the LLM what is already in the library).

```bash
node scripts/extract_db.js RESOURCES_DB.js existing.json
```

## `merge_curated.js`

Reads a `proposed.json` produced by `python -m resource_finder.discover`
and injects verified entries directly into the target category's array in
`RESOURCES_DB.js`. The change is minimal — just new lines before the
closing `]` — so the file's hand-formatted style is preserved.

Flags:

| flag                       | description                                              |
| -------------------------- | -------------------------------------------------------- |
| `--db <path>`              | Override the target DB file (default `./RESOURCES_DB.js`).|
| `--include-unreachable`    | Merge entries whose URL check failed (not recommended).  |
| `--dry-run`                | Print the inserted block but don't write the file.       |

```bash
node scripts/merge_curated.js proposed.json --dry-run
```
