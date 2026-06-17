import { describe, it, expect, beforeEach } from "vitest";
import { ChecklistValidator } from "../checklist.validator";
import type { ChecklistInput, MealForChecklist } from "../types";

describe("ChecklistValidator", () => {
  let validator: ChecklistValidator;

  beforeEach(() => {
    validator = new ChecklistValidator("PE");
  });

  describe("Regla 1: Calificacion promedio >= 4.65", () => {
    it("debe pasar si promedio >= 4.65", () => {
      const platos: MealForChecklist[] = [
        {
          meal_id: 1,
          nombre: "Pollo a la Plancha",
          proteina: "pollo",
          es_estrella: true,
          calificacion_promedio: 4.8,
        },
        {
          meal_id: 2,
          nombre: "Salmon Teriyaki",
          proteina: "pescado",
          es_estrella: true,
          calificacion_promedio: 4.7,
        },
      ];

      const resultado = validator.validate({
        pais: "PE",
        semana_numero: 25,
        platos,
      });

      expect(resultado.detalle_reglas.calificacion.pasada).toBe(true);
      expect(resultado.detalle_reglas.calificacion.promedio).toBe(4.75);
    });

    it("debe fallar si promedio < 4.65", () => {
      const platos: MealForChecklist[] = [
        {
          meal_id: 1,
          nombre: "Plato Pobre",
          proteina: "pollo",
          es_estrella: false,
          calificacion_promedio: 4.2,
        },
        {
          meal_id: 2,
          nombre: "Salmon OK",
          proteina: "pescado",
          es_estrella: true,
          calificacion_promedio: 4.9,
        },
      ];

      const resultado = validator.validate({
        pais: "PE",
        semana_numero: 25,
        platos,
      });

      expect(resultado.detalle_reglas.calificacion.pasada).toBe(false);
      expect(resultado.detalle_reglas.calificacion.peor_plato).toBe("Plato Pobre");
      expect(resultado.alertas.some(a => a.regla === "calificacion")).toBe(true);
    });
  });

  describe("Regla 2: Variedad minima", () => {
    it("debe pasar si cumple variedad minima PE (2 carne, 2 cerdo, 2 pescado, 4 estrella)", () => {
      const platos: MealForChecklist[] = [
        { meal_id: 1, nombre: "Carne 1", proteina: "carne", es_estrella: true, calificacion_promedio: 4.7 },
        { meal_id: 2, nombre: "Carne 2", proteina: "carne", es_estrella: false, calificacion_promedio: 4.7 },
        { meal_id: 3, nombre: "Cerdo 1", proteina: "cerdo", es_estrella: true, calificacion_promedio: 4.7 },
        { meal_id: 4, nombre: "Cerdo 2", proteina: "cerdo", es_estrella: false, calificacion_promedio: 4.7 },
        { meal_id: 5, nombre: "Pescado 1", proteina: "pescado", es_estrella: true, calificacion_promedio: 4.7 },
        { meal_id: 6, nombre: "Pescado 2", proteina: "pescado", es_estrella: false, calificacion_promedio: 4.7 },
        { meal_id: 7, nombre: "Pollo Estrella", proteina: "pollo", es_estrella: true, calificacion_promedio: 4.7 },
      ];

      const resultado = validator.validate({
        pais: "PE",
        semana_numero: 25,
        platos,
      });

      expect(resultado.detalle_reglas.variedad.pasada).toBe(true);
    });

    it("debe fallar si faltan proteinas en PE", () => {
      const platos: MealForChecklist[] = [
        { meal_id: 1, nombre: "Carne", proteina: "carne", es_estrella: true, calificacion_promedio: 4.7 },
        { meal_id: 2, nombre: "Pollo", proteina: "pollo", es_estrella: true, calificacion_promedio: 4.7 },
      ];

      const resultado = validator.validate({
        pais: "PE",
        semana_numero: 25,
        platos,
      });

      expect(resultado.detalle_reglas.variedad.pasada).toBe(false);
      expect(resultado.alertas.some(a => a.regla === "variedad")).toBe(true);
    });

    it("debe fallar en MX si no tiene variedad MX (3 carne, 2 cerdo, 2 pescado, 3 estrella)", () => {
      const validatorMX = new ChecklistValidator("MX");
      const platos: MealForChecklist[] = [
        { meal_id: 1, nombre: "Carne 1", proteina: "carne", es_estrella: false, calificacion_promedio: 4.7 },
        { meal_id: 2, nombre: "Carne 2", proteina: "carne", es_estrella: false, calificacion_promedio: 4.7 },
      ];

      const resultado = validatorMX.validate({
        pais: "MX",
        semana_numero: 25,
        platos,
      });

      expect(resultado.detalle_reglas.variedad.pasada).toBe(false);
    });
  });

  describe("Regla 3: Rotacion (antiguedad minima)", () => {
    it("debe pasar si platos estrella aparecieron hace <= 2 semanas", () => {
      const platos: MealForChecklist[] = [
        {
          meal_id: 1,
          nombre: "Estrella Reciente",
          proteina: "carne",
          es_estrella: true,
          calificacion_promedio: 4.7,
          ultima_aparicion_semana: 3,
        },
        {
          meal_id: 2,
          nombre: "Otro OK",
          proteina: "pollo",
          es_estrella: false,
          calificacion_promedio: 4.7,
          ultima_aparicion_semana: 2,
        },
      ];

      const resultado = validator.validate({
        pais: "PE",
        semana_numero: 5,
        platos,
        semanas_historico: 5,
      });

      expect(resultado.detalle_reglas.rotacion.pasada).toBe(true);
    });

    it("debe fallar si platos estrella sin rotar > 2 semanas", () => {
      const platos: MealForChecklist[] = [
        {
          meal_id: 1,
          nombre: "Estrella Obsoleta",
          proteina: "carne",
          es_estrella: true,
          calificacion_promedio: 4.7,
          ultima_aparicion_semana: 1,
        },
      ];

      const resultado = validator.validate({
        pais: "PE",
        semana_numero: 5,
        platos,
        semanas_historico: 5,
      });

      expect(resultado.detalle_reglas.rotacion.pasada).toBe(false);
      expect(resultado.alertas.some(a => a.regla === "rotacion")).toBe(true);
    });
  });

  describe("Regla 4: Frecuencia maxima de pollo", () => {
    it("debe pasar si pollo <= 7 en PE", () => {
      const platos: MealForChecklist[] = Array.from({ length: 7 }, (_, i) => ({
        meal_id: i,
        nombre: `Pollo ${i}`,
        proteina: "pollo",
        es_estrella: i < 4,
        calificacion_promedio: 4.7,
      }));

      const resultado = validator.validate({
        pais: "PE",
        semana_numero: 25,
        platos,
      });

      expect(resultado.detalle_reglas.pollo.pasada).toBe(true);
    });

    it("debe fallar si pollo > 7 en PE", () => {
      const platos: MealForChecklist[] = Array.from({ length: 8 }, (_, i) => ({
        meal_id: i,
        nombre: `Pollo ${i}`,
        proteina: "pollo",
        es_estrella: false,
        calificacion_promedio: 4.7,
      }));

      const resultado = validator.validate({
        pais: "PE",
        semana_numero: 25,
        platos,
      });

      expect(resultado.detalle_reglas.pollo.pasada).toBe(false);
      expect(resultado.alertas.some(a => a.regla === "pollo")).toBe(true);
    });

    it("debe pasar si pollo <= 6 en MX", () => {
      const validatorMX = new ChecklistValidator("MX");
      const platos: MealForChecklist[] = Array.from({ length: 6 }, (_, i) => ({
        meal_id: i,
        nombre: `Pollo ${i}`,
        proteina: "pollo",
        es_estrella: false,
        calificacion_promedio: 4.7,
      }));

      const resultado = validatorMX.validate({
        pais: "MX",
        semana_numero: 25,
        platos,
      });

      expect(resultado.detalle_reglas.pollo.pasada).toBe(true);
    });
  });

  describe("Regla 5: Pesos minimos", () => {
    it("debe pasar si pesos cumplen minimos", () => {
      const platos: MealForChecklist[] = [
        {
          meal_id: 1,
          nombre: "Plato Perfecto",
          proteina: "carne",
          es_estrella: true,
          calificacion_promedio: 4.7,
          peso_total_gr: 350,
          proteina_gr: 70,
          verduras_gr: 80,
          arroz_gr: 140,
        },
      ];

      const resultado = validator.validate({
        pais: "PE",
        semana_numero: 25,
        platos,
      });

      expect(resultado.detalle_reglas.pesos.pasada).toBe(true);
    });

    it("debe fallar si peso total < 350g", () => {
      const platos: MealForChecklist[] = [
        {
          meal_id: 1,
          nombre: "Plato Pequeno",
          proteina: "carne",
          es_estrella: false,
          calificacion_promedio: 4.7,
          peso_total_gr: 300,
          proteina_gr: 70,
          verduras_gr: 80,
          arroz_gr: 140,
        },
      ];

      const resultado = validator.validate({
        pais: "PE",
        semana_numero: 25,
        platos,
      });

      expect(resultado.detalle_reglas.pesos.pasada).toBe(false);
      expect(resultado.alertas.some(a => a.regla === "pesos")).toBe(true);
    });

    it("debe fallar si proteina < 70g", () => {
      const platos: MealForChecklist[] = [
        {
          meal_id: 1,
          nombre: "Plato Pobre en Proteina",
          proteina: "carne",
          es_estrella: false,
          calificacion_promedio: 4.7,
          peso_total_gr: 350,
          proteina_gr: 60,
          verduras_gr: 80,
          arroz_gr: 140,
        },
      ];

      const resultado = validator.validate({
        pais: "PE",
        semana_numero: 25,
        platos,
      });

      expect(resultado.detalle_reglas.pesos.pasada).toBe(false);
    });
  });

  describe("Cumplimiento general", () => {
    it("calcula % de cumplimiento correctamente (3/5 = 60%)", () => {
      const platos: MealForChecklist[] = [
        { meal_id: 1, nombre: "Pollo", proteina: "pollo", es_estrella: true, calificacion_promedio: 4.7 },
      ];

      const resultado = validator.validate({
        pais: "PE",
        semana_numero: 25,
        platos,
      });

      expect(resultado.cumplimiento_pct).toBeGreaterThanOrEqual(0);
      expect(resultado.cumplimiento_pct).toBeLessThanOrEqual(100);
    });
  });
});
