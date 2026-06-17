import { describe, it, expect } from "vitest";
import { FoodcostCalculator } from "../foodcost.calculator";
import type { FoodcostInput } from "../types";

describe("FoodcostCalculator", () => {
  const calculator = new FoodcostCalculator();

  it("debe calcular diferencia de foodcost entre semanas", () => {
    const input: FoodcostInput = {
      semana_actual: "202606",
      semana_anterior: "202605",
      datos_semana_actual: { PE: 35, CO: 36, MX: 32 },
      datos_semana_anterior: { PE: 30, CO: 30, MX: 30 },
    };

    const resultado = calculator.calculate(input);

    const pe_result = resultado.comparativos.find(c => c.pais === "PE");
    expect(pe_result?.diferencia_pct).toBe(17);
  });

  it("debe generar alertas si diferencia > 40%", () => {
    const input: FoodcostInput = {
      semana_actual: "202606",
      semana_anterior: "202605",
      datos_semana_actual: { PE: 50, CO: 30, MX: 30 },
      datos_semana_anterior: { PE: 30, CO: 30, MX: 30 },
    };

    const resultado = calculator.calculate(input);

    expect(resultado.alertas.some(a => a.includes("PE"))).toBe(true);
  });
});
