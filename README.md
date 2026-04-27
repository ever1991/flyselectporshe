# Fly Select

Landing page + cuestionario premium para Fly Select Club.

## Stack
- HTML estático (Vercel)
- Supabase (almacenamiento de submissions)
- Resend (notificación por correo)

## Setup local
1. Copiar `.env.example` a `.env` y completar
2. `npm install`
3. `vercel dev`

## Variables de entorno
| Var | Descripción |
|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (NUNCA exponer al cliente) |
| `RESEND_API_KEY` | API key de Resend |
| `RESEND_FROM` | Remitente verificado |
| `NOTIFY_TO` | Email destino de las solicitudes |

## Deploy
Push a `main` → Vercel deploya automáticamente.
