import { describe, it, expect } from "vitest";
import { AvailabilityCalculator } from "../availability.calculator";
import type { AvailabilityInput } from "../types";

describe("AvailabilityCalculator", () => {
  const calculator = new AvailabilityCalculator();

  it("debe calcular porcentaje de disponibilidad por tienda", () => {
    const input: AvailabilityInput = {
      semana: "202606",
      tiendas: [
        {
          tienda_id: 1,
          tienda_nombre: "Lima Centro",
          ciudad: "Lima",
          pais: "PE",
          cocina_id: 1,
          platos_activos: 70,
          platos_total: 100,
        },
      ],
    };

    const resultado = calculator.calculate(input);

    expect(resultado.datos_tiendas[0].porcentaje).toBe(70);
    expect(resultado.porcentaje_promedio_general).toBe(70);
  });

  it("debe generar alertas si disponibilidad < 70%", () => {
    const input: AvailabilityInput = {
      semana: "202606",
      tiendas: [
        {
          tienda_id: 1,
          tienda_nombre: "Tienda Baja",
          ciudad: "Lima",
          pais: "PE",
          cocina_id: 1,
          platos_activos: 50,
          platos_total: 100,
        },
      ],
    };

    const resultado = calculator.calculate(input);

    expect(resultado.alertas.length).toBeGreaterThan(0);
    expect(resultado.alertas[0]).toContain("Tienda Baja");
  });

  it("debe calcular promedios por pais", () => {
    const input: AvailabilityInput = {
      semana: "202606",
      tiendas: [
        {
          tienda_id: 1,
          tienda_nombre: "Lima",
          ciudad: "Lima",
          pais: "PE",
          cocina_id: 1,
          platos_activos: 80,
          platos_total: 100,
        },
        {
          tienda_id: 2,
          tienda_nombre: "Bogota",
          ciudad: "Bogota",
          pais: "CO",
          cocina_id: 2,
          platos_activos: 60,
          platos_total: 100,
        },
      ],
    };

    const resultado = calculator.calculate(input);

    expect(resultado.porcentaje_promedio_por_pais.PE).toBe(80);
    expect(resultado.porcentaje_promedio_por_pais.CO).toBe(60);
  });
});
