import { PAIS_REGLAS, UMBRALES } from "../config";
import type { Country, ChecklistAlerta } from "../types";
import type { ChecklistInput, ChecklistOutput, MealForChecklist } from "./types";

export class ChecklistValidator {
  private pais: Country;
  private reglas = PAIS_REGLAS;
  private umbrales = UMBRALES;

  constructor(pais: Country) {
    this.pais = pais;
  }

  validate(input: ChecklistInput): ChecklistOutput {
    const alertas: ChecklistAlerta[] = [];
    let pasadas = 0;
    const totalReglas = 5;

    const calificacionResult = this.validateCalificacion(input.platos, alertas);
    if (calificacionResult) pasadas++;

    const variedadResult = this.validateVariedad(input.platos, alertas);
    if (variedadResult.pasada) pasadas++;

    const rotacionResult = this.validateRotacion(input.platos, input.semanas_historico || 4, alertas);
    if (rotacionResult.pasada) pasadas++;

    const polloResult = this.validatePollo(input.platos, alertas);
    if (polloResult.pasada) pasadas++;

    const pesosResult = this.validatePesos(input.platos, alertas);
    if (pesosResult.pasada) pasadas++;

    const cumplimiento_pct = Math.round((pasadas / totalReglas) * 100);

    return {
      pais: this.pais,
      cumplimiento_pct,
      alertas,
      detalle_reglas: {
        calificacion: {
          pasada: calificacionResult,
          promedio: this.calcularCalificacionPromedio(input.platos),
          peor_plato: this.obtenerPeorPlato(input.platos)?.nombre,
        },
        variedad: variedadResult,
        rotacion: rotacionResult,
        pollo: polloResult,
        pesos: pesosResult,
      },
    };
  }

  private validateCalificacion(platos: MealForChecklist[], alertas: ChecklistAlerta[]): boolean {
    const promedio = this.calcularCalificacionPromedio(platos);
    const pasada = promedio >= this.umbrales.CALIFICACION_MINIMA;

    if (!pasada) {
      const peor = this.obtenerPeorPlato(platos);
      alertas.push({
        regla: "calificacion",
        severidad: "error",
        mensaje: `Calificacion promedio ${promedio.toFixed(2)} inferior a ${this.umbrales.CALIFICACION_MINIMA}`,
        detalles: {
          promedio,
          minimo: this.umbrales.CALIFICACION_MINIMA,
          peor_plato: peor?.nombre,
          calificacion_peor: peor?.calificacion_promedio,
        },
      });
    }

    return pasada;
  }

  private calcularCalificacionPromedio(platos: MealForChecklist[]): number {
    if (platos.length === 0) return 0;
    const suma = platos.reduce((acc, p) => acc + p.calificacion_promedio, 0);
    return Math.round((suma / platos.length) * 100) / 100;
  }

  private obtenerPeorPlato(platos: MealForChecklist[]): MealForChecklist | undefined {
    return [...platos].sort((a, b) => a.calificacion_promedio - b.calificacion_promedio)[0];
  }

  private validateVariedad(platos: MealForChecklist[], alertas: ChecklistAlerta[]) {
    const reglas = this.reglas[this.pais];
    const conteos = {
      carne: platos.filter(p => p.proteina === "carne").length,
      cerdo: platos.filter(p => p.proteina === "cerdo").length,
      pescado: platos.filter(p => p.proteina === "pescado").length,
      estrella: platos.filter(p => p.es_estrella).length,
    };

    const pasada =
      conteos.carne >= reglas.variedad_minima.carne &&
      conteos.cerdo >= reglas.variedad_minima.cerdo &&
      conteos.pescado >= reglas.variedad_minima.pescado &&
      conteos.estrella >= reglas.variedad_minima.estrella &&
      conteos.estrella <= reglas.estrella_maxima;

    if (!pasada) {
      const problemas: string[] = [];
      if (conteos.carne < reglas.variedad_minima.carne)
        problemas.push(`Carne: ${conteos.carne}/${reglas.variedad_minima.carne}`);
      if (conteos.cerdo < reglas.variedad_minima.cerdo)
        problemas.push(`Cerdo: ${conteos.cerdo}/${reglas.variedad_minima.cerdo}`);
      if (conteos.pescado < reglas.variedad_minima.pescado)
        problemas.push(`Pescado: ${conteos.pescado}/${reglas.variedad_minima.pescado}`);
      if (conteos.estrella < reglas.variedad_minima.estrella)
        problemas.push(`Platos estrella: ${conteos.estrella}/${reglas.variedad_minima.estrella}`);
      if (conteos.estrella > reglas.estrella_maxima)
        problemas.push(`Demasiados platos estrella: ${conteos.estrella} (max ${reglas.estrella_maxima})`);

      alertas.push({
        regla: "variedad",
        severidad: "error",
        mensaje: `Falta variedad: ${problemas.join(", ")}`,
        detalles: { variedad: conteos, reglas: reglas.variedad_minima },
      });
    }

    return {
      pasada,
      carne: { actual: conteos.carne, minimo: reglas.variedad_minima.carne },
      cerdo: { actual: conteos.cerdo, minimo: reglas.variedad_minima.cerdo },
      pescado: { actual: conteos.pescado, minimo: reglas.variedad_minima.pescado },
      estrella: { actual: conteos.estrella, minimo: reglas.variedad_minima.estrella, maximo: reglas.estrella_maxima },
    };
  }

  private validateRotacion(platos: MealForChecklist[], semanas_historico: number, alertas: ChecklistAlerta[]) {
    const reglas = this.reglas[this.pais];
    const obsoletos: string[] = [];

    for (const plato of platos) {
      if (!plato.ultima_aparicion_semana) continue;

      const semanas_sin_aparecer = Math.max(0, semanas_historico - plato.ultima_aparicion_semana);
      const dias_sin_aparecer = semanas_sin_aparecer * 7;

      const dias_minimos = plato.es_estrella 
        ? reglas.rotacion_dias.estrella 
        : reglas.rotacion_dias.otros;

      if (dias_sin_aparecer > dias_minimos) {
        obsoletos.push(`${plato.nombre} (${dias_sin_aparecer} dias sin aparecer)`);
      }
    }

    const pasada = obsoletos.length === 0;

    if (!pasada) {
      alertas.push({
        regla: "rotacion",
        severidad: "warning",
        mensaje: `${obsoletos.length} plato(s) sin rotar lo suficiente`,
        detalles: { platos_obsoletos: obsoletos },
      });
    }

    return { pasada, obsoletos };
  }

  private validatePollo(platos: MealForChecklist[], alertas: ChecklistAlerta[]) {
    const reglas = this.reglas[this.pais];
    const frecuencia = platos.filter(p => p.proteina === "pollo").length;

    const pasada = frecuencia <= reglas.pollo_max_semana;

    if (!pasada) {
      alertas.push({
        regla: "pollo",
        severidad: "warning",
        mensaje: `Pollo aparece ${frecuencia} veces (maximo ${reglas.pollo_max_semana})`,
        detalles: { frecuencia, limite: reglas.pollo_max_semana },
      });
    }

    return { pasada, frecuencia, limite: reglas.pollo_max_semana };
  }

  private validatePesos(platos: MealForChecklist[], alertas: ChecklistAlerta[]) {
    const problemas: string[] = [];

    for (const plato of platos) {
      const errores: string[] = [];

      if (plato.peso_total_gr !== undefined && plato.peso_total_gr < this.umbrales.PESO_MINIMO_PRINCIPAL) {
        errores.push(`Peso ${plato.peso_total_gr}g inferior a ${this.umbrales.PESO_MINIMO_PRINCIPAL}g`);
      }

      if (plato.proteina_gr !== undefined && plato.proteina_gr < this.umbrales.PROTEINA_MINIMA) {
        errores.push(`Proteina ${plato.proteina_gr}g inferior a ${this.umbrales.PROTEINA_MINIMA}g`);
      }

      if (plato.verduras_gr !== undefined && plato.verduras_gr < this.umbrales.VERDURAS_MINIMA) {
        errores.push(`Verduras ${plato.verduras_gr}g inferior a ${this.umbrales.VERDURAS_MINIMA}g`);
      }

      if (plato.arroz_gr !== undefined && plato.arroz_gr > this.umbrales.ARROZ_MAXIMO) {
        errores.push(`Arroz ${plato.arroz_gr}g mayor a ${this.umbrales.ARROZ_MAXIMO}g`);
      }

      if (errores.length > 0) {
        problemas.push(`${plato.nombre}: ${errores.join(", ")}`);
      }
    }

    const pasada = problemas.length === 0;

    if (!pasada) {
      alertas.push({
        regla: "pesos",
        severidad: "warning",
        mensaje: `${problemas.length} plato(s) con problemas de peso/macros`,
        detalles: { platos: problemas },
      });
    }

    return { pasada, platos_con_problema: problemas };
  }
}
