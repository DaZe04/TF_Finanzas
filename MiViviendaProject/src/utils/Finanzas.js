// ============================================================
//  CONVERSIÓN DE TASAS
// ============================================================

// TNA → TEA
export function convertirTNAaTEA(tna, capitalizacion) {
  const r = tna / 100;

  if (capitalizacion === "Mensual") {
    return Math.pow(1 + r / 12, 12) - 1;
  }

  if (capitalizacion === "Diaria") {
    return Math.pow(1 + r / 360, 360) - 1;
  }

  if (capitalizacion === "30 días") {
    return Math.pow(1 + r / 12, 12) - 1;
  }

  return r; // si algo falla, deja la tasa como efectiva
}

// TEA → TEM (interés mensual)
export function convertirTEAaTEM(tea) {
  return Math.pow(1 + tea, 1 / 12) - 1;
}



// ============================================================
//  VALIDACIONES FINANCIERAS
// ============================================================

export function validarParametros({ monto, años, tasa }) {
  if (monto <= 0) throw new Error("El monto debe ser mayor a 0.");
  if (años <= 0) throw new Error("Los años deben ser mayores a 0.");
  if (tasa <= 0) throw new Error("La tasa debe ser mayor a 0.");
}



// ============================================================
//  METODO FRANCÉS – CUOTA
// ============================================================

export function calcularCuotaFrances(monto, tem, n) {
  return (
    (monto * (tem * Math.pow(1 + tem, n))) /
    (Math.pow(1 + tem, n) - 1)
  );
}



// ============================================================
//  GENERACIÓN COMPLETA DEL CRONOGRAMA
// ============================================================
// A: incluye seguros
// B: incluye totales
// C: gracia parametrizable
// D: retorna estructura para Firestore
// E: validaciones
// ============================================================

export function generarCronograma({
  monto,
  años,
  tasa,
  tipoTasa,
  capitalizacion,
  gracia, // "Total" / "Parcial" / "Ninguno"
  mesesGracia = 3, // parametrizable
  seguroDesgravamen = 0.0005, // 0.05% mensual (ejemplo)
  seguroInmueble = 0, // opcional
}) {
  // VALIDACIONES
  validarParametros({ monto, años, tasa });

  const meses = años * 12;

  // 1) Convertir tasa a TEA
  let tea;
  if (tipoTasa === "Nominal") {
    tea = convertirTNAaTEA(tasa, capitalizacion);
  } else {
    tea = tasa / 100;
  }

  // 2) TEM
  const tem = convertirTEAaTEM(tea);

  // 3) Cuota del francés sin seguros
  const cuotaBase = calcularCuotaFrances(monto, tem, meses);

  const tabla = [];
  let saldo = monto;

  // Totales
  let totalInteres = 0;
  let totalAmortizacion = 0;
  let totalSeguros = 0;
  let totalCuotas = 0;

  for (let i = 1; i <= meses; i++) {
    let interes = saldo * tem;
    let amortizacion;
    let cuota;
    let seguro1 = saldo * seguroDesgravamen;
    let seguro2 = saldo * seguroInmueble;
    let seguros = seguro1 + seguro2;

    // ============================
    // GRACIA TOTAL
    // ============================
    if (gracia === "Total" && i <= mesesGracia) {
      amortizacion = 0;
      cuota = 0;
      saldo = saldo + interes; // capitaliza interés
    }

    // ============================
    // GRACIA PARCIAL
    // ============================
    else if (gracia === "Parcial" && i <= mesesGracia) {
      amortizacion = 0;
      cuota = interes; // solo intereses
      // saldo no cambia
    }

    // ============================
    // SIN GRACIA
    // ============================
    else {
      cuota = cuotaBase + seguros; // cuota final del cliente
      amortizacion = cuotaBase - interes;
      saldo = saldo - amortizacion;
    }

    // Acumular totales
    totalInteres += interes;
    totalAmortizacion += amortizacion;
    totalSeguros += seguros;
    totalCuotas += cuota;

    tabla.push({
      mes: i,
      interes,
      amortizacion,
      seguros,
      cuota,
      saldo: saldo < 0 ? 0 : saldo,
    });
  }

  return {
    parametros: {
      monto,
      años,
      tasa,
      tipoTasa,
      capitalizacion,
      gracia,
      mesesGracia,
      seguroDesgravamen,
      seguroInmueble,
    },
    resultados: {
      tea,
      tem,
      cuotaBase,
      totalInteres,
      totalAmortizacion,
      totalSeguros,
      totalCuotas,
    },
    tabla,
  };
}
