<template>
  <div>
    <!-- Overlay que se muestra detrás del sidebar cuando está abierto -->
    <transition name="fade">
      <div v-if="isOpen" @click="close" class="sidebar-overlay"></div>
    </transition>

    <!-- El sidebar en sí -->
    <transition name="slide">
      <aside v-if="isOpen" class="sidebar">
        <div class="sidebar-header">
          <h3>FondoVivienda</h3>
        </div>
        <nav class="sidebar-nav">
          <router-link to="/app/home" class="nav-link" @click="close">
            <span>🏠</span>
            <span>Inicio</span>
          </router-link>
          <router-link to="/app/clients" class="nav-link" @click="close">
            <span>👥</span> 
            <span>Clientes</span>
          </router-link>
          <router-link to="/app/unidades" class="nav-link" @click="close">
            <span>🏢</span>
            <span>Inmobiliarias</span>
          </router-link>
          <router-link to="/app/simulador" class="nav-link" @click="close">
            <span>🧮</span> 
            <span>Simulador</span>
          </router-link>
          <router-link to="/app/configuracion" class="nav-link" @click="close">
            <span>⚙️</span>
            <span>Configuración</span>
          </router-link>
        </nav>
      </aside>
    </transition>
  </div>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1999;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 280px;
  background-color: var(--color-card-background);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  color: var(--color-primary);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.sidebar-nav {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.5rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: rgba(0, 92, 153, 0.05);
  color: var(--color-primary);
}

.nav-link.router-link-active {
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
}

.nav-link.disabled {
  color: #aaa;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Animaciones */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}
</style>