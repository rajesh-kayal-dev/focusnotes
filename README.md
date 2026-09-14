# FocusNotes

FocusNotes is a local-first writing and reading workspace for turning messy information into focused notes. Notes are stored in the browser with IndexedDB, and the app can be installed as a Progressive Web App for offline use.

## Goals

- Keep note-taking fast, focused, and distraction-free.
- Support practical Markdown editing, search, focus mode, and downloads.
- Preserve user data locally and keep the application useful offline.
- Collaborate in small, reviewable branches with clear Conventional Commits.

## Repository

This repository is a pnpm monorepo. The web application lives in `apps/web`.

## Requirements

- Node.js 22 or newer
- pnpm 10.33.0 or compatible

## Setup

```bash
pnpm install
pnpm dev
```

The development server is available at `http://localhost:5173`.

FocusNotes currently has no required environment variables. Copy `.env.example` to `.env` only when adding local configuration. Never commit `.env` or real secrets.

## Checks

```bash
pnpm lint
pnpm build
```

The production build is written to `apps/web/dist`.

## Vercel Deployment

The root `vercel.json` configures Vercel to install the workspace, build the `web` package, publish `apps/web/dist`, and serve the client-side application fallback.

To deploy with Vercel:

1. Import the GitHub repository into Vercel.
2. Leave the project root at the repository root.
3. Keep the build and output settings from `vercel.json`.
4. Add only the environment variables required by future integrations; none are needed for the current app.
5. Deploy the branch or open pull request preview before promoting to production.

## Collaboration

Use short-lived branches such as `feature/*`, `fix/*`, and `chore/*`. Run lint and the production build before opening a pull request. Use Conventional Commits, for example:

```text
chore: prepare deployment configuration
```

Pull requests target `main` and should be reviewed before merging.

## License

FocusNotes is available under the [MIT License](LICENSE).