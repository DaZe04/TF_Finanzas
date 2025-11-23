// ============================================================
//  VAN - Valor Actual Neto
// ============================================================
// flujos: array de flujos de caja (negativo al inicio)
// tasa: tasa de descuento mensual (TEM) o tasa anual convertida
export function VAN(flujos, tasa) {
  let van = 0;

  for (let t = 0; t < flujos.length; t++) {
    van += flujos[t] / Math.pow(1 + tasa, t);
  }

  return van;
}



// ============================================================
//  TIR - Tasa Interna de Retorno
// ============================================================
// Se calcula por método iterativo (Newton Raphson)
export function TIR(flujos, precision = 0.0000001, maxIter = 5000) {
  let r = 0.1; // 10% como valor inicial

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

  return null; // no converge
}



// ============================================================
//  CTC - Costo Total del Crédito
// ============================================================
// Suma de todas las cuotas pagadas
export function CTC(tabla) {
  return tabla.reduce((acc, fila) => acc + fila.cuota, 0);
}



// ============================================================
//  TCEA - Tasa de Costo Efectiva Anual
// ============================================================
// TCEA = (1 + in / montoSolicitado) ^ 12 - 1
export function TCEA(monto, totalPagado) {
  const tem = totalPagado / monto - 1; // rendimiento mensual equivalente
  return Math.pow(1 + tem, 12) - 1;
}
