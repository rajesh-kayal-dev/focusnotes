# FocusNotes Development

## Development Order

Build the project in this order.

### 1. Project Setup

- [x] Create monorepo
- [x] Setup React + TypeScript + Vite
- [x] Setup Tailwind CSS
- [x] Setup PWA
- [x] Setup ESLint + Prettier
- [x] Setup project structure
- [x] Setup GitHub repository

Branch:

```text
feature/project-setup
````

---

### 2. App UI

Build the basic application layout.

* [x] App layout
* [x] Sidebar
* [x] Top bar
* [x] Notes list
* [x] Note content area
* [x] New Note
* [x] Note menu

Branch:

```text
feature/app-ui
```

---

### 3. Notes

Implement local notes.

* [x] Create note
* [x] Read note
* [x] Edit note
* [x] Rename note
* [x] Delete note
* [x] Auto save
* [x] IndexedDB storage

Branch:

```text
feature/notes
```

---

### 4. Markdown

Implement Markdown support.

* [x] Markdown rendering
* [x] Direct editing
* [x] Headings
* [x] Lists
* [x] Checkboxes
* [x] Links
* [ ] Code blocks

Branch:

```text
feature/markdown
```

---

### 5. Search

Implement note search.

* [x] Search button
* [x] Search interface
* [x] Search notes
* [x] Open search result

Branch:

```text
feature/search
```

---

### 6. Focus Mode

Implement distraction-free reading.

* [x] Open Focus Mode
* [x] Hide sidebar
* [x] Hide controls
* [x] Full-screen content
* [x] Keyboard shortcut to exit

Branch:

```text
feature/focus-mode
```

---

### 7. Download

Allow users to keep their notes.

* [x] Download Markdown
* [x] Generate `.md` file
* [x] Use note title as filename

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

