<template>
  <div style="padding: 20px;">
    <h1>Detalle de Simulación</h1>

    <div v-if="!simulacion">Cargando...</div>

    <table border="1" v-if="simulacion && simulacion.tabla">
      <tr>
        <th>Mes</th>
        <th>Cuota</th>
        <th>Interés</th>
        <th>Amortización</th>
        <th>Saldo</th>
      </tr>

      <tr v-for="fila in simulacion.tabla" :key="fila.mes">
        <td>{{ fila.mes }}</td>
        <td>{{ fila.cuota.toFixed(2) }}</td>
        <td>{{ fila.interes.toFixed(2) }}</td>
        <td>{{ fila.amortizacion.toFixed(2) }}</td>
        <td>{{ fila.saldo.toFixed(2) }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { obtenerSimulacion } from "@/services/simulacionesService.js";
import { useRoute } from "vue-router";

const route = useRoute();
const id = route.params.id;
const simulacion = ref(null);

onMounted(async () => {
  simulacion.value = await obtenerSimulacion(id);
});
</script>
