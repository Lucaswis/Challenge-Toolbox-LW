# Challenge Toolbox — Lucas Wisgikl

Fullstack application built as a technical challenge. A REST API consumes an external API, reformats CSV data, and exposes it as JSON. A React frontend consumes that API and renders the results in a table.

---

## Project Structure

```
Challenge-Toolbox-LW/
├── docker-compose.yml       # Orchestrates backend + frontend together
├── .gitignore
├── backend/                 # Node.js REST API
└── frontend/                # React SPA
```

---

## Running with Docker (both apps together)

The fastest way to run the full stack with no local setup required:

```bash
docker-compose up --build
```

| App | URL |
|---|---|
| Backend API | http://localhost:3000 |
| Frontend | http://localhost:8080 |

To stop:

```bash
docker-compose down
```

> The backend uses `node:14-alpine` and the frontend uses `node:16-alpine` — each app runs on the Node version it requires, regardless of what is installed on the host machine.

---

---

# Backend

REST API built with Express.js. Fetches files from an external API, parses their CSV content, and exposes the result as JSON.

---

## Backend — Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 14.x | Runtime |
| Express.js | 4.18.2 | HTTP framework |
| Mocha | 10.3.0 | Test runner |
| Chai | 4.3.10 | Assertion library |
| StandardJS | 17.1.0 | Code style linter |

---

## Backend — Scaffolding

```
backend/
├── Dockerfile
├── package.json
├── .mocharc.js              # Mocha configuration
├── src/
│   ├── server.js            # Entry point — binds Express app to port 3000
│   ├── app.js               # Express app factory — createApp({ filesService })
│   ├── config.js            # App-level constants (API key)
│   ├── middleware/
│   │   ├── auth.middleware.js   # Validates Bearer token — returns 401 if invalid
│   │   └── cors.middleware.js   # Sets CORS headers for cross-origin requests
│   ├── routes/
│   │   └── files.router.js     # Registers GET /files/list and GET /files/data
│   └── services/
│       ├── externalApi.service.js  # HTTPS client (Node built-in) for the external API
│       └── files.service.js        # CSV parsing logic + data orchestration
└── test/
    ├── csvParser.test.js    # Unit — pure CSV parsing (no I/O)
    ├── filesService.test.js # Unit — service layer with mock API client
    ├── api.test.js          # Integration — HTTP endpoints with mock service
    └── auth.test.js         # Unit — auth middleware scenarios
```

**Key design decisions:**

- `app.js` is a factory function `createApp({ filesService })` — the service is injected, making the app fully testable without network calls.
- `externalApi.service.js` uses Node's built-in `https` module — no extra HTTP libraries needed.
- `parseCSV` is a pure function — testable in isolation with zero setup.

---

## Backend — Prerequisites (local)

Requires Node.js 14. Install via nvm:

```bash
nvm install 14
nvm use 14
node --version
```

---

## Backend — How to Run

```bash
cd backend
npm install
npm start
```

Server starts at `http://localhost:3000`.

---

## Backend — How to Test

```bash
cd backend
npm install
npm test
```

The test suite has 26 tests across 4 files:

| File | What it covers |
|---|---|
| `test/csvParser.test.js` | Missing fields, invalid numbers, malformed hex, empty content |
| `test/filesService.test.js` | Download errors, empty files, fileName filter, file listing |
| `test/api.test.js` | `GET /files/list`, `GET /files/data`, `?fileName=` filter, 500 on failure |
| `test/auth.test.js` | Missing header, wrong key, missing Bearer prefix, valid key |

To check code style:

```bash
npm run lint
```

No output means all checks passed.

---

## Backend — API Documentation

The full technical API documentation (endpoints, request/response schemas, authentication, error codes) is available via Swagger once the backend is running:

| URL | Description |
|---|---|
| `http://localhost:3000/api-docs` | Swagger UI — interactive documentation |
| `http://localhost:3000/api-docs/openapi.json` | OpenAPI 3.0 spec (JSON) |

> These routes are public — no API key required to access the documentation.

---

## Backend — Security

All `/files/*` endpoints require a valid API key as a `Bearer` token:

```
Authorization: Bearer toolbox-api-key
```

Any request without the header, with a wrong key, or missing the `Bearer` prefix returns `401 Unauthorized`. See the Swagger UI for full authentication details and to test the endpoints interactively.

---

## Backend — External API

| | |
|---|---|
| Base URL | `https://echo-serv.tbxnet.com` |
| Documentation | [Swagger](https://echo-serv.tbxnet.com/explorer/#/Secret) |
| Auth | `Authorization: Bearer aSuperSecretKey` |

Endpoints consumed:
- `GET /v1/secret/files` — list of available filenames
- `GET /v1/secret/file/{filename}` — raw CSV content of a file

---

---

# Frontend

Single-page React application. Fetches file data from the backend API and renders it in a Bootstrap table. Supports filtering by file name.

---

## Frontend — Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 16.x | Runtime (build tooling) |
| React | 18.2.0 | UI library |
| Redux Toolkit | 1.9.7 | State management |
| React Redux | 8.1.3 | React bindings for Redux |
| React Bootstrap | 2.9.1 | UI components |
| Bootstrap | 5.3.2 | CSS framework |
| Webpack | 5.89.0 | Module bundler |
| Babel | 7.23.x | JSX + ES6+ transpilation |
| Jest | 29.7.0 | Test runner |
| React Testing Library | 14.1.2 | Component testing |

---

## Frontend — Scaffolding

```
frontend/
├── Dockerfile
├── package.json
├── webpack.config.js        # Bundler config — entry, output, loaders, dev server
├── babel.config.js          # Babel presets for JSX and modern JS
├── jest.config.js           # Jest config — jsdom environment, CSS mock
├── __mocks__/
│   └── styleMock.js         # Stubs CSS imports so Jest doesn't break
├── public/
│   └── index.html           # HTML template — Webpack injects the bundle here
└── src/
    ├── index.js             # Entry point — mounts React app with Redux Provider
    ├── App.js               # Root component — fetches data, renders layout
    ├── store/
    │   ├── index.js         # Redux store configuration
    │   ├── filesSlice.js    # Slice — state, actions, async thunks for API calls
    │   └── filesSlice.test.js
    └── components/
        ├── FileFilter/
        │   ├── FileFilter.js        # Dropdown to filter by file name
        │   └── FileFilter.test.js
        └── FilesTable/
            ├── FilesTable.js        # Bootstrap table — renders flattened file lines
            └── FilesTable.test.js
```

Each component lives in its own folder alongside its test. This is component-based organization — when you need to touch `FilesTable`, everything related to it is in one place.

**How data flows:**

```
App mounts
  → dispatch(fetchFilesList())  → GET /files/list  → populates filter dropdown
  → dispatch(fetchFilesData())  → GET /files/data  → populates table

User selects a file from the dropdown
  → dispatch(fetchFilesData("file1.csv"))  → GET /files/data?fileName=file1.csv
```

**How the table renders:**

The API returns `[{ file, lines: [{text, number, hex}] }]`. The `FilesTable` component flattens this into one row per line:

```
file1.csv | RgTya | 64075909 | 70ad29aacf0b690b0467fe2b2767f765
file1.csv | AtjW  | 6        | d33a8ca5d36d3106219f66f939774cf5
file2.csv | KrT   | 100      | ...
```

Files with `lines: []` produce no rows. Files with `error` produce no rows either.

---

## Frontend — Prerequisites (local)

Requires Node.js 16. Install via nvm:

```bash
nvm install 16
nvm use 16
node --version  # v16.x.x
```

---

## Frontend — How to Run

The backend must be running first (on port 3000).

```bash
cd frontend
npm install
npm start
```

App opens at `http://localhost:8080`.

---

## Frontend — How to Test

```bash
cd frontend
npm install
npm test
```

The test suite has 15 tests across 3 files:

| File | What it covers |
|---|---|
| `src/__tests__/FilesTable.test.js` | Spinner, error alert, empty state, table rows, headers, multi-file flattening |
| `src/__tests__/FileFilter.test.js` | "All files" option, file options from list, onChange calls |
| `src/__tests__/filesSlice.test.js` | Initial state, setSelectedFile, pending/fulfilled/rejected transitions |

All tests use mock data — no real API calls are made.

---

---

# Architecture

---

## Backend — Layered Architecture

The backend follows a **Layered Architecture** (simplified Clean Architecture). Each layer has a single responsibility and only depends on the layer below it — never the other way around.

```
┌─────────────────────────────┐
│        HTTP Layer           │  files.router.js
│  (routes, req/res, status)  │  Knows Express. Knows nothing about CSV or network.
├─────────────────────────────┤
│      Business Logic         │  files.service.js
│  (parsing, orchestration)   │  Knows CSV and data rules. Knows nothing about Express or HTTPS.
├─────────────────────────────┤
│     Infrastructure          │  externalApi.service.js
│   (external HTTP calls)     │  Knows HTTPS. Knows nothing about routes or business rules.
└─────────────────────────────┘
```

**Dependency Injection** is the direct consequence of this separation. `files.service.js` receives the API client as a parameter instead of importing it directly. This makes every layer independently testable — the tests inject mock dependencies and no real network calls are made.

```javascript
// Production: real HTTP client injected automatically
createApp()

// Tests: mock client injected, no network
createApp({ filesService: mockService })
```

---

## Frontend — Presentational / Container + Redux Ducks

The frontend combines two patterns:

**Presentational / Container** — separates "what to render" from "where data comes from":

```
App.js  (Container)
│  Knows the Redux store. Dispatches actions. Passes data down as props.
│
├── FileFilter  (Presentational)
│   Receives fileList, selectedFile, onChange as props.
│   Has no idea Redux exists.
│
└── FilesTable  (Presentational)
    Receives data, loading, error as props.
    Has no idea Redux exists.
```

Presentational components are pure functions of their props — easy to test, easy to reuse.

**Redux Ducks** — all state logic for a domain lives in one file:

```
filesSlice.js
│
├── initialState       — what the store looks like at boot
├── setSelectedFile    — synchronous action
├── fetchFilesList     — async thunk → GET /files/list
└── fetchFilesData     — async thunk → GET /files/data[?fileName=]
```

**Component-based folder structure** — each component owns its code and its test:

```
components/
├── FileFilter/
│   ├── FileFilter.js       ← component
│   └── FileFilter.test.js  ← test lives next to what it tests
└── FilesTable/
    ├── FilesTable.js
    └── FilesTable.test.js
```

Organized by component, not by type. When a component needs to change, everything related to it is in one folder.
