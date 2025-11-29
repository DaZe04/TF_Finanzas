<template>
  <div style="padding: 20px;">
    <h1>Indicadores Financieros</h1>

    <div v-if="!simulacion">Cargando...</div>

    <div v-if="simulacion">
      <h2>Resultados</h2>

      <p><b>VAN:</b> {{ van.toFixed(2) }}</p>
      <p><b>TIR mensual:</b> {{ (tir * 100).toFixed(4) }}%</p>
      <p><b>TIR anual:</b> {{ ((Math.pow(1 + tir, 12) - 1) * 100).toFixed(4) }}%</p>
      <p><b>CTC – Costo Total del Crédito:</b> {{ ctc.toFixed(2) }}</p>
      <p><b>TCEA:</b> {{ (tcea * 100).toFixed(4) }}%</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { obtenerSimulacion } from "@/services/simulacionesService.js";

import { VAN, TIR, CTC, TCEA } from "@/utils/Indicaciones";

const route = useRoute();
const id = route.params.id;

const simulacion = ref(null);
const van = ref(0);
const tir = ref(0);
const ctc = ref(0);
const tcea = ref(0);

onMounted(async () => {
  simulacion.value = await obtenerSimulacion(id);

  if (!simulacion.value) return;

  // =============================
  // Construcción de flujos de caja
  // =============================
  // Se considera:
  // Flujo 0 = desembolso del cliente (negativo)
  // Flujo t = pago mensual del cronograma

  const flujo0 = -simulacion.value.parametros.monto;
  const flujos = [flujo0, ...simulacion.value.tabla.map(f => f.cuota)];


  simulacion.value.tabla.forEach(f => {
  flujos.push(f.cuota);
  });

  // VAN usando TEM
  const tem = simulacion.value.resultados.tem;
  van.value = VAN(flujos, tem);

  // TIR mensual
  tir.value = TIR(flujos);

  // CTC
  ctc.value = CTC(simulacion.value.tabla);

  // TCEA anual
  tcea.value = TCEA(simulacion.value.parametros.monto, ctc.value);
});
</script>

