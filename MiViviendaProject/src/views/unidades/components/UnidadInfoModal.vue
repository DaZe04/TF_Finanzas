<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content info-modal">
      <h2 v-if="unidad">Detalles de la Unidad</h2>
      <div v-if="!unidad" class="loading-state">Cargando...</div>
      <div v-else class="info-grid">
        <div class="info-item">
          <strong>Proyecto:</strong>
          <span>{{ unidad.proyecto || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <strong>Torre:</strong>
          <span>{{ unidad.torre || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <strong>Piso:</strong>
          <span>{{ unidad.piso || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <strong>Número de Unidad:</strong>
          <span>{{ unidad.numero_unidad || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <strong>Área Construida:</strong>
          <span>{{ unidad.area_construida ? `${unidad.area_construida} m²` : 'N/A' }}</span>
        </div>
        <div class="info-item">
          <strong>Área Ocupada:</strong>
          <span>{{ unidad.area_ocupada ? `${unidad.area_ocupada} m²` : 'N/A' }}</span>
        </div>
        <div class="info-item">
          <strong>Precio de Venta:</strong>
          <span>{{ formatCurrency(unidad.precio_venta) }}</span>
        </div>
        <div class="info-item">
          <strong>Prima Mínima:</strong>
          <span>{{ formatCurrency(unidad.prima_minima) }}</span>
        </div>
        <div class="info-item full-width">
          <strong>Ubicación:</strong>
          <span>{{ unidad.ubicacion || 'N/A' }}</span>
        </div>
      </div>
      <div class="modal-actions">
        <button @click="$emit('close')" class="ok-button">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  unidad: Object,
});

defineEmits(['close']);

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'S/ 0.00';
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
};
</script>

<style scoped src="@/views/users/assets/modal-styles.css"></style>
<style scoped>
.info-modal {
  max-width: 600px;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 1.5rem;
  text-align: left;
}
.info-item {
  display: flex;
  flex-direction: column;
}
.info-item strong {
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}
.info-item span {
  color: var(--color-text-primary);
}
.info-item.full-width {
  grid-column: 1 / -1;
}
.ok-button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 5px;
  cursor: pointer;
}
</style>