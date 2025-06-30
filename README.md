Welcome to your new TanStack app!

# Getting Started

To run this application:

```bash
pnpm install
pnpm start
```

# Building For Production

To build this application for production:

```bash
pnpm build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

## Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
pnpm lint
pnpm format
pnpm check
```

## Routing

This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from '@tanstack/react-router'
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/people',
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json() as Promise<{
      results: {
        name: string
      }[]
    }>
  },
  component: () => {
    const data = peopleRoute.useLoaderData()
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    )
  },
})
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ...

const queryClient = new QueryClient()

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
})
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from '@tanstack/react-query'

import './App.css'

function App() {
  const { data } = useQuery({
    queryKey: ['people'],
    queryFn: () =>
      fetch('https://swapi.dev/api/people')
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  })

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
pnpm add @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from '@tanstack/react-store'
import { Store } from '@tanstack/store'
import './App.css'

const countStore = new Store(0)

function App() {
  const count = useStore(countStore)
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  )
}

export default App
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from '@tanstack/react-store'
import { Store, Derived } from '@tanstack/store'
import './App.css'

const countStore = new Store(0)

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
})
doubledStore.mount()

function App() {
  const count = useStore(countStore)
  const doubledCount = useStore(doubledStore)

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  )
}

export default App
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

# Survey Builder Client

A React-based survey builder application with a multi-step form for creating and distributing surveys.

## Features

- **Multi-step Form**: Create surveys in 3 steps:
  1. **Survey Details**: Basic survey information (title, description, type)
  2. **Questions**: Add and reorder survey questions
  3. **Distribution**: Send surveys to recipients via email

- **Survey Management**:
  - Paginated table view of all surveys
  - Sortable columns (title, type, status, dates)
  - Status indicators (Draft/Published, Internal/External)
  - Responsive design with loading states

- **Modern UI**: Built with Tailwind CSS for a clean, responsive design
- **Form Validation**: Client-side validation for all form fields
- **API Integration**: Connects to Flask backend APIs for survey creation and distribution
- **TanStack Query**: Efficient data fetching with caching and pagination

## Setup

1. Install dependencies:

```bash
npm install
# or
pnpm install
```

2. Install additional required dependencies:

```bash
npm install @tanstack/react-form @tanstack/react-query @tanstack/react-query-devtools
# or
pnpm add @tanstack/react-form @tanstack/react-query @tanstack/react-query-devtools
```

3. Start the development server:

```bash
npm run dev
# or
pnpm run dev
```

## API Integration

The application integrates with the following Flask backend APIs:

- `GET /api/v1/surveys/` - Get paginated list of surveys
- `POST /api/v1/surveys/` - Create a new survey
- `POST /api/v1/questions/bulk-questions` - Add multiple questions to a survey
- `POST /api/v1/distribution/bulk-distribution` - Distribute survey to multiple recipients

## Usage

### Survey Management

1. Navigate to the home page to see all surveys in a paginated table
2. Use the "Add New Survey" button in the navbar to create a new survey
3. Sort surveys by clicking on column headers
4. Navigate through pages using the pagination controls

### Creating Surveys

1. Click "Add New Survey" from the navbar
2. Fill in the survey details (title, description, type)
3. Add questions to your survey (you can reorder them)
4. Configure email distribution settings
5. Submit to create and distribute the survey

## File Structure

```
src/
├── components/
│   ├── SurveyBuilder.tsx      # Main multi-step form component
│   ├── SurveyStep.tsx         # Step 1: Survey details
│   ├── QuestionsStep.tsx      # Step 2: Questions management
│   ├── DistributionStep.tsx   # Step 3: Email distribution
│   ├── DataTable.tsx          # Reusable paginated table component
│   └── Navbar.tsx             # Navigation bar component
├── services/
│   └── api.ts                 # API service layer
└── routes/
    ├── index.tsx              # Home page with survey table
    ├── survey-builder.tsx     # Survey builder page
    └── __root.tsx             # Root layout with QueryClient
```

## Components

### DataTable

A reusable table component with:

- Pagination support
- Sortable columns
- Loading states
- Empty state handling
- Responsive design

### Navbar

Navigation bar featuring:

- Levo Survey brand
- Link to survey builder
- Clean, modern design

## Development

The application uses:

- **TanStack Router** for routing
- **TanStack Query** for API state management and caching
- **TanStack Form** for form management (to be integrated)
- **Tailwind CSS** for styling

## Backend Requirements

Make sure your Flask backend is running on `http://localhost:5000` and has the following endpoints:

- `GET /api/v1/surveys/?page=1&per_page=10` - Returns paginated surveys
- `POST /api/v1/surveys/` - Accepts survey data
- `POST /api/v1/questions/bulk-questions` - Accepts survey_id and questions array
- `POST /api/v1/distribution/bulk-distribution` - Accepts distribution data with survey_id

## Next Steps

1. Install the missing TanStack dependencies
2. Regenerate the route tree to include the survey-builder route
3. Integrate TanStack Form for better form state management
4. Add error handling and loading states
5. Implement form persistence across steps
6. Add survey editing functionality
7. Add survey deletion with confirmation
8. Implement search and filtering for surveys
