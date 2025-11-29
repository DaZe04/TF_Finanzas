// ============================================================
//  UTILIDADES
// ============================================================

function redondear(n) {
  return Math.round(n * 100) / 100;
}



// ============================================================
//  CONVERSIÓN DE TASAS
// ============================================================

// TNA → TEA
export function convertirTNAaTEA(tna, capitalizacion) {
  const r = tna / 100;

  switch (capitalizacion) {
    case "Mensual":
      return Math.pow(1 + r / 12, 12) - 1;
    case "Diaria":
      return Math.pow(1 + r / 360, 360) - 1;
    case "30 días":
      return Math.pow(1 + r / 12, 12) - 1;
    default:
      return r;
  }
}

// TEA → TEM
export function convertirTEAaTEM(tea) {
  return Math.pow(1 + tea, 1 / 12) - 1;
}



// ============================================================
//  VALIDACIONES
// ============================================================

export function validarParametros({ monto, años, tasa }) {
  if (monto <= 0) throw new Error("El monto debe ser mayor a 0.");
  if (años <= 0) throw new Error("Los años deben ser mayores a 0.");
  if (tasa <= 0) throw new Error("La tasa debe ser mayor a 0.");
}



// ============================================================
//  MÉTODO FRANCÉS – CUOTA BASE SIN SEGUROS
// ============================================================

export function calcularCuotaFrances(monto, tem, n) {
  return (monto * tem * Math.pow(1 + tem, n)) / (Math.pow(1 + tem, n) - 1);
}



// ============================================================
//  GENERACIÓN DEL CRONOGRAMA COMPLETO
// ============================================================

export function generarCronograma({
  nombre,
  clienteId,
  unidadId,
  monto,
  años,
  tasa,
  tipoTasa,
  capitalizacion,
  gracia,
  mesesGracia = 3,
  seguroDesgravamen = 0.0005,
  seguroInmueble = 0,
}) {
  validarParametros({ monto, años, tasa });

  const meses = años * 12;

  // 1) TEA
  const tea =
    tipoTasa === "Nominal"
      ? convertirTNAaTEA(tasa, capitalizacion)
      : tasa / 100;

  // 2) TEM
  const tem = convertirTEAaTEM(tea);

  // 3) Cuota sin seguros
  const cuotaBase = calcularCuotaFrances(monto, tem, meses);

  const tabla = [];
  let saldo = monto;

  // Acumuladores
  let totalInteres = 0;
  let totalAmortizacion = 0;
  let totalSeguros = 0;
  let totalCuotas = 0;
  let interesCapitalizado = 0;

  for (let i = 1; i <= meses; i++) {
    const saldoInicial = saldo;

    let interes = saldo * tem;
    let amortizacion = 0;
    let cuota = 0;

    const seguro1 = saldo * seguroDesgravamen;
    const seguro2 = saldo * seguroInmueble;
    const seguros = seguro1 + seguro2;

    // ============================
    // GRACIA TOTAL
    // ============================
    if (gracia === "Total" && i <= mesesGracia) {
      interesCapitalizado += interes;
      saldo = saldo + interes;
    }

    // ============================
    // GRACIA PARCIAL
    // ============================
    else if (gracia === "Parcial" && i <= mesesGracia) {
      cuota = interes + seguros; // solo interés
    }

    // ============================
    // SIN GRACIA
    // ============================
    else {
      cuota = cuotaBase + seguros;
      amortizacion = cuotaBase - interes;
      saldo = saldo - amortizacion;
    }

    tabla.push({
      mes: i,
      saldoInicial: redondear(saldoInicial),
      interes: redondear(interes),
      amortizacion: redondear(amortizacion),
      seguros: redondear(seguros),
      cuotaSinSeguros: redondear(cuotaBase),
      cuota: redondear(cuota),
      saldoFinal: redondear(saldo < 0 ? 0 : saldo),
    });

    totalInteres += interes;
    totalAmortizacion += amortizacion;
    totalSeguros += seguros;
    totalCuotas += cuota;
  }

  return {
    parametros: {
      nombre,
      clienteId,
      unidadId,
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
      cuotaBase: redondear(cuotaBase),
      totalInteres: redondear(totalInteres),
      totalAmortizacion: redondear(totalAmortizacion),
      totalSeguros: redondear(totalSeguros),
      totalCuotas: redondear(totalCuotas),
      interesCapitalizado: redondear(interesCapitalizado),
    },
    tabla,
  };
}
