# Vercel Setup Instructions

## Purpose

Use this document to get the Olite marketing site and free tool pages deployed on Vercel so the landing pages can be reviewed in a live environment and basic SEO work can begin.

This deployment is for:

- the marketing site
- the pricing page
- the free hosted accessibility and privacy tools
- early SEO pages and comparison content

This deployment is not the long-term home for the full scanner product. The deeper scanner is still intended to remain local-first through a CLI and later desktop app.

## Pre-Deployment Checklist

Before connecting Vercel, make sure:

- the repository is pushed to GitHub
- the default branch is the branch you want deployed
- the current build passes locally with `npm run build`
- the custom domain `olite.dev` is available to connect later

## Recommended Vercel Setup

### 1. Import The Repository

- Log in to Vercel.
- Choose `Add New...` then `Project`.
- Import the Olite GitHub repository.

### 2. Confirm Framework Settings

Vercel should detect Next.js automatically.

Recommended settings:

- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: leave default
- Install Command: `npm install`

No custom environment variables are required for the current public marketing and free-tool setup.

### 3. Deploy The Initial Preview

- Complete the import.
- Let Vercel create the first deployment.
- Open the preview URL and confirm the following pages render:
  - `/`
  - `/pricing`
  - `/tools/accessibility`
  - `/tools/privacy`

### 4. Connect The Domain Later

Once the deployment looks correct:

- open the project in Vercel
- go to `Settings` then `Domains`
- add `olite.dev`
- add `www.olite.dev` only if you want both
- update DNS records in your registrar based on Vercel's instructions

Recommended canonical direction:

- primary domain: `https://olite.dev`
- redirect `www` to the apex unless there is a reason not to

## What To Check After Deployment

### Routing And Pages

Confirm these routes resolve without errors:

- `/`
- `/pricing`
- `/tools/accessibility`
- `/tools/privacy`
- `/blog`
- `/blog/review-of-siteimprove`
- `/blog/review-of-cookiebot`
- `/blog/siteimprove-vs-olite`
- `/blog/cookiebot-vs-olite`
- `/blog/best-accessibility-tools`
- `/blog/best-privacy-compliance-tools`

### Crawlability

Confirm:

- `/robots.txt` loads
- `/sitemap.xml` loads
- page titles and descriptions appear in the browser tab and page source

### Tool Behavior

The hosted free tools should remain intentionally lightweight.

Validate:

- URL submission works
- the API route responds for public pages
- the result panel shows findings and limitations

## Basic SEO Checklist

Once the site is live, work through this list.

### Search Console

- add the domain to Google Search Console
- verify ownership
- submit `https://olite.dev/sitemap.xml`
- monitor indexing and crawl errors

## Early Vercel Usage Notes

Vercel is a good fit for the current phase because it handles:

- static and server-rendered marketing pages
- lightweight API routes
- preview deployments for content iteration

It is not the intended runtime for the future heavy scanner product.

That split is deliberate:

- hosted site for marketing and lightweight free tools
- local-first CLI and desktop app for deeper scanning later
