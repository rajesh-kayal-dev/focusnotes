# FocusNotes Git Flow

## Repository

FocusNotes is a monorepo.

```text
focusnotes/
├── apps/
│   └── web/
├── packages/
├── .github/
├── package.json
└── pnpm-workspace.yaml
````

---

## Main Branch

```text
main
```

`main` contains stable, working code.

---

## Branches

We use short-lived branches.

```text
main
│
├── feature/*
├── fix/*
└── chore/*
```

### Feature Branch

Used for new functionality.

```text
feature/project-setup
feature/app-ui
feature/notes
feature/markdown
feature/search
feature/focus-mode
feature/download
feature/pwa
```

### Fix Branch

Used for bug fixes.

```text
fix/note-save
fix/markdown-editor
fix/search
```

### Chore Branch

Used for project maintenance.

```text
chore/dependencies
chore/config
```

---

## Development Flow

```text
main
 ↓
Create branch
 ↓
Develop
 ↓
Test
 ↓
Commit
 ↓
Push
 ↓
Pull Request
 ↓
Merge
 ↓
Delete branch
```

---

## Branch Creation

Always create a new branch from the latest `main`.

```bash
git checkout main
git pull origin main

git checkout -b feature/notes
```

---

## Pull Request

Every feature or fix is merged through a Pull Request.

```text
feature/*
     ↓
Pull Request
     ↓
main
```

---

## Commit Format

Use Conventional Commits.

```text
type(scope): description
```

Examples:

```text
feat(notes): add note creation
feat(markdown): add markdown editor
feat(search): add note search
fix(notes): fix note saving
chore: update dependencies
```

---

## Monorepo Rule

Branches represent a feature or change, not an individual package.

Example:

```text
feature/markdown
```

The branch can contain changes in:

```text
apps/web/
packages/
```

when they are required for the same feature.

---

## Project Development Order

```text
main
 ↓
feature/project-setup
 ↓
feature/app-ui
 ↓
feature/notes
 ↓
feature/markdown
 ↓
feature/search
 ↓
feature/focus-mode
 ↓
feature/download
 ↓
feature/pwa
 ↓
main
```

---

## Production Branch

```text
main
```

The production application is deployed from `main`.

```

This is the Git flow I would use for **FocusNotes**: one `main` branch, short-lived feature/fix/chore branches, and Pull Requests into `main`.
```
