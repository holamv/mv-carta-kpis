# 🚀 Instrucciones de Deploy a Vercel

## Estado Actual ✅
- **Tests Playwright:** 10/10 PASS (42.3s)
- **Errores detectados:** 0
- **Build status:** Ready for production
- **Endpoint:** `/api/carta/dashboard/leo` - Funcional ✅

## Opción 1: Deploy por GitHub (Recomendado)

1. **Conecta el repositorio a Vercel:**
   - Ve a https://vercel.com/new
   - Selecciona "Import Git Repository"
   - Selecciona tu repo: `holamv/mv-carta-kpis`
   - Click "Import"

2. **Configura el proyecto:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `packages/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

3. **Variables de Entorno:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hzpycmczwkwbfrqzvfyz.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM
   ```

4. **Click "Deploy"**

## Opción 2: Deploy por CLI con Token

1. **Copia tu token de Vercel:**
   - https://vercel.com/account/tokens
   - Crea un nuevo token

2. **Haz deploy:**
   ```bash
   export VERCEL_TOKEN="tu_token_aqui"
   cd packages/frontend
   vercel deploy --prod --token $VERCEL_TOKEN
   ```

## Opción 3: Usa GitHub Actions

Crea `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Verificación Post-Deploy

Una vez deployado, verifica:

```bash
# Endpoint disponible
curl https://tu-dominio-vercel.vercel.app/api/carta/dashboard/leo?semana=W25-2026&pais=PE&ciudad=Lima

# Dashboard accesible
https://tu-dominio-vercel.vercel.app/carta
```

## 📊 Checklist Pre-Deploy

- ✅ Build Next.js completado
- ✅ 10/10 Playwright tests PASS
- ✅ Endpoint `/api/carta/dashboard/leo` funcional
- ✅ Disponibilidad varía correctamente (7 cocinas)
- ✅ Aislamiento por país funciona (PE ≠ MX)
- ✅ Variables de entorno configuradas
- ✅ vercel.json creado

## Errores Comunes

**Error: "No existing credentials"**
- Usa Opción 1 (GitHub) o Opción 2 (Token)

**Error: "Cannot find module"**
- Asegúrate de que `npm install` está completado
- Verifica que `packages/frontend/` es el root directory

**Error: "API endpoints not working"**
- Verifica variables de entorno Supabase
- Confirma que el backend es accesible desde Vercel

## Soporte

Si necesitas ayuda, contacta al equipo de Vercel:
https://vercel.com/support
