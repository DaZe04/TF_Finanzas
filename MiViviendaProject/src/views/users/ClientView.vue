<template>
  <div class="client-view">
    <ClientFormModal :is-open="isFormModalOpen" :is-editing="isEditing" :client-data="currentClient" :is-loading="isSaving" @close="closeFormModal" @save="handleSaveClient" />
    
    <ClientInfoModal :is-open="isInfoModalOpen" :client="currentClient" @close="closeInfoModal" />
    <ConfirmationModal :is-open="isDeleteModalOpen" title="Confirmar Eliminación" message="¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer." @confirm="confirmDeleteClient" @cancel="closeDeleteModal" />
    <AccessDeniedModal :is-open="isAccessDeniedModalOpen" @close="closeAccessDeniedModal" />


    <h1>Gestión de Clientes</h1>

    <!-- Botón para abrir el modal de nuevo cliente -->
    <button @click="openFormModal()" class="add-button">Agregar Nuevo Cliente</button>

    <!-- Filtros -->
    <div class="filter-container">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="Escribe para buscar..."
      />
      <CustomSelect v-model="filterType" :options="filterOptions" />
    </div>

    <!-- Tabla para mostrar los clientes -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>DNI</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Ingresos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedClients.length === 0">
            <td colspan="6" class="no-data">{{ clients.length === 0 ? 'No hay clientes para mostrar.' : 'No se encontraron clientes con ese criterio.' }}</td>
          </tr>
          <tr v-for="client in paginatedClients" :key="client.id">
            <td class="name-cell" :title="client.fullName">{{ client.fullName }}</td>
            <td>{{ client.dni }}</td>
            <td>{{ client.email }}</td>
            <td>{{ client.phone }}</td>
            <td>{{ formatCurrency(client.income) }}</td>
            <td>
              <button @click="openInfoModal(client)" class="info-button">Más Info.</button>
              <button @click="openFormModal(client)" class="edit-button">Editar</button>
              <button @click="openDeleteModal(client.id)" class="delete-button">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="pagination-container">
      <button @click="prevPage" :disabled="currentPage === 1" class="pagination-button">
        Anterior
      </button>
      <span class="pagination-info">Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-button">
        Siguiente
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { db, auth } from '@/firebase'; 
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore';
import ClientFormModal from '@/views/users/components/ClientFormModal.vue';
import ClientInfoModal from '@/views/users/components/ClientInfoModal.vue';
import ConfirmationModal from '@/views/users/components/ConfirmationModal.vue';
import AccessDeniedModal from '@/views/users/components/AccessDeniedModal.vue';
import CustomSelect from '@/views/users/components/CustomSelect.vue';

const clients = ref([]);
const currentClient = ref(null);
const clientToDeleteId = ref(null);
const isEditing = ref(false);
const isSaving = ref(false); // Estado para controlar el guardado
const userRole = ref(null); // Estado para guardar el rol del usuario

// Estados para controlar la visibilidad de cada modal
const isFormModalOpen = ref(false);
const isInfoModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isAccessDeniedModalOpen = ref(false);

// --- Lógica de Filtro ---
const searchQuery = ref('');
const filterType = ref('fullName'); // Filtro por defecto
const filterOptions = ref([
  { value: 'fullName', label: 'Nombre' },
  { value: 'dni', label: 'DNI' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Teléfono' },
]);

const filteredClients = computed(() => {
  if (!searchQuery.value.trim()) {
    return clients.value;
  }
  const query = searchQuery.value.toLowerCase().trim();
  return clients.value.filter(client => {
    const fieldValue = client[filterType.value] ? String(client[filterType.value]).toLowerCase() : '';
    return fieldValue.includes(query);
  });
});

// --- Lógica de Paginación ---
const currentPage = ref(1);
const itemsPerPage = ref(8); // Cambiado a 3 para pruebas

const totalPages = computed(() => {
  return Math.ceil(filteredClients.value.length / itemsPerPage.value);
});

const paginatedClients = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredClients.value.slice(startIndex, endIndex);
});

// Watcher para resetear la página cuando cambia el filtro
watch([searchQuery, filterType], () => {
  currentPage.value = 1;
});

// Referencia a la colección de Firestore
const clientsCollection = collection(db, 'clients');

const fetchClients = async () => {
  console.log("Obteniendo clientes desde la base de datos...");
  // Usamos onSnapshot para actualizaciones en tiempo real
  onSnapshot(clientsCollection, (querySnapshot) => {
    clients.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
};

onMounted(async () => {
  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      userRole.value = snap.data().accountType;
    }
  }

  fetchClients();
});

// --- Lógica para el Modal de Formulario (Crear/Editar) ---
const openFormModal = (client = null) => {
  if (client) {
    isEditing.value = true;
    currentClient.value = client;
  } else {
    isEditing.value = false;
    currentClient.value = null; // El modal de formulario se encargará de los datos iniciales
  }
  isFormModalOpen.value = true;
};

const closeFormModal = () => {
  isFormModalOpen.value = false;
  currentClient.value = null;
};

const handleSaveClient = async (clientData) => {
  isSaving.value = true;
  try {
    // Excluimos el 'id' del objeto a guardar, Firestore lo maneja.
    const { id, ...dataToSave } = clientData;

    if (isEditing.value) {
      const clientDocRef = doc(clientsCollection, id);
      await updateDoc(clientDocRef, dataToSave);
    } else {
      await addDoc(clientsCollection, dataToSave);
    }
    // No es necesario fetchClients() gracias a onSnapshot
    closeFormModal();
  } catch (error) {
    console.error("Error al guardar el cliente:", error);
    // Aquí podrías mostrar una notificación de error al usuario
  } finally {
    isSaving.value = false;
  }
};

// --- Lógica para el Modal de Información ---
const openInfoModal = (client) => {
  currentClient.value = client;
  isInfoModalOpen.value = true;
};

const closeInfoModal = () => {
  isInfoModalOpen.value = false;
  currentClient.value = null;
};

// --- Lógica para el Modal de Eliminación ---
const openDeleteModal = (clientId) => {
  if (userRole.value === 'administrador') {
    clientToDeleteId.value = clientId;
    isDeleteModalOpen.value = true;
  } else {
    // Si no es admin, muestra el modal de acceso denegado
    isAccessDeniedModalOpen.value = true;
  }
};

const closeAccessDeniedModal = () => {
  isAccessDeniedModalOpen.value = false;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  clientToDeleteId.value = null;
};

const confirmDeleteClient = async () => {
  const clientDocRef = doc(clientsCollection, clientToDeleteId.value);
  await deleteDoc(clientDocRef);
  closeDeleteModal();
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') return value;
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};
</script>

<style scoped>
.client-view {
  padding: 2rem;
  font-family: sans-serif;
}

.client-view h1 {
  color: var(--color-text-primary);
}

.add-button {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 1rem;
  padding: 10px;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 92, 153, 0.25);
}

.filter-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: var(--color-card-background);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-input, .filter-select {
  padding: 0.75rem;
  border: 2px solid #E5E7EB;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.search-input:focus, .filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 92, 153, 0.1);
}

.search-input {
  flex-grow: 1;
}

.table-container {
  overflow-x: auto;
  background-color: var(--color-card-background);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
}

tbody tr:hover {
  background-color: #f5f5f5;
}

.name-cell {
  max-width: 200px; /* Ajusta este valor según tu preferencia */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.no-data {
  text-align: center;
  color: #888;
  padding: 2rem;
}

.edit-button, .delete-button, .info-button {
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  color: white;
  cursor: pointer;
  margin-right: 5px;
  transition: all 0.2s ease-in-out;
}

.edit-button { background-color: var(--color-primary); } /* Azul */
.edit-button:hover { background-color: var(--color-primary-light); }
.delete-button { background-color: #f44336; } /* Rojo */
.delete-button:hover { background-color: #d32f2f; }
.info-button { background-color: var(--color-accent); } /* Naranja */
.info-button:hover { background-color: #fbc72c ; }

/* Estilos de Paginación */
.pagination-container {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.pagination-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background-color: var(--color-primary);
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: var(--color-primary-light);
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  font-weight: 500;
  color: var(--color-text-secondary);
}
</style>
