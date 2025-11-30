<!-- src/App.vue -->
<template>
  <div>

    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { initializeConfigurationListener } from '@/services/configService.js';

onMounted(() => {
  // Iniciamos el listener para la configuración en toda la app.
  initializeConfigurationListener();
});
</script>

<style scoped>

</style>
