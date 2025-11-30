<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Buscar Unidad Inmobiliaria</h2>
        <button class="close-button" @click="closeModal" aria-label="Cerrar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Panel de Filtros -->
      <div class="filters-panel">
        <div class="filters-grid">
          <div class="input-group">
            <label for="search-proyecto">Proyecto</label>
            <input 
              id="search-proyecto"
              type="text" 
              v-model="searchProyecto" 
              placeholder="Buscar por nombre del proyecto" 
            />
          </div>
          <div class="input-group">
            <label for="search-numero">Número de Unidad</label>
            <input 
              id="search-numero"
              type="text" 
              v-model="searchNumero" 
              placeholder="Buscar por número" 
            />
          </div>
        </div>
        <div v-if="searchProyecto || searchNumero" class="results-info">
          {{ filteredUnidades.length }} {{ filteredUnidades.length === 1 ? 'resultado' : 'resultados' }}
        </div>
      </div>

      <!-- Lista de Resultados -->
      <div class="results-container">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando unidades...</p>
        </div>
        <ul v-else-if="filteredUnidades.length > 0" class="results-list">
          <li 
            v-for="unidad in filteredUnidades" 
            :key="unidad.id" 
            @click="selectUnidad(unidad)"
            class="result-item"
          >
            <div class="result-info">
              <strong class="project-name">{{ unidad.proyecto }}</strong>
              <span class="unit-number">Unidad N° {{ unidad.numero_unidad }}</span>
            </div>
            <div class="result-price">
              <span class="price-label">Precio</span>
              <span class="price-value">{{ formatCurrency(unidad.precio_venta, unidad.moneda) }}</span>
            </div>
          </li>
        </ul>
        <div v-else class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>No se encontraron unidades</p>
          <span>Intenta ajustar los filtros de búsqueda</span>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="closeModal">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getUnidades } from "@/services/unidadesService.js";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(['close', 'unidad-seleccionada']);

const unidades = ref([]);
const isLoading = ref(true);
const searchProyecto = ref('');
const searchNumero = ref('');

onMounted(async () => {
  unidades.value = await getUnidades();
  isLoading.value = false;
});

const filteredUnidades = computed(() => {
  if (!searchProyecto.value && !searchNumero.value) {
    return unidades.value;
  }
  return unidades.value.filter(u => {
    const proyectoMatch = searchProyecto.value ? u.proyecto.toLowerCase().includes(searchProyecto.value.toLowerCase()) : true;
    const numeroMatch = searchNumero.value ? u.numero_unidad.toLowerCase().includes(searchNumero.value.toLowerCase()) : true;
    return proyectoMatch && numeroMatch;
  });
});

function formatCurrency(value, currency = 'PEN') {
  if (typeof value !== 'number') return value;
  const currencySymbol = currency === 'USD' ? 'USD' : 'PEN';
  const style = currency === 'USD' ? 'en-US' : 'es-PE';
  return new Intl.NumberFormat(style, { style: 'currency', currency: currencySymbol }).format(value);
}

function selectUnidad(unidad) {
  emit('unidad-seleccionada', unidad);
}

function closeModal() {
  emit('close');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(31, 41, 55, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--color-card-background);
  padding: 0;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease-out;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.close-button {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

.filters-panel {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #E5E7EB;
  background-color: var(--color-background);
}

.filters-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.input-group input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1.5px solid #D1D5DB;
  border-radius: 6px;
  font-size: 0.9375rem;
  transition: all 0.2s;
  color: var(--color-text-primary);
  background-color: white;
  box-sizing: border-box; 
}

.input-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30, 111, 165, 0.1);
}

.input-group input::placeholder {
  color: #9CA3AF;
}

.results-info {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.results-container {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  min-height: 300px;
  max-height: 400px;
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  padding: 1rem 1.5rem;
  border: 1.5px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
  background-color: white;
}

.result-item:hover {
  border-color: var(--color-primary);
  background-color: rgba(30, 111, 165, 0.02);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.result-item:active {
  transform: translateY(0);
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.project-name {
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.unit-number {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.result-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.price-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.price-value {
  color: var(--color-primary);
  font-size: 1.125rem;
  font-weight: 700;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-background);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  gap: 0.75rem;
}

.empty-state svg {
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.empty-state p {
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.empty-state span {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.modal-actions {
  padding: 1.5rem 2rem;
  border-top: 1px solid #E5E7EB;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  background-color: white;
}

.btn-cancel {
  padding: 0.625rem 1.25rem;
  border: 1.5px solid #D1D5DB;
  background-color: white;
  color: var(--color-text-primary);
  border-radius: 6px;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: var(--color-background);
  border-color: var(--color-text-secondary);
}

.btn-cancel:active {
  transform: scale(0.98);
}

/* Scrollbar personalizado */
.results-container::-webkit-scrollbar {
  width: 8px;
}

.results-container::-webkit-scrollbar-track {
  background: var(--color-background);
  border-radius: 4px;
}

.results-container::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 4px;
}

.results-container::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

@media (max-width: 640px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .result-price {
    align-items: flex-start;
  }
}
</style>