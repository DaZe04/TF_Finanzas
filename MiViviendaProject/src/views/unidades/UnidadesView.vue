<template>
  <div class="container">
    <!-- Modal para ver detalles de la unidad -->
    <UnidadInfoModal
      :is-open="isInfoModalOpen"
      :unidad="currentUnidad"
      @close="closeInfoModal"
    />

    <!-- Modal de Acceso Denegado -->
    <AccessDeniedModal
      :is-open="isAccessDeniedModalOpen"
      @close="closeAccessDeniedModal"
    />

    <!-- Modal de confirmación para eliminar -->
    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Confirmar Eliminación"
      message="¿Estás seguro de que deseas eliminar esta unidad? Esta acción no se puede deshacer."
      @close="closeDeleteModal"
      @confirm="handleDeleteConfirm"
    />

    <!-- Añadimos el componente del modal -->
    <UnidadFormModal
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :unidad-data="currentUnidad"
      :is-loading="isSaving"
      @close="closeModal"
      @save="handleSave"
    />

    <h1>Unidades Inmobiliarias</h1>

    <!-- Panel de Filtros Mejorado -->
    <div class="filters-panel">
      <div class="filters-header">
        <div class="filters-title">
          <div class="icon-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
            </svg>
          </div>
          <div>
            <h3>Filtrar Unidades</h3>
            <p class="subtitle">Encuentra la unidad perfecta</p>
          </div>
        </div>
        <button @click="limpiarFiltros" class="clear-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
          Limpiar filtros
        </button>
      </div>
      
      <div class="filters-grid">
        <div class="form-group">
          <label>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            Proyecto
          </label>
          <div class="input-wrapper">
            <input 
              type="text" 
              v-model="searchProyecto" 
              placeholder="Buscar proyecto..." 
            />
            <svg v-if="searchProyecto" @click="searchProyecto = ''" class="clear-input" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          </div>
        </div>

        <div class="form-group">
          <label>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 3v18M3 9h18M3 15h18M15 3v18"/>
            </svg>
            Número de Unidad
          </label>
          <div class="input-wrapper">
            <input 
              type="text" 
              v-model="searchNumero" 
              placeholder="Ej: 101, 202..." 
            />
            <svg v-if="searchNumero" @click="searchNumero = ''" class="clear-input" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          </div>
        </div>

        <div class="form-group range-group">
          <label>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
            Rango de Precio (S/)
          </label>
          <div class="range-inputs">
            <div class="input-wrapper">
              <span class="input-prefix">Min</span>
              <input 
                type="number" 
                v-model.number="searchPrecioMin" 
                placeholder="0" 
              />
            </div>
            <div class="range-separator">—</div>
            <div class="input-wrapper">
              <span class="input-prefix">Max</span>
              <input 
                type="number" 
                v-model.number="searchPrecioMax" 
                placeholder="∞" 
              />
            </div>
          </div>
        </div>

        <div class="form-group range-group">
          <label>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
            Rango de Área (m²)
          </label>
          <div class="range-inputs">
            <div class="input-wrapper">
              <span class="input-prefix">Min</span>
              <input 
                type="number" 
                v-model.number="searchAreaMin" 
                placeholder="0" 
              />
            </div>
            <div class="range-separator">—</div>
            <div class="input-wrapper">
              <span class="input-prefix">Max</span>
              <input 
                type="number" 
                v-model.number="searchAreaMax" 
                placeholder="∞" 
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Indicador de filtros activos -->
      <div class="active-filters" v-if="hasActiveFilters">
        <span class="filter-count">
          {{ activeFiltersCount }} filtro{{ activeFiltersCount > 1 ? 's' : '' }} activo{{ activeFiltersCount > 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <div class="toolbar">      
      <!-- Mostrar botón solo si el usuario es administrador -->
      <button v-if="userRole === 'administrador'" @click="openModal()" class="add-button">Nueva Unidad</button>
    </div>

    <!-- Indicador de Carga -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando inmobiliarias...</p>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Número</th>
            <th>Área construida</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="paginatedUnidades.length === 0">
            <td colspan="5" class="no-data">No hay unidades para mostrar.</td>
          </tr>
          <tr v-for="u in paginatedUnidades" :key="u.id">
            <td>{{ u.proyecto }}</td>
            <td>{{ u.numero_unidad }}</td>
            <td>{{ u.area_construida }} m²</td>
            <td>{{ formatCurrency(u.precio_venta, u.moneda) }}</td>
            <td class="actions-cell">
              <button @click="openInfoModal(u)" class="info-button">
                Ver
              </button>
              <!-- Mostrar botón solo si el usuario es administrador -->
              <button v-if="userRole === 'administrador'" @click="openModal(u)" class="edit-button">
                Editar
              </button>
              <button @click="openDeleteModal(u)" class="delete-button">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Controles de Paginación -->
    <div class="pagination-controls" v-if="!isLoading && totalPages > 1">
      <button @click="prevPage" :disabled="currentPage === 1">Anterior</button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Siguiente</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { getUnidades, crearUnidad, actualizarUnidad, deleteUnidad } from "@/services/unidadesService.js";
import UnidadFormModal from './components/UnidadNuevaView.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import AccessDeniedModal from '@/components/AccessDeniedModal.vue';
import UnidadInfoModal from './components/UnidadInfoModal.vue';
import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useConfiguration } from "@/services/configService.js";

const unidades = ref([]);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const currentUnidad = ref(null);
const isLoading = ref(true);

// Estado para el modal de eliminación
const isDeleteModalOpen = ref(false);
const isAccessDeniedModalOpen = ref(false);
const isInfoModalOpen = ref(false);
const unidadToDelete = ref(null);
const userRole = ref(null);

// --- Estados para los filtros de búsqueda ---
const searchProyecto = ref('');
const searchNumero = ref('');
const searchPrecioMin = ref(null);
const searchPrecioMax = ref(null);
const searchAreaMin = ref(null);
const searchAreaMax = ref(null);

// Estado para la paginación
const currentPage = ref(1);
const itemsPerPage = 8;

// Usamos la configuración reactiva para obtener el tipo de cambio
const appConfig = useConfiguration();

onMounted(async () => {
  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      userRole.value = snap.data().accountType;
    }
  }
  unidades.value = await getUnidades();
  isLoading.value = false;
});

const openModal = (unidad = null) => {
  isEditing.value = !!unidad;
  currentUnidad.value = unidad ? { ...unidad } : null;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSave = async (unidadData) => {
  isSaving.value = true;
  const { id, ...dataToSave } = unidadData;
  if (isEditing.value) {
    await actualizarUnidad(id, dataToSave);
  } else {
    await crearUnidad(dataToSave);
  }
  unidades.value = await getUnidades();
  isSaving.value = false;
  closeModal();
};

// Lógica para el modal de información
const openInfoModal = (unidad) => {
  currentUnidad.value = unidad;
  isInfoModalOpen.value = true;
};

const closeInfoModal = () => {
  isInfoModalOpen.value = false;
};

// Lógica para el modal de eliminación
const openDeleteModal = (unidad) => {
  if (userRole.value === 'administrador') {
    unidadToDelete.value = unidad;
    isDeleteModalOpen.value = true;
  } else {
    isAccessDeniedModalOpen.value = true;
  }
};

const closeAccessDeniedModal = () => {
  isAccessDeniedModalOpen.value = false;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  unidadToDelete.value = null;
};

const handleDeleteConfirm = async () => {
  if (unidadToDelete.value) {
    await deleteUnidad(unidadToDelete.value.id);
    unidades.value = await getUnidades();
    closeDeleteModal();
  }
};

// Función para limpiar todos los filtros
const limpiarFiltros = () => {
  searchProyecto.value = '';
  searchNumero.value = '';
  searchPrecioMin.value = null;
  searchPrecioMax.value = null;
  searchAreaMin.value = null;
  searchAreaMax.value = null;
};

// Computed para verificar si hay filtros activos
const hasActiveFilters = computed(() => {
  return searchProyecto.value || searchNumero.value || 
         searchPrecioMin.value || searchPrecioMax.value ||
         searchAreaMin.value || searchAreaMax.value;
});

// Computed para contar filtros activos
const activeFiltersCount = computed(() => {
  let count = 0;
  if (searchProyecto.value) count++;
  if (searchNumero.value) count++;
  if (searchPrecioMin.value || searchPrecioMax.value) count++;
  if (searchAreaMin.value || searchAreaMax.value) count++;
  return count;
});

// Lógica de filtro y paginación
const filteredUnidades = computed(() => {
  return unidades.value.filter(u => {
    const proyectoMatch = searchProyecto.value ? u.proyecto.toLowerCase().includes(searchProyecto.value.toLowerCase()) : true;
    const numeroMatch = searchNumero.value ? u.numero_unidad.toString().toLowerCase().includes(searchNumero.value.toLowerCase()) : true;

    // --- LÓGICA DE FILTRO DE PRECIO MEJORADA ---
    // 1. Obtenemos el precio de la unidad en PEN, sin importar su moneda original.
    let precioEnPEN = u.precio_venta;
    if (u.moneda === 'USD') {
      const tipoCambio = appConfig.value?.tipoCambioDolar || 3.40; // Usar valor de respaldo si no está disponible
      precioEnPEN = u.precio_venta * tipoCambio;
    }

    // 2. Comparamos el precio en PEN con los filtros.
    const precioMinMatch = (searchPrecioMin.value !== null && searchPrecioMin.value > 0) ? precioEnPEN >= searchPrecioMin.value : true;
    const precioMaxMatch = (searchPrecioMax.value !== null && searchPrecioMax.value > 0) ? precioEnPEN <= searchPrecioMax.value : true;

    const areaMinMatch = searchAreaMin.value ? u.area_construida >= searchAreaMin.value : true;
    const areaMaxMatch = searchAreaMax.value ? u.area_construida <= searchAreaMax.value : true;
    
    return proyectoMatch && numeroMatch && precioMinMatch && precioMaxMatch && areaMinMatch && areaMaxMatch;
  });
});

watch([
  searchProyecto,
  searchNumero,
  searchPrecioMin,
  searchPrecioMax,
  searchAreaMin,
  searchAreaMax
], () => {
  currentPage.value = 1;
});

// Lógica de paginación
const totalPages = computed(() => {
  return Math.ceil(filteredUnidades.value.length / itemsPerPage);
});

const paginatedUnidades = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUnidades.value.slice(start, end);
});

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

const formatCurrency = (value, currency = 'PEN') => {
  if (typeof value !== 'number') return value;
  const currencySymbol = currency === 'USD' ? 'USD' : 'PEN';
  const style = currency === 'USD' ? 'en-US' : 'es-PE';
  return new Intl.NumberFormat(style, { style: 'currency', currency: currencySymbol }).format(value);
};
</script>

<style scoped>
.container {
  padding: 1.5rem;
  background-color: var(--color-background-soft);
  border-radius: 8px;
}

h1 {
  color: var(--color-heading);
  margin-bottom: 1.5rem;
}

.toolbar {
  margin-bottom: 1.5rem;
}

.add-button {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  padding: 10px;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 92, 153, 0.25);
}

/* Panel de Filtros Mejorado */
.filters-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafb 100%);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(30, 111, 165, 0.1);
  transition: all 0.3s ease;
}

.filters-panel:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(30, 111, 165, 0.1);
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #2d8fc7 100%);
  border-radius: 10px;
  color: white;
  box-shadow: 0 4px 12px rgba(30, 111, 165, 0.25);
}

.filters-title h3 {
  margin: 0;
  color: var(--color-heading);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.subtitle {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 400;
}

.clear-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: white;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.clear-button:hover {
  background-color: #fee;
  border-color: #e74c3c;
  color: #e74c3c;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.15);
}

.clear-button svg {
  transition: transform 0.2s;
}

.clear-button:hover svg {
  transform: rotate(15deg);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group label svg {
  color: var(--color-primary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  padding: 10px 14px;
  padding-right: 36px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background-color: white;
  color: var(--color-text-primary);
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(30, 111, 165, 0.1);
  transform: translateY(-1px);
}

.input-wrapper input::placeholder {
  color: #b0b0b0;
}

.clear-input {
  position: absolute;
  right: 10px;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
}

.clear-input:hover {
  color: #e74c3c;
  transform: scale(1.1);
}

.range-group .range-inputs {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.range-separator {
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 1.1rem;
}

.input-prefix {
  position: absolute;
  left: 14px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  pointer-events: none;
}

.range-inputs .input-wrapper input {
  padding-left: 44px;
}

/* Indicador de filtros activos */
.active-filters {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-count {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, #2d8fc7 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(30, 111, 165, 0.2);
}

.table-container {
  overflow-x: auto;
  background-color: var(--color-card-background);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

tbody tr {
  transition: background-color 0.2s ease;
}

tbody tr:hover {
  background-color: var(--color-background-mute);
}

th {
  background-color: var(--color-background-soft);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

tbody tr:nth-child(even) {
  background-color: var(--color-background-soft);
}

tbody tr:nth-child(even):hover {
  background-color: var(--color-background-mute);
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.edit-button {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-button:hover {
  background-color: var(--color-primary);
  color: white;
}

.info-button {
  background-color: transparent;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.info-button:hover {
  background-color: var(--color-accent);
  color: white;
}

.delete-button {
  background-color: transparent;
  border: 1px solid rgb(215, 30, 30);
  color: rgb(215, 30, 30);
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-button:hover {
  background-color: rgb(215, 30, 30);
  color: white;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  color: #333333
}

.pagination-controls button {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  background-color: var(--color-card-background);
  border-radius: 5px;
  cursor: pointer;
  color: white;
  background-color: var(--color-primary);
}

.pagination-controls button:hover {
  background-color: #3580b2;
}

.pagination-controls button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Estilos para el contenedor de carga */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  gap: 1rem;
  color: var(--color-text-secondary);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 92, 153, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filters-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .clear-button {
    justify-content: center;
  }
}
</style>