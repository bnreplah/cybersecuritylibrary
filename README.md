# cybersecuritylibrary

A working, inclusive list of cybersecurity and programming resources to share and reference.

This repo accepts contributions — either open a PR directly against `RESOURCES_DB.js`, or let the **auto-curation** workflow do a first pass for you.

## Auto-curation

`bnreplah/cybersecuritylibrary` can curate itself by asking [`bnreplah/autonomous-researcher`](https://github.com/bnreplah/autonomous-researcher) to:

1. **Pull** — fetch recent items from public security feeds (Krebs, Talos, Unit 42, etc.) for grounding context.
2. **Parse** — ask Claude or Gemini to propose new, durable, evergreen entries for a target category (`tools`, `research`, `events`, `training`, `threatIntel`, or any of the three RSS lists).
3. **Verify** — GET each proposed URL with a short timeout; treat 2xx/3xx (and 401/403/429 = bot-blocked) as reachable; capture each page's `<title>`.
4. **Add** — splice verified entries into the right category in `RESOURCES_DB.js`, preserving the file's hand-formatted style, and open a PR labelled `auto-curated` + `needs-review`.

### Three ways to trigger it

- **On a schedule** — `.github/workflows/auto-curate-resources.yml` runs every Monday at 04:00 UTC. The category rotates by ISO week number so all nine get revisited roughly every two months.
- **Manually** — _Actions → Auto-Curate Resources → Run workflow_. Pick a category, optionally narrow with a topic, optionally dry-run.
- **From an issue** — open one using the **Resource request (auto-curate)** template. `curate-on-issue.yml` parses the form, runs the curator, opens a PR, and comments back on the issue.

Every successful run uploads a `curator-output-*` artifact with the full `proposed.json` so you can see exactly what the LLM proposed and why each entry was kept or rejected.

**There is no auto-merge.** A human always reviews and merges the PR.

See [`docs/AUTO_CURATION.md`](docs/AUTO_CURATION.md) for setup (API keys, optional repo variables) and the full pipeline diagram.

## Manual contributions

Add an entry to the right list in [`RESOURCES_DB.js`](RESOURCES_DB.js) and open a PR. The existing PR checks (`pr-checks.yml`, `validate-urls.yml`, `validate-feeds.yml`) will validate the schema and reachability.
