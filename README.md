# Levo Survey Client

[Link](https://lclient.nirajkhatiwada.dev/)

### 📁 Architecture Overview

Key Architectural Components

1. Routing System
   - **Framework**: TanStack Router (formerly React Router)
   - **Type Safety**: Full TypeScript integration
   - **File-based**: Routes defined by file structure
   - **Features**: Type-safe navigation, search params, nested routes
2. State Management
   - **Server State**: TanStack Query (React Query)
   - **Client State**: React useState/useReducer
   - **Caching**: Automatic caching and background updates
3. Component Architecture
   - **Atomic Design**: Components organized by complexity
   - **Composition**: Favor composition over inheritance
   - **Props Interface**: Strongly typed props with TypeScript
4. API Layer
   - **Service Pattern**: Centralized API calls in services/api.ts
   - **Type Safety**: Full TypeScript interfaces for API responses
   - **Error Handling**: Consistent error handling across the app
   - **Query Keys**: Organized query key management

5. UI Framework
   - **Styling**: Tailwind CSS for utility-first styling
   - **Components**: Custom component library
   - **Charts**: Recharts for data visualization

#### Stack

- **Framework**: React 19 with TypeScript
- **Router**: TanStack Router
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Build Tool**: Vite
- **Package Manager**: pnpm

### Steps to run:

- Clone the repo:

```
https://github.com/niraj-khatiwada/levo-survey-client/
```

- Install the packages:

```
pnpm install
```

Install [pnpm](https://pnpm.io/) if you haven't installed it.

- Copy the environment files:

```
cp ./.env.example ./.env
```

- Run development server:

```
pnpm dev
```

- To run prod build:

```
pnpm build

pnpm serve
```

Your development server is now ready to test in http://localhost:3000
