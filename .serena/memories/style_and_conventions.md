# Style and Conventions

## Tech Stack Conventions
- **Language**: TypeScript (strict mode implied by React/Remotion)
- **Framework**: React 19 with functional components and hooks
- **Styling**: Tailwind CSS v3 with custom configuration
- **Build Tool**: Vite
- **Video**: Remotion v4

## Code Style
- **File Extensions**: .ts for logic, .tsx for React components
- **Imports**: ES modules with destructuring
- **Component Structure**: Functional components with explicit return types
- **State Management**: React Context (EditorContext) + useReducer pattern
- **Hooks**: Custom hooks in dedicated hooks/ directories

## Naming Conventions
- **Components**: PascalCase (e.g., `Player.tsx`, `TimelineEditor.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAutoSave.ts`)
- **Utilities**: camelCase (e.g., `coordinates.ts`)
- **Types/Interfaces**: PascalCase with descriptive names
- **Constants**: UPPER_SNAKE_CASE in constants.ts

## TypeScript Patterns
- Strict type definitions in `src/data/types.ts`
- Interface-based type definitions for complex objects
- Union types for finite state values
- Optional properties with `?` notation

## React Patterns
- Context API for global state (EditorContext)
- useReducer for complex state logic
- Custom hooks for reusable logic
- Forward refs where necessary

## Styling
- Tailwind utility classes
- CSS modules not used (inline Tailwind)
- Custom CSS in style.css for global styles
- PostCSS and autoprefixer configured

## Project Organization
- Feature-based folder structure
- Components grouped by domain (aoe/, player/, ui/)
- Co-location of related files
- barrel exports (index.ts) for clean imports

## No Linting/Formatting Tools
**Important**: This project does not have ESLint, Prettier, or other linting/formatting tools configured. No automated code quality checks are performed.
