# FocusNotes Development

## Development Order

Build the project in this order.

### 1. Project Setup

- [ ] Create monorepo
- [ ] Setup React + TypeScript + Vite
- [ ] Setup Tailwind CSS
- [ ] Setup PWA
- [ ] Setup ESLint + Prettier
- [ ] Setup project structure
- [ ] Setup GitHub repository

Branch:

```text
feature/project-setup
````

---

### 2. App UI

Build the basic application layout.

* [ ] App layout
* [ ] Sidebar
* [ ] Top bar
* [ ] Notes list
* [ ] Note content area
* [ ] New Note
* [ ] Note menu

Branch:

```text
feature/app-ui
```

---

### 3. Notes

Implement local notes.

* [ ] Create note
* [ ] Read note
* [ ] Edit note
* [ ] Rename note
* [ ] Delete note
* [ ] Auto save
* [ ] IndexedDB storage

Branch:

```text
feature/notes
```

---

### 4. Markdown

Implement Markdown support.

* [ ] Markdown rendering
* [ ] Direct editing
* [ ] Headings
* [ ] Lists
* [ ] Checkboxes
* [ ] Links
* [ ] Code blocks

Branch:

```text
feature/markdown
```

---

### 5. Search

Implement note search.

* [ ] Search button
* [ ] Search interface
* [ ] Search notes
* [ ] Open search result

Branch:

```text
feature/search
```

---

### 6. Focus Mode

Implement distraction-free reading.

* [ ] Open Focus Mode
* [ ] Hide sidebar
* [ ] Hide controls
* [ ] Full-screen content
* [ ] Keyboard shortcut to exit

Branch:

```text
feature/focus-mode
```

---

### 7. Download

Allow users to keep their notes.

* [ ] Download Markdown
* [ ] Generate `.md` file
* [ ] Use note title as filename

Branch:

```text
feature/download
```

---

### 8. PWA

Make FocusNotes installable.

* [ ] Web app manifest
* [ ] App icons
* [ ] Service worker
* [ ] Offline support
* [ ] Standalone app
* [ ] Test desktop installation

Branch:

```text
feature/pwa
```

---

### 9. Testing

Test the complete application.

* [ ] Create note
* [ ] Edit note
* [ ] Save note
* [ ] Delete note
* [ ] Search
* [ ] Markdown
* [ ] Focus Mode
* [ ] Download
* [ ] Offline mode
* [ ] PWA installation

---

### 10. Deployment

* [ ] Build production version
* [ ] Deploy application
* [ ] Test production URL
* [ ] Test PWA installation
* [ ] Verify offline support

---

## Feature Completion

Every feature follows:

```text
Plan
 ↓
Create branch
 ↓
Build
 ↓
Test
 ↓
Commit
 ↓
Pull Request
 ↓
Merge into main
```

A feature is complete only after it is tested and merged into `main`.

---

## MVP Complete

The MVP is complete when these work:

```text
Paste
 ↓
Markdown
 ↓
Read
 ↓
Direct Edit
 ↓
Auto Save
 ↓
Search
 ↓
Focus Mode
 ↓
Download
 ↓
Install as PWA
```

## Future

AI organization will be added after the MVP.

```text
Right Click
 ↓
Organize with AI
 ↓
Organized Markdown
```

AI is not part of the initial MVP.

