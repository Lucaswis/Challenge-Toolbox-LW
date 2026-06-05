# Challenge Toolbox — Lucas Wisgikl

Fullstack application: a REST API fetches files from an external source, parses their CSV content, and exposes it as JSON. A React frontend consumes that API and renders the results in a filterable table.

---

## Running with Docker

```bash
docker-compose up --build
```

| App | URL |
|---|---|
| Backend | http://localhost:3000 |
| Frontend | http://localhost:8080 |

```bash
docker-compose down
```

---

## Project Structure

```
Challenge-Toolbox-LW/
├── docker-compose.yml
├── backend/
└── frontend/
```

---

# Backend

REST API built with Node.js 14 + Express.

## Stack

| | |
|---|---|
| Runtime | Node.js 14 |
| Framework | Express 4 |
| Tests | Mocha + Chai |
| Style | StandardJS |

## Scaffolding

```
backend/
├── src/
│   ├── server.js               # Entry point
│   ├── app.js                  # Express factory — createApp({ filesService })
│   ├── config.js               # Constants
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── cors.middleware.js
│   ├── routes/
│   │   └── files.router.js     # GET /files/list, GET /files/data
│   └── services/
│       ├── externalApi.service.js
│       └── files.service.js
└── test/
    ├── csvParser.test.js
    ├── filesService.test.js
    ├── api.test.js
    └── auth.test.js
```

`app.js` exports a factory that receives `filesService` as a parameter — the service is injected rather than imported directly. This keeps every layer independently testable without network calls.

## Run locally

```bash
cd backend
npm install
npm start       # http://localhost:3000
npm test
npm run lint
```

## API Endpoints

| Method | Path | Auth |
|---|---|---|
| GET | /files/list | Bearer required |
| GET | /files/data | Bearer required |
| GET | /files/data?fileName=file1.csv | Bearer required |

All endpoints require `Authorization: Bearer toolbox-api-key`.

Interactive docs (Swagger UI) available at `http://localhost:3000/api-docs`. OpenAPI spec at `http://localhost:3000/api-docs/openapi.json`. Both routes are public — no API key required.

## External API

| | |
|---|---|
| Base URL | https://echo-serv.tbxnet.com |
| Auth | `Bearer aSuperSecretKey` |

---

# Frontend

React 18 SPA.

## Stack

| | |
|---|---|
| Runtime | Node.js 16 |
| UI | React 18 + React Bootstrap |
| State | Redux Toolkit |
| Bundler | Webpack 5 |
| Tests | Jest + React Testing Library |

## Scaffolding

```
frontend/src/
├── index.js
├── App.js                      # Container — dispatches actions, passes props down
├── store/
│   ├── index.js
│   ├── authSlice.js
│   └── filesSlice.js           # Async thunks for /files/list and /files/data
└── components/
    ├── Login/
    │   ├── Login.js
    │   └── Login.test.js
    ├── FileFilter/
    │   ├── FileFilter.js
    │   └── FileFilter.test.js
    └── FilesTable/
        ├── FilesTable.js
        └── FilesTable.test.js
```

Each component owns its test. `App.js` is the only container — it knows the store. `FileFilter` and `FilesTable` are purely presentational, receiving everything via props.

## Run locally

```bash
cd frontend
npm install
npm start       # http://localhost:8080 (backend must be running)
npm test
```
