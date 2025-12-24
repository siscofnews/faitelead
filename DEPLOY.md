# Deploy Netlify + Backend API

## Netlify (Frontend)
- Build: `npm run build`
- Publish: `dist`
- Environment:
  - `VITE_API_URL` → URL pública do backend (ex.: `https://api.seudominio.com`)
- Redirect SPA:
  - Já incluso em `netlify.toml` (`/* -> /index.html`)

## Backend API
- Hospede `backend` (Fastify) em Render/Railway/VPS.
- Porta: `8090` (usa `PORT`).
- Persistência: manter `backend/data.json`.
- CORS: habilitado.

## Supabase
- Abra SQL Editor e execute `supabase/seeds/bibliologia_33.sql`.
- Crie disciplina, módulos e aulas e configure simulados/prova.

## Passos rápidos
1. Crie o projeto no Netlify (time siscofnews).
2. Defina `VITE_API_URL` nas variáveis.
3. Suba o backend e teste `https://API/health`.
4. Publique o front e valide chamadas à API.
5. Importe `bibliologia_33.sql`.
6. Cadastre módulos/aulas, libere simulados e prova final.
7. Matrícula de alunos e acesso imediato.
