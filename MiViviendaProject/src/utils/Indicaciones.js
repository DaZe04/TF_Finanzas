// ============================================================
//  VAN - Valor Actual Neto
// ============================================================

export function VAN(flujos, tasa) {
  return flujos.reduce(
    (acc, f, t) => acc + f / Math.pow(1 + tasa, t),
    0
  );
}



// ============================================================
//  TIR - Interna
// ============================================================

export function TIR(flujos, precision = 1e-7, maxIter = 5000) {
  let r = 0.1; // guess inicial

  for (let i = 0; i < maxIter; i++) {
    let f = 0;
    let df = 0;

    for (let t = 0; t < flujos.length; t++) {
      f += flujos[t] / Math.pow(1 + r, t);
      df += -t * flujos[t] / Math.pow(1 + r, t + 1);
    }

    let rNuevo = r - f / df;
    if (Math.abs(rNuevo - r) < precision) return rNuevo;

    r = rNuevo;
  }

  return null;
}



// ============================================================
//  CTC - Costo Total del Crédito
// ============================================================

export function CTC(tabla) {
  return tabla.reduce((acc, fila) => acc + fila.cuota, 0);
}



// ============================================================
//  TCEA - Tasa de Costo Efectiva Anual
// ============================================================
// Correcta:
//     (1 + r_mensual)^12 - 1

export function TCEA(monto, totalPagado) {
  const tem = totalPagado / monto - 1;
  return Math.pow(1 + tem, 12) - 1;
}



// ============================================================
//  NUEVO: Genera flujos desde el cronograma
//  Para VAN, TIR, TCEA
// ============================================================
// flujo[0]  = desembolso (negativo)
// flujo[i]  = cuota del mes i
export function generarFlujosDesdeCronograma(tabla, montoDesembolsado) {
  const flujos = [-montoDesembolsado];

  tabla.forEach((fila) => {
    flujos.push(fila.cuota);
  });

  return flujos;
}



// ============================================================
//  NUEVO: conversiones adicionales
// ============================================================

// TEM → TEA
export function convertirTEMaTEA(tem) {
  return Math.pow(1 + tem, 12) - 1;
}

// TEA → tasa continua
export function convertirTEAaTasaContinua(tea) {
  return Math.log(1 + tea);
}
