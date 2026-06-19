# 🚀 Despliegue a Vercel - Dashboard KPI Carta

## Estado Actual
✅ Código commiteado y pusheado a GitHub: `https://github.com/holamv/mv-carta-kpis`
✅ vercel.json configurado con variables de entorno
✅ Build compilado sin errores localmente

## Método: GitHub Connect (Recomendado)

### Paso 1: Ir a Vercel Dashboard
1. Abre `https://vercel.com/dashboard`
2. Inicia sesión con tu cuenta (o crea una nueva)

### Paso 2: Agregar Nuevo Proyecto
1. Click en **"Add New..."** → **"Project"**
2. Click en **"Import Git Repository"**
3. Selecciona **GitHub** como proveedor

### Paso 3: Conectar Repositorio GitHub
1. Autoriza Vercel para acceder a tu GitHub
2. Busca el repositorio: `holamv/mv-carta-kpis`
3. Click en **"Import"**

### Paso 4: Configurar Proyecto
- **Project Name:** `mv-carta-kpis`
- **Framework Preset:** Next.js (automático)
- **Root Directory:** `packages/frontend/` (IMPORTANTE)

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://hzpycmczwkwbfrqzvfyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cHljbWN6d2t3YmZycXp2Znl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjc0MjgsImV4cCI6MjA5MTQwMzQyOH0.QSYb5PPqmlmRLL6URrjStNZhPgsW5s0IxnTWD-EEinM
```

### Paso 5: Desplegar
1. Click en **"Deploy"**
2. Espera 2-3 minutos
3. ✅ URL: `https://mv-carta-kpis.vercel.app`

### Paso 6: Auto-Deploy
Automático: Cada push a `main` → nuevo deploy

---

## Checklist Post-Deploy

- [ ] Dashboard carga en: `https://mv-carta-kpis.vercel.app/carta`
- [ ] Filtros (país, ciudad, semana) funcionan
- [ ] API responde: `/api/carta/dashboard/leo`
- [ ] Datos completos: 16 semanas con compliance/foodcost
- [ ] Semanas W10-W25 todas disponibles
- [ ] Compliance varía por ciudad
- [ ] Actualizar PROJECT_SCOPE.md con URL de prod

---

## Status Deployment
Generado: 2026-06-19
Repositorio: https://github.com/holamv/mv-carta-kpis
Rama: main
