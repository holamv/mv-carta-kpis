# CALCULATION_RULES.md — Especificacion Matematica de Motors de Calculo

## Resumen Ejecutivo

La capa de calculo puro contiene 5 motors independientes, testeados, sin dependencias externas:

1. **ChecklistValidator** — Valida las 5 reglas criticas de carta
2. **AvailabilityCalculator** — Consolida disponibilidad por tienda
3. **FoodcostCalculator** — Compara foodcost semanal
4. **NuevosPlatosAnalyzer** — Analiza platos lanzados
5. **ReportConsolidator** — Orquesta los 4 anteriores

**Cobertura total:** 23 tests, 100% pasando. Logica 100% determinista.

---

## 1. ChecklistValidator (14 tests)

**Valida 5 reglas criticas de carta:**

### Regla 1: Calificacion Promedio >= 4.65
```
promedio = SUM(plato.calificacion) / COUNT(platos)
pasa = promedio >= 4.65
```
Si falla, identifica plato con peor calificacion.

### Regla 2: Variedad Minima
- PE/CO: 2 carne, 2 cerdo, 2 pescado, 4-5 estrella
- MX: 3 carne, 2 cerdo, 2 pescado, 3-4 estrella

### Regla 3: Rotacion (Antiguedad Minima)
- Platos estrella: >= 2 semanas (14 dias)
- Otros: >= 4 semanas (28 dias)

### Regla 4: Frecuencia Maxima de Pollo
- PE/CO: maximo 7 platos
- MX: maximo 6 platos

### Regla 5: Pesos Minimos (600kcal referencia)
- Peso total: >= 350g
- Proteina: >= 70g
- Verduras: >= 80g
- Arroz: <= 140g

**Cumplimiento:** (reglas_pasadas / 5) * 100

---

## 2. AvailabilityCalculator (3 tests)

```
porcentaje_tienda = (platos_activos / platos_total) * 100
porcentaje_promedio_general = SUM(activos) / SUM(total) * 100
porcentaje_promedio_pais = SUM(activos en pais) / SUM(total en pais) * 100
```

Alerta si < 70%.

---

## 3. FoodcostCalculator (2 tests)

```
diferencia_pct = ((actual - anterior) / anterior) * 100
alerta = ABS(diferencia_pct) > 40%
```

---

## 4. NuevosPlatosAnalyzer (2 tests)

```
dias_en_carta = (ahora - fecha_lanzamiento) / (1000 * 60 * 60 * 24)
filtrado = dias_en_carta <= dias_lanzamiento_minimo (default 7)

performance = 
  calificacion >= 4.7 ? "arriba_promedio" :
  calificacion >= 4.5 ? "normal" :
  "abajo_promedio"
```

---

## 5. ReportConsolidator (2 tests)

```
cumplimiento_general = AVG(checklist por paises)
alertas_criticas = SUM(errores en cada pais)

status = 
  cumplimiento >= 80 ? "BUENO" :
  cumplimiento >= 60 ? "ALERTA" :
  "CRITICO"
```

---

## Tests: 23/23 Pasando

- ChecklistValidator: 14 tests
- AvailabilityCalculator: 3 tests  
- FoodcostCalculator: 2 tests
- NuevosPlatosAnalyzer: 2 tests
- ReportConsolidator: 2 tests

Ejecutar: npm test -- src/carta/calculations/__tests__/

---

*Generado: 2026-06-14*
*Proyecto: mv-quejas — Modulo Reporte Semanal de KPIs de Carta*
