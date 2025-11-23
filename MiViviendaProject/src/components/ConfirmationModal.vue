<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content confirmation-modal">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="modal-actions">
        <button @click="handleCancel" class="cancel-button">Cancelar</button>
        <button @click="$emit('confirm')" class="confirm-button">Confirmar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Confirmar Acción'
  },
  message: {
    type: String,
    default: '¿Estás seguro de que deseas continuar?'
  }
});

const emit = defineEmits(['close', 'confirm', 'cancel']);

const handleCancel = () => {
  emit('close');
  emit('cancel'); // Emitimos ambos eventos para compatibilidad
};
</script>

<style scoped>
/* Importamos los estilos base del modal */
@import '@/views/users/assets/modal-styles.css';

.confirmation-modal {
  max-width: 400px;
  text-align: center;
}

.confirmation-modal h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.confirmation-modal p {
  margin-bottom: 2rem;
  color: var(--color-text-secondary);
}

.confirm-button {
  background-color: var(--color-success);
  border: 1px solid var(--color-success);
  border-radius: 5px;
  color: white;
  padding: 8px 8px;
  cursor: pointer;
}

.confirm-button:hover {
  background-color: #28a745;
}
</style>