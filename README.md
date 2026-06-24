# Garnish

React/TypeScript frontend for the recipe book application. A single-page app for browsing, creating, and managing recipes, ingredients, equipment, stories, and family groups.

## Stack

- **React 18** + **TypeScript** with [Vite](https://vitejs.dev/)
- **reactstrap** + **csh-material-bootstrap** for UI components
- **react-router-dom** for client-side routing
- JWT auth stored in `localStorage`

## Running

```sh
cd garnish
npm run dev      # Vite dev server on localhost:5173
```

The dev server proxies nothing — requests go directly to the API at `VITE_API_PREFIX`.

## Build

```sh
npm run build
```

## Environment Variables

Create a `.env` file in `garnish/`:

```env
VITE_API_PREFIX=http://localhost:8080
VITE_SSO_ENABLED=false
```

## Architecture

- `src/context/AuthContext.tsx` — `AuthProvider` wraps the app; `useAuth()` exposes `token`, `user` (`{uid, username}`), `login()`, `logout()`, `isAuthenticated`. JWT claims are parsed client-side from `localStorage`.
- `src/api/` — one file per domain (auth, recipes, ingredients, equipment, stories, families); all functions accept `token: string | null`.
- `src/App.tsx` — `BrowserRouter` + `AuthProvider`; `ProtectedRoute` redirects unauthenticated users to `/login`.
- `src/styles/theme.scss` — CSS custom properties (`--color-teal`, `--color-sand`, etc.)

## Pages

| Route | Page |
|---|---|
| `/` | RecipeFeed — search by name and ingredient |
| `/recipes/:rid` | RecipeDetail — story banner, ingredient chips, comments |
| `/recipes/create` | RecipeForm |
| `/recipes/:rid/edit` | RecipeForm (edit mode) |
| `/login` | Login |
| `/register` | Register |
| `/profile` | UserProfile |
| `/family` | FamilyManager |
