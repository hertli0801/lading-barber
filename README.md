# Barber Solutions — Landing (lading-barber)

Landing estática desplegada en [Vercel](https://vercel.com/) con captura de leads en [Supabase](https://supabase.com/).

## Ramas y PRs

- Usa el prefijo **`feature/nombre-descriptivo`** para trabajo nuevo (ej. `feature/supabase-leads`).
- Abre pull requests hacia `main` y revisa el código de tus compañeros antes de aprobar o fusionar.

## Configuración de Supabase

1. Crea un proyecto en Supabase.
2. En **SQL Editor**, ejecuta el script [`supabase/schema.sql`](./supabase/schema.sql) para crear la tabla `public.leads`.
3. En el panel de Supabase, copia **Project URL** y la clave **service_role** (solo servidor; no la expongas en el navegador).

## Variables de entorno

| Variable | Dónde | Descripción |
|----------|--------|-------------|
| `SUPABASE_URL` | Vercel + `.env.local` local | URL del proyecto (`https://xxx.supabase.co`). |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + `.env.local` local | Clave **service_role** para insertar desde `/api/leads`. |
| `ALLOWED_ORIGIN` | Vercel (opcional) | Origen permitido en CORS si no usas `localhost` ni `*.vercel.app`. |

Copia [`.env.example`](./.env.example) a `.env.local` para desarrollo con `vercel dev`.

## Desarrollo local

```bash
npm install
npx vercel dev
```

Abre la URL que indique la CLI y prueba el formulario en `#registro-beta`.

## Despliegue

1. Conecta el repositorio a Vercel.
2. Añade las variables de entorno en el proyecto (Production / Preview según necesites).
3. Vercel detectará `api/leads.js` como función serverless e instalará dependencias desde `package.json`.

## API

- **`POST /api/leads`** — Cuerpo JSON: `full_name`, `email`, opcionales `phone`, `business_name`, `notes`. Respuesta `201` con `{ ok: true, id }` o error con mensaje en español.
