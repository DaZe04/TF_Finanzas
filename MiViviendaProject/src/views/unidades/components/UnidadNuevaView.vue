<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
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
            <label>Área construida (m²)</label>
            <input v-model.number="form.area_construida" type="number" required />
          </div>
          <div class="form-group">
            <label>Área ocupada (m²)</label>
            <input v-model.number="form.area_ocupada" type="number" />
          </div>
          <div class="form-group">
            <label>Precio venta (S/)</label>
            <input v-model.number="form.precio_venta" type="number" required />
          </div>
          <div class="form-group">
            <label>Prima mínima (S/)</label>
            <input v-model.number="form.prima_minima" type="number" />
          </div>
          <div class="form-group full-width">
            <label>Ubicación</label>
            <input v-model="form.ubicacion" />
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="handleClose" class="cancel-button" :disabled="isLoading">Cancelar</button>
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

const form = ref({});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    form.value = props.isEditing && props.unidadData ? { ...props.unidadData } : {};
  }
});

const handleClose = () => !props.isLoading && emit('close');
const handleSave = () => emit('save', form.value);
</script>

<style scoped src="@/views/users/assets/modal-styles.css"></style>
