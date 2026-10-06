# Modern Portfolio Template

A responsive portfolio built with Next.js 14, React, TypeScript, Tailwind CSS, and Framer Motion. It includes a dark hero, light/dark themes, project cards, filterable skills, an experience timeline, and a guided tour. The sample identity, projects, and illustrations are fictional.

## Quick start

Use Node.js 20 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No provider accounts or API keys are needed to view the portfolio.

```sh
npm run lint
npm test -- --runInBand
npm run build
npm start
```

Other useful checks: `npm run typecheck` and `npm run check:knip`.

## Make it yours

Edit **`src/config/site.ts`**. It is the single source for your name, title, email, links, biography, hero specialties, skills, timeline, projects, tour copy, podcast episodes, and project journal. Start with the `siteConfig` object near the end; the larger sample content arrays are above it. Replace sample achievements with claims you can support.

- Set `url` to your deployed origin, including `https://`.
- Set the contact email and social/resume links to your own destinations.
- Replace the neutral illustrations in `public/images/placeholders/` and update `images` in the config. Remove private image metadata before publication.
- Add your case studies to `projectsData.all`; the featured cards retain the same styling.
- Keep text content in the config and presentation changes in `src/components/sections/`.
- Global styles are in `src/app/globals.css`; design tokens are in `tailwind.config.ts`.

The `/30days` and `/podcast` pages are optional sample layouts. Audio playback and downloads need real episode assets and player integration; sample episodes do not contain audio.

## Optional services

Copy `.env.example` to `.env.local` only if you want integrations. Its empty defaults keep services inactive. Never commit `.env.local`.

- **AI chat:** set the server-only `OPENAI_API_KEY`. Its portfolio context comes from the site config; the API reports unavailable when no key is configured.
- **Contact email:** set `RESEND_API_KEY` and a verified `FROM_EMAIL`. The recipient comes from `siteConfig.email`. Unconfigured delivery returns an error instead of pretending a message was sent.
- **Analytics:** Firebase configuration is optional. Configure restrictive Firestore rules and real administrative authorization before exposing data. The legacy client-side dashboard password is not server-side access control. Some analytics collection endpoints remain integration points.
- **Scheduling:** disabled by default through `features.scheduling`. Connect and validate a calendar backend before enabling it; this template does not bundle calendar authentication or booking APIs.

Keep provider credentials server-side. Do not put them in `NEXT_PUBLIC_*` variables or `next.config.js`'s `env` option.

## Deploy

Run the production build locally, then deploy as a Next.js project on Vercel or another Node-compatible host. Use `npm run build` as the build command; a self-hosted deployment uses `npm start`. Configure optional server environment variables through the host and update `siteConfig.url` for canonical and social metadata. A static export does not include the optional API routes.

## Folder structure

```text
src/
  app/                  Pages, metadata, styles, and API routes
  components/           Sections, navigation, themes, chat, analytics
  config/site.ts        Identity and public portfolio content
  config/site.test.ts   Configuration and optional-service regression tests
  hooks/                UI state and chat behavior
  lib/                  Shared helpers and optional service integrations
  types/                TypeScript interfaces
public/
  images/placeholders/  Neutral avatar and project illustrations
  images/icons/         UI illustrations
memory/
  README.md             Optional local agent-memory guidance
  EXAMPLE.md            Fictional example only
```

## Public-fork hygiene

Real agent memory, personal notes, workspace inventories, and credentials do not belong in public forks. Keep private memory outside the repository. `.gitignore` permits only `memory/README.md` and `memory/EXAMPLE.md`; ignore rules cannot untrack files already committed. Review your diff and assets before publishing.
