# Pull Request

## Summary

<!-- Briefly describe what this PR adds, changes, or fixes. -->

## Type of Change

- [ ] New resource(s) added to `RESOURCES_DB.js`
- [ ] Existing resource updated (dead link fix, description update, etc.)
- [ ] UI / CSS change in `index.html`
- [ ] Workflow / automation change
- [ ] Bug fix
- [ ] Other: <!-- describe -->

## Resources Changed

<!-- List the resources added or modified. For each new entry, paste the object from RESOURCES_DB.js below. -->

```js
// Example:
{ title: 'Example Tool', url: 'https://example.com/', badge: 'Free', badgeClass: 'badge-green',
  desc: 'A description of the tool.', tags: ['tag1', 'tag2'] }
```

## Checklist

- [ ] All URLs in my changes are publicly accessible (tested manually)
- [ ] All RSS feeds I added return valid XML (tested manually or via `curl`)
- [ ] No `cybopsec` branding or old references introduced
- [ ] No `eval()`, `innerHTML` with user-supplied data, or other XSS vectors added
- [ ] `RESOURCES_DB.js` is valid JavaScript (no syntax errors)
- [ ] PR title follows the format: `[RESOURCE] Add <name>` or `[FIX] <description>`
- [ ] CI checks are passing

## Testing

<!-- How did you verify your changes work? -->

- Opened `index.html` locally in a browser: Yes / No
- Confirmed new cards render correctly: Yes / No
- Confirmed RSS feeds load in Live Feeds panel: Yes / No / N/A
