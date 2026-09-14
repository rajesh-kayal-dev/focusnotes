# FocusNotes

FocusNotes is a local-first writing and reading workspace for turning messy information into focused notes. Notes are stored in the browser with IndexedDB, and the app can be installed as a Progressive Web App for offline use.

## Goals

- Keep note-taking fast, focused, and distraction-free.
- Support practical Markdown editing, search, focus mode, and downloads.
- Preserve user data locally and keep the application useful offline.
- Collaborate in small, reviewable branches with clear Conventional Commits.

## Project Structure

FocusNotes is a pnpm monorepo. The application currently contains one web workspace and shared documentation:

```text
focusnotes/
├── apps/
│   └── web/                 React, TypeScript, Vite, and PWA application
│       ├── public/          Static icons and public assets
│       └── src/             Application source code
│           ├── app/         Application layout
│           ├── components/  Shared interface components
│           ├── db/          IndexedDB persistence
│           ├── features/    Notes, Markdown, search, theme, zoom, and PWA logic
│           └── lib/         Reusable utilities
├── docs/                    Development, architecture, and design notes
├── packages/                Reserved for future shared packages
├── .env.example             Local environment variable template
├── package.json             Workspace scripts and package manager metadata
├── pnpm-workspace.yaml      Workspace package definitions

├── LICENSE                  MIT license
└── README.md                Project documentation
```

## Project Details

- **Frontend:** React, TypeScript, Vite, and Tailwind CSS
- **Editor:** Milkdown with Markdown support and syntax highlighting
- **Storage:** Browser IndexedDB through `idb`
- **Application features:** Notes, tabs, search, focus mode, themes, page zoom, downloads, and media previews
- **Offline support:** Installable PWA with a generated service worker
- **Data model:** Local browser data; no backend or required external services

## Requirements

- Node.js 22 or newer
- pnpm 10.33.0 or compatible

## Getting Started

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

The development server is available at `http://localhost:5173`.

FocusNotes currently has no required environment variables. Copy `.env.example` to `.env` only when adding local configuration. Never commit `.env` or real secrets.

## Validation

Run the project checks before opening a pull request:

```bash
pnpm lint
pnpm build
```

The production build is written to `apps/web/dist`.

## Collaboration

Start work from an up-to-date `main` branch and use a short-lived branch for each change:

```bash
git switch main
git pull origin main
git switch -c feature/your-change
```

Use `feature/*`, `fix/*`, or `chore/*` branch names. Run lint and the production build before opening a pull request. Use Conventional Commits, for example:

```text
feat(notes): improve note search
fix(editor): preserve markdown formatting
chore: update project documentation
```

Pull requests target `main` and should be reviewed before merging. For questions, improvements, or collaboration, open an issue or start a discussion in the repository.

## License

FocusNotes is available under the [MIT License](LICENSE).

## Author

Rajesh