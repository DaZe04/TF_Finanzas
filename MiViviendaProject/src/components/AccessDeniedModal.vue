<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content access-denied-modal">
      <div class="icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3>Acceso Denegado</h3>
      <p>No tienes los permisos necesarios para realizar esta acción.</p>
      <div class="modal-actions">
        <button @click="handleClose" class="ok-button">Entendido</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};
</script>

<style scoped src="@/views/users/assets/modal-styles.css"></style>
<style scoped>
.access-denied-modal {
  max-width: 420px;
  text-align: center;
}

.icon-wrapper {
  margin: 0 auto 1rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(231, 76, 60, 0.1);
  color: var(--color-error);
  display: flex;
  align-items: center;
  justify-content: center;
}

.access-denied-modal h3 {
  font-size: 1.4rem;
  margin-bottom: 0.5rem;
}

.access-denied-modal p {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.modal-actions {
  justify-content: center;
}

.ok-button {
  background-color: var(--color-primary);
  color: white;
  padding: 10px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.ok-button:hover {
  background-color: var(--color-primary-light);
}
</style>
