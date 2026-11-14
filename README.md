# Albatany Portfolio

> Push the limits.

The personal portfolio of Aziz Albatany, covering software and hardware work: AI applications, game design, robotics, and cybersecurity. Version 5.0 keeps the established identity of the site (dark navy palette, red accent, VCR font, pixel art, and the vinyl music player) and adds a community layer, live statistics, and a command palette.

![Live site](https://img.shields.io/badge/live-albatany.vercel.app-e63946?style=flat-square)
![Node.js](https://img.shields.io/badge/node-22%20LTS-339933?style=flat-square)

**Live site:** https://albatany.vercel.app/

<p align="center">
  <img width="1920" height="1036" alt="image" src="https://github.com/user-attachments/assets/d506e43c-6f2d-4f17-8add-ca8fb927c4f2" />
</p>

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Security and Privacy](#security-and-privacy)
- [Release Notes](#release-notes)
- [Contact](#contact)

## Features

| Area | Description |
|---|---|
| Visual design | Keeps the navy and dark identity with a red accent, VCR font, pixel art, and the vinyl player. Includes a floating navbar, a more compact grid, a shorter page rhythm, and a responsive layout. |
| Background | A lightweight image is the default. The background can be configured as MP4, WebM, GIF, PNG, JPG, WebP, AVIF, or SVG. |
| Projects | Ten projects, including ZT-HAC, Bridge, OfflineBox, and ChronoLens. Supports search and category filters. Parallax is limited to game previews. |
| Reactions | Sign in with Google or GitHub. Each account has one active reaction per project, and clicking it again removes it. |
| Guestbook | A fixed button at the bottom right opens a drawer. Supports pseudonymous names, pagination, deleting your own messages, and spam limits enforced in the database. |
| Statistics | WakaTime and GitHub appear at the top, with Monkeytype, Discord, and Steam below. Popular repositories are pulled from GitHub. |
| GitHub calendar | Daily contributions from the GitHub GraphQL API. Hover, keyboard focus, or touch shows the count for each date. |
| Achievements | A filterable and searchable collection with PDF detail views and an optional validation button for each item. |
| Gallery | Previous and Next controls, keyboard arrow navigation, and swipe gestures. Follows the active category. |
| Music | The original vinyl player. The whole disc can be hidden and brought back from the Music tab. |
| Command palette | Opens with Ctrl+K or Cmd+K. Supports search, arrow key navigation, Enter, and Escape. A navbar button is also available. |
| About | A pixel art story built with GSAP ScrollTrigger (pin and scrub). Small screens and reduced-motion settings get a standard layout. |
| Terminal | A sandboxed command playground with `help`, `whoami`, `skills`, `projects`, `contact`, `socials`, `date`, `clear`, and `open about`. |
| Contact | Form validation, honeypot, Cloudflare Turnstile, and delivery through Resend, with sending, received, and failed states. An email address is shown as an alternative. |
| Share preview | A 1600x900 PNG generated from the site's own assets, with Open Graph and Twitter Card metadata on every page. |
| Privacy | A dedicated privacy page, public identity limited to an alias, deletion of your own contributions, and no service-role key in the browser. |


### Integrations

Login, community storage, email delivery, and part of the statistics only become active after you add your own credentials. When a connection is unavailable, the interface shows no invented numbers and does not report a successful delivery.

| Service | Used for |
|---|---|
| Supabase | Google and GitHub login, reactions, guestbook |
| GitHub | Contribution calendar, popular repositories |
| WakaTime | Coding activity statistics |
| Monkeytype | Typing statistics |
| Discord | Presence and community stats |
| Steam | Gaming stats |
| Resend | Contact form delivery |
| Cloudflare Turnstile | Contact form bot protection |

Setup instructions for each service are in [INTEGRATIONS.md](INTEGRATIONS.md).

## Getting Started

### Prerequisites

- Node.js 22 LTS
- npm

### Installation

1. Extract the package into a new folder and keep a backup of the previous site.
2. Copy any gallery, music, or video assets that were intentionally left out back to their original paths under `assets/`. The full list is in [docs/ASSETS.md](docs/ASSETS.md).
3. Open a terminal in the folder that contains `package.json` and install the dependencies:

   ```bash
   npm ci
   ```

4. Create your local environment file.

   Linux and macOS:

   ```bash
   cp .env.example .env.local
   ```

   Windows (CMD):

   ```cmd
   copy .env.example .env.local
   ```

5. Fill in `.env.local` by following [INTEGRATIONS.md](INTEGRATIONS.md). The file can stay empty at first if you only want to preview the site and its fallbacks.

### Run Locally

```bash
npm run dev
```

Open http://localhost:4173. The local server runs the same API handlers as Vercel, so do not open the HTML files through `file://`.

`npm run dev` builds the site before it starts. There is no hot reload: after editing content or code, stop the server with Ctrl+C and run the command again.

## Scripts

```bash
npm run build      # Build dist/, bundles, HTML metadata, sitemap, robots, and social thumbnails
npm run check      # Validation checks
npm test           # Test suite
npm run test:http  # HTTP-level tests
```

`build` writes everything to `dist/`. Do not edit `dist/` by hand, because the next build overwrites it. Missing heavy assets do not fail the build.

## Project Structure

```text
assets/js/content.js       Content data (the file you will edit most often)
assets/js/site.js          Main renderer and retained v4.1 interactions
assets/css/site.css        Visual foundation from v4.1
assets/css/update.css      v5 visual adjustments and components
assets/css/v6.css          Dropdown, flags, dock, project thumbnails, contact, Guides/Devlogs/Papers
assets/css/gendut.css      Gendut <3 page (loaded on that page only)
assets/guides/             Guide book PDFs
assets/papers/             Paper PDFs
assets/images/             Photos, certificates, pixel art, social thumbnails
src/                       Modular features: palette, community, statistics, story
api/                       Vercel handlers for public data and contact
server/                    Backend utilities
supabase/schema.sql        Private schema, RLS policies, and RPCs with owner checks
site.config.mjs            URL, metadata, and thumbnail configuration
scripts/                   Build, local server, and validation scripts
```

## Documentation

| Document | Contents |
|---|---|
| [INTEGRATIONS.md](INTEGRATIONS.md) | Supabase (Google and GitHub), GitHub calendar, Monkeytype, WakaTime, Discord, Steam, contact form |
| [docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md) | Deploying to the existing Vercel project from a terminal |
| [docs/EDITING.md](docs/EDITING.md) | Adding projects, gallery items, certificates, validation links, About stories, music, backgrounds, and thumbnails |
| [docs/ASSETS.md](docs/ASSETS.md) | Assets that are not bundled and how to restore them |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Structure, data flow, privacy decisions, moderation, and operational limits |
| [docs/VERIFICATION.md](docs/VERIFICATION.md) | Test coverage and pre-production checks |
| [CHANGELOG.md](CHANGELOG.md) | Changes from v4.1 to v5.0 |

## Security and Privacy

- The source archive contained `.env` and `.env.local` files. The real keys are not included in this release. Rotate the WakaTime and Steam keys and any other token that is still active, since they were shared in the archive. Revoke the Vercel token if it is still valid, and use new keys in `.env.local` and in Vercel.
- Google and GitHub login cannot be anonymous to the authentication administrator. Supabase stores the login identity, and project administrators can access it. The application limits what is shown publicly, the scopes it requests, and what is stored in the community tables. The login modal and `privacy.html` explain this to visitors.

## Release Notes

- This package does not modify the existing production website. Fill in the services, restore the required assets, and then follow the deployment guide.
- Four of the new project descriptions come from the metadata of public repositories. The cards labeled as workspace illustrations are presentation visuals and are not application screenshots.
- The "Check Validation" buttons use `example.com` and carry a **DEMO LINK** label. Replace these links before publishing them as proof of validation.

## Contact

- Website: https://albatany.vercel.app/
- GitHub: https://github.com/Albatany
