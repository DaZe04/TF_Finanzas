<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="() => handleClose()">
    <div class="modal-content">
      <h2>{{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
      <form @submit.prevent="handleSave">
        <div class="form-grid">
          <div class="form-group">
            <label for="fullName">Nombre Completo</label>
            <input id="fullName" v-model="editableClient.fullName" type="text" required />
            <span v-if="errors.fullName" class="error-message">{{ errors.fullName }}</span>
          </div>
          <div class="form-group">
            <label for="dni">DNI</label>
            <input id="dni" v-model="editableClient.dni" type="text" required />
            <span v-if="errors.dni" class="error-message">{{ errors.dni }}</span>
          </div>
          <div class="form-group">
            <label for="maritalStatus">Estado Civil</label>
            <select id="maritalStatus" v-model="editableClient.maritalStatus">
              <option value="Soltero/a">Soltero/a</option>
              <option value="Casado/a">Casado/a</option>
              <option value="Divorciado/a">Divorciado/a</option>
              <option value="Viudo/a">Viudo/a</option>
            </select>
          </div>
          <div class="form-group income-group">
            <label for="income">Ingresos (Mensuales)</label>
            <div class="input-with-select">
              <input id="income" v-model.number="editableClient.income" type="number" step="0.01" required />
              <select v-model="editableClient.incomeCurrency">
                <option value="PEN">S/</option>
                <option value="USD">$</option>
              </select>
            </div>
            <span v-if="errors.income" class="error-message">{{ errors.income }}</span>
          </div>
          <div class="form-group">
            <label for="dependents">Dependientes</label>
            <input id="dependents" v-model.number="editableClient.dependents" type="number" />
            <span v-if="errors.dependents" class="error-message">{{ errors.dependents }}</span>
          </div>
          <div class="form-group">
            <label for="occupation">Trabajo / Ocupación</label>
            <input id="occupation" v-model="editableClient.occupation" type="text" />
            <span v-if="errors.occupation" class="error-message">{{ errors.occupation }}</span>
          </div>
          <div class="form-group">
            <label for="phone">Teléfono</label>
            <input id="phone" v-model="editableClient.phone" type="tel" required />
            <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" v-model="editableClient.email" type="email" required />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>
          <div class="form-group">
            <label for="familyDependents">Carga Familiar</label>
            <input id="familyDependents" v-model.number="editableClient.familyDependents" type="number" />
          </div>
          <div class="form-group">
            <label for="incomeStatement">Declaración de Ingresos</label>
            <input id="incomeStatement" v-model="editableClient.incomeStatement" type="text" placeholder="URL o referencia al documento" />
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="() => handleClose()" class="cancel-button" :disabled="isLoading">Cancelar</button>
          <button type="submit" class="save-button" :disabled="isLoading">{{ isLoading ? 'Guardando...' : 'Guardar' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const props = defineProps({
  isOpen: Boolean,
  clientData: Object,
  isEditing: Boolean,
  isLoading: Boolean,
});

const emit = defineEmits(['close', 'save']);

const initialErrors = {
  fullName: '',
  dni: '',
  income: '',
  dependents: '',
  occupation: '',
  phone: '',
  email: '',
};

const errors = ref({ ...initialErrors });

const getInitialData = () => ({
  fullName: '',
  dni: '',
  maritalStatus: 'Soltero/a',
  income: 0,
  incomeCurrency: 'PEN', // Moneda por defecto
  dependents: 0,
  occupation: '',
  phone: '',
  email: '',
  familyDependents: 0,
  incomeStatement: '',
});

const editableClient = ref(getInitialData());

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    // Resetear errores al abrir el modal
    errors.value = { ...initialErrors };
    editableClient.value = props.isEditing && props.clientData
      ? { ...props.clientData }
      : getInitialData();
  }
});

const handleClose = (force = false) => {
  // Si está cargando, no permitir cerrar, a menos que se fuerce
  if (props.isLoading && !force) return;
  emit('close');
};

const validateForm = async () => {
  errors.value = { ...initialErrors };
  let isValid = true;
  const client = editableClient.value;

  // DNI: 8 dígitos numéricos
  if (!/^\d{8}$/.test(client.dni)) {
    errors.value.dni = 'El DNI debe contener exactamente 8 dígitos numéricos.';
    isValid = false;
  } else {
    // --- INICIO DE LA VALIDACIÓN DE DNI ÚNICO ---
    // 1. Creamos una consulta para buscar en la colección 'clients'
    //    un documento que tenga el mismo DNI.
    const q = query(collection(db, "clients"), where("dni", "==", client.dni));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Si la consulta no está vacía, significa que ya existe un cliente con ese DNI.
      if (props.isEditing) {
        // Si estamos editando, debemos asegurarnos de que el DNI encontrado
        // no pertenezca a un cliente DIFERENTE.
        const foundClientId = querySnapshot.docs[0].id;
        if (foundClientId !== client.id) {
          errors.value.dni = "Este DNI ya está registrado para otro cliente.";
          isValid = false;
        }
      } else {
        // Si estamos creando un nuevo cliente, cualquier coincidencia es un error.
        errors.value.dni = "Este DNI ya está registrado.";
        isValid = false;
      }
    }
    // --- FIN DE LA VALIDACIÓN ---
  }

  // Ocupación: Solo texto y espacios
  if (client.occupation && !/^[a-zA-Z\s]+$/.test(client.occupation)) {
    errors.value.occupation = 'La ocupación solo debe contener letras y espacios.';
    isValid = false;
  }

  // Teléfono: Solo números
  if (!/^\d+$/.test(client.phone)) {
    errors.value.phone = 'El teléfono solo debe contener números.';
    isValid = false;
  }

  // Validaciones básicas de campos requeridos (aunque HTML5 ya ayuda)
  if (!client.fullName.trim()) {
    errors.value.fullName = 'El nombre es obligatorio.';
    isValid = false;
  }
  if (!client.email.trim()) {
    errors.value.email = 'El email es obligatorio.';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
    errors.value.email = 'El formato del email no es válido.';
    isValid = false;
  }

  return isValid;
};

const handleSave = async () => {
  // La función de validación ahora es asíncrona
  if (await validateForm()) {
    emit('save', editableClient.value);
  }
};
</script>

<style scoped src="@/views/users/assets/modal-styles.css"></style>
<style scoped>
.error-message {
  color: var(--color-error);
  font-size: 0.8rem;
  margin-top: 4px;
}

.income-group .input-with-select {
  display: flex;
}

.income-group input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  flex-grow: 1;
}

.income-group select {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 0;
  background-color: #f8f9fa;
}
</style>
