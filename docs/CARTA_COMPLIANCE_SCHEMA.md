# Carta Compliance - Menú Diario Data Lake

**Proyecto**: `hzpycmczwkwbfrqzvfyz`  
**Fuente**: Node script `scripts/build-carta-compliance.mjs` (semanal)

## 3 Tablas Principales

### 1. `carta_compliance` — % Cumplimiento por ciudad

```sql
SELECT city, compliance_pct, rules 
FROM carta_compliance 
WHERE semana_id='252026' 
ORDER BY compliance_pct DESC;
```

**Campos**:
- `city` — ciudad (Lima, Bogotá, CDMX, etc.)
- `compliance_pct` — % cumplimiento total
- `rules` — desglose de reglas (JSONB)
- `semana_id` — formato 'WWYYYY' (W252026 = semana 25, 2026)

### 2. `carta_compliance_meals` — Checks por plato (JSONB)

```sql
SELECT meal_name, is_star, checks 
FROM carta_compliance_meals
WHERE branch_office_id=2 
  AND (checks->>'foodcost_lt40')='false';  -- platos que fallan foodcost
```

**Campos**:
- `meal_name` — nombre del plato
- `is_star` — plato bandera (bool)
- `checks` — JSONB con resultado de cada regla
  - `'foodcost_lt40'` — foodcost < 40% ✅/❌
  - `'peso_minimo'` — peso total ≥ 350g
  - `'proteina_pct'` — proteína ≥ 20%
  - `'arroz_maximo'` — arroz ≤ 140g
  - Y más...
- `branch_office_id` — ciudad/tienda

### 3. `star_plates_weekly` — Top-5 + Consistencia

```sql
SELECT meal_name, weeks_consecutive, weeks_total, city
FROM star_plates_weekly
WHERE semana_id = '252026'
ORDER BY weeks_consecutive DESC;
```

**Campos**:
- `meal_name` — plato estrella
- `weeks_consecutive` — semanas consecutivas en top-5
- `weeks_total` — total de semanas en top-5 (últimas 6 semanas)
- `city` — ciudad

---

## Reglas Activas (En el Score)

### Formato y Presentación
- [ ] Foto (foto requerida)
- [ ] Presentación (según estándar)
- [ ] Empaque definido
- [ ] Empaque-subgrupo (categoría correcta)

### Costo y Nutrición
- [ ] **Foodcost < 40%** — SUM(costo_teorico_local) / SUM(precio_local) * 100 < 40
- [ ] **Peso total ≥ 350g** (platos 600kcal)
- [ ] **Proteína ≥ 20%** — protein_gr / weight_gr * 100 ≥ 20
- [ ] **Arroz ≤ 140g** (máximo para platos)
- [ ] **Sin huevo en complementos**

### Variedad
- [ ] **Variedad Carne** — ≥ 2 platos carne/semana
- [ ] **Variedad Cerdo** — ≥ 2 platos cerdo/semana
- [ ] **Variedad Pescado** — ≥ 2 platos pescado/semana
- [ ] **Pollo en ensalada ≤ cap** — máximo pollo en ensaladas
- [ ] **Estrella en carta** — ≥ 4 platos estrella por país

---

## Reglas Diferidas (No en Score Aún)

### Nutrición Adicional
- [ ] **Verduras ≥ 80g** — verduras_gr ≥ 80 (PENDIENTE: clasificación fuzzy)
- [ ] **Snacks 120g mínimo** — peso ≥ 120g
- [ ] **Ensaladas 300g mínimo** — peso ≥ 300g

### % de Pedido (PENDIENTE DEFINICIÓN)
- [ ] **Snacks ≤ 30% de ventas** — SUM(unidades snack) / SUM(unidades total) ≤ 30%
- [ ] **Ensaladas ≤ 20% de ventas** — SUM(unidades ensalada) / SUM(unidades total) ≤ 20%

### Imagen
- [ ] **Imagen = imagen catering** — validar que foto sea del catering, no stock (PENDIENTE: `image_ad` casi vacío en BD)

---

## Pendientes para Leo / Dev

### 1. "% promedio de pedido" — DEFINIR MÉTRICA
**Pregunta**: Para snacks y ensaladas, ¿qué es el "% promedio de pedido"?
- ¿Es % de pedidos (cuántos pedidos incluyen snack) o % de volumen (cuántas unidades)?
- ¿Es por tienda, por ciudad, o por país?
- ¿Semana actual vs histórico (última N semanas)?

**Ejemplo**:
```sql
-- Opción 1: % de unidades (volumen)
SUM(CASE WHEN category='snack' THEN unidades ELSE 0 END) / 
  SUM(unidades) * 100 <= 30%

-- Opción 2: % de órdenes (pedidos)
COUNT(DISTINCT CASE WHEN has_snack=true THEN order_id END) /
  COUNT(DISTINCT order_id) * 100 <= 30%
```

### 2. Verduras ≥ 80g — CLASIFICACIÓN DE SUBGRUPO
**Problema**: `categoria`/`subcategoria` en `meals` no tiene palabra clave clara para "verdura".

**Solución**: Proporcionar:
- Keywords para clasificar como "verdura" (ej: "verdura", "vegetal", "salsa-vegetal", etc.)
- O subgrupo exacto en la BD

**Ejemplo de activación**:
```sql
-- Una vez tengamos la clasificación
WHERE protein_type IN ('verdura', ...)  -- si existe
  OR category LIKE '%verdura%'           -- patrón fuzzy
  OR subgrupo_id IN (15, 18, 22)         -- IDs exactos
```

### 3. Imagen = Imagen Catering
**Problema**: `image_ad` casi vacío; falta claridad en cómo validar.

**Solución**: Decidir:
- ¿Ignorar esta regla hasta que `image_ad` esté poblado?
- ¿O usar otro campo como proxy (ej: `image_source='catering'`)?

---

## Refresh Script

```bash
node scripts/build-carta-compliance.mjs
```

Runs weekly. Populates tables for `semana_id` based on current week.

---

## Integration Plan (ChecklistValidator v2)

Once pending items are defined, extend `ChecklistValidator` to:
1. Query `carta_compliance` para % cumplimiento por país
2. Query `carta_compliance_meals` para checks por plato (JSONB)
3. Merge con reglas custom en ChecklistValidator si hay divergencia

For now: ChecklistValidator uses hardcoded rules (v1). Data lake has source of truth (v2 pending).
