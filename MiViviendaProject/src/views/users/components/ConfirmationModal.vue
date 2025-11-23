<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
    <div class="modal-content confirmation-modal">
      <h3>{{ title }}</h3>
      <p class="message">{{ message }}</p>
      <div class="modal-actions">
        <button @click="handleCancel" class="cancel-button">Cancelar</button>
        <button @click="handleConfirm" class="delete-button">Confirmar</button>
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
    default: '¿Estás seguro de que quieres continuar?'
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped src="@/views/users/assets/modal-styles.css"></style>
<style scoped>
.confirmation-modal {
  max-width: 400px;
}

.message {
  font-size: 1rem;
  line-height: 1.5;
}

</style>