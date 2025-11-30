<script setup>
import { ref, onMounted } from "vue";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const config = ref({
  tipoTasa: "Nominal",
  capitalizacion: "Mensual",
  plazoGracia: "Ninguno",
});

const loading = ref(true);
const userId = ref(null);
const showSuccessMessage = ref(false);
const successMessageText = ref('');

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.error("El usuario no está logueado");
      loading.value = false;
      return;
    }

    userId.value = user.uid;

    const refDoc = doc(db, "configuracion", user.uid);
    const snap = await getDoc(refDoc);

    if (snap.exists()) {
      config.value = snap.data();
    }

    loading.value = false;
  });
});

const guardarConfig = async () => {
  if (!userId.value) {
    console.error("No hay usuario logueado");
    return;
  }

  const refDoc = doc(db, "configuracion", userId.value);
  await setDoc(refDoc, config.value, { merge: true });

  // Mostrar mensaje de éxito
  successMessageText.value = "Configuración guardada correctamente.";
  showSuccessMessage.value = true;
  setTimeout(() => {
    showSuccessMessage.value = false;
  }, 3000); // Ocultar después de 3 segundos
};
</script>

<template>
  <div class="config-page">
    <div class="config-card">
      <div class="config-header">
        <div class="config-icon">
          ⚙️
        </div>
        <h1>Configuración</h1>
        <p>Define los parámetros financieros por defecto para tus simulaciones.</p>
      </div>

      <div v-if="loading" class="loading-text">
        Cargando configuración...
      </div>

      <form v-else @submit.prevent="guardarConfig" class="config-form">
        <div class="form-group">
          <label>Tipo de tasa</label>
          <select v-model="config.tipoTasa">
            <option value="Nominal">Nominal</option>
            <option value="Efectiva">Efectiva</option>
          </select>
        </div>

        <div
          class="form-group"
          v-if="config.tipoTasa === 'Nominal'"
        >
          <label>Capitalización</label>
          <select v-model="config.capitalizacion">
            <option value="Mensual">Mensual</option>
            <option value="Diaria">Diaria</option>
            <option value="30 días">Cada 30 días</option>
          </select>
        </div>

        <div class="form-group">
          <label>Periodo de gracia</label>
          <select v-model="config.plazoGracia">
            <option value="Total">Total</option>
            <option value="Parcial">Parcial</option>
            <option value="Ninguno">Ninguno</option>
          </select>
        </div>

        <button type="submit" class="save-btn">
          Guardar configuración
        </button>
      </form>
    </div>

    <!-- Notificación de Éxito -->
    <transition name="slide-fade">
      <div v-if="showSuccessMessage" class="success-notification">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>{{ successMessageText }}</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.config-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  position: relative; /* Necesario para posicionar la notificación */
  align-items: center;
  padding: 20px;
}

.config-card {
  background: #ffffff;
  width: 100%;
  max-width: 430px;
  border-radius: 16px;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
  padding: 28px 32px 30px;
  box-sizing: border-box;
}

.config-header {
  text-align: center;
  margin-bottom: 20px;
}

.config-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  font-size: 24px;
}

.config-header h1 {
  font-size: 1.5rem;
  margin: 0;
  color: #1e3a5f;
}

.config-header p {
  font-size: 0.9rem;
  color: #607d8b;
  margin-top: 4px;
}

/* Formulario */
.config-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #455a64;
}

.form-group select {
  padding: 9px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 0.9rem;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
}

.form-group select:focus {
  border-color: #1e88e5;
  box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.15);
}

/* Botón guardar */
.save-btn {
  margin-top: 6px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 999px;
  border: none;
  background: #1e88e5;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s, transform 0.05s;
}

.save-btn:hover {
  background: #1565c0;
}

.save-btn:active {
  transform: scale(0.98);
}

.loading-text {
  text-align: center;
  font-size: 0.9rem;
  color: #546e7a;
}

/* Estilos para la notificación de éxito */
.success-notification {
  position: fixed; /* Usamos fixed para que se muestre sobre todo */
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #28a745; /* Verde éxito */
  color: white;
  padding: 14px 22px;
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  z-index: 1000;
  font-size: 0.95rem;
}

/* Animación para la notificación */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>