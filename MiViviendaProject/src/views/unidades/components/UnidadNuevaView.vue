<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="() => handleClose()">
    <div class="modal-content">
      <h2>{{ isEditing ? 'Editar Unidad' : 'Nueva Unidad' }}</h2>
      <form @submit.prevent="handleSave">
        <div class="form-grid">
          <div class="form-group">
            <label>Proyecto</label>
            <input v-model="form.proyecto" required />
          </div>
          <div class="form-group">
            <label>Torre</label>
            <input v-model="form.torre" />
          </div>
          <div class="form-group">
            <label>Piso</label>
            <input v-model.number="form.piso" type="number" />
          </div>
          <div class="form-group">
            <label>Número</label>
            <input v-model="form.numero_unidad" required />
          </div>
          <div class="form-group">
            <label for="area_construida">Área construida (m²)</label>
            <input v-model.number="form.area_construida" type="number" required />
          </div>
          <div class="form-group">
            <label for="area_ocupada">Área ocupada (m²)</label>
            <input v-model.number="form.area_ocupada" type="number" />
          </div>
          <div class="form-group currency-group">
            <label for="precio_venta">Precio de Venta</label>
            <div class="input-with-select">
              <input id="precio_venta" v-model.number="form.precio_venta" type="number" step="0.01" required />
              <select v-model="form.moneda">
                <option value="PEN">S/</option>
                <option value="USD">$</option>
              </select>
            </div>
          </div>
          <div class="form-group currency-group">
            <label for="prima_minima">Prima Mínima</label>
            <div class="input-with-prefix">
              <span class="prefix">{{ form.moneda === 'USD' ? '$' : 'S/' }}</span>
              <input id="prima_minima" v-model.number="form.prima_minima" type="number" step="0.01" />
            </div>
          </div>
          <div class="form-group full-width">
            <label>Ubicación</label>
            <input v-model="form.ubicacion" />
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
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  isEditing: Boolean,
  unidadData: Object,
  isLoading: Boolean,
});

const emit = defineEmits(['close', 'save']);

const getInitialData = () => ({
  proyecto: '',
  torre: '',
  piso: null,
  numero_unidad: '',
  area_construida: 0,
  area_ocupada: 0,
  precio_venta: 0,
  moneda: 'PEN', // Moneda por defecto para precio y prima
  prima_minima: 0,
  ubicacion: '',
});

const form = ref(getInitialData());

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.isEditing && props.unidadData) {
      // Si estamos editando, usamos los datos existentes.
      // Aseguramos que 'moneda' tenga un valor por defecto si no viene.
      form.value = { ...getInitialData(), ...props.unidadData };
    } else {
      // Si es nuevo, reseteamos al estado inicial.
      form.value = getInitialData();
    }
  }
});

const handleClose = () => {
  if (props.isLoading) return;
  emit('close');
};

const handleSave = () => {
  emit('save', form.value);
};
</script>

<style scoped src="@/views/users/assets/modal-styles.css"></style>
<style scoped>
/* Estilos para agrupar input de moneda */
.input-with-select { display: flex; }
.input-with-select input, .input-with-prefix input { flex-grow: 1; }
.input-with-select input { border-top-right-radius: 0; border-bottom-right-radius: 0; }
.input-with-select select { border-top-left-radius: 0; border-bottom-left-radius: 0; border-left: 0; background-color: #f8f9fa; }

.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}
.input-with-prefix .prefix {
  position: absolute;
  left: 1rem;
  color: var(--color-text-secondary);
  pointer-events: none;
}
.input-with-prefix input { padding-left: 2.5rem; }
</style>
