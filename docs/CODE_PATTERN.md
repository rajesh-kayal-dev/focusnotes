# FocusNotes Code Pattern

## Folder Structure

```text
focusnotes/
│
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── features/
│       │   │   ├── notes/
│       │   │   ├── search/
│       │   │   ├── focus/
│       │   │   └── markdown/
│       │   ├── db/
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── main.tsx
│       │
│       ├── public/
│       └── package.json
│
├── packages/
│
├── .github/
├── package.json
├── pnpm-workspace.yaml
└── README.md
````

## Folder Rules

### app/

App setup and routing.

### components/

Reusable UI components.

```text
Button
Modal
Sidebar
TopBar
```

### features/

Feature-specific code.

```text
notes/
search/
focus/
markdown/
```

### db/

IndexedDB code.

### hooks/

Reusable React hooks.

### lib/

Small shared utilities and constants.

### packages/

Only for code shared between apps.

---

## Component Style

Use `rafce` style.

```tsx
const NoteItem = () => {
  return (
    <div>
      Note
    </div>
  );
};

export default NoteItem;
```

## Naming

Components:

```text
NoteItem.tsx
NoteEditor.tsx
SearchDialog.tsx
```

Hooks:

```text
useNotes.ts
useSearch.ts
```

Services:

```text
note.service.ts
```

Types:

```text
note.types.ts
```

## Code Flow

Keep the flow simple:

```text
Component
    ↓
Hook
    ↓
Service
    ↓
Database
```

Only use a layer when needed.

## Rules

* Use TypeScript.
* Use functional React components.
* Keep components small.
* Keep feature code inside `features/`.
* Don't put database logic inside components.
* Use React hooks for state.
* Don't use Redux for MVP.
* Don't create unnecessary files.
* Don't add libraries without a reason.
* Prefer simple readable code.

