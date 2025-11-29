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

    <!-- 1. Añadimos el componente del modal -->
    <UnidadFormModal
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :unidad-data="currentUnidad"
      :is-loading="isSaving"
      @close="closeModal"
      @save="handleSave"
    />

    <h1>Unidades Inmobiliarias</h1>

    <!-- Panel de Filtros Avanzado -->
    <div class="filters-panel">
      <div class="filters-header">
        <h3>Filtrar Unidades</h3>
        <button @click="limpiarFiltros" class="clear-button">Limpiar Filtros</button>
      </div>
      <div class="filters-grid">
        <div class="form-group">
          <label>Proyecto</label>
          <input type="text" v-model="searchProyecto" placeholder="Nombre del proyecto" />
        </div>
        <div class="form-group">
          <label>Número de Unidad</label>
          <input type="text" v-model="searchNumero" placeholder="Ej: 101, A-203" />
        </div>
        <div class="form-group range-group">
          <label>Precio (S/)</label>
          <input type="number" v-model.number="searchPrecioMin" placeholder="Mínimo" />
          <input type="number" v-model.number="searchPrecioMax" placeholder="Máximo" />
        </div>
        <div class="form-group range-group">
          <label>Área (m²)</label>
          <input type="number" v-model.number="searchAreaMin" placeholder="Mínima" />
          <input type="number" v-model.number="searchAreaMax" placeholder="Máxima" />
        </div>
      </div>
    </div>
    <div class="toolbar">      
      <button @click="openModal()" class="add-button">Nueva Unidad</button>
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
            <td>S/ {{ u.precio_venta }}</td>
            <td class="actions-cell">
              <button @click="openInfoModal(u)" class="info-button">
                Ver
              </button>
              <button @click="openModal(u)" class="edit-button">
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

const unidades = ref([]);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const currentUnidad = ref(null);
const isLoading = ref(true); // Nuevo estado para la carga inicial

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
  isLoading.value = false; // Desactivar el estado de carga
});

const openModal = (unidad = null) => {
  isEditing.value = !!unidad; // Si hay 'unidad', estamos editando.
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
  unidades.value = await getUnidades(); // Recargar la lista de unidades
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
    unidades.value = await getUnidades(); // Recargar datos
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

// Lógica de filtro y paginación
const filteredUnidades = computed(() => {
  return unidades.value.filter(u => {
    const proyectoMatch = searchProyecto.value ? u.proyecto.toLowerCase().includes(searchProyecto.value.toLowerCase()) : true;
    const numeroMatch = searchNumero.value ? u.numero_unidad.toLowerCase().includes(searchNumero.value.toLowerCase()) : true;
    
    const precioMinMatch = searchPrecioMin.value ? u.precio_venta >= searchPrecioMin.value : true;
    const precioMaxMatch = searchPrecioMax.value ? u.precio_venta <= searchPrecioMax.value : true;

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
  currentPage.value = 1; // Resetear a la primera página al buscar
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

/* Estilos para el nuevo panel de filtros */
.filters-panel {
  background-color: var(--color-card-background);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filters-header h3 {
  margin: 0;
  color: var(--color-heading);
}

.clear-button {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.clear-button:hover {
  background-color: var(--color-background-soft);
  color: var(--color-text-primary);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 5px;
  background-color: var(--color-background-soft);
  color: var(--color-text-primary);
}

.range-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 0.5rem;
}

.range-group label {
  grid-column: 1 / -1; /* La etiqueta ocupa todo el ancho */
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
  padding: 1.25rem 1rem; /* Aumentamos el padding vertical */
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle; /* Centramos verticalmente el contenido */
}

tbody tr {
  transition: background-color 0.2s ease;
}

tbody tr:hover {
  background-color: var(--color-background-mute); /* Efecto hover sutil */
}

th {
  background-color: var(--color-background-soft);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase; /* Mayúsculas para los encabezados */
  font-size: 0.8rem; /* Tamaño de fuente más pequeño para el header */
  letter-spacing: 0.5px;
}

/* Estilo de filas alternadas (Zebra-striping) */
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
  background-color: #3580b2; /* Un tono más oscuro para el hover */
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
</style>
