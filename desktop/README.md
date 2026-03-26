# Olite Desktop Prototype

This is the first desktop prototype for Olite.

Current scope:

- local crawl of a simple public website
- optional sitemap seeding for broader sitewide crawl coverage
- bounded same-domain page discovery
- grouped findings across accessibility, privacy, consent, and security
- export of scan results to JSON
- export of flattened issue rows to CSV
- saved local scan history inside the desktop shell, including reopening past reports
- saved local test targets for repeated comparisons while exploring the interface

To run it from the repository root:

- `npm install`
- `npm run desktop:start`

Useful first-pass workflow:

- add a few public URLs as saved test targets
- add a sitemap when you want to seed a broader sitewide crawl
- rerun those same sites with different page limits
- compare issue grouping and page-level findings
- review the issue-rows table before exporting CSV
- reopen saved reports from local history without rescanning

This first version is intentionally narrow and aimed at simple public websites.