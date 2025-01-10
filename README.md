# Noteworthy App

A simple note-taking application using React 18 + Vite + Tailwind/Shadcn.
Deployed onto Netlify.

[View deployed app here](https://noteworthy-local.netlify.app/)

## Contact

You can find me at:

- [Website](https://www.shah1d.com)
- [LinkedIn](https://www.linkedin.com/in/shahidrogers/)
- [E-mail](mailto:shahidrogers@gmail.com)

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Future enhancements](#future-enhancements)
- [State Synchronization](#state-synchronization)
- [Conflict Resolution](#conflict-resolution)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Build](#build)

## Tech Stack

- **Frontend Framework**: React 18 with Vite
- **Type Safety**: TypeScript
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library
- **Styling**: TailwindCSS + Shadcn (using some RadixUI primitives) + Lucide-react icons
- **Aninmation**: framer-motion
- **Opinionated Toasts**: Sonner
- **Rich Text Editor**: Tiptap + minimal-tiptap

## Features

- Create, edit, and delete notes
- Organize notes with folders
- Search functionality
- Rich text support for note content
- Local storage persistence (basic security with AES-GCM encryption)
- [State synchronization](#state-synchronization) (Cross-tab/window only)

## Future enhancements

- [ ] Drag + drop capability to re-order notes/folders and to move notes from one folder to another
- [ ] Conflict resolution

## State Synchronization

This app uses the [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) to synchronize state across multiple tabs/windows. This means any changes made to notes or folders in one tab are instantly reflected in all other open instances of the app.

### Why BroadcastChannel?

- **Simplicity**: No backend required, perfect for a client-side only app
- **Real-time**: Updates are instantaneous across tabs
- **Low overhead**: Native browser API with minimal setup
- **Perfect for local-first**: Aligns with our local storage persistence strategy

While solutions like tRPC or WebSocket would be more appropriate for client-server architectures, BroadcastChannel is the ideal choice for this local-first application where all data lives in the browser.

## Conflict Resolution

I have implemented a super simple "conflict detection mechanism" when editing notes.

When you open a note, the app stores the "initial load time" of the note.

When you are saving a note, it compares:

- The initial load time of the note
- The last update time of the current note version

If a newer version is detected (modified in another tab), a modal/dialog appears with 2 options:

- Override: Save your current changes, overwriting the newer version
- Load New: Discard your changes and load the latest version

This approach should be simple enough for users to be aware of concurrent modifications and avoid unexpected changes in their notes.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/shahidrogers/noteworthy.git

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Testing

```bash
# Run all tests
npm test
```

### Test Coverage

The test suite covers:

- Component rendering and interactions
- State management logic
- Note/Folder CRUD operations
- Search functionality
- Data persistence

## Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```
