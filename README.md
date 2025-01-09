# Noteworthy App

A simple note-taking application.

## Tech Stack

- **Frontend Framework**: React 18 with Vite
- **Type Safety**: TypeScript
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library
- **Styling**: TailwindCSS + Shadcn (using some RadixUI primitives) + Lucide-react icons
- **Opinionated Toasts**: Sonner
- **Rich Text Editor**: Tiptap + minimal-tiptap

## Features

- Create, edit, and delete notes
- Organize notes with folders
- Search functionality
- Rich text support for note content
- Local storage persistence

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/noteworthy.git

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

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage

The test suite covers:

- Component rendering and interactions
- State management logic
- Note CRUD operations
- Search functionality
- Data persistence

## Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```
