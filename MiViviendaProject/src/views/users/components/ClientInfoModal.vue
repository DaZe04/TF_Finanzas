<template>
  <div v-if="isOpen && client" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <h2>Detalles del Cliente</h2>
      <div class="info-grid">
        <div class="info-item">
          <strong>Nombre Completo:</strong>
          <span>{{ client.fullName }}</span>
        </div>
        <div class="info-item">
          <strong>DNI:</strong>
          <span>{{ client.dni }}</span>
        </div>
        <div class="info-item">
          <strong>Email:</strong>
          <span>{{ client.email }}</span>
        </div>
        <div class="info-item">
          <strong>Teléfono:</strong>
          <span>{{ client.phone }}</span>
        </div>
        <div class="info-item">
          <strong>Estado Civil:</strong>
          <span>{{ client.maritalStatus }}</span>
        </div>
        <div class="info-item">
          <strong>Ocupación:</strong>
          <span>{{ client.occupation }}</span>
        </div>
        <div class="info-item">
          <strong>Ingresos Mensuales:</strong>
          <span>{{ formatCurrency(client.income) }}</span>
        </div>
        <div class="info-item">
          <strong>Dependientes:</strong>
          <span>{{ client.dependents }}</span>
        </div>
        <div class="info-item">
          <strong>Carga Familiar:</strong>
          <span>{{ client.familyDependents }}</span>
        </div>
        <div class="info-item">
          <strong>Declaración de Ingresos:</strong>
          <span>{{ client.incomeStatement || 'No especificado' }}</span>
        </div>
      </div>
      <div class="modal-actions">
        <button @click="handleClose" class="cancel-button">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  client: Object,
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') return value;
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
};
</script>

<style scoped src="@/views/users/assets/modal-styles.css"></style>
<style scoped>
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  text-align: left;
}
.info-item {
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
}
.info-item strong {
  margin-bottom: 5px;
  color: var(--color-primary);
}
</style>