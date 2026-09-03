# frontend-template

A fresh, opinionated Vue 3 base template for building frontends.

**It ships a complete design system** — 69 components, one token palette, light
and dark. Start at [docs/design-system/README.md](docs/design-system/README.md),
or run `npm run dev` and open `/design-system` to see every component rendered.

## Stack

- **[Vue 3](https://vuejs.org/)** + **[Vite](https://vite.dev/)** (JavaScript)
- **File-based routing** — [unplugin-vue-router](https://uvr.esm.is/) (routes generated from `src/pages/`)
- **Layouts** — [vite-plugin-vue-layouts-next](https://github.com/loicduong/vite-plugin-vue-layouts-next) (`src/layouts/`)
- **[Pinia](https://pinia.vuejs.org/)** state management
- **[Tailwind CSS v4](https://tailwindcss.com/)** with `data-theme` dark mode
- **[VueUse](https://vueuse.org/)** composables
- **[Vitest](https://vitest.dev/)** unit testing
- **ESLint + Prettier + oxlint**

## Project structure

```
src/
├── App.vue              # root — renders the active layout
├── main.js              # app bootstrap (pinia + router)
├── assets/main.css      # Tailwind entry + dark variant
├── layouts/
│   └── default.vue      # page shell (nav + dark toggle)
├── pages/               # file-based routes
│   ├── index.vue        #   → /
│   ├── about.vue        #   → /about
│   └── [...path].vue    #   → 404 catch-all
├── router/index.js      # auto routes + layouts
├── stores/              # Pinia stores (+ __tests__)
├── components/          # your reusable components
└── lib/api.js           # fetch API client
```

## Conventions

### Signing in

The app sits behind a login. `src/router/index.js` guards **every** route by
default; a page opts out in its own route block:

```vue
<route lang="json">
{ "meta": { "public": true } }
</route>
```

Closed by default on purpose — a guard written the other way round leaks every
page somebody forgets to add to the list, and forgetting is silent.

`src/stores/auth.js` holds the session. Sign-in is **mocked in exactly one
function**, `requestSignIn` — any credentials work and the session persists in
`localStorage`. Point that one function at your backend and nothing else
changes:

```js
const { user, token } = await api.post('/auth/login', { email, password })
return { name: user.name, email: user.email, role: user.role, token }
```

### Navigation

`src/lib/navigation.js` is the single source: the sidebar renders it, the
breadcrumb is derived from it, and the router pushes its `to`. Add a page there
once rather than in three files that can disagree.

### Routing

Drop a `.vue` file into `src/pages/` and it becomes a route automatically:

| File                   | Route         |
| ---------------------- | ------------- |
| `pages/index.vue`      | `/`           |
| `pages/about.vue`      | `/about`      |
| `pages/users/[id].vue` | `/users/:id`  |
| `pages/[...path].vue`  | 404 catch-all |

### Layouts

Every page uses `src/layouts/default.vue` by default. To use a different layout,
create it (e.g. `src/layouts/blank.vue`) and set it in the page via a route block:

```vue
<route lang="json">
{ "meta": { "layout": "blank" } }
</route>
```

### API calls

Set `VITE_API_BASE_URL` in `.env` (copy from `.env.example`), then:

```js
import { api } from '@/lib/api'

const users = await api.get('/users')
await api.post('/users', { name: 'Ada' })
```

### Dark mode

`useDark()` (VueUse) toggles the `.dark` class on `<html>`. Style with `dark:` variants.

## Commands

```sh
npm install          # install dependencies
npm run dev          # start dev server
npm run build        # production build
npm run preview      # preview the production build
npm run test:unit    # run unit tests
npm run test:e2e     # browser layout tests (Chromium, real rendering)
npm run lint         # oxlint + eslint (autofix)
npm run format       # prettier
```

`test:e2e` needs a one-time `npx playwright install chromium` before its first
run. Each run does a full production build, so it's checked once per section
rather than after every edit.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur).
