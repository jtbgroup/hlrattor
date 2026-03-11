# hlrattor

This project is a minimal starter for a web app with a **Spring Boot backend + Angular frontend** running in a **single Docker container (prod)** and a **live development workflow** with hot reload.

> ✅ The production image packages the frontend as static assets and runs both backend + nginx in one container.

---

## Setup (one-time)

1. Clone the repo (don’t fork if you want a clean history).
2. Disconnect from the original remote and push to your own git repo.
3. Replace `hlrattor` in package names, app names, database names, etc.
4. Adjust ports if you need to (see `docker-compose.yml` / `docker-compose.dev.yml`).

---

## Development (hot reload)

The dev setup runs 3 containers:

- **frontend** → Angular dev server (`ng serve`)
- **backend** → Spring Boot (`mvn spring-boot:run`)
- **nginx** → routes `/` to frontend and `/api/` to backend

Start dev mode:
```sh
make dev-start
```
Then open:

- http://localhost:8080 (app)
- http://localhost:4200 (direct Angular dev server)

Stop dev mode:
```sh
make dev-down
```

View logs:
```sh
make dev-logs
```

---

## Production (single container)

Build + run prod:
```sh
make prod
```

The production image builds both frontend + backend, then runs them together behind nginx.

Stop production:
```sh
make prod-down
```

View production logs:
```sh
make prod-logs
```

---

## Version management

Update the project version everywhere:
```sh
make set-version V=x.y.z
```
