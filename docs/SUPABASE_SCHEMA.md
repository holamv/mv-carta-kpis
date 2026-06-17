# Supabase Schema - Menú Diario Data Lake

**Proyecto**: `hzpycmczwkwbfrqzvfyz`  
**Schema**: `public`  
**Fuente**: MySQL prod (Menú Diario) - Backfill automático

## 4 Tablas Principales

### 1. `meals` — Catálogo de platos (1,395 platos)

```sql
meal_id (PK)
meal_name
protein_type -- 'carne', 'cerdo', 'pescado', 'pollo', 'otro'
country_id
country -- 'PE', 'CO', 'MX'
is_star (bool) -- plato bandera
is_active (bool)
is_new (bool) -- flag curado, 31 platos
first_sold_date -- primera venta histórica

-- Nutrición (cobertura ~90%)
weight_gr, protein_gr, carbs_gr, fat_gr, calories
-- Tabla: meal_macros

food_cost_pct -- % por plato directo
food_cost_local -- costo en moneda local
```

### 2. `stores` — Cocinas/tiendas (161)

```sql
store_id (PK)
store_name
city
country
country_id
cocina_id
branch_office_id
catering_level -- 'A', 'B', 'C'
is_active (bool)
```

### 3. `meal_orders_daily` — Ventas día×plato×tienda (AGREGADO DIARIO)

```sql
order_date
meal_id (FK -> meals)
store_id (FK -> stores)
country_id
unidades -- cantidad vendida

-- Foodcost (la fórmula)
costo_teorico_local -- costo teórico en moneda local
precio_local -- precio en moneda local
```

**⚠️ NO son órdenes individuales** — es agregado diario. Para platos más vendidos: `SUM(unidades) GROUP BY meal_id`

### 4. `meal_feedbacks` — Rating por plato (0-5)

```sql
meal_id (FK -> meals)
branch_office_id (FK -> stores)
rating -- score actual (0-5)
initial_rating -- rating inicial
```

**Por plato×sede (ciudad)**, NO por cliente/orden individual.

---

## Joins

```sql
-- Ventas + plato + tienda
meal_orders_daily.meal_id = meals.meal_id
meal_orders_daily.store_id = stores.store_id

-- Rating + plato
meal_feedbacks.meal_id = meals.meal_id

-- Rating + ciudad
meal_feedbacks.branch_office_id = stores.branch_office_id
```

---

## Foodcost Teórico

### Fórmula
```
SUM(costo_teorico_local) / SUM(precio_local) * 100
```

### Cálculo por país/tienda/semana
```sql
SELECT
  country,
  SUM(costo_teorico_local) / SUM(precio_local) * 100 as foodcost_pct
FROM meal_orders_daily
WHERE [filtro: país/tienda/semana]
GROUP BY country
```

### Fuentes
- `plate_costs` — costo por plato y nivel calórico
- `meal_orders_daily.costo_teorico_local` + `.precio_local` — para foodcost% en cualquier corte
- `meals.food_cost_pct` — % por plato directo

### ⚠️ Complementos (bebidas/postres)
Algunos complementos salen >100% — precio de línea es bajo vs costo.  
**Solución**: Filtrar por categoría de platos principales O usar máximo de 100% en cálculos.

### Validación (PE semana 16)
- Foodcost teórico: **31.9%** ✅

---

## Estado de Módulos (5 Motors)

| Motor | Estado | Fuente |
|-------|--------|--------|
| ChecklistValidator | ✅ Listo | meal_feedbacks, meals (proteína/peso/macros) |
| AvailabilityCalculator | ✅ Listo | meals.is_active + stores |
| NuevosPlatosAnalyzer | ✅ Listo | meals.is_new flag o first_sold_date |
| FoodcostCalculator | ✅ Listo | meal_orders_daily (costo_teorico_local / precio_local) |
| ReportConsolidator | ✅ Listo | Consolida todo |

---

## Queries de Referencia

### Top 10 platos vendidos en Perú con rating
```sql
SELECT 
  m.meal_name, 
  SUM(o.unidades) AS unidades, 
  AVG(f.rating) AS rating
FROM meal_orders_daily o
JOIN meals m ON m.meal_id = o.meal_id
LEFT JOIN meal_feedbacks f ON f.meal_id = o.meal_id
WHERE o.country_id = 1 -- PE
GROUP BY m.meal_name
ORDER BY unidades DESC
LIMIT 10;
```

### Foodcost por país
```sql
SELECT
  country,
  ROUND(SUM(costo_teorico_local) / SUM(precio_local) * 100, 2) as foodcost_pct
FROM meal_orders_daily
WHERE WEEK(order_date) = 16 AND YEAR(order_date) = 2026
GROUP BY country;
```
