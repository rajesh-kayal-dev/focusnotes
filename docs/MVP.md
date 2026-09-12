# FocusNotes MVP

## 1. Main Goal

FocusNotes is a simple browser extension for turning copied or pasted content into clean, readable Markdown.

The main goal is:

**Capture quickly → Read clearly → Edit directly → Stay focused**

It is not meant to replace Notion or become a full note-taking platform.

## 2. How Users Add Notes

Users can add content in two ways:

* Copy text and use the browser right-click menu
* Paste content directly into FocusNotes

Right-click options:

* Save to FocusNotes
* Open in Focus Mode
* Download as Markdown

## 3. Markdown

Pasted content is automatically displayed as clean Markdown.

Users can directly edit the content while reading.

There is no separate Edit Mode.

Users can:

* Type
* Delete
* Edit text
* Create headings
* Edit lists
* Tick checkboxes

## 4. Main Page

The main page should be minimal.

It contains:

* Small sidebar with saved notes
* Search button at the top
* Note content area

The sidebar can be hidden.

No folders, tags, categories, dashboards, or unnecessary management features.

## 5. Focus Mode

Focus Mode removes everything except the note content.

The purpose is distraction-free reading and editing.

When Focus Mode is active:

* No sidebar
* No search
* No extra controls
* Only the content is visible

Focus Mode can be exited with a simple keyboard shortcut.

## 6. Storage

For MVP, everything is stored locally in the browser.

Technology:

* IndexedDB / local storage
* No backend
* No database server
* No login
* No account

Users can download their notes as `.md` files.

## 7. AI

AI is not required for the MVP.

Initially, FocusNotes simply saves and formats the content.

Later, users can select:

**Organize with AI**

AI will then organize the existing note into a better structure.

## 8. Technology

* React
* TypeScript
* Vite
* Tailwind CSS
* Chrome Extension Manifest V3
* IndexedDB
* Markdown editor/parser

## 9. MVP Features

The first version only needs:

1. Save copied content
2. Paste content
3. Markdown rendering
4. Direct editing
5. Save notes locally
6. Search notes
7. Focus Mode
8. Right-click integration
9. Download as Markdown
10.Progressive Web App

## 10. Product Principle

**FocusNotes should stay simple.**

The product should help users **read and understand their information without creating another complicated system to manage.**
