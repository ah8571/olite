# Olite Desktop Prototype

This is the first desktop prototype for Olite.

Current scope:

- single-page local review of a public website
- optional runtime browser audit for one public page using Playwright
- bounded same-domain page discovery
- grouped findings across accessibility, privacy, consent, and security
- export of scan results to JSON
- export of flattened issue rows to CSV
- suggested-fix guidance included in exported issue data for remediation and chat-agent workflows
- machine-readable issue family, verification method, confidence level, and manual-review flags included in exported issue data
- saved local scan history inside the desktop shell, including reopening past reports
- saved local test targets for repeated comparisons while exploring the interface

To run it from the repository root:

- `npm install`
- `npm run desktop:start`

Useful first-pass workflow:

- add a few public URLs as saved test targets
- rerun those same sites as you remediate issues
- compare issue grouping and page-level findings
- review the issue-rows table before exporting CSV
- reopen saved reports from local history without rescanning

This first version is intentionally narrow and aimed at simple public websites.

The runtime browser audit observes tracker requests and tracking-cookie signals before any consent click, then samples the page again immediately after one detected accept or reject interaction when possible. It is useful for catching obvious consent implementation problems, but it does not replace route-by-route, authenticated, or full sitewide privacy verification.