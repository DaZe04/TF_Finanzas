<template>
  <div class="detalle-container" v-if="!isLoading">
    <div v-if="!simulacion" class="loading-state">Cargando...</div>

    <div v-else>
      <div class="header">
        <h1>{{ simulacion.parametros?.nombre || 'Detalle de Simulación' }}</h1>
        <button @click="$router.back()" class="btn-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Volver
        </button>
      </div>

      <!-- Panel de Análisis de Viabilidad -->
      <div v-if="cliente" class="viability-panel" :class="viabilityClass">
        <div class="viability-icon">
          <svg v-if="isClientApt" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <div class="viability-content">
          <h2 class="viability-title">{{ viabilityStatus.title }}</h2>
          <p class="viability-message">{{ viabilityStatus.message }}</p>
          <div class="viability-details">
            <span>Ingresos del Cliente: <strong>{{ formatCurrency(cliente.income, cliente.incomeCurrency) }}</strong></span>
            <span>Ingresos en PEN (para cálculo): <strong>S/ {{ formatPrice(clientIncomeInPEN) }}</strong></span>
            <span>Cuota Mensual Máxima: <strong>S/ {{ formatPrice(maxMonthlyPayment) }}</strong></span>
            <span>Cuota del Crédito: <strong>S/ {{ formatPrice(creditMonthlyPayment) }}</strong></span>
          </div>
        </div>
      </div>

      <div class="summary-panel">
        <div class="param-item" v-if="cliente">
          <label>Cliente</label>
          <span>{{ cliente.fullName }}</span>
        </div>
        <div class="param-item" v-if="unidad">
          <label>Proyecto Inmobiliario</label>
          <span>{{ unidad.proyecto }}</span>
        </div>
      </div>

      <!-- Panel de Parámetros -->
      <div class="summary-panel">
        <h2 class="panel-title">Parámetros Utilizados</h2>
        <div class="params-grid">
          <div class="param-item">
            <label>Monto del Crédito</label>
            <span>S/ {{ formatPrice(simulacion.parametros.monto) }}</span>
          </div>
          <div class="param-item" v-if="simulacion.parametros.primaInicial > 0">
            <label>Prima Inicial</label>
            <span>S/ {{ formatPrice(simulacion.parametros.primaInicial) }}</span>
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
import { obtenerSimulacion, getClientById, getUnidadById } from "@/services/simulacionesService.js";
import { useConfiguration } from "@/services/configService.js";
import { useRoute } from "vue-router";

const route = useRoute();
const id = route.params.id;
const simulacion = ref(null);
const cliente = ref(null);
const unidad = ref(null);
const isLoading = ref(true);
const appConfig = useConfiguration(); // Usamos la configuración reactiva

// --- Lógica de Viabilidad ---
const VIABILITY_THRESHOLD = 0.40; // 40% del ingreso mensual

const clientIncomeInPEN = computed(() => {
  if (!cliente.value) return 0;
  // Si los ingresos están en USD, los convertimos a PEN. Si no, los usamos directamente.
  if (cliente.value.incomeCurrency === 'USD') {
    const tipoCambio = appConfig.value?.tipoCambioDolar;
    if (tipoCambio && typeof tipoCambio === 'number' && tipoCambio > 0) {
      return cliente.value.income * tipoCambio;
    }
    // Si no hay tipo de cambio en la config, usamos uno por defecto y advertimos.
    console.warn("Tipo de cambio no configurado en Firestore. Usando valor por defecto (3.40) para el cálculo de viabilidad.");
    return cliente.value.income * 3.40; // Valor de respaldo
  }
  return cliente.value.income;
});

const isClientApt = computed(() => cliente.value && maxMonthlyPayment.value >= creditMonthlyPayment.value);

const maxMonthlyPayment = computed(() => clientIncomeInPEN.value * VIABILITY_THRESHOLD);

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

const creditMonthlyPayment = computed(() => {
  if (!simulacion.value?.tabla || simulacion.value.tabla.length === 0) return 0;
  // Usamos la cuota más alta del cronograma para el cálculo, por si hay periodos de gracia.
  return Math.max(...simulacion.value.tabla.map(fila => fila.cuota));
});

const viabilityStatus = computed(() => {
  if (!cliente.value) return {};
  if (isClientApt.value) {
    return {
      title: "Cliente Apto para el Crédito",
      message: "La cuota mensual del crédito se encuentra dentro del rango saludable respecto a los ingresos del cliente."
    };
  }
  return {
    title: "Cliente No Apto para el Crédito",
    message: "La cuota mensual del crédito supera el 40% de los ingresos declarados por el cliente, lo cual representa un riesgo financiero elevado."
  };
});

const viabilityClass = computed(() => {
  return isClientApt.value ? 'is-apt' : 'is-not-apt';
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

function formatCurrency(value, currency = 'PEN') {
  if (typeof value !== 'number') return value;
  const currencySymbol = currency === 'USD' ? 'USD' : 'PEN';
  const style = currency === 'USD' ? 'en-US' : 'es-PE';
  return new Intl.NumberFormat(style, { style: 'currency', currency: currencySymbol }).format(value);
}

onMounted(async () => {
  isLoading.value = true;
  simulacion.value = await obtenerSimulacion(id);

  if (simulacion.value && simulacion.value.parametros) {
    const { clienteId, unidadId } = simulacion.value.parametros;
    if (clienteId) {
      cliente.value = await getClientById(clienteId);
    }
    if (unidadId) {
      unidad.value = await getUnidadById(unidadId);
    }
  }

  isLoading.value = false;
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

/* Estilos para el panel de viabilidad */
.viability-panel {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid;
}

.viability-panel.is-apt {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
  color: #15803d;
}

.viability-panel.is-not-apt {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.viability-icon {
  flex-shrink: 0;
}

.viability-content {
  flex-grow: 1;
}

.viability-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.viability-message {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  opacity: 0.9;
}

.viability-details {
  display: flex;
  gap: 2rem;
  font-size: 0.875rem;
  padding-top: 1rem;
  border-top: 1px dashed;
  opacity: 0.8;
  flex-wrap: wrap;
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
