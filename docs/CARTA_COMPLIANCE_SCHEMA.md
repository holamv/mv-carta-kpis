# Carta Compliance - Menú Diario Data Lake

**Proyecto**: `hzpycmczwkwbfrqzvfyz`  
**Fuente**: Node script `scripts/build-carta-compliance.mjs` (semanal)

## 4 Tablas Principales (Data Lake)

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

### 4. `carta_availability` — Disponibilidad por Cocina (Catering)

```sql
-- Disponibilidad por cocina
SELECT city, catering_name, catering_level, disponibles, carta_total, disponibilidad_pct
FROM carta_availability 
WHERE semana_id='242026' 
ORDER BY disponibilidad_pct DESC;

-- Promedio por ciudad (solo Level A+B = "always on")
SELECT city, ROUND(AVG(disponibilidad_pct),1) avg_disp, COUNT(*) cocinas
FROM carta_availability 
WHERE semana_id='242026' AND catering_level IN ('A','B')
GROUP BY city;
```

**Campos**:
- `city` — ciudad
- `catering_name` — nombre de la cocina (catering)
- `catering_level` — nivel operativo (A=always on, B=always on, C=seasonal)
- `disponibles` — platos producidos (daily_cooked_weight_details) OR vendidos (order_details) en la semana
- `carta_total` — total de platos en la carta de esa ciudad
- `disponibilidad_pct` — porcentaje: disponibles / carta_total * 100
- `semana_id` — formato 'WWYYYY' (W242026 = semana 24, 2026)

**Cálculo**:
```
disponibilidad_pct = (disponibles / carta_total) * 100

Disponible = plato producido (daily_cooked_weight_details) 
          OR plato vendido (order_details) 
          en la semana cerrada anterior
```

**Notas**:
- ⚠️ Mide sobre la **semana anterior cerrada** (no a mitad de semana, para evitar subestimar producción)
- 🔧 Solo cocinas activas: `caterings.delete=0` (~17 cocinas)
- 📊 La carta es **por ciudad**, no por cocina (todos los caterings de una ciudad comparten la misma carta)
- 🔴 Cocina en 0% = no produjo ni vendió esa semana (recién abierta, inactiva, o con disponibilidad limitada)
- 🔄 Filtro "always on": `catering_level IN ('A', 'B')`

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

## Reglas Activas - Por Ámbito

### Por Plato (10 reglas)
1. Foto (requerida)
2. Presentación
3. Empaque definido
4. Empaque-subgrupo
5. Foodcost < 40%
6. Peso total ≥ 350g (600kcal)
7. Arroz ≤ 140g (600kcal)
8. Proteína ≥ 20% (600kcal)
9. **Verduras ≥ 80g (600kcal)** — ✅ ACTIVA
10. Sin huevo en complementos

#### Detalle: Regla `verduras_min_80`

Un **subgrupo cuenta como verdura** si **>50% de su porción** están en `ingredient_category_id=2` (FRUVER).

Luego se suma el **peso cocido** de los subgrupos clasificados como verdura.

```sql
SELECT meal_name, checks->>'verduras_min_80' AS verduras, checks->>'proteina_min_20pct' AS proteina
FROM carta_compliance_meals
WHERE branch_office_id=2 
  AND checks->>'verduras_min_80' IS NOT NULL;
```

**Nota**: FRUVER incluye frutas (no solo verduras) → puede sobre-contar en platos con fruta. 
Sub-clasificar FRUVER requeriría categorización adicional en BD.

**Valores nulos**: La regla retorna `null` cuando:
- El plato no tiene datos de peso cocido
- El plato no es principal (category='principal')

### Por Ciudad (5 reglas)
1. Variedad Carne (≥2)
2. Variedad Cerdo (≥2)
3. Variedad Pescado (≥2)
4. Pollo en ensalada ≤ cap
5. Estrella en carta (≥4 por país)

### Comparte Ambos (bonus)
- Ensaladas ≤ 20% de ventas
- Snacks ≤ 30% de ventas

---

## Reglas Diferidas (No en Score Aún - 3)

1. **Peso snack ≥ 120g** — snacks deben pesar mínimo 120g cocido
2. **Peso ensalada ≥ 300g** — ensaladas deben pesar mínimo 300g cocido
3. **Imagen = Imagen catering** — validar que foto sea del catering, no stock

---

## Pendientes para Leo / Dev (2)

### 1. "% promedio de pedido" — DEFINIR MÉTRICA
**Estado**: Pendiente definición  
**Aplica a**: snacks (≤30%) y ensaladas (≤20%)

**Pregunta**: ¿Qué es el "% promedio de pedido"?
- ¿Es % de pedidos (cuántos pedidos incluyen snack) o % de volumen (cuántas unidades)?
- ¿Es por tienda, por ciudad, o por país?
- ¿Semana actual vs histórico (última N semanas)?

**Ejemplo de implementación**:
```sql
-- Opción 1: % de unidades (volumen)
SUM(CASE WHEN category='snack' THEN unidades ELSE 0 END) / 
  SUM(unidades) * 100 <= 30%

-- Opción 2: % de órdenes (pedidos)
COUNT(DISTINCT CASE WHEN has_snack=true THEN order_id END) /
  COUNT(DISTINCT order_id) * 100 <= 30%
```

### 2. Imagen = Imagen Catering
**Estado**: Diferida  
**Problema**: `image_ad` casi vacío en BD

**Solución**: Decidir:
- ¿Ignorar esta regla hasta que `image_ad` esté poblado?
- ¿O usar otro campo como proxy (ej: `image_source='catering'`)?

---

## Refresh Scripts

### 1. Compliance Rules
```bash
node scripts/build-carta-compliance.mjs
```
Popula `carta_compliance`, `carta_compliance_meals`, `star_plates_weekly` (semanal)

### 2. Kitchen Availability
```bash
node scripts/build-carta-availability.mjs
```
Popula `carta_availability` (semanal, mide sobre semana anterior cerrada)

---

## Integration Plan (ChecklistValidator v2)

Once pending items are defined, extend `ChecklistValidator` to:
1. Query `carta_compliance` para % cumplimiento por país
2. Query `carta_compliance_meals` para checks por plato (JSONB)
3. Merge con reglas custom en ChecklistValidator si hay divergencia

For now: ChecklistValidator uses hardcoded rules (v1). Data lake has source of truth (v2 pending).
