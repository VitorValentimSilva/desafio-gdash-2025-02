# Poke API (external/poke)

**Base path:** `/api/external/poke`  
**Swagger UI:** `/api/docs`
**Swagger JSON:** `docs/swagger/swagger.json`

## Overview

This module proxies and augments calls to the public PokeAPI (`https://pokeapi.co/api/v2`), providing:

- paginated listing,
- search by name,
- filter by types (union of types),
- detail by id or name.

Important: the service **does not cache** responses by default (current implementation). Concurrency is limited when calling multiple external endpoints to avoid bursts.

---

## Endpoints

### 1) List (paginated)

`GET /api/external/poke?limit=20&offset=0&order=pokedex`

Query parameters:

- `limit` (number, optional, default `20`) — page size
- `offset` (number, optional, default `0`) — page offset
- `order` (string, optional, one of `pokedex` | `az` | `za`, default `pokedex`)
  - `pokedex` — delegate to PokeAPI pagination (fast)
  - `az` / `za` — sorts alphabetically; service will fetch all pages in batches and sort locally

Response (example):

```json
{
  "count": 1118,
  "limit": 20,
  "offset": 0,
  "results": [
    { "name": "bulbasaur", "url": "...", "id": 1 },
    ...
  ],
  "next": "?limit=20&offset=20&order=pokedex",
  "previous": null
}
```

Notes:

- `az`/`za` can be slower because the service fetches all entries in batches (batch size: 500). Consider caching if used heavily.

---

### 2) Search

`GET /api/external/poke/search?q=pika&limit=20&offset=0&order=pokedex`

Query:

- `q` (string, required) — substring search (case-insensitive)
- `limit`, `offset`, `order` — same as List

Example:

```bash
curl 'http://localhost:3000/api/external/poke/search?q=pika'
```

---

### 3) Filter by types

`GET /api/external/poke/types?types=grass,poison&limit=20&offset=0&order=pokedex`

Query:

- `types` (string, required) — comma-separated list of types (e.g. `grass,poison`)
- `limit`, `offset`, `order` — same as List

Example:

```bash
curl 'http://localhost:3000/api/external/poke/types?types=grass,poison'
```

Notes:

- service makes one external request per requested type but **limits concurrency** (default 3 concurrent requests). If a single type fails the service logs a warning and continues with available results (partial).
- Response is a paged union (unique by `name`).

---

### 4) Detail

`GET /api/external/poke/:id`

Path:

- `:id` — numeric id or pokemon name (string)

Example:

```bash
curl 'http://localhost:3000/api/external/poke/25'   # pikachu
curl 'http://localhost:3000/api/external/poke/pikachu'
```

Response:

- Raw PokeAPI detail payload (the service does not transform this payload).

---

## Errors & HTTP codes

- `400 Bad Request` — invalid/missing params (ex: `types` missing)
- `502 Bad Gateway` — error talking to external PokeAPI (normalized in repository)
- `200 OK` — success

All errors include a message. When `nestjs-i18n` is enabled the controller will return localized messages for validation errors and some custom messages.

---

## Observability & Logs

- The service logs warnings for:
  - failed batch fetches,
  - failed type fetches,
  - failed detail fetch.
- In production consider attaching a structured logger (Pino/Winston) and forwarding logs to ELK/Cloud provider.

---

## Rate limits & concurrency

- The repo applies a default concurrency limit of **3** for calls to `/type/{type}` — increase if you have higher bandwidth.
- Consider adding caching (Redis + `@nestjs/cache-manager`) for high traffic.

---

## i18n (multi-language)

- Locale files are in `src/locales/{en,pt_BR}/common.json`.
- Language resolved from `Accept-Language` header or `?lang=` query parameter.
- Example: `GET /api/external/poke/types?types=grass&lang=pt_BR` returns Portuguese validation messages.

---

## Examples

List:

```bash
curl 'http://localhost:3000/api/external/poke?limit=10&offset=0&order=az'
```

Search:

```bash
curl 'http://localhost:3000/api/external/poke/search?q=char'
```

Filter:

```bash
curl 'http://localhost:3000/api/external/poke/types?types=fire,flying'
```

Detail:

```bash
curl 'http://localhost:3000/api/external/poke/pikachu'
```

---

## Development notes

- To regenerate static swagger JSON: `npm run swagger:generate` (if you added the script).
- To view interactive docs: `http://localhost:3000/api/docs`.
- Consider running `npm run lint` and `npm test` in CI for PR validation.
