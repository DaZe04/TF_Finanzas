import { db } from "@/firebase/index.js";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { ref } from 'vue';

// La configuración se guarda en un único documento con un ID conocido.
const CONFIG_DOC_ID = "mainConfig"; 
const configDocRef = doc(db, "configuration", CONFIG_DOC_ID);

// Estado reactivo para la configuración.
// Se inicializa con valores por defecto para evitar errores en la app.
const configState = ref({
  tipoCambioDolar: 3.40, // Valor de respaldo
});

/**
 * Inicializa el listener de Firestore para la configuración.
 * Esta función se debe llamar una sola vez, idealmente en App.vue.
 * Mantiene 'configState' sincronizado en tiempo real.
 */
export function initializeConfigurationListener() {
  onSnapshot(configDocRef, (docSnap) => {
    if (docSnap.exists()) {
      console.log("Configuración actualizada desde Firestore:", docSnap.data());
      configState.value = { ...configState.value, ...docSnap.data() };
    } else {
      console.warn("Documento de configuración no encontrado en Firestore. Usando valores por defecto.");
    }
  }, (error) => {
    console.error("Error al escuchar la configuración:", error);
  });
}

/**
 * Hook 'composable' para usar la configuración en cualquier componente.
 * Devuelve una referencia reactiva al estado de la configuración.
 * @returns {import('vue').Ref<Object>}
 */
export function useConfiguration() {
  return configState;
}

/**
 * Actualiza el documento de configuración en Firestore.
 * @param {Object} newConfig - El nuevo objeto de configuración a guardar.
 */
export async function updateConfiguration(newConfig) {
  await setDoc(configDocRef, newConfig, { merge: true });
}
