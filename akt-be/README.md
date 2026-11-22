# MURANET Backend (`akt-be`)

Backend service untuk MURANET Internal Systems yang dibangun menggunakan Express.js, TypeScript, Drizzle ORM, dan PostgreSQL running di Docker.

---

## Fitur & Tech Stack

- **Runtime & Framework**: Node.js, Express.js, TypeScript (strict mode, ES2022).
- **Database & ORM**: PostgreSQL 16 (Docker Compose), Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
- **Keamanan**: Helmet, CORS, bcrypt untuk hash password.
- **Validasi**: Zod schema validation untuk request body, params, query, dan environment variables.
- **Logging**: Morgan HTTP logger dan internal logger ber-timestamp.
- **Arsitektur**: Layered Architecture terpisah di `src/`:
  - `core/`: Konfigurasi env, koneksi DB, error classes.
  - `controllers/`: HTTP request/response handling.
  - `services/`: Business logic.
  - `repositories/`: Database queries (Drizzle).
  - `models/`: Schema/model database Drizzle.
  - `validations/`: Zod validation schemas.
  - `middlewares/`: Global error handler, request validator.
  - `routes/`: Routing endpoint Express.
  - `utils/`: Standard response & logging helpers.
  - `types/`: Common TypeScript interfaces & types.
  - `app.ts` & `server.ts`: Express setup dan server entry point dengan graceful shutdown.

---

## Cara Menjalankan

### 1. Inisialisasi Database (Docker)

Pastikan Docker Desktop aktif, lalu jalankan:

```bash
docker compose up -d
```

### 2. Push Schema Database

Sinkronisasi skema Drizzle ke PostgreSQL:

```bash
npm run db:push
```

Untuk membuka GUI database (Drizzle Studio):

```bash
npm run db:studio
```

### 3. Menjalankan Server Development

```bash
npm run dev
```

Server akan aktif di `http://localhost:5000`.

### 4. Build untuk Production

```bash
npm run build
npm start
```

---

## API Endpoints

### Health Check
- `GET /api/v1/health` - Cek uptime server dan konektivitas database.

### Users Management
- `GET /api/v1/users` - Mengambil daftar seluruh user.
- `GET /api/v1/users/:id` - Mengambil detail user berdasarkan UUID.
- `POST /api/v1/users` - Membuat user baru (`name`, `email`, `password`, `role`: `admin` | `teknisi` | `cs`).
- `PUT /api/v1/users/:id` - Memperbarui data user (`name`, `role`, `isActive`, `password`).
- `DELETE /api/v1/users/:id` - Menghapus user.
