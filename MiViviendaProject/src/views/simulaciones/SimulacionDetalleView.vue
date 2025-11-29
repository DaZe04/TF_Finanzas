<template>
  <div class="detalle-container">
    <div v-if="!simulacion" class="loading-state">Cargando...</div>

    <div v-else>
      <div class="header">
        <h1>{{ simulacion.parametros?.nombre || 'Detalle de Simulación' }}</h1>
        <button @click="$router.back()" class="btn-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Volver
        </button>
      </div>

      <!-- Panel de Parámetros -->
      <div class="summary-panel">
        <h2 class="panel-title">Parámetros Utilizados</h2>
        <div class="params-grid">
          <div class="param-item">
            <label>Monto del Crédito</label>
            <span>S/ {{ formatPrice(simulacion.parametros.monto) }}</span>
          </div>
          <div class="param-item">
            <label>Plazo</label>
            <span>{{ simulacion.parametros.años }} años</span>
          </div>
          <div class="param-item">
            <label>Tasa de Interés</label>
            <span>{{ simulacion.parametros.tasa }}% ({{ simulacion.parametros.tipoTasa }})</span>
          </div>
          <div class="param-item" v-if="simulacion.parametros.tipoTasa === 'Nominal'">
            <label>Capitalización</label>
            <span>{{ simulacion.parametros.capitalizacion }}</span>
          </div>
          <div class="param-item">
            <label>Periodo de Gracia</label>
            <span>{{ simulacion.parametros.gracia }}</span>
          </div>
          <div class="param-item">
            <label>Seguro de Desgravamen</label>
            <span>{{ (simulacion.parametros.seguroDesgravamen * 100).toFixed(4) }}% mensual</span>
          </div>
          <div class="param-item" v-if="simulacion.parametros.seguroInmueble > 0">
            <label>Seguro de Inmueble</label>
            <span>{{ (simulacion.parametros.seguroInmueble * 100).toFixed(4) }}% mensual</span>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Cuota (Total)</th>
              <th>Cuota Base</th>
              <th>Seguros</th>
              <th>Interés</th>
              <th>Amortización</th>
              <th>Saldo Inicial</th>
              <th>Saldo Final</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fila in paginatedTabla" :key="fila.mes">
              <td>{{ fila.mes }}</td>
              <td>{{ fila.cuota.toFixed(2) }}</td>
              <td>{{ (fila.cuotaSinSeguros ?? fila.cuotaBase ?? 0).toFixed(2) }}</td>
              <td>{{ (fila.seguros ?? 0).toFixed(2) }}</td>
              <td>{{ fila.interes.toFixed(2) }}</td>
              <td>{{ fila.amortizacion.toFixed(2) }}</td>
              <td>{{ fila.saldoInicial.toFixed(2) }}</td>
              <td>{{ fila.saldoFinal.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Controles de Paginación -->
      <div class="pagination-controls" v-if="totalPages > 1">
        <button @click="prevPage" :disabled="currentPage === 1">Anterior</button>
        <span>Página {{ currentPage }} de {{ totalPages }} (Año {{ Math.ceil(currentPage) }})</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Siguiente</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { obtenerSimulacion } from "@/services/simulacionesService.js";
import { useRoute } from "vue-router";

const route = useRoute();
const id = route.params.id;
const simulacion = ref(null);

// --- Lógica de Paginación ---
const currentPage = ref(1);
const itemsPerPage = 12; // Mostraremos 12 meses (1 año) por página

const totalPages = computed(() => {
  if (!simulacion.value || !simulacion.value.tabla) return 0;
  return Math.ceil(simulacion.value.tabla.length / itemsPerPage);
});

const paginatedTabla = computed(() => {
  if (!simulacion.value || !simulacion.value.tabla) return [];
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return simulacion.value.tabla.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

function formatPrice(price) {
  if (typeof price !== 'number') return '0.00';
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

onMounted(async () => {
  simulacion.value = await obtenerSimulacion(id);
});
</script>

<style scoped>
.detalle-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header h1 {
  margin: 0;
  color: var(--color-text-primary);
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-primary);
  background-color: var(--color-card-background);
  color: var(--color-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all .2s ease-in
  /* Estilos adicionales similares a otros botones de la app */
}

.btn-back:hover {
  background-color: var(--color-primary);
  color: #fff;
}

.table-container {
  overflow-x: auto;
  background-color: var(--color-card-background);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* Estilos para el nuevo panel de resumen */
.summary-panel {
  background-color: var(--color-card-background);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.panel-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.param-item label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.param-item span {
  font-size: 1rem;
  color: var(--color-text-primary);
  font-weight: 600;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
  white-space: nowrap;
}

th {
  background-color: var(--color-background-soft);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-size: 0.8rem;
}

tbody tr:hover {
  background-color: var(--color-background-mute);
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  color: var(--color-text-secondary);
}

.pagination-controls button {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  background-color: var(--color-card-background);
  border-radius: 5px;
  cursor: pointer;
  color: var(--color-text-primary);
  transition: all 0.2s;
}

.pagination-controls button:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.pagination-controls button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
