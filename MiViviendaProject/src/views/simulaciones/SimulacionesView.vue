<template>
  <div style="padding: 20px;">
    <h1>Simulaciones</h1>

    <router-link to="/simulaciones/nueva">
      <button>Nueva Simulación</button>
    </router-link>

    <div v-if="simulaciones.length === 0">
      No hay simulaciones registradas.
    </div>

    <ul>
      <li v-for="sim in simulaciones" :key="sim.id">
        <router-link :to="'/simulaciones/' + sim.id">
          {{ sim.datos?.monto }} - {{ sim.datos?.años }} años
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { obtenerSimulaciones } from "@/services/simulacionesService.js";

const simulaciones = ref([]);

onMounted(async () => {
  simulaciones.value = await obtenerSimulaciones();
});
</script>
