# Auto-Curation

This library can curate itself by asking the
[`bnreplah/autonomous-researcher`](https://github.com/bnreplah/autonomous-researcher)
project — specifically its `resource_finder` module — to propose new
resources, then opening a PR with the additions for human review.

## What runs where

| Repo                          | Component                                          | Purpose                                                            |
| ----------------------------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| `bnreplah/cybersecuritylibrary` | `scripts/extract_db.js`                          | Dumps `RESOURCES_DB.js` as JSON the curator can read.              |
| `bnreplah/cybersecuritylibrary` | `.github/workflows/auto-curate-resources.yml`    | Scheduled + manual driver. Rotates categories by ISO week number.  |
| `bnreplah/cybersecuritylibrary` | `.github/workflows/curate-on-issue.yml`          | Triggers on `resource-request` labelled issues.                    |
| `bnreplah/cybersecuritylibrary` | `scripts/merge_curated.js`                       | Splices verified proposals into the right category array.          |
| `bnreplah/autonomous-researcher`| `resource_finder/discover.py`                    | Pulls feeds, calls the LLM, verifies URLs, writes proposals JSON.  |

## Pipeline

```
  RESOURCES_DB.js
        │
        ▼  scripts/extract_db.js
   existing.json
        │
        ▼  python -m resource_finder.discover
  + optional recent RSS items
  + LLM (Claude or Gemini) proposes durable entries
  + URL verification (HTTP 2xx/3xx + page <title>)
        │
        ▼
   proposed.json
        │
        ▼  scripts/merge_curated.js   (only reachable + complete entries)
  RESOURCES_DB.js (updated, formatting preserved)
        │
        ▼  peter-evans/create-pull-request
   PR opened on main with the curator output as artifact
```

## Setting it up

### 1. Secrets

In this repository's _Settings → Secrets and variables → Actions_:

- `ANTHROPIC_API_KEY` — required for Claude (default backend)
- `GOOGLE_API_KEY` — optional, only needed if you switch to Gemini

`GITHUB_TOKEN` is provided automatically and is what `peter-evans/create-pull-request` uses to open the PR.

### 2. Variables (optional)

In _Settings → Secrets and variables → Actions → Variables_:

| Variable                         | Purpose                                                        | Default                              |
| -------------------------------- | -------------------------------------------------------------- | ------------------------------------ |
| `AUTONOMOUS_RESEARCHER_REF`      | Branch / tag of `autonomous-researcher` to check out.          | `main`                               |
| `RESOURCE_FINDER_MODEL`          | `claude` or `gemini`.                                          | `claude`                             |
| `RESOURCE_FINDER_CLAUDE_MODEL`   | Claude model id.                                               | `claude-haiku-4-5-20251001`          |
| `RESOURCE_FINDER_GEMINI_MODEL`   | Gemini model id.                                               | `gemini-2.5-flash`                   |

> Set `AUTONOMOUS_RESEARCHER_REF` to a feature branch (e.g.
> `claude/add-autonomous-researcher-zScK8`) until the `resource_finder`
> module lands on `main` of that repo, then remove the variable.

### 3. Allowed Actions

The workflows use `peter-evans/create-pull-request@v6`. If your
organization restricts third-party actions, allow that one (or vendor
an equivalent script).

## Running it

### On a schedule

`auto-curate-resources.yml` runs every Monday at 04:00 UTC and rotates
through the nine categories by ISO week number, so each category is
revisited roughly once every two months.

### On demand (manual)

_Actions → Auto-Curate Resources → Run workflow_. Pick a category and
optional topic. Tick **Dry run** to skip PR creation — the
`curator-output-*` artifact still has the full output.

### Via an issue

Open an issue using the **Resource request (auto-curate)** template (it
adds the `resource-request` label). `curate-on-issue.yml` will:

1. Comment on the issue acknowledging the run.
2. Run the curator with the requested category / topic / max.
3. Open a PR that `Closes #<issue>` on success, or comment with the
   reason on failure / empty result.

## How safe is the auto-merge?

**There is no auto-merge.** Every successful run opens a PR labelled
`auto-curated` + `needs-review`. The proposed entries are filtered to
those that:

- pass the category's required-fields check (`schema.CATEGORY_FIELDS`)
- return a reachable HTTP status (2xx/3xx, or 401/403/429)

The PR description includes a review checklist. The merge step is
always a human.
