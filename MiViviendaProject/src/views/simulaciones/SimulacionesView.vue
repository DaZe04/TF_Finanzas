<template>
  <div class="simulaciones-container">
    <!-- Modal de confirmación para eliminar -->
    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Confirmar Eliminación"
      message="¿Estás seguro de que deseas eliminar esta simulación? Esta acción no se puede deshacer."
      @close="closeDeleteModal"
      @confirm="handleDeleteConfirm"
    />

    <div class="header">
      <h1>Simulaciones</h1>
      <router-link to="/app/simulador/nueva">
        <button class="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nueva Simulación
        </button>
      </router-link>
    </div>

    <!-- 2. Indicador de Carga -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando simulaciones...</p>
    </div>

    <div v-else-if="!isLoading && simulaciones.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M9 2v4m6-4v4M4 8h16M3 10h18a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1v-9a1 1 0 011-1z"/>
      </svg>
      <p>No hay simulaciones registradas</p>
      <span>Crea tu primera simulación para comenzar</span>
    </div>

    <!-- Nueva Vista de Tabla -->
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre Simulación</th>
            <th>Monto Crédito</th>
            <th>Plazo</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sim in simulaciones" :key="sim.id">
            <td>{{ sim.parametros?.nombre || 'Sin nombre' }}</td>
            <td>S/ {{ formatAmount(sim.parametros?.monto) }}</td>
            <td>{{ sim.parametros?.años }} años</td>
            <td>{{ formatDate(sim.fechaCreacion) }}</td>
            <td class="actions-cell">
              <button @click="navigateToDetail(sim.id)" class="action-button view-button">Ver</button>
              <button @click="navigateToEdit(sim.id)" class="action-button edit-button">Editar</button>
              <button @click="openDeleteModal(sim.id)" class="action-button delete-button">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { db } from "@/firebase";
import { collection, getDocs, doc, deleteDoc, orderBy, query } from "firebase/firestore";
import ConfirmationModal from '@/components/ConfirmationModal.vue';

const simulaciones = ref([]);
const router = useRouter();
const isLoading = ref(true); // Estado para la carga inicial

// Estados para el modal de eliminación
const isDeleteModalOpen = ref(false);
const simulacionToDeleteId = ref(null);

onMounted(async () => {
  isLoading.value = true;
  // Obtenemos las simulaciones directamente desde Firestore, ordenadas por fecha
  const q = query(collection(db, "simulaciones"), orderBy("fechaCreacion", "desc"));
  const querySnapshot = await getDocs(q);
  simulaciones.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  isLoading.value = false;
});

const openDeleteModal = (id) => {
  simulacionToDeleteId.value = id;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  simulacionToDeleteId.value = null;
};

const handleDeleteConfirm = async () => {
  if (simulacionToDeleteId.value) {
    // Eliminamos el documento directamente desde Firestore
    const docRef = doc(db, "simulaciones", simulacionToDeleteId.value);
    await deleteDoc(docRef);
    // Actualizamos la lista localmente para reflejar el cambio al instante
    simulaciones.value = simulaciones.value.filter(sim => sim.id !== simulacionToDeleteId.value);
    closeDeleteModal();
  }
};

const navigateToDetail = (id) => {
  router.push(`/app/simulador/${id}`);
};

const navigateToEdit = (id) => {
  // Navegamos a la misma vista de "nueva simulación" pero pasamos el ID como parámetro
  router.push(`/app/simulador/nueva?edit=${id}`);
};

function formatAmount(amount) {
  return new Intl.NumberFormat('es-PE').format(amount);
}

function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) {
    return 'Fecha no disponible';
  }
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}
</script>

<style scoped>
/* Estilos para el contenedor de carga (copiados de otras vistas para consistencia) */
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

@keyframes spin { to { transform: rotate(360deg); } }

.simulaciones-container {
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
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(30, 111, 165, 0.2);
}

.header a {
  text-decoration: none; /* Añade esto */
}

.btn-primary:hover {
  background-color: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(30, 111, 165, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  gap: 0.75rem;
  background-color: var(--color-card-background);
  border-radius: 12px;
  border: 2px dashed #D1D5DB;
  margin-top: 2rem;
}

.empty-state svg {
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.empty-state p {
  color: var(--color-text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.empty-state span {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

/* Estilos para la nueva tabla */
.table-container {
  overflow-x: auto;
  background-color: var(--color-card-background);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

th {
  background-color: var(--color-background-soft);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

tbody tr {
  transition: background-color 0.2s ease;
}

tbody tr:hover {
  background-color: var(--color-background-mute);
}

.actions-cell {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.view-button {
  background-color: var(--color-primary);
}
.view-button:hover {
  background-color: var(--color-primary-light);
}

.edit-button {
  background-color: var(--color-accent);
}

.edit-button:hover {
  background-color: #fbc72c;
}

.delete-button {
  background-color: var(--color-error);
}
.delete-button:hover {
  background-color: #e74c3c;
}

@media (max-width: 768px) {
  .simulaciones-container {
    padding: 1.5rem;
  }

  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .header h1 {
    font-size: 1.75rem;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .simulaciones-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .simulaciones-container {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }
}
</style>